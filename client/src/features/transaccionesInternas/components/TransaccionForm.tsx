import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Loader2, Settings2 } from "lucide-react";
import { Form } from "@/shared/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import { Button } from "@/shared/ui/button";
import { AppButton } from "@/shared/components/AppButton";
import { cn } from "@/shared/lib/utils";
import {
  EMPTY_TRANSACCION_FORM_VALUES,
  transaccionInternaSchema,
  type TransaccionInternaFormValues,
} from "../schemas/transaccionInterna.schema";
import { ADVANCED_FIELDS, GENERAL_FIELDS } from "../config/transaccionForm.fields";
import { BRAND_BUTTON_CLASSES } from "../config/transaccionesInternas.constants";
import type { TransaccionFormMode } from "../types/transaccionInterna.types";
import { TransaccionFormField } from "./TransaccionFormField";

export interface TransaccionFormProps {
  /** "view" deshabilita todos los campos y muestra `viewActions`. */
  mode: TransaccionFormMode;
  /** Valores iniciales; para resetear el formulario remonte con `key`. */
  defaultValues?: TransaccionInternaFormValues;
  onSubmit?: (values: TransaccionInternaFormValues) => void | Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  /** Rol Keycloak requerido para el boton "Guardar cambios". */
  submitPermKey?: string;
  /** Acciones del pie en modo "view" (Eliminar / Editar). */
  viewActions?: ReactNode;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
      {children}
    </h3>
  );
}

/**
 * Formulario de Transaccion Interna (RHF + Zod).
 * Seccion "Datos generales" siempre visible + "Configuracion avanzada"
 * colapsable (cerrada por defecto). Los campos salen de `transaccionForm.fields.ts`.
 */
export function TransaccionForm({
  mode,
  defaultValues = EMPTY_TRANSACCION_FORM_VALUES,
  onSubmit,
  onCancel,
  submitting = false,
  submitPermKey = "",
  viewActions,
}: TransaccionFormProps) {
  const readOnly = mode === "view";
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const form = useForm<TransaccionInternaFormValues>({
    resolver: zodResolver(transaccionInternaSchema),
    defaultValues,
    mode: "onTouched",
  });

  const handleSubmit = form.handleSubmit(
    async (values) => {
      await onSubmit?.(values);
    },
    (errors) => {
      // Si el error esta en la seccion avanzada, se abre para que sea visible.
      if (ADVANCED_FIELDS.some((f) => f.name in errors)) setAdvancedOpen(true);
    },
  );

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col" aria-busy={submitting}>
        <div className="space-y-6 px-5 py-5 sm:px-6">
          <section className="space-y-4" aria-labelledby="trx-general-title">
            <div id="trx-general-title">
              <SectionTitle>Datos generales</SectionTitle>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {GENERAL_FIELDS.map((config) => (
                <TransaccionFormField key={config.name} control={form.control} config={config} readOnly={readOnly} />
              ))}
            </div>
          </section>

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-gray-700 dark:bg-gray-800/60 dark:hover:bg-gray-800"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <Settings2 className="h-4 w-4 text-gray-400" aria-hidden="true" />
                Configuración avanzada
                <span className="text-xs font-normal text-gray-400">({ADVANCED_FIELDS.length} campos)</span>
              </span>
              <ChevronDown
                className={cn("h-4 w-4 text-gray-400 transition-transform duration-200", advancedOpen && "rotate-180")}
                aria-hidden="true"
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {ADVANCED_FIELDS.map((config) => (
                  <TransaccionFormField key={config.name} control={form.control} config={config} readOnly={readOnly} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 dark:border-gray-700">
          {readOnly ? (
            viewActions
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Cancelar
              </Button>
              <AppButton
                type="submit"
                permKey={submitPermKey}
                noPermBehavior="disable"
                extraDisabled={submitting}
                className={BRAND_BUTTON_CLASSES.solid}
              >
                {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
                {submitting ? "Guardando..." : "Guardar cambios"}
              </AppButton>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
