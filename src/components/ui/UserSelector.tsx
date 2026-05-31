import { UserCircle2, ChevronDown } from 'lucide-react'
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
    <div className="flex items-center gap-2">
      <UserCircle2 size={15} className="text-gray-400 flex-shrink-0" />
      <span className="text-[11px] text-gray-400 whitespace-nowrap hidden sm:inline">Você é:</span>
      <div className="relative">
        <select
          value={currentUser}
          onChange={e => setCurrentUser(e.target.value)}
          className="text-[12px] pl-2 pr-6 h-7 rounded-md border border-gray-200 bg-white text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 appearance-none min-w-[130px] max-w-[180px]"
        >
          <option value="">Selecionar...</option>
          {responsaveis.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {currentUser && (
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100 font-medium whitespace-nowrap hidden md:inline">
          ✏️ pode editar suas ações
        </span>
      )}
    </div>
  )
}
