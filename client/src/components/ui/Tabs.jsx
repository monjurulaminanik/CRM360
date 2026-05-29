import { useState } from 'react';

const Tabs = ({ tabs = [], defaultTab, onChange, className = '' }) => {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  const select = (id) => {
    setActive(id);
    onChange?.(id);
  };

  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div className={className}>
      <div className="flex gap-1 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && select(tab.id)}
            disabled={tab.disabled}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px
              disabled:opacity-40 disabled:cursor-not-allowed
              ${active === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-dark hover:border-gray-200'
              }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.count != null && (
              <span className={`ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-medium
                ${active === tab.id ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab?.content && (
        <div className="pt-4">{activeTab.content}</div>
      )}
    </div>
  );
};

export default Tabs;
