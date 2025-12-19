import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const SIMULATED_TOKEN = 'meu-token-teste-123';

const querySchema = z.object({
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'startDate inválida' }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'endDate inválida' }),
  typeMaintenance: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d+(,\d+)*$/.test(val),
      { message: 'typeMaintenance deve ser números separados por vírgula' }
    ),
});

function requireAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) throw new Error('Não autorizado');

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || token !== SIMULATED_TOKEN) throw new Error('Token inválido');

  return { clientId: 405, userId: 1 };
}

export async function GET(req: Request) {
  try {
    const user = requireAuth(req);

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const startDate = parsed.data.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const endDate = parsed.data.endDate ?? new Date().toISOString().substring(0, 10);
    const tiposManutencao = parsed.data.typeMaintenance
      ? parsed.data.typeMaintenance.split(',').map(Number)
      : undefined;

    const familias = await prisma.cadastro_de_familias_de_equipamento.findMany({
      where: { ID_cliente: user.clientId },
    });
    if (!familias.length) return NextResponse.json({ success: true, data: [] });

    const equipamentos = await prisma.cadastro_de_equipamentos.findMany({
      where: { ID_cliente: user.clientId },
      select: { ID: true, ID_familia: true },
    });
    const equipamentoIds = equipamentos.map(e => e.ID);
    if (!equipamentoIds.length) return NextResponse.json({ success: true, data: [] });

    const escalas = await prisma.sofman_prospect_escala_trabalho.findMany({
      where: {
        id_equipamento: { in: equipamentoIds },
        data_programada: { gte: new Date(startDate), lte: new Date(endDate) },
      },
    });

    const paradas = await prisma.sofman_apontamento_paradas.findMany({
      where: {
        id_equipamento: { in: equipamentoIds },
        data_hora_stop: { gte: new Date(startDate), lte: new Date(endDate) },
        controle_de_ordens_de_servico: tiposManutencao
          ? { tipo_manutencao: { in: tiposManutencao } }
          : undefined,
      },
      include: { controle_de_ordens_de_servico: true },
    });

    const tempoPrevistoPorFamilia = new Map<number, number>();
    const tempoManutencaoPorFamilia = new Map<number, number>();
    const qtdParadasPorFamilia = new Map<number, number>();
    const equipamentoFamiliaMap = new Map<number, number>();
    equipamentos.forEach(e => {
      if (e.ID_familia) equipamentoFamiliaMap.set(e.ID, e.ID_familia);
    });

    escalas.forEach(e => {
      const familiaId = equipamentoFamiliaMap.get(e.id_equipamento);
      if (!familiaId || !e.inicio || !e.termino) return;

      const inicio = new Date(`1970-01-01T${e.inicio.toISOString().substring(11, 19)}`);
      const termino = new Date(`1970-01-01T${e.termino.toISOString().substring(11, 19)}`);

      let horas = (termino.getTime() - inicio.getTime()) / 1000 / 3600;
      if (horas < 0) horas += 24;

      tempoPrevistoPorFamilia.set(familiaId, (tempoPrevistoPorFamilia.get(familiaId) ?? 0) + horas);
    });

    paradas.forEach(p => {
      if (!p.id_equipamento || !p.data_hora_stop || !p.data_hora_start) return;
      const familiaId = equipamentoFamiliaMap.get(p.id_equipamento);
      if (!familiaId) return;

      const horas = (p.data_hora_start.getTime() - p.data_hora_stop.getTime()) / 1000 / 3600;

      tempoManutencaoPorFamilia.set(familiaId, (tempoManutencaoPorFamilia.get(familiaId) ?? 0) + horas);
      qtdParadasPorFamilia.set(familiaId, (qtdParadasPorFamilia.get(familiaId) ?? 0) + 1);
    });

    const data = familias.map(f => {
      const tempoPrev = tempoPrevistoPorFamilia.get(f.ID) ?? 0;
      const tempoMan = tempoManutencaoPorFamilia.get(f.ID) ?? 0;
      const paradasRaw = qtdParadasPorFamilia.get(f.ID) ?? 0;
      const paradasCount = paradasRaw || 1;

      const DF = tempoPrev > 0 ? ((tempoPrev - tempoMan) / tempoPrev) * 100 : 0;
      const MTBF = (tempoPrev - tempoMan) / paradasCount;
      const MTTR = tempoMan / paradasCount;

      return {
        Familia: f.familia ?? 'SEM FAMÍLIA',
        DF: Number(DF.toFixed(2)),
        MTBF: Number(MTBF.toFixed(2)),
        MTTR: Number(MTTR.toFixed(2)),
        Paradas: paradasRaw,
        tempo_prev: Number(tempoPrev.toFixed(2)),
        tempo_corretiva: Number(tempoMan.toFixed(2)),
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao gerar indicadores' },
      { status: 500 }
    );
  }
}
