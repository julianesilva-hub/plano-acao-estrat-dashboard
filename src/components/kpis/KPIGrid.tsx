import type { KPIs } from '../../types'
import {
  ListChecks, CheckCircle2, Clock, AlertTriangle, CalendarClock, PieChart,
} from 'lucide-react'

interface KPIGridProps { kpis: KPIs }

interface KPICardProps {
  label: string
  value: number | string
  sub: string
  icon: React.ReactNode
  valueColor: string
  iconColor: string
}

function KPICard({ label, value, sub, icon, valueColor, iconColor }: KPICardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 relative overflow-hidden shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{label}</p>
      <p className={`text-3xl font-medium leading-none mb-1 ${valueColor}`}>{value}</p>
      <p className="text-[11px] text-gray-400">{sub}</p>
      <div className={`absolute right-3 top-3 opacity-15 ${iconColor}`}>{icon}</div>
    </div>
  )
}

export function KPIGrid({ kpis }: KPIGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      <KPICard
        label="Total de Ações"
        value={kpis.total}
        sub="registros"
        icon={<ListChecks size={22} />}
        valueColor="text-brand-600"
        iconColor="text-brand-600"
      />
      <KPICard
        label="Concluídas"
        value={kpis.concluidas}
        sub={`${kpis.pctConclusao}% do total`}
        icon={<CheckCircle2 size={22} />}
        valueColor="text-green-700"
        iconColor="text-green-700"
      />
      <KPICard
        label="Em Andamento"
        value={kpis.emAndamento}
        sub="em execução"
        icon={<Clock size={22} />}
        valueColor="text-violet-600"
        iconColor="text-violet-600"
      />
      <KPICard
        label="Atrasadas"
        value={kpis.atrasadas}
        sub="prazo vencido"
        icon={<AlertTriangle size={22} />}
        valueColor="text-red-700"
        iconColor="text-red-700"
      />
      <KPICard
        label="Vence em 7 dias"
        value={kpis.vencendo}
        sub="atenção imediata"
        icon={<CalendarClock size={22} />}
        valueColor="text-orange-700"
        iconColor="text-orange-700"
      />
      <KPICard
        label="% Conclusão"
        value={`${kpis.pctConclusao}%`}
        sub="taxa de entrega"
        icon={<PieChart size={22} />}
        valueColor="text-amber-700"
        iconColor="text-amber-700"
      />
    </div>
  )
}
