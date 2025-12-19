import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const dados = await prisma.cadastro_de_familias_de_equipamento.findMany({
    take: 20
  });

  return NextResponse.json(dados);
}
