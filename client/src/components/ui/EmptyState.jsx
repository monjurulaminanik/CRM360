import { Inbox } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
    <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
      <Icon size={26} className="text-primary" strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-semibold text-dark mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 max-w-xs mb-5">{description}</p>}
    {action && (
      <Button variant="primary" size="sm" onClick={action.onClick} icon={action.icon}>
        {action.label}
      </Button>
    )}
  </div>
);

export default EmptyState;
