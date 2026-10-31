// src/components/common/Pagination.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function getPageNumbers(currentPage, totalPages) {
  const pages = [];
  const delta = 1; // pages shown around current

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  const rangeStart = Math.max(2, currentPage - delta);
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

  if (rangeStart > 2) pages.push('...');
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < totalPages - 1) pages.push('...');

  pages.push(totalPages);
  return pages;
}

export default function Pagination({
  currentPage,
  page,
  totalItems,
  totalCount,
  total,
  pageSize,
  limit,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className = '',
}) {
  const activePage = Math.max(1, parseInt(currentPage ?? page, 10) || 1);
  const activePageSize = Math.max(1, parseInt(pageSize ?? limit, 10) || 10);
  const activeTotal = Math.max(0, parseInt(totalItems ?? totalCount ?? total, 10) || 0);

  const totalPages = Math.max(1, Math.ceil(activeTotal / activePageSize));
  const startItem = activeTotal === 0 ? 0 : Math.min((activePage - 1) * activePageSize + 1, activeTotal);
  const endItem = Math.min(activePage * activePageSize, activeTotal);
  const pages = getPageNumbers(activePage, totalPages);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
      {/* Left: items info + page size */}
      <div className="flex items-center gap-3 text-sm text-text-secondary">
        <span>
          Showing{' '}
          <span className="font-medium text-text-primary">
            {activeTotal === 0 ? '0' : `${startItem}–${endItem}`}
          </span>{' '}
          of{' '}
          <span className="font-medium text-text-primary">{activeTotal}</span>
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">|</span>
            <select
              value={activePageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="select-field py-1 px-2 text-xs w-auto min-w-0"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange && onPageChange(activePage - 1)}
          disabled={activePage <= 1}
          className="btn-ghost btn-sm p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-sm text-text-muted select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange && onPageChange(p)}
              className={`btn-sm min-w-[32px] h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                p === activePage
                  ? 'bg-action text-white shadow-sm'
                  : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange && onPageChange(activePage + 1)}
          disabled={activePage >= totalPages}
          className="btn-ghost btn-sm p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
