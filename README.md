# Plano de Ação — Reuniões Estratégicas

Dashboard executivo para monitoramento de planos de ação corporativos, integrado ao Google Apps Script.

## Stack

- **React 18** + **TypeScript**
- **Vite 5**
- **Tailwind CSS 3**
- **Chart.js** + **react-chartjs-2**
- **xlsx** (exportação Excel)
- **lucide-react** (ícones)

## Instalação

```bash
npm install
npm run dev
```

## Build para produção

```bash
npm run build
npm run preview
```

## Deploy no Vercel

### Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Via GitHub

1. Suba o repositório no GitHub
2. Acesse [vercel.com/new](https://vercel.com/new)
3. Importe o repositório
4. Configurações detectadas automaticamente (Vite)
5. Clique em **Deploy**

## Subir no GitHub

```bash
git init
git add .
git commit -m "feat: dashboard executivo plano de ação"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/plano-acao.git
git push -u origin main
```

## Estrutura

```
src/
├── components/
│   ├── layout/     Header
│   ├── filters/    FilterBar
│   ├── kpis/       KPIGrid
│   ├── charts/     Charts (Status, Setor, Responsável)
│   ├── alerts/     Alerts (atrasadas + vencendo)
│   └── table/      Table (sort, search, paginate, export)
├── hooks/
│   └── useAcoes.ts  fetch + filter + sort + pagination
├── lib/
│   ├── utils.ts     helpers de data, status, truncate
│   ├── kpis.ts      cálculo de KPIs
│   └── export.ts    CSV + Excel
└── types/
    └── index.ts     interfaces TypeScript
```

## API

```
GET https://script.google.com/macros/s/.../exec
```

Retorna array JSON com campos:
`ID`, `Empresa`, `Reunião`, `Ação`, `Setor`, `Responsável`, `DT reunião`, `Prazo`, `Status`, `Observação`

Auto-refresh a cada **5 minutos**.
