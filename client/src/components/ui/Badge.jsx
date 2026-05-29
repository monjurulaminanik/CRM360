const variants = {
  default: 'bg-gray-100 text-gray-700',
  info:    'bg-primary-light text-primary',
  success: 'bg-emerald-50 text-success',
  warning: 'bg-amber-50 text-warning',
  danger:  'bg-red-50 text-danger',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

const Badge = ({ variant = 'default', size = 'md', dot = false, children, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
  >
    {dot && (
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          variant === 'success' ? 'bg-success' :
          variant === 'warning' ? 'bg-warning' :
          variant === 'danger'  ? 'bg-danger'  :
          variant === 'info'    ? 'bg-primary'  :
          'bg-gray-400'
        }`}
      />
    )}
    {children}
  </span>
);

export default Badge;
