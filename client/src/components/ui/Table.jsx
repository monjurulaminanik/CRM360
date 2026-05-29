import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  pagination,
  onPageChange,
  className = '',
  rowClassName,
  onRowClick,
}) => {
  const [sort, setSort] = useState({ key: null, dir: 'asc' });

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  const sorted = sort.key
    ? [...data].sort((a, b) => {
        const av = a[sort.key] ?? '';
        const bv = b[sort.key] ?? '';
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sort.dir === 'asc' ? cmp : -cmp;
      })
    : data;

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap
                    ${col.sortable ? 'cursor-pointer select-none hover:text-dark transition-colors duration-200' : ''}
                    ${col.width ?? ''}`}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sort.key === col.key ? (
                        sort.dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                      ) : (
                        <ChevronsUpDown size={13} className="text-gray-300" />
                      )
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading…</span>
                  </div>
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No data found
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={`bg-white transition-colors duration-150
                    ${onRowClick ? 'cursor-pointer hover:bg-primary-light/40' : 'hover:bg-gray-50/60'}
                    ${rowClassName?.(row) ?? ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-dark">
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>
            Showing <span className="font-medium text-dark">{pagination.from}–{pagination.to}</span> of{' '}
            <span className="font-medium text-dark">{pagination.total}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-3 py-1 rounded-lg bg-primary-light text-primary font-medium">
              {pagination.page}
            </span>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
