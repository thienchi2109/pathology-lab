import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader2 
      className={cn("animate-spin text-primary", sizeClasses[size], className)} 
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  message?: string;
  className?: string;
}

export function LoadingCard({ message = "Loading...", className }: LoadingCardProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 gap-4", className)}>
      <LoadingSpinner size="lg" />
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
  );
}
