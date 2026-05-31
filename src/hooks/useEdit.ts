import { useState, useCallback } from 'react'
import type { Acao } from '../types'

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
  const [saving, setSaving] = useState(false)
  const [editTarget, setEditTarget] = useState<Acao | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function openEdit(row: Acao) {
    setEditTarget(row)
  }

  function closeEdit() {
    setEditTarget(null)
  }

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const save = useCallback(async (payload: EditPayload) => {
    setSaving(true)
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // Apps Script exige text/plain para evitar CORS preflight
        body: JSON.stringify(payload),
      })

      const text = await response.text()
      console.log('[Edit] Resposta Apps Script:', text)

      let result: EditResult
      try {
        result = JSON.parse(text)
      } catch {
        result = { success: response.ok, message: text }
      }

      if (result.success) {
        showToast('success', 'Atualizado com sucesso!')
        setEditTarget(null)
        onSuccess()
      } else {
        showToast('error', result.message || 'Erro ao salvar. Tente novamente.')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro de conexão'
      console.error('[Edit] Erro ao salvar:', msg)
      showToast('error', 'Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }, [onSuccess])

  return { editTarget, openEdit, closeEdit, save, saving, toast }
}
