import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({
  trigger,
  items = [],
  align = 'left',
  width = 'w-48',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen((p) => !p)} className="cursor-pointer">
        {trigger ?? (
          <button className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-dark">
            Options <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {open && (
        <div
          className={`absolute z-40 mt-1.5 ${width} bg-white border border-gray-100 rounded-xl shadow-dropdown py-1 animate-slide-down
            ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {items.map((item, i) => {
            if (item.divider) return <div key={i} className="my-1 border-t border-gray-100" />;

            return (
              <button
                key={i}
                onClick={() => { item.onClick?.(); setOpen(false); }}
                disabled={item.disabled}
                className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-sm transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${item.danger
                    ? 'text-danger hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-dark'
                  }`}
              >
                {item.icon && <span className="shrink-0 text-gray-400">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
