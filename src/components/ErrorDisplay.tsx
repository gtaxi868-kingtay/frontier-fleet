import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorSeverity, parseSupabaseError } from "@/lib/errorHandler";

interface ErrorDisplayProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showDetails?: boolean;
}

export function ErrorDisplay({
  error,
  title,
  onRetry,
  onDismiss,
  className = "",
  showDetails = false,
}: ErrorDisplayProps) {
  const message = parseSupabaseError(error);
  const severity = getErrorSeverity(error);
  
  const getVariant = () => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  const getIcon = () => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Alert variant={getVariant()} className={className}>
      {getIcon()}
      <AlertTitle>{title || "Error"}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{message}</p>
        {showDetails && error instanceof Error && (
          <details className="text-xs mt-2">
            <summary className="cursor-pointer text-muted-foreground">
              Technical Details
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {error.stack || error.message}
            </pre>
          </details>
        )}
        <div className="flex gap-2 mt-3">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
            >
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Inline error display for form fields
 */
interface InlineErrorProps {
  error?: string;
  className?: string;
}

export function InlineError({ error, className = "" }: InlineErrorProps) {
  if (!error) return null;

  return (
    <p className={`text-sm text-destructive mt-1 flex items-center gap-1 ${className}`}>
      <AlertCircle className="h-3 w-3" />
      {error}
    </p>
  );
}

