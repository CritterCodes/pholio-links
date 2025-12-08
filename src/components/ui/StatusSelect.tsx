import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface StatusOption {
  value: string;
  label: string;
}

interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: StatusOption[];
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusSelect({
  value,
  onChange,
  options,
  disabled = false,
  className,
  size = 'sm'
}: StatusSelectProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "appearance-none block w-full rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white",
          size === 'sm' ? "py-1 pl-3 pr-8 text-xs" : "py-2 pl-3 pr-10 text-sm"
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
        <ChevronDown className={cn(
          size === 'sm' ? "h-3 w-3" : "h-4 w-4"
        )} />
      </div>
    </div>
  );
}
