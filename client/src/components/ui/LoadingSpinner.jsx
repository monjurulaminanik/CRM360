const sizes = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-7 h-7 border-2',
  xl: 'w-10 h-10 border-[3px]',
};

const LoadingSpinner = ({ size = 'md', className = '', fullPage = false, label }) => {
  const spinner = (
    <div
      className={`${sizes[size]} border-primary border-t-transparent rounded-full animate-spin shrink-0 ${className}`}
      role="status"
      aria-label={label || 'Loading'}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          {label && <p className="text-sm text-gray-500 font-medium">{label}</p>}
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
