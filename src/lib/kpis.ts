import type { Acao, KPIs } from '../types'
import { isConcluido, isAndamento, isAtrasada, isVencendoBreve } from './utils'

export function calcKPIs(data: Acao[]): KPIs {
  const total = data.length
  const concluidas = data.filter(r => isConcluido(r.Status)).length
  const emAndamento = data.filter(r => isAndamento(r.Status)).length
  const atrasadas = data.filter(r => isAtrasada(r)).length
  const vencendo = data.filter(r => isVencendoBreve(r)).length
  const pctConclusao = total > 0 ? Math.round((concluidas / total) * 100) : 0
  return { total, concluidas, emAndamento, atrasadas, vencendo, pctConclusao }
}
