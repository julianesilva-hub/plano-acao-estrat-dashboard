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
   * PROBLEMA 1: Permissão baseada EXCLUSIVAMENTE em "Você é" (currentUser).
   * Sem qualquer relação com o filtro Responsável.
   */
  function canEdit(row: Acao): boolean {
    if (!currentUser.trim()) return false
    return row['Responsável'].trim() === currentUser.trim()
  }

  const save = useCallback(async (payload: EditPayload) => {
    setSaving(true)

    // ─── LOGS COMPLETOS PARA DIAGNÓSTICO (PROBLEMA 2) ───────────────────────
    console.log('[Edit] ▶ Iniciando envio')
    console.log('[Edit] URL base:', API_URL)
    console.log('[Edit] Payload completo:', JSON.stringify(payload, null, 2))

    try {
      /*
       * PROBLEMA 2 — SOLUÇÃO:
       * Apps Script rejeita POST com CORS quando há redirect 302.
       * Estratégia: enviar via GET com payload em query string (contorna CORS).
       * Se o Apps Script aceitar POST sem redirect, use POST.
       * Tentamos POST primeiro. Se falhar por CORS/network, usamos GET.
       *
       * Apps Script: doPost(e) recebe e.postData.contents = JSON string
       *              doGet(e)  recebe e.parameter.payload = JSON string
       */

      // ── TENTATIVA 1: POST com Content-Type text/plain (sem preflight) ──────
      let response: Response | null = null
      let fetchError: string | null = null

      try {
        console.log('[Edit] Tentativa 1: POST text/plain com redirect:follow')
        response = await fetch(API_URL, {
          method: 'POST',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        })
        console.log('[Edit] POST status:', response.status, response.statusText)
        console.log('[Edit] POST URL final (após redirect):', response.url)
        console.log('[Edit] POST ok?', response.ok)
        console.log('[Edit] POST type:', response.type)
      } catch (e1) {
        fetchError = e1 instanceof Error ? e1.message : String(e1)
        console.error('[Edit] POST falhou:', fetchError)
      }

      // ── TENTATIVA 2: GET com payload em query string ──────────────────────
      if (!response || !response.ok || response.type === 'opaque') {
        console.log('[Edit] Tentativa 2: GET com payload na query string')
        const encoded = encodeURIComponent(JSON.stringify(payload))
        const getUrl = `${API_URL}?action=update&payload=${encoded}`
        console.log('[Edit] GET URL:', getUrl.slice(0, 300))
        try {
          response = await fetch(getUrl, { redirect: 'follow' })
          console.log('[Edit] GET status:', response.status, response.statusText)
          console.log('[Edit] GET URL final:', response.url)
          console.log('[Edit] GET type:', response.type)
        } catch (e2) {
          const msg2 = e2 instanceof Error ? e2.message : String(e2)
          console.error('[Edit] GET também falhou:', msg2)
          throw new Error(`POST: ${fetchError ?? 'falhou'} | GET: ${msg2}`)
        }
      }

      const text = await response.text()
      console.log('[Edit] Resposta bruta (primeiros 1000 chars):', text.slice(0, 1000))

      // Detectar resposta HTML de erro do Apps Script
      if (text.trim().startsWith('<')) {
        console.error('[Edit] Apps Script retornou HTML — provavelmente não publicado como "Anyone" ou erro interno')
        console.error('[Edit] HTML recebido:', text.slice(0, 500))
        showToast('error', 'Apps Script retornou HTML. Verifique: Deploy > Manage Deployments > "Who has access" = Anyone.')
        return
      }

      let result: EditResult
      try {
        result = JSON.parse(text)
        console.log('[Edit] JSON parseado:', result)
      } catch {
        console.warn('[Edit] Resposta não é JSON válido:', text.slice(0, 200))
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
      console.error('[Edit] ✖ Erro final:', msg)
      console.error('[Edit] Stack:', e instanceof Error ? e.stack : 'sem stack')
      showToast('error', `Erro de conexão: ${msg}`)
    } finally {
      setSaving(false)
    }
  }, [onSuccess])

  return { editTarget, openEdit, closeEdit, save, saving, toast, canEdit, currentUser }
}
