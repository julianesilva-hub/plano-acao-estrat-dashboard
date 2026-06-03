import * as XLSX from 'xlsx'
import type { Acao } from '../types'

const COLS = [
  'ID', 'Empresa', 'Reunião', 'Ação', 'Setor',
  'Responsável', 'DT reunião', 'Prazo', 'Status', 'Observação',
] as const

function toRows(data: Acao[]): string[][] {
  return data.map(r => COLS.map(c => String(r[c] ?? '')))
}

export function exportCSV(data: Acao[], filename = 'plano_acao.csv'): void {
  const rows = [COLS.join(','), ...toRows(data).map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(','))]
  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  download(blob, filename)
}

export function exportExcel(data: Acao[], filename = 'plano_acao.xlsx'): void {
  const ws = XLSX.utils.aoa_to_sheet([COLS as unknown as string[], ...toRows(data)])
  ws['!cols'] = [8, 18, 22, 40, 16, 20, 12, 12, 18, 30].map(w => ({ wch: w }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Plano de Ação')
  XLSX.writeFile(wb, filename)
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
