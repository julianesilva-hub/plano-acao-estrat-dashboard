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
  const { currentUser } = useUser()   // "Você é" — fonte única de identidade para edição
  const [saving, setSaving]           = useState(false)
  const [editTarget, setEditTarget]   = useState<Acao | null>(null)
  const [toast, setToast]             = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function openEdit(row: Acao) { setEditTarget(row) }
  function closeEdit()         { setEditTarget(null) }

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  /**
   * Permissão baseada EXCLUSIVAMENTE em "Você é" (currentUser).
   * Independente do filtro "Responsável".
   */
  function canEdit(row: Acao): boolean {
    if (!currentUser) return false
    return row['Responsável'] === currentUser
  }

  const save = useCallback(async (payload: EditPayload) => {
    setSaving(true)
    try {
      console.log('[Edit] Enviando payload:', payload)

      const response = await fetch(API_URL, {
        method: 'POST',
        // Apps Script não aceita application/json (gera preflight CORS)
        // text/plain evita preflight e o body ainda é JSON válido
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })

      console.log('[Edit] HTTP status:', response.status)
      const text = await response.text()
      console.log('[Edit] Resposta bruta:', text)

      let result: EditResult
      try {
        result = JSON.parse(text)
      } catch {
        // Se não for JSON, considera sucesso se HTTP 200
        result = { success: response.ok, message: text || 'Resposta inesperada da API' }
      }

      if (result.success) {
        showToast('success', 'Atualizado com sucesso!')
        setEditTarget(null)
        onSuccess()
      } else {
        showToast('error', result.message || 'Erro ao salvar. Tente novamente.')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      console.error('[Edit] Erro de conexão:', msg)
      // "Failed to fetch" em produção quase sempre é o Apps Script retornando
      // redirect 302 que o fetch segue mas perde o body — tratar como possível sucesso
      showToast('error', `Erro de conexão: ${msg}. Verifique se o Apps Script está publicado corretamente.`)
    } finally {
      setSaving(false)
    }
  }, [onSuccess])

  return { editTarget, openEdit, closeEdit, save, saving, toast, canEdit, currentUser }
}
