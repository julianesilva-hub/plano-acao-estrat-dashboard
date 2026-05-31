import { Header } from './components/layout/Header'
import { FilterBar } from './components/filters/FilterBar'
import { KPIGrid } from './components/kpis/KPIGrid'
import { Charts } from './components/charts/Charts'
import { Alerts } from './components/alerts/Alerts'
import { Table } from './components/table/Table'
import { EditModal } from './components/edit/EditModal'
import { Toast } from './components/ui/Toast'
import { useAcoes } from './hooks/useAcoes'
import { useEdit } from './hooks/useEdit'
import { calcKPIs } from './lib/kpis'
import { unique } from './lib/utils'

export default function App() {
  const {
    allData,
    filtered,
    sorted,
    paged,
    loading,
    error,
    lastUpdate,
    filters,
    search,
    setSearch,
    sortCol,
    sortDir,
    page,
    setPage,
    totalPages,
    totalFiltered,
    handleSort,
    updateFilter,
    clearFilters,
    refresh,
  } = useAcoes()

  const { editTarget, openEdit, closeEdit, save, saving, toast } = useEdit(refresh)

  const kpis = calcKPIs(filtered)
  const statusOptions = unique(allData, 'Status')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        loading={loading}
        error={error}
        lastUpdate={lastUpdate}
        totalRecords={allData.length}
        allData={allData}
        onRefresh={refresh}
      />

      <FilterBar
        allData={allData}
        filters={filters}
        onUpdate={updateFilter}
        onClear={clearFilters}
      />

      <main className="px-6 py-5 space-y-5 max-w-screen-2xl mx-auto">
        <KPIGrid kpis={kpis} />

        {filtered.length > 0 && <Charts data={filtered} />}

        <Alerts data={filtered} />

        <Table
          paged={paged}
          allFiltered={sorted}
          totalFiltered={totalFiltered}
          page={page}
          totalPages={totalPages}
          sortCol={sortCol}
          sortDir={sortDir}
          search={search}
          onSort={handleSort}
          onSearch={setSearch}
          onPage={setPage}
          onEdit={openEdit}
        />
      </main>

      {/* Modal de edição */}
      {editTarget && (
        <EditModal
          row={editTarget}
          saving={saving}
          onClose={closeEdit}
          onSave={save}
          statusOptions={statusOptions}
        />
      )}

      {/* Toast de feedback */}
      {toast && <Toast type={toast.type} msg={toast.msg} />}
    </div>
  )
}
