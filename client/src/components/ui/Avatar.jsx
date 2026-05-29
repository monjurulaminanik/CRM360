const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
};

const colors = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function getColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const Avatar = ({ src, name = '', size = 'md', className = '', status }) => {
  const initials = getInitials(name);
  const colorClass = getColor(name);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`}
        />
      ) : (
        <span
          className={`${sizes[size]} ${colorClass} rounded-full inline-flex items-center justify-center font-semibold ring-2 ring-white`}
        >
          {initials || '?'}
        </span>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white w-2.5 h-2.5 ${
            status === 'online'  ? 'bg-success' :
            status === 'away'   ? 'bg-warning'  :
            status === 'busy'   ? 'bg-danger'   :
            'bg-gray-400'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
