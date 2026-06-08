export interface AcaoRaw {
  ID: string
  Empresa: string
  'Reunião': string
  'Ação': string
  Setor: string
  'Responsável': string
  'DT reunião': string
  Prazo: string
  Status: string
  'Observação': string
  'Última Atualização'?: string
  'Atualizado Por'?: string
}

export interface Acao extends AcaoRaw {
  _prazo: Date | null
  _reuniao: Date | null
}

export interface Filters {
  empresa: string
  reuniao: string
  setor: string
  responsavel: string
  status: string
  periodo: string
  ano: string
}

export interface KPIs {
  total: number
  concluidas: number
  emAndamento: number
  atrasadas: number
  vencendo: number
  pctConclusao: number
}

export type SortDir = 1 | -1
export type SortCol = keyof AcaoRaw | null

/* ── Auth ── */
export type UserRole = 'ADM' | 'Usuário'

export interface UsuarioCadastro {
  responsavel: string   // nome na planilha de ações
  email: string
  acesso: UserRole
}

export interface AuthUser {
  name: string
  email: string
  picture: string
  responsavel: string   // mapeado da aba Usuário
  acesso: UserRole
}
