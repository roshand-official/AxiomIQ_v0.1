// src/components/common/Tabs.jsx
export default function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div className={`border-b border-border ${className}`}>
      <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-action text-action'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
              }`}
            >
              {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-action' : 'text-text-secondary'}`} />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                    isActive ? 'bg-blue-50 text-action' : 'bg-gray-100 text-text-secondary'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
