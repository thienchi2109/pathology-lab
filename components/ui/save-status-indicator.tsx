import { SaveStatus } from '@/lib/hooks/useAutosave';
import { CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
}

export function SaveStatusIndicator({ status, lastSaved }: SaveStatusIndicatorProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
          text: 'Đang lưu...',
          className: 'text-primary',
        };
      case 'saved':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-success" />,
          text: 'Đã lưu',
          className: 'text-success',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4 text-error" />,
          text: 'Lỗi lưu',
          className: 'text-error',
        };
      case 'idle':
      default:
        if (lastSaved) {
          const now = new Date();
          const diffMs = now.getTime() - lastSaved.getTime();
          const diffMinutes = Math.floor(diffMs / 60000);
          
          if (diffMinutes < 1) {
            return {
              icon: <Clock className="h-4 w-4 text-text-secondary" />,
              text: 'Vừa lưu',
              className: 'text-text-secondary',
            };
          } else {
            return {
              icon: <Clock className="h-4 w-4 text-text-secondary" />,
              text: `Lưu ${diffMinutes} phút trước`,
              className: 'text-text-secondary',
            };
          }
        }
        return null;
    }
  };

  const display = getStatusDisplay();

  if (!display) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${display.className}`}>
      {display.icon}
      <span>{display.text}</span>
    </div>
  );
}
