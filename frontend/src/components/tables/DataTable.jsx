// src/components/tables/DataTable.jsx
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import TableToolbar from './TableToolbar';
import Pagination from '../common/Pagination';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  // Search & Filters
  searchable = false,
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  // Sorting
  sortColumn,
  sortDirection = 'asc',
  onSort,
  // Selection
  selectable = false,
  selectedRows = new Set(),
  onSelectRow,
  onSelectAll,
  rowIdKey = 'id',
  // Pagination
  pagination = true,
  page = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
  // Actions & Export
  actions = [],
  batchActions = [],
  exportable = false,
  onExport,
  // Customization
  onRowClick,
  rowClassName,
  emptyTitle = 'No records found',
  emptyMessage = 'There are no records matching your current filter criteria.',
}) {
  const allIds = data.map((row) => row[rowIdKey]);
  const isAllSelected = allIds.length > 0 && allIds.every((id) => selectedRows.has(id));

  return (
    <div className="card overflow-hidden">
      {/* Optional Toolbar */}
      {(searchable || filters.length > 0 || actions.length > 0 || exportable) && (
        <div className="px-5 border-b border-border bg-white">
          <TableToolbar
            searchable={searchable}
            searchPlaceholder={searchPlaceholder}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            filters={filters}
            filterValues={filterValues}
            onFilterChange={onFilterChange}
            actions={actions}
            batchActions={batchActions}
            selectedCount={selectedRows.size}
            exportable={exportable}
            onExport={onExport}
          />
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-subtle border-b border-border text-[11px] font-semibold uppercase tracking-wider text-text-secondary select-none">
              {selectable && (
                <th className="w-10 px-3.5 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={() => onSelectAll && onSelectAll(allIds)}
                    className="w-3.5 h-3.5 rounded border-border text-action focus:ring-action cursor-pointer"
                  />
                </th>
              )}

              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`px-4 py-3 font-semibold ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${
                      col.sortable && onSort
                        ? 'cursor-pointer hover:bg-gray-100/80 transition-colors'
                        : ''
                    }`}
                    onClick={() => col.sortable && onSort && onSort(col.key)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : ''
                      }`}
                    >
                      <span>{col.label}</span>
                      {col.sortable && onSort && (
                        <span className="text-gray-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-action" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-action" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-xs">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="p-8 text-center"
                >
                  <LoadingState variant="table" count={5} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 px-4"
                >
                  <EmptyState title={emptyTitle} message={emptyMessage} />
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const rowId = row[rowIdKey] || idx;
                const isSelected = selectedRows.has(rowId);
                const customClasses = rowClassName ? rowClassName(row) : '';

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors hover:bg-surface-subtle ${
                      isSelected ? 'bg-action-light/40' : ''
                    } ${onRowClick ? 'cursor-pointer' : ''} ${customClasses}`}
                  >
                    {selectable && (
                      <td
                        className="w-10 px-3.5 py-2.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow && onSelectRow(rowId)}
                          className="w-3.5 h-3.5 rounded border-border text-action focus:ring-action cursor-pointer"
                        />
                      </td>
                    )}

                    {columns.map((col) => {
                      const value = row[col.key];
                      const rendered = col.render ? col.render(value, row) : value;

                      return (
                        <td
                          key={col.key}
                          className={`px-3.5 py-2.5 text-text-primary text-xs ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          }`}
                        >
                          {rendered ?? '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && onPageChange && data.length > 0 && (
        <div className="border-t border-border px-5 py-3 bg-white">
          <Pagination
            currentPage={page}
            page={page}
            pageSize={pageSize}
            totalItems={totalCount || data.length}
            totalCount={totalCount || data.length}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
}
