import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon,
  iconRight,
  className = '',
  wrapperClassName = '',
  required,
  ...props
}, ref) => {
  const hasError = Boolean(error);

  return (
    <div className={`form-group ${wrapperClassName}`}>
      {label && (
        <label className="text-sm font-medium text-dark">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          className={`
            w-full h-9 rounded-lg border bg-white text-sm text-dark placeholder:text-gray-400
            px-3 py-2 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${icon ? 'pl-9' : ''}
            ${iconRight ? 'pr-9' : ''}
            ${hasError
              ? 'border-danger focus:ring-danger/30 focus:border-danger'
              : 'border-gray-300 focus:ring-primary/30 focus:border-primary'
            }
            ${className}
          `}
          {...props}
        />

        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {iconRight}
          </span>
        )}
      </div>

      {hasError && (
        <p className="text-xs text-danger flex items-center gap-1">{error}</p>
      )}
      {!hasError && hint && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
