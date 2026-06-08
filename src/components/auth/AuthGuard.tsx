import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { LoginScreen } from './LoginScreen'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <LoginScreen />
  return <>{children}</>
}
