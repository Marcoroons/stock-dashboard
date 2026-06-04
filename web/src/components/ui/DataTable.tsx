import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

export type SortDirection = 'asc' | 'desc' | null

export interface ColumnDef<T> {
  key: keyof T
  label: string
  width?: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T extends Record<string, any>> {
  data: T[]
  columns: ColumnDef<T>[]
  keyField: keyof T
  sortable?: boolean
  hoverable?: boolean
  striped?: boolean
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyState?: React.ReactNode
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  sortable = true,
  hoverable = true,
  striped = true,
  onRowClick,
  loading = false,
  emptyState,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>(null)

  const toggleSort = (key: keyof T) => {
    if (!sortable) return
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc')
      else if (sortDir === 'desc') {
        setSortKey(null)
        setSortDir(null)
      }
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]

      if (aVal == null) return 1
      if (bVal == null) return -1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }

      const strA = String(aVal).toLowerCase()
      const strB = String(bVal).toLowerCase()
      return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA)
    })
  }, [data, sortKey, sortDir])

  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (sortedData.length === 0) {
    return emptyState || (
      <div className="glass-card p-8 text-center">
        <p className="text-[#64748b]">No data to display</p>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e3a] bg-[#0f0f1a]">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="text-left px-4 py-3 font-medium text-[#64748b] uppercase tracking-wider text-xs whitespace-nowrap"
                  style={{ width: col.width, textAlign: col.align }}
                >
                  {col.sortable && sortable ? (
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="flex items-center gap-1.5 hover:text-[#94a3b8] transition-colors cursor-pointer"
                    >
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <motion.tr
                key={String(row[keyField])}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className={cn(
                  'border-b border-[#1e1e3a]',
                  striped && idx % 2 === 0 && 'bg-[#0f0f1a]',
                  hoverable && 'hover:bg-[#141425] transition-colors',
                  onRowClick && 'cursor-pointer',
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="px-4 py-3 text-[#f1f5f9]"
                    style={{ textAlign: col.align }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Convenience component for financial tables
export function FinancialTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <DataTable
      data={data}
      columns={columns}
      keyField={keyField}
      sortable
      hoverable
      striped
      onRowClick={onRowClick}
    />
  )
}
