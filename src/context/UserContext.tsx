/**
 * UserContext — identidade local "Você é"
 * Completamente independente do filtro "Responsável" e do AuthContext.
 * Usado exclusivamente para determinar permissão de edição.
 */
import { createContext, useContext, useState, type ReactNode } from 'react'

interface UserContextType {
  currentUser: string           // nome selecionado em "Você é"
  setCurrentUser: (name: string) => void
}

const UserContext = createContext<UserContextType>({
  currentUser: '',
  setCurrentUser: () => {},
})

const STORAGE_KEY = 'plano_acao_voce_eh'

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  })

  function setCurrentUser(name: string) {
    setCurrentUserState(name)
    localStorage.setItem(STORAGE_KEY, name)
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
