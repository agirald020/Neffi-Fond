import { useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { useTransaccionesInternasStore } from "./stores/useTransaccionesInternas.store";
import { TransaccionesInternasHeader } from "./components/TransaccionesInternasHeader";
import { TransaccionesInternasTable } from "./components/TransaccionesInternasTable";
import { TransaccionDetailPanel } from "./components/TransaccionDetailPanel";
import { SuccessBanner } from "./components/SuccessBanner";

/**
 * Parametrizacion / Operacion -> Transacciones internas.
 * Layout maestro-detalle: tabla (izquierda, 3/5) + panel (derecha, 2/5).
 * En mobile las columnas se apilan (panel debajo de la tabla).
 */
export default function TransaccionesInternasPage() {
  const loadRecords = useTransaccionesInternasStore((s) => s.loadRecords);
  const reset = useTransaccionesInternasStore((s) => s.reset);
  const panelMode = useTransaccionesInternasStore((s) => s.panelMode);
  const startCreate = useTransaccionesInternasStore((s) => s.startCreate);
  const successMessage = useTransaccionesInternasStore((s) => s.successMessage);
  const clearSuccessMessage = useTransaccionesInternasStore((s) => s.clearSuccessMessage);
  const error = useTransaccionesInternasStore((s) => s.error);
  const clearError = useTransaccionesInternasStore((s) => s.clearError);

  useEffect(() => {
    void loadRecords();
    // Al salir de la pagina se limpia el estado para no arrastrar selecciones.
    return () => reset();
  }, [loadRecords, reset]);

  const isEditing = panelMode === "edit" || panelMode === "create";

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      <TransaccionesInternasHeader onCreate={startCreate} createDisabled={isEditing} />

      <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <SuccessBanner message={successMessage} onDismiss={clearSuccessMessage} />

            {error && (
              <Alert variant="destructive" className="flex items-start gap-2 bg-red-50 py-3 dark:bg-red-950/30">
                <span className="mt-0.5 shrink-0" aria-hidden="true">
                  <AlertCircle className="h-4 w-4" />
                </span>
                <AlertDescription className="flex-1">{error}</AlertDescription>
                <button
                  type="button"
                  onClick={clearError}
                  className="rounded p-1 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-red-900/40"
                  aria-label="Cerrar error"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Alert>
            )}

            <TransaccionesInternasTable />
          </div>

          <aside className="lg:sticky lg:top-6 lg:col-span-2" aria-label="Panel de transacción">
            <TransaccionDetailPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
