import type { ReactNode } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

/**
 * Wrapper unico de SweetAlert2 para la aplicacion.
 * Cualquier feature debe usar estas funciones (o `useConfirmDelete`)
 * en lugar de importar `sweetalert2` directamente, para mantener una sola
 * paleta y un solo comportamiento de botones.
 *
 * Nota: el entry `sweetalert2` (dist/sweetalert2.all.js) inyecta su CSS,
 * no hace falta importar hoja de estilos.
 */

const ReactSwal = withReactContent(Swal);

/** Paleta configurable (rojo de marca = Tailwind red-600). */
export const SWEET_ALERT_COLORS = {
  confirmDanger: "#dc2626",
  cancel: "#6b7280",
  warningIcon: "#f97316",
} as const;

export interface ConfirmDeleteOptions {
  /** Titulo del modal. Default: "¿Eliminar registro?" */
  title?: string;
  /** Texto plano del cuerpo. Ignorado si se envia `content`. */
  text?: string;
  /** Contenido React del cuerpo (renderizado via sweetalert2-react-content). */
  content?: ReactNode;
  /** Default: "Sí, eliminar" */
  confirmButtonText?: string;
  /** Default: "Cancelar" */
  cancelButtonText?: string;
}

/**
 * Muestra el modal de confirmacion de borrado.
 * @returns `true` si el usuario confirmo, `false` si cancelo/cerro.
 */
export async function confirmDelete(options: ConfirmDeleteOptions = {}): Promise<boolean> {
  const {
    title = "¿Eliminar registro?",
    text = "Esta acción no se puede deshacer.",
    content,
    confirmButtonText = "Sí, eliminar",
    cancelButtonText = "Cancelar",
  } = options;

  const result = await ReactSwal.fire({
    icon: "warning",
    iconColor: SWEET_ALERT_COLORS.warningIcon,
    title,
    ...(content ? { html: content } : { text }),
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: SWEET_ALERT_COLORS.confirmDanger,
    cancelButtonColor: SWEET_ALERT_COLORS.cancel,
    reverseButtons: true,
    focusCancel: true,
  });

  return result.isConfirmed;
}
