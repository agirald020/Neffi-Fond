import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { SUCCESS_BANNER_DURATION_MS } from "../config/transaccionesInternas.constants";

export interface SuccessBannerProps {
  /** Mensaje a mostrar; `null` oculta el banner. */
  message: string | null;
  onDismiss: () => void;
  /** Milisegundos antes del auto-cierre. Default: SUCCESS_BANNER_DURATION_MS. */
  durationMs?: number;
}

/** Banner verde de confirmacion con auto-dismiss. */
export function SuccessBanner({ message, onDismiss, durationMs = SUCCESS_BANNER_DURATION_MS }: SuccessBannerProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss, durationMs]);

  if (!message) return null;

  return (
    <Alert
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 border-emerald-200 bg-emerald-50 py-3 text-emerald-800 animate-in fade-in slide-in-from-top-1 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
    >
      {/* Envuelto en <span>: Alert posiciona en absoluto los <svg> hijos directos. */}
      <span className="shrink-0" aria-hidden="true">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      </span>
      <AlertDescription className="flex-1 font-medium">{message}</AlertDescription>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded p-1 text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-emerald-900/50"
        aria-label="Cerrar mensaje"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </Alert>
  );
}
