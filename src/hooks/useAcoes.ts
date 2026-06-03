import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Acao, AcaoRaw, Filters, SortCol, SortDir } from '../types'
import { enrichRow, isAtrasada, isVencendoBreve, isVencendo30 } from '../lib/utils'

const API_URL =
  'https://script.google.com/macros/s/AKfycbyUDv1i6rjJzIxY8gtF6c5d4yztSx5VYRNHRwy54472LuOTKIdL5QNkJQb2WlSzYjk/exec'

const INITIAL_FILTERS: Filters = {
  empresa: '', reuniao: '', setor: '', responsavel: '',
  status: '', periodo: '', ano: '',
}

export const PAGE_SIZE = 15

export function useAcoes() {
  const [allData, setAllData]       = useState<Acao[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [filters, setFilters]       = useState<Filters>(INITIAL_FILTERS)
  const [search, setSearch]         = useState('')
  const [sortCol, setSortCol]       = useState<SortCol>(null)
  const [sortDir, setSortDir]       = useState<SortDir>(1)
  const [page, setPage]             = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(API_URL)
      const data = await response.json()

      console.log('[Plano de Ação] Dados recebidos:', data)

      const raw: AcaoRaw[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)   ? data.data
        : Array.isArray(data?.values) ? data.values
        : []

      console.log(`[Plano de Ação] ${raw.length} registros`)
      if (raw.length > 0) console.log('[Plano de Ação] Amostra:', raw[0])

      setAllData(raw.map(enrichRow))
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      console.error('[Plano de Ação] Erro ao carregar:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchData])

  const filtered = useMemo(() => {
    return allData.filter(r => {
      if (filters.empresa     && r['Empresa']     !== filters.empresa)     return false
      if (filters.reuniao     && r['Reunião']     !== filters.reuniao)     return false
      if (filters.setor       && r['Setor']       !== filters.setor)       return false
      if (filters.responsavel && r['Responsável'] !== filters.responsavel) return false
      if (filters.status      && r['Status']      !== filters.status)      return false

      /* Filtro Ano — baseado em DT reunião */
      if (filters.ano) {
        const ano = parseInt(filters.ano)
        if (r._reuniao?.getFullYear() !== ano) return false
      }

      /* Filtro Prazo */
      if (filters.periodo === 'atrasadas' && !isAtrasada(r))      return false
      if (filters.periodo === '7d'        && !isVencendoBreve(r)) return false
      if (filters.periodo === '30d'       && !isVencendo30(r))    return false

      /* Busca textual */
      if (search) {
        const q = search.toLowerCase()
        const haystack = [
          r.ID, r.Empresa, r['Reunião'], r['Ação'], r.Setor,
          r['Responsável'], r.Status, r['Observação'],
        ].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }

      return true
    })
  }, [allData, filters, search])

  const sorted = useMemo(() => {
    if (!sortCol) return filtered
    return [...filtered].sort((a, b) => {
      let va: string | Date = String(a[sortCol] ?? '')
      let vb: string | Date = String(b[sortCol] ?? '')
      if (sortCol === 'Prazo')      { va = a._prazo   ?? new Date(0); vb = b._prazo   ?? new Date(0) }
      if (sortCol === 'DT reunião') { va = a._reuniao ?? new Date(0); vb = b._reuniao ?? new Date(0) }
      return va < vb ? -sortDir : va > vb ? sortDir : 0
    })
  }, [filtered, sortCol, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => (d === 1 ? -1 : 1))
    else { setSortCol(col); setSortDir(1) }
  }

  function updateFilter(key: keyof Filters, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS)
    setSearch('')
    setPage(1)
  }

  return {
    allData, filtered, sorted, paged,
    loading, error, lastUpdate,
    filters, search,
    setSearch: (v: string) => { setSearch(v); setPage(1) },
    sortCol, sortDir,
    page, setPage, totalPages,
    totalFiltered: sorted.length,
    handleSort, updateFilter, clearFilters,
    refresh: fetchData,
  }
}
