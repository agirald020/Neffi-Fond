import type { TransaccionInternaFormValues } from "../schemas/transaccionInterna.schema";

/**
 * Configuracion declarativa de los campos del formulario.
 * Para agregar/quitar/reordenar un campo basta con editar estos arrays;
 * `TransaccionForm` los renderiza genericamente.
 */

export type TransaccionFieldName = keyof TransaccionInternaFormValues;

export interface SelectOption {
  value: string;
  label: string;
}

interface BaseFieldConfig {
  name: TransaccionFieldName;
  label: string;
  placeholder?: string;
  /** Texto de ayuda bajo el campo. */
  description?: string;
  /** Ocupa las 2 columnas del grid en pantallas >= sm. */
  fullWidth?: boolean;
  required?: boolean;
}

export type TransaccionFieldConfig =
  | (BaseFieldConfig & { type: "text"; maxLength?: number; uppercase?: boolean })
  | (BaseFieldConfig & { type: "textarea"; maxLength?: number })
  | (BaseFieldConfig & { type: "integer" })
  | (BaseFieldConfig & { type: "fraction" })
  | (BaseFieldConfig & { type: "select"; options: SelectOption[] });

export const SENAL_OPTIONS: SelectOption[] = [
  { value: "I", label: "I - Ingreso" },
  { value: "E", label: "E - Egreso" },
];

export const CANJE_OPTIONS: SelectOption[] = [
  { value: "S", label: "S - Sí" },
  { value: "N", label: "N - No" },
];

export const SMS_OPTIONS: SelectOption[] = [
  { value: "SI", label: "Sí" },
  { value: "NO", label: "No" },
];

/** Seccion "Datos generales" (siempre visible, igual al mockup). */
export const GENERAL_FIELDS: TransaccionFieldConfig[] = [
  {
    name: "nombreTransaccion",
    label: "Nombre de la transacción",
    type: "text",
    maxLength: 50,
    required: true,
    fullWidth: true,
    placeholder: "Ej. APORTE POR TRANSFERENCIA",
  },
  {
    name: "descripcion",
    label: "Descripción",
    type: "textarea",
    maxLength: 256,
    fullWidth: true,
    placeholder: "Describe el uso de la transacción",
  },
  { name: "senalIngEgr", label: "Señal", type: "select", options: SENAL_OPTIONS, required: true, placeholder: "Selecciona" },
  {
    name: "porceImpuesto",
    label: "% Impuesto",
    type: "fraction",
    placeholder: "0.19",
    description: "Fracción decimal: 0.19 = 19%",
  },
  { name: "claseTransaccion", label: "Clase", type: "text", maxLength: 3, uppercase: true, placeholder: "Ej. APO" },
  { name: "grupoTrx", label: "Grupo", type: "text", maxLength: 3, uppercase: true, placeholder: "Ej. 001" },
  { name: "entraCanje", label: "Entra en canje", type: "select", options: CANJE_OPTIONS, placeholder: "Selecciona" },
  { name: "envioSms", label: "Envío SMS", type: "select", options: SMS_OPTIONS, placeholder: "Selecciona" },
];

/** Seccion colapsable "Configuracion avanzada" (los 9 campos restantes). */
export const ADVANCED_FIELDS: TransaccionFieldConfig[] = [
  { name: "codigoTrxAfecta", label: "Código trx afecta", type: "integer" },
  { name: "afectaCampoAcumulados", label: "Afecta campo acumulados", type: "text", maxLength: 2, uppercase: true },
  { name: "senalAnulacion", label: "Señal de anulación", type: "text", maxLength: 2, uppercase: true },
  { name: "codTrxHomolgacion", label: "Código trx homologación", type: "integer" },
  { name: "codTrxDevRnds", label: "Cód. trx dev. rendimientos", type: "integer" },
  { name: "codTrxDevComi", label: "Cód. trx dev. comisiones", type: "integer" },
  { name: "codTrxDevOtros", label: "Cód. trx dev. otros", type: "integer" },
  { name: "descReportes", label: "Descripción reportes", type: "text", maxLength: 3, uppercase: true },
  { name: "cobraImptos", label: "Cobra impuestos", type: "text", maxLength: 3, uppercase: true },
];
