import {
  createContext, useContext, useState, useCallback,
  useEffect, type ReactNode,
} from 'react'
import type { AuthUser, UsuarioCadastro } from '../types'

const API_URL =
  'https://script.google.com/macros/s/AKfycbyUDv1i6rjJzIxY8gtF6c5d4yztSx5VYRNHRwy54472LuOTKIdL5QNkJQb2WlSzYjk/exec'

const SESSION_KEY = 'plano_acao_auth_user'

interface AuthContextType {
  user: AuthUser | null
  loadingAuth: boolean
  authError: string | null
  login: (googleCredential: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loadingAuth: false,
  authError: null,
  login: async () => {},
  logout: () => {},
})

/* Decodifica JWT do Google sem biblioteca extra */
function decodeGoogleJwt(token: string): { name: string; email: string; picture: string } {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(
    atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  )
  return JSON.parse(json)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  /* Persiste sessão no sessionStorage */
  useEffect(() => {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [user])

  const login = useCallback(async (googleCredential: string) => {
    setLoadingAuth(true)
    setAuthError(null)

    try {
      /* 1. Decodifica o JWT do Google → obtém name, email, picture */
      const googleUser = decodeGoogleJwt(googleCredential)
      console.log('[Auth] Google user:', googleUser.email)

      /* 2. Busca a lista de usuários cadastrados no Apps Script */
      const response = await fetch(`${API_URL}?action=usuarios`)
      const data = await response.json()

      console.log('[Auth] Dados de usuários recebidos:', data)

      const usuarios: UsuarioCadastro[] = Array.isArray(data?.usuarios)
        ? data.usuarios
        : []

      /* 3. Localiza o e-mail autenticado na aba Usuário */
      const cadastro = usuarios.find(
        u => u.email.trim().toLowerCase() === googleUser.email.trim().toLowerCase()
      )

      if (!cadastro) {
        setAuthError('Seu usuário não possui autorização para acessar este sistema.')
        setLoadingAuth(false)
        return
      }

      /* 4. Monta o objeto AuthUser */
      const authUser: AuthUser = {
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
        responsavel: cadastro.responsavel,
        acesso: cadastro.acesso,
      }

      console.log('[Auth] Acesso liberado:', authUser)
      setUser(authUser)

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro de autenticação'
      console.error('[Auth] Erro:', msg)
      setAuthError('Erro ao verificar autorização. Tente novamente.')
    } finally {
      setLoadingAuth(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setAuthError(null)
    sessionStorage.removeItem(SESSION_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loadingAuth, authError, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
