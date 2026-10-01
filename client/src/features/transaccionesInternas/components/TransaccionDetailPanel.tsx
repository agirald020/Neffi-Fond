import { useCallback, useMemo } from "react";
import { FileText, Loader2, MousePointerClick, Pencil, Plus, Trash2 } from "lucide-react";
import { AppButton } from "@/shared/components/AppButton";
import { cn } from "@/shared/lib/utils";
import {
  BRAND_BUTTON_CLASSES,
  TRANSACCIONES_PERMISSIONS,
} from "../config/transaccionesInternas.constants";
import {
  toFormValues,
  toRequestPayload,
  type TransaccionInternaFormValues,
} from "../schemas/transaccionInterna.schema";
import {
  selectSelectedRecord,
  useTransaccionesInternasStore,
} from "../stores/useTransaccionesInternas.store";
import { useConfirmDeleteTransaccion } from "../hooks/useConfirmDeleteTransaccion";
import type { PanelMode } from "../types/transaccionInterna.types";
import { TransaccionForm } from "./TransaccionForm";

/** Titulos e iconos del encabezado por modo (configurable). */
const PANEL_HEADERS: Record<Exclude<PanelMode, "empty">, { title: string; subtitle: string; icon: typeof FileText }> = {
  view: { title: "Detalle de transacción", subtitle: "Consulta los parámetros de la transacción seleccionada.", icon: FileText },
  edit: { title: "Editar transacción", subtitle: "Ajusta los parámetros y guarda los cambios.", icon: Pencil },
  create: { title: "Nueva transacción", subtitle: "Completa los datos de la nueva regla de transacción.", icon: Plus },
};

const CARD_CLASSES =
  "rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900";

function PanelEmptyState() {
  return (
    <div className={cn(CARD_CLASSES, "flex flex-col items-center justify-center px-6 py-16 text-center")}>
      <div className="mb-3 rounded-full bg-red-50 p-3 dark:bg-red-950/40">
        <MousePointerClick className="h-6 w-6 text-red-600" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">Detalle de transacción</h2>
      <p className="mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">
        Selecciona una transacción del registro para ver su detalle, o crea una nueva.
      </p>
    </div>
  );
}

/**
 * Panel derecho maestro-detalle. Cambia de modo segun `panelMode` del store:
 * empty (sin seleccion) | view (solo lectura) | edit | create.
 * El mismo panel se reutiliza para editar y crear (sin modales ni navegacion).
 */
export function TransaccionDetailPanel() {
  const panelMode = useTransaccionesInternasStore((s) => s.panelMode);
  const selected = useTransaccionesInternasStore(selectSelectedRecord);
  const saving = useTransaccionesInternasStore((s) => s.saving);
  const deleting = useTransaccionesInternasStore((s) => s.deleting);
  const startEdit = useTransaccionesInternasStore((s) => s.startEdit);
  const cancelPanel = useTransaccionesInternasStore((s) => s.cancelPanel);
  const createRecord = useTransaccionesInternasStore((s) => s.createRecord);
  const updateRecord = useTransaccionesInternasStore((s) => s.updateRecord);
  const deleteRecord = useTransaccionesInternasStore((s) => s.deleteRecord);
  const confirmDelete = useConfirmDeleteTransaccion();

  const defaultValues = useMemo(
    () => (panelMode !== "create" && selected ? toFormValues(selected) : undefined),
    [panelMode, selected],
  );

  const handleSubmit = useCallback(
    async (values: TransaccionInternaFormValues) => {
      const payload = toRequestPayload(values);
      if (panelMode === "create") {
        await createRecord(payload);
      } else if (panelMode === "edit" && selected) {
        await updateRecord(selected.codigoReferencia, payload);
      }
    },
    [panelMode, selected, createRecord, updateRecord],
  );

  const handleDelete = useCallback(async () => {
    if (!selected) return;
    if (await confirmDelete(selected)) {
      await deleteRecord(selected.codigoReferencia);
    }
  }, [selected, confirmDelete, deleteRecord]);

  if (panelMode === "empty" || ((panelMode === "view" || panelMode === "edit") && !selected)) {
    return <PanelEmptyState />;
  }

  const header = PANEL_HEADERS[panelMode];
  const HeaderIcon = header.icon;
  const isEditing = panelMode !== "view";

  return (
    <section
      className={cn(CARD_CLASSES, "overflow-hidden", isEditing && "ring-2 ring-red-100 dark:ring-red-900/40")}
      aria-labelledby="trx-panel-title"
    >
      <header className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-700">
        <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950/40">
          <HeaderIcon className="h-4 w-4 text-red-600" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 id="trx-panel-title" className="text-base font-semibold text-gray-900 dark:text-white">
            {header.title}
          </h2>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {panelMode === "create" || !selected
              ? header.subtitle
              : `Código de referencia ${selected.codigoReferencia}`}
          </p>
        </div>
      </header>

      <TransaccionForm
        // Remonta (y resetea) el formulario al cambiar de modo o de registro.
        key={`${panelMode}-${selected?.codigoReferencia ?? "new"}`}
        mode={panelMode}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={cancelPanel}
        submitting={saving}
        submitPermKey={panelMode === "create" ? TRANSACCIONES_PERMISSIONS.create : TRANSACCIONES_PERMISSIONS.edit}
        viewActions={
          <>
            <AppButton
              type="button"
              variant="outline"
              permKey={TRANSACCIONES_PERMISSIONS.delete}
              noPermBehavior="disable"
              extraDisabled={deleting}
              onClick={handleDelete}
              className={BRAND_BUTTON_CLASSES.outline}
            >
              {deleting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
              {deleting ? "Eliminando..." : "Eliminar"}
            </AppButton>
            <AppButton
              type="button"
              permKey={TRANSACCIONES_PERMISSIONS.edit}
              noPermBehavior="disable"
              extraDisabled={deleting}
              onClick={startEdit}
              className={BRAND_BUTTON_CLASSES.solid}
            >
              <Pencil aria-hidden="true" />
              Editar
            </AppButton>
          </>
        }
      />
    </section>
  );
}
