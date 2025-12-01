import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  children?: React.ReactNode;
  maxRetries?: number;
}

export function RetryButton({
  onRetry,
  disabled = false,
  variant = "outline",
  size = "default",
  children,
  maxRetries = 3,
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      return;
    }

    setIsRetrying(true);
    try {
      await onRetry();
      setRetryCount(0); // Reset on success
    } catch (error) {
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  if (retryCount >= maxRetries) {
    return null; // Hide button after max retries
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRetry}
      disabled={disabled || isRetrying}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
      {children || (isRetrying ? "Retrying..." : `Retry ${retryCount > 0 ? `(${retryCount}/${maxRetries})` : ''}`)}
    </Button>
  );
}

