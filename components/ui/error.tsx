import { AlertCircle, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
}

export function ErrorMessage({ 
  title = "Error", 
  message, 
  className 
}: ErrorMessageProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg bg-error/10 border border-error/20",
      className
    )}>
      <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-error mb-1">{title}</h4>
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
    </div>
  );
}

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorCard({ 
  title = "Something went wrong", 
  message, 
  onRetry,
  className 
}: ErrorCardProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 gap-4 text-center",
      className
    )}>
      <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
        <XCircle className="w-6 h-6 text-error" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary max-w-md">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onDismiss, className }: ErrorBannerProps) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-3 p-4 rounded-lg bg-error/10 border border-error/20",
      className
    )}>
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
        <p className="text-sm text-text-primary">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-error hover:text-error/80 transition-colors"
          aria-label="Dismiss"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
