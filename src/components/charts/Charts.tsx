import { useMemo } from 'react'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import type { Acao } from '../../types'
import { isConcluido, isAtrasada, trunc } from '../../lib/utils'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const PALETTE = ['#185FA5','#3B6D11','#854F0B','#A32D2D','#534AB7','#0F6E56','#993C1D','#888780']

interface ChartsProps { data: Acao[] }

interface SetorEntry { t: number; a: number; at: number }
interface RespEntry  { t: number; p: number; at: number }

export function Charts({ data }: ChartsProps) {
  const statusData = useMemo(() => {
    const map: Record<string, number> = {}
    data.forEach(r => { const s = r.Status || 'Sem status'; map[s] = (map[s] ?? 0) + 1 })
    return map
  }, [data])

  const setorData = useMemo(() => {
    const map: Record<string, SetorEntry> = {}
    data.forEach(r => {
      const s = r.Setor || 'N/A'
      if (!map[s]) map[s] = { t: 0, a: 0, at: 0 }
      map[s].t++
      if (!isConcluido(r.Status)) map[s].a++
      if (isAtrasada(r)) map[s].at++
    })
    return Object.entries(map).sort((a, b) => b[1].t - a[1].t).slice(0, 8)
  }, [data])

  const respData = useMemo(() => {
    const map: Record<string, RespEntry> = {}
    data.forEach(r => {
      const s = r['Responsável'] || 'N/A'
      if (!map[s]) map[s] = { t: 0, p: 0, at: 0 }
      map[s].t++
      if (!isConcluido(r.Status)) map[s].p++
      if (isAtrasada(r)) map[s].at++
    })
    return Object.entries(map).sort((a, b) => b[1].t - a[1].t).slice(0, 8)
  }, [data])

  const stLabels = Object.keys(statusData)
  const stValues = Object.values(statusData)
  const seLabels = setorData.map(([k]) => trunc(k, 22))
  const rLabels  = respData.map(([k]) => trunc(k, 22))

  const barOpts = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
      y: { ticks: { font: { size: 11 } } },
    },
  }

  const BarLegend = ({ items }: { items: { color: string; label: string }[] }) => (
    <div className="flex flex-wrap gap-3 mb-3">
      {items.map(i => (
        <span key={i.label} className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-0.5">Status das Ações</h3>
          <p className="text-[11px] text-gray-400 mb-3">Distribuição por status</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {stLabels.map((l, i) => (
              <span key={l} className="flex items-center gap-1 text-[11px] text-gray-500">
                <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0"
                  style={{ background: PALETTE[i % PALETTE.length] }} />
                {trunc(l, 20)} ({stValues[i]})
              </span>
            ))}
          </div>
          <div style={{ position: 'relative', height: 200 }}>
            <Doughnut
              data={{
                labels: stLabels,
                datasets: [{ data: stValues, backgroundColor: PALETTE.slice(0, stLabels.length), borderWidth: 2, borderColor: '#fff' }],
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>

        {/* Setor */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-0.5">Ações por Setor</h3>
          <p className="text-[11px] text-gray-400 mb-2">Volume, abertas e atrasadas</p>
          <BarLegend items={[{color:'#B5D4F4',label:'Total'},{color:'#85B7EB',label:'Abertas'},{color:'#F09595',label:'Atrasadas'}]} />
          <div style={{ position: 'relative', height: Math.max(180, setorData.length * 38 + 50) }}>
            <Bar
              data={{
                labels: seLabels,
                datasets: [
                  { label: 'Total',    data: setorData.map(([,v]) => v.t),  backgroundColor: '#B5D4F4', borderRadius: 3 },
                  { label: 'Abertas',  data: setorData.map(([,v]) => v.a),  backgroundColor: '#85B7EB', borderRadius: 3 },
                  { label: 'Atrasadas',data: setorData.map(([,v]) => v.at), backgroundColor: '#F09595', borderRadius: 3 },
                ],
              }}
              options={barOpts}
            />
          </div>
        </div>
      </div>

      {/* Responsável */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-800 mb-0.5">Ações por Responsável</h3>
        <p className="text-[11px] text-gray-400 mb-2">Carga, pendências e atrasos</p>
        <BarLegend items={[{color:'#B5D4F4',label:'Total'},{color:'#85B7EB',label:'Pendentes'},{color:'#F09595',label:'Atrasadas'}]} />
        <div style={{ position: 'relative', height: Math.max(180, respData.length * 38 + 50) }}>
          <Bar
            data={{
              labels: rLabels,
              datasets: [
                { label: 'Total',     data: respData.map(([,v]) => v.t),  backgroundColor: '#B5D4F4', borderRadius: 3 },
                { label: 'Pendentes', data: respData.map(([,v]) => v.p),  backgroundColor: '#85B7EB', borderRadius: 3 },
                { label: 'Atrasadas', data: respData.map(([,v]) => v.at), backgroundColor: '#F09595', borderRadius: 3 },
              ],
            }}
            options={barOpts}
          />
        </div>
      </div>
    </div>
  )
}
