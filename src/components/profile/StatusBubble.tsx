import { cn } from '@/lib/utils';

interface Status {
  message: string;
  emoji?: string;
}

interface StatusBubbleProps {
  status: Status;
  theme?: any;
  isDark?: boolean;
  className?: string;
}

export function StatusBubble({ status, theme, isDark = false, className }: StatusBubbleProps) {
  if (!status) return null;

  const style = theme?.statusButtonStyle || 'thought';
  const bgColor = theme?.statusBackgroundColor || (isDark ? '#1f2937' : '#ffffff');
  const textColor = theme?.statusTextColor || (isDark ? '#ffffff' : '#111827');
  const borderColor = isDark ? 'rgba(55, 65, 81, 1)' : 'rgba(229, 231, 235, 1)';

  return (
    <div className={cn("absolute z-20 max-w-[200px] sm:max-w-[250px]", className)}>
      <div 
        className={cn(
          "relative px-4 py-2 shadow-xl border transition-all duration-200",
          style === 'pill' ? 'rounded-full' : 'rounded-2xl'
        )}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderColor: borderColor
        }}
      >
        <p className="text-sm font-medium leading-snug break-words whitespace-normal break-all">
          <span className="mr-1.5 inline-block">{status.emoji}</span>
          {status.message}
        </p>
        
        {/* Thought Bubble Tail */}
        {(style === 'thought') && (
          <>
            <div 
              className="absolute -bottom-1 left-6 w-3 h-3 rounded-full border"
              style={{ backgroundColor: bgColor, borderColor: borderColor }}
            ></div>
            <div 
              className="absolute -bottom-3 left-4 w-1.5 h-1.5 rounded-full border"
              style={{ backgroundColor: bgColor, borderColor: borderColor }}
            ></div>
          </>
        )}
        
        {/* Speech Bubble Tail */}
        {style === 'speech' && (
          <div 
            className="absolute -bottom-1.5 left-6 w-3 h-3 border-r border-b transform rotate-45"
            style={{ backgroundColor: bgColor, borderColor: borderColor }}
          ></div>
        )}
      </div>
    </div>
  );
}
