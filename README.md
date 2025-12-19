# Sistema de Indicadores de Performance de Manutenção

Interface frontend desenvolvida em Next.js 14 para visualização de indicadores-chave de performance (KPIs) de manutenção industrial, integrada com backend NestJS conforme especificação técnica (`Teste_Backend_Pleno.html`).

---

## Início Rápido

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Acessar aplicação
http://localhost:3000
```

**Modo Standalone:** Funciona sem backend usando dados mock para demonstração completa.

---

## Stack Tecnológico

- **Next.js 14** - Framework React com App Router
- **TypeScript 5.1** - Tipagem estática
- **Tailwind CSS 3.3** - Estilização utility-first
- **Axios 1.4** - Cliente HTTP
- **Day.js** - Manipulação de datas
- **Lucide React** - Biblioteca de ícones

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página inicial
├── components/
│   ├── header.tsx           # Cabeçalho
│   ├── table-performance.tsx # Tabela de indicadores
│   └── ui/                  # Componentes base
└── lib/
    ├── api.ts               # Cliente HTTP
    ├── mock-data.ts         # Dados mock
    └── utils.ts             # Utilitários
```

---

## Integração com Backend

### Referência da Documentação do Backend

Este frontend segue a especificação oficial descrita em `Teste_Backend_Pleno.html`.

- Caminho local: `D:\Teste-Backend-Smart\Teste_Backend_Pleno.html`
- Abra o arquivo no navegador para consultar detalhes de tabelas, fórmulas e rota.

### Endpoint

```
GET /maintenance/reports/performance-indicator
```

### Parâmetros (Query String)

| Parâmetro | Tipo | Obrigatório | Default | Descrição |
|-----------|------|-------------|---------|-----------|
| `startDate` | string (YYYY-MM-DD) | Não | 30 dias atrás | Data inicial do período |
| `endDate` | string (YYYY-MM-DD) | Não | Hoje | Data final do período |

### Formato de Resposta Esperado

```json
{
  "success": true,
  "data": [
    {
      "Familia": "COMPRESSORES",
      "DF": 85.50,
      "MTBF": 120.5,
      "MTTR": 4.2,
      "Paradas": 15,
      "tempo_prev": 1800,
      "tempo_corretiva": 63
    }
  ]
}
```

### Configuração

Edite `src/lib/api.ts` para alterar a URL do backend:

```typescript
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
})
```

Ou crie `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Autenticação (Opcional)

Para adicionar token JWT:

```typescript
// src/lib/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

---

## Estrutura de Dados

### Tipo TypeScript

```typescript
export type PerformanceManutencao = {
  Familia: string           // Nome da família de equipamentos
  DF: number               // Disponibilidade Física (%)
  MTBF: number             // Mean Time Between Failures (horas)
  MTTR: number             // Mean Time To Repair (horas)
  Paradas: number          // Quantidade de paradas
  tempo_prev: number       // Tempo previsto de funcionamento (horas)
  tempo_corretiva: number  // Tempo de manutenção corretiva (horas)
}
```

### Fórmulas dos KPIs

Conforme especificação do backend (`Teste_Backend_Pleno.html`):

**DF (Disponibilidade Física):**
```
DF = ((tempo_prev - tempo_corretiva) / tempo_prev) × 100
```

**MTBF (Mean Time Between Failures):**
```
MTBF = (tempo_prev - tempo_corretiva) / Paradas
```

**MTTR (Mean Time To Repair):**
```
MTTR = tempo_corretiva / Paradas
```

Nota: Quando `Paradas = 0`, utiliza-se `1` para evitar divisão por zero.

---

## Funcionalidades

### Interface

- **Cabeçalho:** Título e botão de exportação Excel
- **Filtros:** Data inicial e data final
- **Tabela:** 7 colunas com indicadores por família
- **Ordenação:** Clique nos cabeçalhos para ordenar (asc/desc)
- **Paginação:** Controle de linhas por página

### Estados

- **Loading:** Spinner animado durante carregamento
- **Empty:** Mensagem quando não há dados
- **Error:** Fallback automático para dados mock

---

## Dados Mock

Arquivo: `src/lib/mock-data.ts`

Usado automaticamente quando:
- Backend não está disponível
- Erro de rede
- Desenvolvimento local sem backend

Permite testar toda a interface sem dependências externas.

---

## Desenvolvimento

### Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm start        # Servidor de produção
npm run lint     # Linting
```

### Checklist de Integração

**Antes de conectar ao backend:**
- [ ] Backend NestJS rodando
- [ ] Endpoint implementado conforme especificação
- [ ] Banco de dados com cliente ID 405 populado
- [ ] CORS configurado

**No frontend:**
- [ ] `.env.local` configurado (se necessário)
- [ ] `npm install` executado
- [ ] Servidor rodando

**Validação:**
- [ ] Requisição retorna status 200
- [ ] Estrutura de resposta correta
- [ ] Dados exibidos na tabela
- [ ] Filtros funcionando
- [ ] Ordenação operacional

---

## Referência do Backend

### Especificação Técnica

Documento: `Teste_Backend_Pleno.html`

Contém:
- Estrutura completa do banco de dados
- Tabelas utilizadas (sofman_*, controle_*, cadastro_*)
- Credenciais de teste (cliente ID 405)
- Fórmulas detalhadas dos KPIs
- Requisitos de autenticação

### Tabelas do Banco

O backend utiliza:
- `sofman_prospect_escala_trabalho` - Escala de trabalho
- `sofman_apontamento_paradas` - Registro de paradas
- `controle_de_ordens_de_servico` - Ordens de serviço
- `cadastro_de_equipamentos` - Equipamentos
- `cadastro_de_familias_de_equipamento` - Famílias

---

## Troubleshooting

### Erro: "Network Error"
**Causa:** Backend não acessível  
**Solução:** Verificar se backend está rodando e URL está correta

### Erro: "401 Unauthorized"
**Causa:** Token inválido ou ausente  
**Solução:** Verificar autenticação e implementar interceptor

### Dados não aparecem
**Causa:** Formato de resposta incorreto  
**Solução:** Validar estrutura JSON e nomes dos campos (case-sensitive)

### Performance lenta
**Causa:** Volume grande de dados  
**Solução:** Implementar paginação no backend e debounce nos filtros

---

## Build e Deploy

### Build Local

```bash
npm run build
npm start
```

### Deploy Recomendado

**Vercel (Recomendado para Next.js):**
```bash
vercel deploy
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Licença

Projeto desenvolvido para fins de teste técnico.

---

# Documentação Completa do Backend (Referência)

Esta seção contém a especificação técnica original para o desenvolvimento do backend.

## Objetivo
Desenvolver uma rota de API REST que retorne indicadores de performance (KPIs) de manutenção agrupados por **família de equipamentos**.

## Contexto
Sistema de gestão de manutenção. Relatório de indicadores de disponibilidade e performance.

### Indicadores a Calcular
| Indicador | Descrição |
|-----------|-----------|
| **DF** | Disponibilidade Física (%) |
| **MTBF** | Mean Time Between Failures - Tempo Médio Entre Falhas (horas) |
| **MTTR** | Mean Time To Repair - Tempo Médio Para Reparo (horas) |
| **Paradas** | Quantidade total de ordens de serviço (paradas) |

## Conexão com o Banco de Dados

> **⚠️ ATENÇÃO:** Use estas credenciais apenas para o teste.

| Parâmetro | Valor |
|-----------|-------|
| **Host** | `smartnewdb-do-user-14494582-0.c.db.ondigitalocean.com` |
| **Port** | `25060` |
| **Database** | `sofman` |
| **User** | `user_test` |
| **Password** | `AVNS_CqsbNG4s6FInXFBnYOx` |
| **ID Cliente (filtro)** | `405` |

**String de Conexão (Prisma):**
```
DATABASE_URL="mysql://user_test:AVNS_CqsbNG4s6FInXFBnYOx@smartnewdb-do-user-14494582-0.c.db.ondigitalocean.com:25060/sofman"
```

> **Nota:** Utilize `id_cliente = 405` como filtro nas suas consultas.

## Tabelas Disponíveis

### 1. `sofman_prospect_escala_trabalho` (Escala de Trabalho)
Define os horários programados de funcionamento.
- `id` (INT)
- `id_equipamento` (INT)
- `data_programada` (DATE)
- `inicio` (TIME)
- `termino` (TIME)

### 2. `sofman_apontamento_paradas` (Registro de Paradas)
Registra paradas e retornos.
- `id` (INT)
- `id_ordem_servico` (INT)
- `id_equipamento` (INT)
- `data_hora_stop` (DATETIME)
- `data_hora_start` (DATETIME)

### 3. `controle_de_ordens_de_servico` (Ordens de Serviço)
- `ID` (INT)
- `ID_cliente` (INT)
- `tipo_manutencao` (INT)

### 4. `cadastro_de_equipamentos` (Equipamentos)
- `ID` (INT)
- `id_cliente` (INT)
- `id_familia` (INT)
- `equipamento_codigo` (VARCHAR)
- `descricao` (VARCHAR)

### 5. `cadastro_de_familias_de_equipamento` (Famílias)
- `ID` (INT)
- `ID_cliente` (INT)
- `familia` (VARCHAR)

## Fórmulas dos KPIs

### Disponibilidade Física (DF)
```
DF = ((Tempo Previsto de Funcionamento - Tempo de Manutenção) / Tempo Previsto de Funcionamento) * 100
```

### MTBF - Tempo Médio Entre Falhas
```
MTBF = (Tempo Previsto de Funcionamento - Tempo de Manutenção) / Quantidade de Paradas
```

### MTTR - Tempo Médio Para Reparo
```
MTTR = Tempo de Manutenção / Quantidade de Paradas
```

> **Nota:** Caso a quantidade de paradas seja 0, use 1 para evitar divisão por zero.

## Especificação da Rota

**Rota:** `GET /maintenance/reports/performance-indicator`

### Query Parameters
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `startDate` | DATE | Não | Data inicial (default: 30 dias atrás) |
| `endDate` | DATE | Não | Data final (default: hoje) |
| `typeMaintenance` | STRING | Não | IDs dos tipos de manutenção (ex: "1,2,3") |

### Response Esperado
```json
{
  "success": true,
  "data": [
    {
      "Familia": "COMPRESSORES",
      "DF": 85.50,
      "MTBF": 120.5,
      "MTTR": 4.2,
      "Paradas": 15,
      "tempo_prev": 1800,
      "tempo_corretiva": 63
    }
  ]
}
```

## Requisitos Técnicos
- **Framework:** NestJS com TypeScript
- **ORM:** Prisma (pode usar `$queryRaw`)
- **Validação:** Zod
- **Autenticação:** AuthGuard

## Dicas
- **Tempo Previsto:** calculado a partir da escala (`inicio` e `termino`).
- **Tempo de Manutenção:** calculado a partir das paradas (`data_hora_stop` e `data_hora_start`).
- Agrupe por **família de equipamento**.
- Filtre por data (`startDate` até `endDate`) e cliente (`clientId`).


## Prisma
- Para iniciar o prisma nescessario usar o codigo 'npx prisma studio'
