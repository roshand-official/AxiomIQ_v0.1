// src/components/tables/TableToolbar.jsx
import { Download, SlidersHorizontal } from 'lucide-react';
import SearchInput from '../common/SearchInput';
import FilterDropdown from '../common/FilterDropdown';

export default function TableToolbar({
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchValue = '',
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  exportable = false,
  onExport,
  actions = [],
  selectedCount = 0,
  batchActions = [],
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3">
      {/* Left side: Search & Filters */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {searchable && onSearchChange && (
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          </div>
        )}

        {filters.map((filter) => (
          <FilterDropdown
            key={filter.key}
            label={filter.label}
            options={filter.options}
            value={filterValues[filter.key] || 'all'}
            onChange={(val) => onFilterChange && onFilterChange(filter.key, val)}
          />
        ))}
      </div>

      {/* Right side: Actions, Export, Batch */}
      <div className="flex items-center gap-2 flex-wrap">
        {selectedCount > 0 && batchActions.length > 0 ? (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            <span className="text-xs font-semibold text-action">
              {selectedCount} selected
            </span>
            {batchActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={action.onClick}
                className={`btn btn-sm ${
                  action.variant === 'danger' ? 'btn-danger' : 'btn-secondary'
                }`}
              >
                {action.icon && <action.icon className="w-3.5 h-3.5" />}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {actions.map((act, idx) => (
              <button
                key={idx}
                type="button"
                onClick={act.onClick}
                className={`btn btn-sm ${
                  act.variant === 'primary'
                    ? 'btn-primary'
                    : act.variant === 'danger'
                    ? 'btn-danger'
                    : 'btn-secondary'
                }`}
              >
                {act.icon && <act.icon className="w-3.5 h-3.5" />}
                <span>{act.label}</span>
              </button>
            ))}

            {exportable && onExport && (
              <button
                type="button"
                onClick={onExport}
                className="btn btn-secondary btn-sm"
                title="Export to CSV"
              >
                <Download className="w-3.5 h-3.5 text-text-secondary" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
