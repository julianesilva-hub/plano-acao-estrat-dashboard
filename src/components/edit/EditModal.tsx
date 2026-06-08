import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import type { Acao } from '../../types'
import type { EditPayload } from '../../hooks/useEdit'
import { useUser } from '../../context/UserContext'
import { fmtDate } from '../../lib/utils'

interface EditModalProps {
  row: Acao
  saving: boolean
  onClose: () => void
  onSave: (payload: EditPayload) => void
  statusOptions: string[]
}

export function EditModal({ row, saving, onClose, onSave, statusOptions }: EditModalProps) {
  const { currentUser } = useUser()   // "Você é" — não depende do filtro Responsável

  const [status, setStatus]         = useState(row.Status ?? '')
  const [observacao, setObservacao] = useState(row['Observação'] ?? '')
  const [prazo, setPrazo]           = useState(() => {
    if (!row._prazo) return ''
    const d = row._prazo
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSave() {
    let prazoFmt = ''
    if (prazo) {
      const [y, m, d] = prazo.split('-')
      prazoFmt = `${d}/${m}/${y}`
    }

    const payload: EditPayload = {
      ID:                row.ID,
      Status:            status,
      Observação:        observacao,
      Prazo:             prazoFmt,
      AtualizadoPor:     currentUser,   // nome do "Você é"
      UltimaAtualizacao: new Date().toLocaleString('pt-BR'),
    }

    console.log('[EditModal] Salvando:', payload)
    onSave(payload)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-label="Editar ação"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Editar Ação</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">ID {row.ID} · {row.Setor}</p>
          </div>
          <button onClick={onClose} disabled={saving}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100 disabled:opacity-50">
            <X size={16} />
          </button>
        </div>

        {/* Ação — somente leitura */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Ação</p>
          <p className="text-xs text-gray-700 leading-relaxed">{row['Ação'] || '—'}</p>
        </div>

        {/* Campos editáveis */}
        <div className="px-5 py-4 space-y-4">

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              disabled={saving}
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 disabled:bg-gray-50"
            >
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              {status && !statusOptions.includes(status) && (
                <option value={status}>{status}</option>
              )}
            </select>
          </div>

          {/* Prazo */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Prazo
            </label>
            <input
              type="date"
              value={prazo}
              onChange={e => setPrazo(e.target.value)}
              disabled={saving}
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 disabled:bg-gray-50"
            />
            {row._prazo && (
              <p className="text-[10px] text-gray-400 mt-1">Prazo atual: {fmtDate(row._prazo)}</p>
            )}
          </div>

          {/* Observação */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Observação
            </label>
            <textarea
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              disabled={saving}
              rows={3}
              placeholder="Adicione uma observação..."
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-[11px] text-gray-400">
            Editando como{' '}
            <span className="font-medium text-gray-700">{currentUser || '—'}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !currentUser}
              className="flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? <><Loader2 size={12} className="animate-spin" /> Salvando...</>
                : <><Save size={12} /> Salvar alterações</>
              }
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
