import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const dados = await prisma.sofman_apontamento_paradas.findMany({
    take: 20
  });

  return NextResponse.json(dados);
}
