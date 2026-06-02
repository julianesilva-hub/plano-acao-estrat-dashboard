import { AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react'
import type { Acao } from '../../types'
import { isAtrasada, isVencendoBreve, diffDays, fmtDate, statusStyle, trunc } from '../../lib/utils'

interface AlertsProps { data: Acao[] }

export function Alerts({ data }: AlertsProps) {
  const atrasadas = data
    .filter(r => isAtrasada(r))
    .sort((a, b) => (diffDays(b._prazo) ?? 0) - (diffDays(a._prazo) ?? 0))

  const breve = data
    .filter(r => isVencendoBreve(r))
    .sort((a, b) => {
      if (!a._prazo || !b._prazo) return 0
      return a._prazo.getTime() - b._prazo.getTime()
    })

  if (!atrasadas.length && !breve.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm text-center">
        <CheckCircle2 size={24} className="text-green-600 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Nenhuma ação crítica no momento</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {atrasadas.length > 0 && (
        <AlertSection
          title="Ações Atrasadas"
          count={atrasadas.length}
          items={atrasadas.slice(0, 10)}
          tipo="late"
          icon={<AlertTriangle size={15} className="text-red-600" />}
          badgeClass="bg-red-50 text-red-700"
          extra={atrasadas.length > 10 ? atrasadas.length - 10 : 0}
        />
      )}
      {breve.length > 0 && (
        <AlertSection
          title="Vencimento em 7 dias"
          count={breve.length}
          items={breve}
          tipo="soon"
          icon={<CalendarClock size={15} className="text-amber-600" />}
          badgeClass="bg-amber-50 text-amber-700"
        />
      )}
    </div>
  )
}

function AlertSection({
  title, count, items, tipo, icon, badgeClass, extra = 0,
}: {
  title: string
  count: number
  items: Acao[]
  tipo: 'late' | 'soon'
  icon: React.ReactNode
  badgeClass: string
  extra?: number
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
          {icon}
          {title}
        </div>
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
          {count}
        </span>
      </div>

      {/* Header row */}
      <div className="grid gap-2 pb-2 border-b border-gray-100 mb-1"
        style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) 90px minmax(0,1fr) 90px' }}>
        {['Ação','Responsável','Setor','Prazo','Status','Situação'].map(h => (
          <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{h}</span>
        ))}
      </div>

      {items.map((r, i) => <AlertRow key={r.ID || i} row={r} tipo={tipo} />)}

      {extra > 0 && (
        <p className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
          +{extra} ações adicionais — consulte a tabela abaixo
        </p>
      )}
    </div>
  )
}

function AlertRow({ row, tipo }: { row: Acao; tipo: 'late' | 'soon' }) {
  const dd = diffDays(row._prazo)
  const sc = statusStyle(row.Status)

  return (
    <div className="grid gap-2 py-2 border-b border-gray-50 last:border-0 items-center text-[12px]"
      style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) 90px minmax(0,1fr) 90px' }}>
      <span className="font-medium text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap" title={row['Ação']}>
        {trunc(row['Ação'], 55)}
      </span>
      <span className="text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap text-[11px]">
        {trunc(row['Responsável'], 18)}
      </span>
      <span className="text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap text-[11px]">
        {trunc(row['Setor'], 16)}
      </span>
      <span className="text-gray-500 text-[11px]">{fmtDate(row._prazo)}</span>
      <span>
        <span className="status-pill" style={{ background: sc.bg, color: sc.color }}>
          {trunc(row.Status, 16)}
        </span>
      </span>
      <span>
        {tipo === 'late' ? (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-red-50 text-red-700 whitespace-nowrap">
            {dd !== null ? `${dd}d atraso` : '—'}
          </span>
        ) : (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 whitespace-nowrap">
            em {row._prazo ? Math.max(0, -(dd ?? 0)) : '—'}d
          </span>
        )}
      </span>
    </div>
  )
}
