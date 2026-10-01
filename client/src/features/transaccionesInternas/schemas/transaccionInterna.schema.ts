import { z } from "zod";
import type {
  TransaccionInterna,
  TransaccionInternaRequest,
} from "../types/transaccionInterna.types";

/**
 * Schema del formulario de Transacciones Internas.
 *
 * Decision: todos los campos del formulario se manejan como `string`
 * (lo que entregan los <input>), y la conversion a number/null se hace en
 * `toRequestPayload`. Asi RHF no lidia con `NaN` ni con `""` en campos
 * numericos opcionales. Las reglas replican las anotaciones de
 * `TransaccionInternaRequest.java` (@Size, @Pattern, @DecimalMin/Max).
 */

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} no puede superar ${max} caracteres`);

/** Entero positivo opcional (Long en el backend). */
const optionalLong = (label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{1,18}$/.test(v), `${label} debe ser un número entero`);

/** Fraccion decimal 0..1 opcional (BigDecimal en el backend). */
const optionalFraction = (label: string) =>
  z
    .string()
    .trim()
    .refine(
      (v) => {
        if (v === "") return true;
        const n = Number(v.replace(",", "."));
        return Number.isFinite(n) && n >= 0 && n <= 1;
      },
      `${label} debe ser una fracción entre 0 y 1 (ej. 0.19 = 19%)`,
    );

export const transaccionInternaSchema = z.object({
  // ---- Datos generales ----
  nombreTransaccion: z
    .string()
    .trim()
    .min(1, "El nombre de la transacción es obligatorio")
    .max(50, "El nombre de la transacción no puede superar 50 caracteres"),
  descripcion: optionalText(256, "La descripción"),
  senalIngEgr: z
    .string()
    .trim()
    .min(1, "La señal ingreso/egreso es obligatoria")
    .regex(/^[IEie]$/, "La señal debe ser I (Ingreso) o E (Egreso)"),
  porceImpuesto: optionalFraction("El porcentaje de impuesto"),
  claseTransaccion: optionalText(3, "La clase de transacción"),
  grupoTrx: optionalText(3, "El grupo de transacción"),
  entraCanje: optionalText(1, "Entra en canje"),
  envioSms: optionalText(2, "Envío de SMS"),

  // ---- Configuracion avanzada ----
  codigoTrxAfecta: optionalLong("Código trx afecta"),
  afectaCampoAcumulados: optionalText(2, "Afecta campo acumulados"),
  senalAnulacion: optionalText(2, "La señal de anulación"),
  codTrxDevRnds: optionalLong("Código trx dev. rendimientos"),
  codTrxDevComi: optionalLong("Código trx dev. comisiones"),
  codTrxDevOtros: optionalLong("Código trx dev. otros"),
  codTrxHomolgacion: optionalLong("Código trx homologación"),
  descReportes: optionalText(3, "La descripción de reportes"),
  cobraImptos: optionalText(3, "Cobra impuestos"),
});

export type TransaccionInternaFormValues = z.infer<typeof transaccionInternaSchema>;

/** Valores vacios para el modo "create". */
export const EMPTY_TRANSACCION_FORM_VALUES: TransaccionInternaFormValues = {
  nombreTransaccion: "",
  descripcion: "",
  senalIngEgr: "",
  porceImpuesto: "",
  claseTransaccion: "",
  grupoTrx: "",
  entraCanje: "",
  envioSms: "",
  codigoTrxAfecta: "",
  afectaCampoAcumulados: "",
  senalAnulacion: "",
  codTrxDevRnds: "",
  codTrxDevComi: "",
  codTrxDevOtros: "",
  codTrxHomolgacion: "",
  descReportes: "",
  cobraImptos: "",
};

const str = (v: string | number | null | undefined): string =>
  v === null || v === undefined ? "" : String(v);

/** Registro del backend -> valores del formulario (null -> ""). */
export function toFormValues(record: TransaccionInterna): TransaccionInternaFormValues {
  return {
    nombreTransaccion: str(record.nombreTransaccion),
    descripcion: str(record.descripcion),
    senalIngEgr: str(record.senalIngEgr).toUpperCase(),
    porceImpuesto: str(record.porceImpuesto),
    claseTransaccion: str(record.claseTransaccion),
    grupoTrx: str(record.grupoTrx),
    entraCanje: str(record.entraCanje).toUpperCase(),
    envioSms: str(record.envioSms).toUpperCase(),
    codigoTrxAfecta: str(record.codigoTrxAfecta),
    afectaCampoAcumulados: str(record.afectaCampoAcumulados),
    senalAnulacion: str(record.senalAnulacion),
    codTrxDevRnds: str(record.codTrxDevRnds),
    codTrxDevComi: str(record.codTrxDevComi),
    codTrxDevOtros: str(record.codTrxDevOtros),
    codTrxHomolgacion: str(record.codTrxHomolgacion),
    descReportes: str(record.descReportes),
    cobraImptos: str(record.cobraImptos),
  };
}

const textOrNull = (v: string): string | null => {
  const t = v.trim();
  return t === "" ? null : t;
};

const numberOrNull = (v: string): number | null => {
  const t = v.trim().replace(",", ".");
  return t === "" ? null : Number(t);
};

/** Valores del formulario -> body de POST/PUT ("" -> null, string -> number). */
export function toRequestPayload(values: TransaccionInternaFormValues): TransaccionInternaRequest {
  return {
    nombreTransaccion: values.nombreTransaccion.trim(),
    descripcion: textOrNull(values.descripcion),
    senalIngEgr: values.senalIngEgr.trim().toUpperCase(),
    porceImpuesto: numberOrNull(values.porceImpuesto),
    claseTransaccion: textOrNull(values.claseTransaccion),
    grupoTrx: textOrNull(values.grupoTrx),
    entraCanje: textOrNull(values.entraCanje),
    envioSms: textOrNull(values.envioSms),
    codigoTrxAfecta: numberOrNull(values.codigoTrxAfecta),
    afectaCampoAcumulados: textOrNull(values.afectaCampoAcumulados),
    senalAnulacion: textOrNull(values.senalAnulacion),
    codTrxDevRnds: numberOrNull(values.codTrxDevRnds),
    codTrxDevComi: numberOrNull(values.codTrxDevComi),
    codTrxDevOtros: numberOrNull(values.codTrxDevOtros),
    codTrxHomolgacion: numberOrNull(values.codTrxHomolgacion),
    descReportes: textOrNull(values.descReportes),
    cobraImptos: textOrNull(values.cobraImptos),
  };
}
