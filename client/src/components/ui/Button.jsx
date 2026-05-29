import { forwardRef } from 'react';
import { LoaderCircle } from 'lucide-react';

const variants = {
  primary:   'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-sm',
  secondary: 'bg-gray-100 text-dark hover:bg-gray-200 active:scale-[0.98]',
  outline:   'border border-gray-300 bg-white text-dark hover:border-primary hover:text-primary active:scale-[0.98]',
  ghost:     'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-dark active:scale-[0.98]',
  danger:    'bg-danger text-white hover:bg-red-600 active:scale-[0.98] shadow-sm',
};

const sizes = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
};

const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  children,
  className = '',
  ...props
}, ref) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none';

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <LoaderCircle size={14} className="animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
