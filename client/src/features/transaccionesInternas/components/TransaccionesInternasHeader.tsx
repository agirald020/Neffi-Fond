import { Plus } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { AppButton } from "@/shared/components/AppButton";
import {
  BRAND_BUTTON_CLASSES,
  TRANSACCIONES_PERMISSIONS,
} from "../config/transaccionesInternas.constants";

export interface TransaccionesInternasHeaderProps {
  onCreate: () => void;
  /** Deshabilita "+ Nueva transaccion" (p.ej. mientras se edita). */
  createDisabled?: boolean;
}

/** Breadcrumb + titulo + subtitulo + accion principal de la pagina. */
export function TransaccionesInternasHeader({ onCreate, createDisabled = false }: TransaccionesInternasHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-4 py-6 sm:px-6 lg:px-10 dark:border-gray-800 dark:bg-gray-900">
      <Breadcrumb className="mb-2">
        <BreadcrumbList className="text-[11px] font-semibold uppercase tracking-wider sm:gap-1.5">
          <BreadcrumbItem>Parametrización</BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-red-600 dark:text-red-400">Operación</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transacciones internas</h1>
          <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Administra las reglas de transacción que utiliza la operación de fondos. Revisa los parámetros antes de
            guardar cualquier cambio.
          </p>
        </div>

        <AppButton
          type="button"
          permKey={TRANSACCIONES_PERMISSIONS.create}
          noPermBehavior="disable"
          extraDisabled={createDisabled}
          onClick={onCreate}
          className={`${BRAND_BUTTON_CLASSES.solid} shrink-0 self-start`}
        >
          <Plus aria-hidden="true" />
          Nueva transacción
        </AppButton>
      </div>
    </div>
  );
}
