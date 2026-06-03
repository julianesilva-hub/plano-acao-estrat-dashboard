import { useState, useCallback } from 'react'
import type { Acao } from '../types'
import { useUser } from '../context/UserContext'

const API_URL =
  'https://script.google.com/macros/s/AKfycbyUDv1i6rjJzIxY8gtF6c5d4yztSx5VYRNHRwy54472LuOTKIdL5QNkJQb2WlSzYjk/exec'

export interface EditPayload {
  ID: string
  Status: string
  Observação: string
  Prazo: string
  AtualizadoPor: string
  UltimaAtualizacao: string
}

export interface EditResult {
  success: boolean
  message: string
}

export function useEdit(onSuccess: () => void) {
  const { currentUser } = useUser()
  const [saving, setSaving]         = useState(false)
  const [editTarget, setEditTarget] = useState<Acao | null>(null)
  const [toast, setToast]           = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function openEdit(row: Acao) { setEditTarget(row) }
  function closeEdit()         { setEditTarget(null) }

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  /**
   * Comparação com trim() para evitar falha por espaços invisíveis.
   * Baseada EXCLUSIVAMENTE em "Você é" (currentUser).
   */
  function canEdit(row: Acao): boolean {
    if (!currentUser.trim()) return false
    return row['Responsável'].trim() === currentUser.trim()
  }

  const save = useCallback(async (payload: EditPayload) => {
    setSaving(true)

    console.log('[Edit] ▶ Iniciando POST')
    console.log('[Edit] URL:', API_URL)
    console.log('[Edit] Payload:', JSON.stringify(payload, null, 2))

    try {
      /*
       * Apps Script + CORS: fetch com method POST e redirect:'follow'
       * O Apps Script retorna redirect 302 → o browser segue automaticamente.
       * Content-Type: text/plain evita OPTIONS preflight que o Apps Script rejeita.
       */
      const response = await fetch(API_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })

      console.log('[Edit] HTTP status:', response.status, response.statusText)
      console.log('[Edit] Response URL (após redirect):', response.url)

      const text = await response.text()
      console.log('[Edit] Resposta bruta:', text.slice(0, 500))

      // Apps Script às vezes retorna HTML de erro — detectar
      if (text.trim().startsWith('<')) {
        console.error('[Edit] Apps Script retornou HTML — verifique se está publicado como Web App')
        showToast('error', 'Apps Script retornou resposta inesperada. Verifique a publicação.')
        return
      }

      let result: EditResult
      try {
        result = JSON.parse(text)
      } catch {
        result = { success: response.ok, message: text || 'Resposta não reconhecida' }
      }

      if (result.success) {
        showToast('success', 'Atualizado com sucesso!')
        setEditTarget(null)
        onSuccess()
      } else {
        showToast('error', result.message || 'Erro ao salvar. Tente novamente.')
      }

    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[Edit] ✖ Erro de fetch:', msg)
      showToast('error', `Erro de conexão: ${msg}`)
    } finally {
      setSaving(false)
    }
  }, [onSuccess])

  return { editTarget, openEdit, closeEdit, save, saving, toast, canEdit, currentUser }
}
