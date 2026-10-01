/**
 * Tipos del modulo Transacciones Internas.
 * Replican 1:1 los DTOs del backend:
 *  - backend/.../dto/TransaccionInternaRequest.java
 *  - backend/.../dto/TransaccionInternaResponse.java
 * Los `Long`/`BigDecimal` de Java llegan como `number` en JSON.
 */

/** Senal ingreso/egreso: I = Ingreso, E = Egreso. */
export type SenalIngEgr = "I" | "E";

/** Body de POST/PUT `/api/transacciones-internas`. */
export interface TransaccionInternaRequest {
  nombreTransaccion: string;
  descripcion: string | null;
  senalIngEgr: string;
  /** Fraccion decimal entre 0 y 1 (0.19 = 19%). */
  porceImpuesto: number | null;
  codigoTrxAfecta: number | null;
  afectaCampoAcumulados: string | null;
  /** S / N */
  entraCanje: string | null;
  claseTransaccion: string | null;
  senalAnulacion: string | null;
  codTrxDevRnds: number | null;
  codTrxDevComi: number | null;
  codTrxDevOtros: number | null;
  codTrxHomolgacion: number | null;
  descReportes: string | null;
  cobraImptos: string | null;
  grupoTrx: string | null;
  /** SI / NO */
  envioSms: string | null;
}

/** Registro devuelto por el backend (Request + llave). */
export interface TransaccionInterna extends TransaccionInternaRequest {
  codigoReferencia: number;
}

/** Filtros opcionales soportados por GET y por la exportacion. */
export interface TransaccionesInternasFilters {
  nombreTransaccion?: string;
  senalIngEgr?: string;
  claseTransaccion?: string;
  grupoTrx?: string;
}

/** Modo del panel derecho (maestro-detalle). */
export type PanelMode = "empty" | "view" | "edit" | "create";

/** Modo que recibe el formulario (el panel "empty" no renderiza formulario). */
export type TransaccionFormMode = Exclude<PanelMode, "empty">;
