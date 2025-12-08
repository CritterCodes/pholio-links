import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Info,
  MinusCircle,
  PlayCircle
} from 'lucide-react';

interface StatusBadgeProps {
  status: string | boolean;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  variant?: 'default' | 'outline';
}

export function StatusBadge({ 
  status, 
  className, 
  showIcon = true,
  size = 'sm',
  variant = 'default'
}: StatusBadgeProps) {
  const statusKey = typeof status === 'boolean' 
    ? (status ? 'active' : 'inactive') 
    : status.toLowerCase().replace('_', '-').replace(' ', '-');

  const getStatusConfig = (key: string) => {
    switch (key) {
      // Success / Green
      case 'active':
      case 'resolved':
      case 'completed':
      case 'paid':
      case 'success':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
          icon: CheckCircle
        };
      
      // Warning / Yellow
      case 'pending':
      case 'in-progress':
      case 'warning':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
          icon: Clock
        };

      // Info / Blue
      case 'open':
      case 'planned':
      case 'info':
      case 'free':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          icon: Info
        };
        
      // Purple
      case 'new':
        return {
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          icon: PlayCircle
        };

      // Error / Red
      case 'rejected':
      case 'error':
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
          icon: XCircle
        };

      // Neutral / Gray
      case 'closed':
      case 'inactive':
      case 'draft':
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
          icon: MinusCircle
        };
    }
  };

  const config = getStatusConfig(statusKey);
  const Icon = config.icon;

  const label = typeof status === 'boolean'
    ? (status ? 'Active' : 'Inactive')
    : status.replace(/_/g, ' ').replace(/-/g, ' ');

  return (
    <span className={cn(
      "inline-flex items-center justify-center font-medium rounded-full border transition-colors whitespace-nowrap",
      size === 'sm' ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
      config.color,
      className
    )}>
      {showIcon && <Icon className={cn(
        "mr-1.5",
        size === 'sm' ? "w-3 h-3" : "w-4 h-4"
      )} />}
      <span className="capitalize">{label}</span>
    </span>
  );
}
