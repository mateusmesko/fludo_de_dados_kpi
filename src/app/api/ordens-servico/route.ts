import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const dados = await prisma.controle_de_ordens_de_servico.findMany({
    take: 20
  });

  return NextResponse.json(dados);
}
