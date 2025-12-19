import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🔑 Token simulado para teste
const SIMULATED_TOKEN = 'meu-token-teste-123';

export function middleware(request: NextRequest) {
  // Pega o header Authorization
  const authHeader = request.headers.get('authorization');

  // Se não existir, retorna 401
  if (!authHeader) {
    return NextResponse.json(
      { message: 'Não autorizado: header Authorization ausente' },
      { status: 401 }
    );
  }

  const [type, token] = authHeader.split(' ');

  // Valida tipo e token
  if (type !== 'Bearer' || token !== SIMULATED_TOKEN) {
    return NextResponse.json(
      { message: 'Token inválido' },
      { status: 401 }
    );
  }

  // Se tudo ok, deixa passar
  return NextResponse.next();
}

// Configuração do middleware: protege todas as rotas da API
export const config = {
  matcher: ['/api/:path*'],
};
