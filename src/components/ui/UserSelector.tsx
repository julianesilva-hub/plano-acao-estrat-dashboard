/**
 * UserSelector — "Você é"
 * Controla identidade para edição.
 * NÃO altera o filtro "Responsável" da FilterBar.
 * Posicionado acima da tabela (renderizado no App.tsx).
 */
import { UserCircle2 } from 'lucide-react'
import { useUser } from '../../context/UserContext'
import type { Acao } from '../../types'
import { unique } from '../../lib/utils'

interface UserSelectorProps {
  allData: Acao[]
}

export function UserSelector({ allData }: UserSelectorProps) {
  const { currentUser, setCurrentUser } = useUser()
  const responsaveis = unique(allData, 'Responsável')

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
      <UserCircle2 size={16} className="text-brand-500 flex-shrink-0" />
      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Você é:</span>
      <select
        value={currentUser}
        onChange={e => setCurrentUser(e.target.value)}
        className="text-xs px-2 h-8 rounded-md border border-gray-200 bg-gray-50 text-gray-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 min-w-[160px]"
      >
        <option value="">Selecionar meu nome...</option>
        {responsaveis.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      {currentUser
        ? (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium whitespace-nowrap">
            ✏️ editando suas ações
          </span>
        ) : (
          <span className="text-[11px] text-gray-400 whitespace-nowrap">
            Selecione para habilitar edição
          </span>
        )
      }
    </div>
  )
}
