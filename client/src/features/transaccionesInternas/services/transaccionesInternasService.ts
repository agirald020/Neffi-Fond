import { apiBlob, apiJson, apiRequest } from "@/shared/lib/queryClient";
import { TRANSACCIONES_INTERNAS_API } from "../config/transaccionesInternas.constants";
import type {
  TransaccionInterna,
  TransaccionInternaRequest,
  TransaccionesInternasFilters,
} from "../types/transaccionInterna.types";

/**
 * Cliente HTTP del modulo. Todas las llamadas pasan por el wrapper de
 * `queryClient.ts` (Bearer token + timeout + errores centralizados).
 * `apiJson` desenvuelve `{ data }` tanto de `ApiResponse` como de `BaseApiResponse`.
 */

function toQueryString(filters: TransaccionesInternasFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "string" && value.trim() !== "") {
      params.set(key, value.trim());
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Listado completo (el backend no pagina; busqueda/paginado son client-side). */
export const getTransaccionesInternas = async (
  filters?: TransaccionesInternasFilters,
): Promise<TransaccionInterna[]> => {
  const data = await apiJson<TransaccionInterna[] | null>(
    "GET",
    `${TRANSACCIONES_INTERNAS_API}${toQueryString(filters)}`,
  );
  return data ?? [];
};

export const getTransaccionInterna = (codigoReferencia: number): Promise<TransaccionInterna> =>
  apiJson<TransaccionInterna>("GET", `${TRANSACCIONES_INTERNAS_API}/${codigoReferencia}`);

export const createTransaccionInterna = (
  data: TransaccionInternaRequest,
): Promise<TransaccionInterna> =>
  apiJson<TransaccionInterna>("POST", TRANSACCIONES_INTERNAS_API, data);

export const updateTransaccionInterna = (
  codigoReferencia: number,
  data: TransaccionInternaRequest,
): Promise<TransaccionInterna> =>
  apiJson<TransaccionInterna>("PUT", `${TRANSACCIONES_INTERNAS_API}/${codigoReferencia}`, data);

export const deleteTransaccionInterna = async (codigoReferencia: number): Promise<void> => {
  await apiRequest("DELETE", `${TRANSACCIONES_INTERNAS_API}/${codigoReferencia}`);
};

export const exportTransaccionesInternasExcel = (
  filters?: TransaccionesInternasFilters,
): Promise<Blob> =>
  apiBlob("GET", `${TRANSACCIONES_INTERNAS_API}/exportar${toQueryString(filters)}`);
