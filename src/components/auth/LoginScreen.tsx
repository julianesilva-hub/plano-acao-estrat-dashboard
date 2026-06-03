import { GoogleLogin } from '@react-oauth/google'
import { Loader2, ShieldAlert, BarChart3 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function LoginScreen() {
  const { login, loadingAuth, authError } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Topo */}
          <div className="bg-brand-500 px-8 py-8 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={28} className="text-white" />
            </div>
            <h1 className="text-white text-lg font-semibold leading-tight">
              Plano de Ação Estratégico
            </h1>
            <p className="text-blue-100 text-xs mt-1.5 leading-relaxed">
              Monitoramento Executivo<br />Governança Corporativa
            </p>
          </div>

          {/* Corpo */}
          <div className="px-8 py-8 flex flex-col items-center gap-5">
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Acesse com sua conta Google corporativa para continuar.
            </p>

            {authError && (
              <div className="w-full flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <ShieldAlert size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed">{authError}</p>
              </div>
            )}

            {loadingAuth ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <Loader2 size={16} className="animate-spin text-brand-500" />
                Verificando autorização...
              </div>
            ) : (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={cr => { if (cr.credential) login(cr.credential) }}
                  onError={() => console.error('[Auth] Falha no login Google')}
                  text="signin_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                />
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-5">
          Acesso restrito a usuários autorizados.
        </p>
      </div>
    </div>
  )
}
