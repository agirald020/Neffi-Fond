import type { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import type { TransaccionInternaFormValues } from "../schemas/transaccionInterna.schema";
import type { TransaccionFieldConfig } from "../config/transaccionForm.fields";
import { formatPercent } from "../utils/transaccionInterna.formatters";

/**
 * Estilo de los controles en modo solo-lectura: legibles (sin opacity-50
 * por defecto de shadcn) pero visualmente inactivos.
 */
const READONLY_CONTROL_CLASSES =
  "disabled:cursor-default disabled:opacity-100 disabled:bg-gray-50 disabled:text-gray-900 dark:disabled:bg-gray-800/60 dark:disabled:text-gray-100";

interface TransaccionFormFieldProps {
  control: Control<TransaccionInternaFormValues>;
  config: TransaccionFieldConfig;
  readOnly: boolean;
}

/** Renderiza un campo del formulario a partir de su configuracion declarativa. */
export function TransaccionFormField({ control, config, readOnly }: TransaccionFormFieldProps) {
  const inputId = `trx-${config.name}`;

  return (
    <FormField
      control={control}
      name={config.name}
      render={({ field }) => (
        <FormItem className={cn(config.fullWidth && "sm:col-span-2")}>
          <FormLabel className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {config.label}
            {config.required && !readOnly && (
              <span className="ml-0.5 text-red-600" aria-hidden="true">
                *
              </span>
            )}
          </FormLabel>

          {config.type === "select" ? (
            <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
              <FormControl>
                <SelectTrigger
                  id={inputId}
                  onBlur={field.onBlur}
                  className={cn(READONLY_CONTROL_CLASSES, "disabled:cursor-default")}
                >
                  <SelectValue placeholder={readOnly ? "—" : config.placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {config.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : config.type === "textarea" ? (
            <FormControl>
              <Textarea
                {...field}
                id={inputId}
                rows={2}
                maxLength={config.maxLength}
                disabled={readOnly}
                placeholder={readOnly ? "" : config.placeholder}
                className={cn("resize-none", READONLY_CONTROL_CLASSES)}
              />
            </FormControl>
          ) : (
            <FormControl>
              <Input
                {...field}
                id={inputId}
                disabled={readOnly}
                placeholder={readOnly ? "" : config.placeholder}
                inputMode={
                  config.type === "integer" ? "numeric" : config.type === "fraction" ? "decimal" : undefined
                }
                maxLength={config.type === "text" ? config.maxLength : undefined}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (config.type === "integer") {
                    field.onChange(raw.replace(/\D/g, ""));
                  } else if (config.type === "text" && config.uppercase) {
                    field.onChange(raw.toUpperCase());
                  } else {
                    field.onChange(raw);
                  }
                }}
                className={READONLY_CONTROL_CLASSES}
              />
            </FormControl>
          )}

          {config.type === "fraction" && field.value !== "" ? (
            <FormDescription className="text-xs">Equivale a {formatPercent(field.value)}</FormDescription>
          ) : config.description && !readOnly ? (
            <FormDescription className="text-xs">{config.description}</FormDescription>
          ) : null}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
