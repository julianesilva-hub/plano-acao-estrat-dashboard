import {
  Download, FileSpreadsheet, Search,
  ChevronUp, ChevronDown, ChevronsUpDown,
  Pencil, Lock,
} from 'lucide-react'
import type { Acao, SortCol, SortDir } from '../../types'
import { isAtrasada, diffDays, fmtDate, statusStyle, trunc } from '../../lib/utils'
import { exportCSV, exportExcel } from '../../lib/export'
import { PAGE_SIZE } from '../../hooks/useAcoes'
import { useUser } from '../../context/UserContext'

interface TableProps {
  paged: Acao[]
  allFiltered: Acao[]
  totalFiltered: number
  page: number
  totalPages: number
  sortCol: SortCol
  sortDir: SortDir
  search: string
  onSort: (col: SortCol) => void
  onSearch: (v: string) => void
  onPage: (p: number) => void
  onEdit: (row: Acao) => void
}

const COLS = [
  { key: 'ID',          label: 'ID',         w: '36px'  },
  { key: 'Empresa',     label: 'Empresa',     w: '85px'  },
  { key: 'Reunião',     label: 'Reunião',     w: '110px' },
  { key: 'Ação',        label: 'Ação',        w: '155px' },
  { key: 'Setor',       label: 'Setor',       w: '85px'  },
  { key: 'Responsável', label: 'Responsável', w: '105px' },
  { key: 'DT reunião',  label: 'DT Reunião',  w: '82px'  },
  { key: 'Prazo',       label: 'Prazo',       w: '80px'  },
  { key: 'Status',      label: 'Status',      w: '108px' },
  { key: 'Observação',  label: 'Observação',  w: '110px' },
  { key: '_edit',       label: 'Editar',      w: '62px'  },
]

export function Table({
  paged, allFiltered, totalFiltered, page, totalPages,
  sortCol, sortDir, search, onSort, onSearch, onPage, onEdit,
}: TableProps) {
  /*
   * currentUser lido UMA VEZ no componente pai Table e passado como prop
   * para cada TableRow. Elimina qualquer inconsistência de contexto por
   * re-render individual das linhas.
   */
  const { currentUser } = useUser()

  const maxBtns = 10
  const pageBtns = Array.from({ length: Math.min(totalPages, maxBtns) }, (_, i) => i + 1)

  function SortIcon({ col }: { col: string }) {
    if (col === '_edit') return null
    if (sortCol !== col) return <ChevronsUpDown size={10} className="opacity-30 ml-0.5" />
    return sortDir === 1
      ? <ChevronUp   size={10} className="text-brand-500 ml-0.5" />
      : <ChevronDown size={10} className="text-brand-500 ml-0.5" />
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm">

      {/* Controls */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 gap-3 flex-wrap border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <span>Tabela Gerencial</span>
          <span className="text-[11px] text-gray-400 font-normal">
            {totalFiltered} registro{totalFiltered !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Buscar..."
              className="text-xs pl-7 pr-3 h-8 rounded-md border border-gray-200 bg-gray-50 w-44 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <button
            onClick={() => exportCSV(allFiltered)}
            className="flex items-center gap-1.5 text-xs px-3 h-8 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download size={12} /> CSV
          </button>
          <button
            onClick={() => exportExcel(allFiltered)}
            className="flex items-center gap-1.5 text-xs px-3 h-8 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <FileSpreadsheet size={12} /> Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse" style={{ tableLayout: 'fixed' }}>
          <colgroup>{COLS.map(c => <col key={c.key} style={{ width: c.w }} />)}</colgroup>
          <thead>
            <tr className="bg-gray-50">
              {COLS.map(c => (
                <th
                  key={c.key}
                  onClick={() => c.key !== '_edit' && onSort(c.key as SortCol)}
                  className={`text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 select-none whitespace-nowrap ${c.key !== '_edit' ? 'cursor-pointer hover:text-gray-700' : ''}`}
                >
                  <span className="flex items-center">
                    {c.label}
                    <SortIcon col={c.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0
              ? (
                <tr>
                  <td colSpan={COLS.length} className="text-center py-8 text-gray-400 text-xs">
                    Nenhum registro encontrado
                  </td>
                </tr>
              )
              : paged.map((r, i) => (
                  <TableRow
                    key={r.ID || `row-${i}`}
                    row={r}
                    currentUser={currentUser}  /* prop explícita — sem hook no row */
                    onEdit={onEdit}
                  />
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-wrap gap-2">
        <span className="text-[11px] text-gray-400">
          Página {page} de {totalPages} · {totalFiltered} registros
        </span>
        <div className="flex gap-1 flex-wrap">
          {pageBtns.map(p => (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                p === page
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          {totalPages > maxBtns && (
            <span className="text-[11px] text-gray-400 px-1.5 py-1">…{totalPages}</span>
          )}
        </div>
      </div>
    </div>
  )
}

interface TableRowProps {
  row: Acao
  currentUser: string   /* recebido como prop — não via hook */
  onEdit: (row: Acao) => void
}

function TableRow({ row, currentUser, onEdit }: TableRowProps) {
  const dd  = row._prazo ? diffDays(row._prazo) : null
  const atr = isAtrasada(row) && dd !== null
  const sc  = statusStyle(row.Status)

  /*
   * Regra EXCLUSIVA: Você é === Responsável da ação (com trim)
   * SEM qualquer relação com o filtro Responsável da FilterBar.
   */
  const userTrimmed = currentUser.trim()
  const respTrimmed = (row['Responsável'] ?? '').trim()
  const canEdit     = userTrimmed !== '' && respTrimmed === userTrimmed

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-50 last:border-0">
      <td className="px-3 py-2 text-gray-500">{row.ID || '—'}</td>
      <td className="px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap" title={row.Empresa}>
        {trunc(row.Empresa, 12)}
      </td>
      <td className="px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap" title={row['Reunião']}>
        {trunc(row['Reunião'], 16)}
      </td>
      <td className="px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap" title={row['Ação']}>
        {trunc(row['Ação'], 22)}
      </td>
      <td className="px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap" title={row.Setor}>
        {trunc(row.Setor, 12)}
      </td>
      <td className="px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap" title={row['Responsável']}>
        {trunc(row['Responsável'], 14)}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-gray-500">{fmtDate(row._reuniao)}</td>
      <td className="px-3 py-2 whitespace-nowrap text-gray-500">
        {fmtDate(row._prazo)}
        {atr && <span className="text-[10px] text-red-600 ml-1">+{dd}d</span>}
      </td>
      <td className="px-3 py-2">
        <span className="status-pill" style={{ background: sc.bg, color: sc.color }}>
          {trunc(row.Status, 15)}
        </span>
      </td>
      <td
        className="px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap text-gray-500"
        title={row['Observação']}
      >
        {trunc(row['Observação'], 15)}
      </td>
      <td className="px-3 py-2">
        {canEdit ? (
          <button
            onClick={() => onEdit(row)}
            title="Editar esta ação"
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-brand-200 text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors whitespace-nowrap"
          >
            <Pencil size={11} /> Editar
          </button>
        ) : (
          <span
            className="flex justify-center"
            title={userTrimmed ? `Responsável: ${respTrimmed}` : 'Selecione "Você é" para editar'}
          >
            <Lock size={11} className="text-gray-200" />
          </span>
        )}
      </td>
    </tr>
  )
}

export { PAGE_SIZE }
