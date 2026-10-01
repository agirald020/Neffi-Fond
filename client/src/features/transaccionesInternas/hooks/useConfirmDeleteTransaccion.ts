import { useCallback } from "react";
import { useConfirmDelete } from "@/shared/hooks/useConfirmDelete";
import { useTransaccionesInternasStore } from "../stores/useTransaccionesInternas.store";
import type { TransaccionInterna } from "../types/transaccionInterna.types";

/**
 * Confirmacion SweetAlert2 especifica de Transacciones Internas.
 * Sincroniza `confirmOpen` en el store para que la tabla muestre su overlay.
 */
export function useConfirmDeleteTransaccion() {
  const setConfirmOpen = useTransaccionesInternasStore((s) => s.setConfirmOpen);
  const { confirm } = useConfirmDelete({ onOpenChange: setConfirmOpen });

  return useCallback(
    (transaccion: Pick<TransaccionInterna, "nombreTransaccion">) =>
      confirm({
        title: "¿Eliminar transacción?",
        text: `Se eliminará "${transaccion.nombreTransaccion}" de la parametrización. Esta acción no se puede deshacer.`,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }),
    [confirm],
  );
}
