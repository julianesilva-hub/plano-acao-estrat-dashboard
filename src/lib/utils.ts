import type { Acao, AcaoRaw } from '../types'

export function parseDate(s: string | undefined | null): Date | null {
  if (!s) return null
  const str = String(s).trim()
  const br = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (br) return new Date(+br[3], +br[2] - 1, +br[1])
  const iso = new Date(str)
  return isNaN(iso.getTime()) ? null : iso
}

export function today(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function diffDays(d: Date | null): number | null {
  if (!d) return null
  return Math.round((today().getTime() - d.getTime()) / 86_400_000)
}

export function fmtDate(d: Date | null): string {
  if (!d) return '—'
  return d.toLocaleDateString('pt-BR')
}

export function trunc(s: string | undefined | null, n: number): string {
  const str = String(s ?? '')
  return str.length > n ? str.slice(0, n) + '…' : str || '—'
}

export function norm(s: string): string {
  return String(s ?? '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function isConcluido(s: string): boolean {
  const n = norm(s)
  return n === 'concluido' || n === 'concluida' || n.startsWith('conclu')
}

export function isAndamento(s: string): boolean {
  const n = norm(s)
  return n.includes('andamento') || n.includes('execu') ||
         n.includes('progress') || n.includes('iniciado')
}

export function isAtrasada(r: Acao): boolean {
  return !isConcluido(r.Status) && r._prazo !== null && r._prazo < today()
}

export function isVencendoBreve(r: Acao): boolean {
  if (isConcluido(r.Status) || !r._prazo) return false
  const t = today()
  const lim = new Date(t)
  lim.setDate(lim.getDate() + 7)
  return r._prazo >= t && r._prazo <= lim
}

export function isVencendo30(r: Acao): boolean {
  if (isConcluido(r.Status) || !r._prazo) return false
  const t = today()
  const lim = new Date(t)
  lim.setDate(lim.getDate() + 30)
  return r._prazo >= t && r._prazo <= lim
}

export interface StatusStyle { bg: string; color: string }

export function statusStyle(s: string): StatusStyle {
  const n = norm(s)
  if (n.startsWith('conclu'))   return { bg: '#EAF3DE', color: '#27500A' }
  if (n.includes('andamento') || n.includes('execu') || n.includes('progress'))
                                 return { bg: '#E6F1FB', color: '#0C447C' }
  if (n.includes('atraso'))     return { bg: '#FCEBEB', color: '#791F1F' }
  if (n.includes('pendent') || n.includes('aguard') || n.includes('aberta'))
                                 return { bg: '#FAEEDA', color: '#633806' }
  if (n.includes('cancel'))     return { bg: '#F3F4F6', color: '#6B7280' }
  return { bg: '#F3F4F6', color: '#6B7280' }
}

export function enrichRow(r: AcaoRaw): Acao {
  const raw = r as unknown as Record<string, string>
  return {
    ...r,
    _prazo:   parseDate(r['Prazo']      ?? raw['prazo']),
    _reuniao: parseDate(r['DT reunião'] ?? raw['DT Reuniao'] ?? raw['dt reuniao']),
  }
}

export function unique(data: Acao[], key: keyof AcaoRaw): string[] {
  return [...new Set(data.map(r => r[key]).filter((v): v is string => Boolean(v)))].sort()
}
