// src/components/common/LoadingState.jsx

function SkeletonBar({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function TableSkeleton({ rows = 5 }) {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-5 py-3 flex items-center gap-6">
        {[...Array(5)].map((_, i) => (
          <SkeletonBar key={i} className="h-3.5 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="px-5 py-4 flex items-center gap-6 border-b border-border last:border-0">
          {[...Array(5)].map((_, j) => (
            <SkeletonBar
              key={j}
              className={`h-3.5 flex-1 ${j === 0 ? 'max-w-[140px]' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <SkeletonBar className="w-11 h-11 rounded-lg !rounded-lg" />
            <div className="flex-1 space-y-2">
              <SkeletonBar className="h-3 w-24" />
              <SkeletonBar className="h-5 w-16" />
            </div>
          </div>
          <SkeletonBar className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBar className="h-7 w-48" />
          <SkeletonBar className="h-4 w-72" />
        </div>
        <SkeletonBar className="h-10 w-32 rounded-lg" />
      </div>
      {/* KPI row */}
      <CardSkeleton count={4} />
      {/* Table */}
      <TableSkeleton rows={6} />
    </div>
  );
}

export default function LoadingState({ variant = 'table', rows, count, className = '' }) {
  return (
    <div className={className}>
      {variant === 'table' && <TableSkeleton rows={rows} />}
      {variant === 'card' && <CardSkeleton count={count} />}
      {variant === 'page' && <PageSkeleton />}
    </div>
  );
}
