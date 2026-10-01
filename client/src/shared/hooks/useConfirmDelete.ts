import { useCallback, useRef, useState } from "react";
import { confirmDelete, type ConfirmDeleteOptions } from "@/shared/lib/sweetAlert";

interface UseConfirmDeleteParams {
  /** Notifica apertura/cierre del modal (p.ej. para bloquear una tabla). */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Hook generico sobre el wrapper de SweetAlert2.
 *
 * @example
 * const { confirm, isOpen } = useConfirmDelete();
 * if (await confirm({ title: "¿Eliminar?", text: "..." })) { ... }
 */
export function useConfirmDelete({ onOpenChange }: UseConfirmDeleteParams = {}) {
  const [isOpen, setIsOpen] = useState(false);
  // Ref para no recrear `confirm` cuando cambia el callback del consumidor.
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const confirm = useCallback(async (options: ConfirmDeleteOptions): Promise<boolean> => {
    setIsOpen(true);
    onOpenChangeRef.current?.(true);
    try {
      return await confirmDelete(options);
    } finally {
      setIsOpen(false);
      onOpenChangeRef.current?.(false);
    }
  }, []);

  return { confirm, isOpen };
}
