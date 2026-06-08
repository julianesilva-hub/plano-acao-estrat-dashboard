import { RefreshCw, BarChart3 } from 'lucide-react'

interface HeaderProps {
  loading: boolean
  error: string | null
  lastUpdate: string
  totalRecords: number
  onRefresh: () => void
}

export function Header({ loading, error, lastUpdate, totalRecords, onRefresh }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <BarChart3 size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-gray-900 leading-tight">
            Plano de Ação — Reuniões Estratégicas
          </h1>
          <p className="text-[11px] text-gray-500 leading-tight">
            Monitoramento Executivo · Governança Corporativa
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!loading && !error && lastUpdate && (
          <span className="text-[11px] text-gray-400 flex items-center gap-1.5 hidden sm:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            {totalRecords} registros · {lastUpdate}
          </span>
        )}
        {loading && (
          <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block animate-pulse" />
            Carregando...
          </span>
        )}
        {error && (
          <span className="text-[11px] text-red-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            Erro ao carregar
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-md px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>
    </header>
  )
}
