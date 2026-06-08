import { X } from 'lucide-react'
import { useMemo } from 'react'
import type { Filters, Acao } from '../../types'
import { unique } from '../../lib/utils'

interface FilterBarProps {
  allData: Acao[]
  filters: Filters
  onUpdate: (key: keyof Filters, value: string) => void
  onClear: () => void
}

const PERIODO_OPTIONS = [
  { value: '',           label: 'Prazo' },
  { value: 'atrasadas',  label: 'Atrasadas' },
  { value: '7d',         label: 'Vence em 7d' },
  { value: '30d',        label: 'Vence em 30d' },
]

export function FilterBar({ allData, filters, onUpdate, onClear }: FilterBarProps) {
  const hasActive = Object.values(filters).some(v => v !== '')

  /* Anos extraídos de _reuniao, ordenados mais recente → mais antigo */
  const anos = useMemo(() => {
    const set = new Set<number>()
    allData.forEach(r => {
      const y = r._reuniao?.getFullYear()
      if (y) set.add(y)
    })
    return Array.from(set).sort((a, b) => b - a).map(String)
  }, [allData])

  return (
    <div className="bg-white border-b border-gray-100 px-6 sticky top-[57px] z-20">
      <div
        className="flex flex-row flex-nowrap items-center gap-2 overflow-x-auto py-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap flex-shrink-0">
          Filtros
        </span>
        <div className="w-px h-4 bg-gray-200 flex-shrink-0" />

        <SelectFilter
          value={filters.empresa}
          placeholder="Empresa"
          options={unique(allData, 'Empresa')}
          onChange={v => onUpdate('empresa', v)}
        />
        <SelectFilter
          value={filters.reuniao}
          placeholder="Reunião"
          options={unique(allData, 'Reunião')}
          onChange={v => onUpdate('reuniao', v)}
        />
        <SelectFilter
          value={filters.setor}
          placeholder="Setor"
          options={unique(allData, 'Setor')}
          onChange={v => onUpdate('setor', v)}
        />
        <SelectFilter
          value={filters.responsavel}
          placeholder="Responsável"
          options={unique(allData, 'Responsável')}
          onChange={v => onUpdate('responsavel', v)}
        />
        <SelectFilter
          value={filters.status}
          placeholder="Status"
          options={unique(allData, 'Status')}
          onChange={v => onUpdate('status', v)}
        />

        {/* Filtro Ano */}
        <select
          className="filter-select"
          value={filters.ano}
          onChange={e => onUpdate('ano', e.target.value)}
        >
          <option value="">Ano</option>
          {anos.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        {/* Filtro Prazo */}
        <select
          className="filter-select"
          value={filters.periodo}
          onChange={e => onUpdate('periodo', e.target.value)}
        >
          {PERIODO_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div className="w-px h-4 bg-gray-200 flex-shrink-0" />

        <button
          onClick={onClear}
          className={`flex items-center gap-1 text-[11px] px-3 rounded-md border whitespace-nowrap flex-shrink-0 transition-colors h-[30px] ${
            hasActive
              ? 'text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100'
              : 'text-gray-400 border-gray-200 bg-white'
          }`}
        >
          <X size={11} /> Limpar
        </button>
      </div>
    </div>
  )
}

function SelectFilter({
  value, placeholder, options, onChange,
}: {
  value: string; placeholder: string; options: string[]; onChange: (v: string) => void
}) {
  return (
    <select
      className="filter-select"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}
