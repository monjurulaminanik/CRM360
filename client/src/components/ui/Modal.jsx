import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const sizes = {
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[95vw]',
};

const Modal = ({
  open,
  onClose,
  title,
  description,
  size = 'md',
  hideClose = false,
  children,
  footer,
}) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onClose?.()}
    >
      <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" />

      <div
        className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-modal flex flex-col max-h-[90vh] animate-slide-up`}
        role="dialog"
        aria-modal="true"
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
            <div>
              {title && <h3 className="text-base font-semibold text-dark">{title}</h3>}
              {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                className="ml-4 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        <div className="px-6 py-4 overflow-y-auto scrollbar-thin flex-1">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
