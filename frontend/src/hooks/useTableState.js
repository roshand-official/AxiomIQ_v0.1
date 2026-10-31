// src/hooks/useTableState.js
import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export function useTableState(data, options = {}) {
  const {
    initialSort = null,
    initialSortDir = 'asc',
    initialPageSize = 10,
    searchFields = [],
  } = options;

  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState(initialSort);
  const [sortDirection, setSortDirection] = useState(initialSortDir);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [filters, setFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());

  const debouncedSearch = useDebounce(search, 300);

  const handleSort = useCallback((column) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPage(1);
  }, [sortColumn]);

  const handleFilter = useCallback((key, value) => {
    setFilters(prev => {
      if (value === '' || value === 'all' || value == null) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    setSelectedRows(new Set());
  }, []);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(1);
    setSelectedRows(new Set());
  }, []);

  const handleSelectRow = useCallback((id) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((ids) => {
    setSelectedRows(prev => {
      if (prev.size === ids.length) return new Set();
      return new Set(ids);
    });
  }, []);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (debouncedSearch && searchFields.length > 0) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const val = item[field];
          return val && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(item => String(item[key]).toLowerCase() === String(value).toLowerCase());
      }
    });

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, debouncedSearch, searchFields, filters, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  return {
    search, setSearch,
    sortColumn, sortDirection, handleSort,
    page, pageSize, totalPages,
    handlePageChange, handlePageSizeChange,
    filters, handleFilter,
    selectedRows, handleSelectRow, handleSelectAll,
    filteredData,
    paginatedData,
    totalCount: filteredData.length,
  };
}
