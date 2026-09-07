
import { apiBlob, apiJson, apiPaginated, apiRequest } from "@/shared/lib/queryClient";
import type {
  GeneratedResult,
  NombresFideicomiso,
  FondCode,
  FondCodesQuery,
  FondPrefix,
} from "../types/newName.types";
import { SubtipoFideicomisoDto } from "../types/TipoFideicomisoDTO";
import { SucursalDTO } from "../types/SucursalDTO";
import { Page } from "@/shared/types/pagination.types";

function qs(params: Record<string, string | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const getFondCodes = async (
  params: FondCodesQuery = {}
): Promise<Page<FondCode>> => {
  const searchParams = new URLSearchParams();

  if (params.criterio?.trim()) {
    searchParams.set("criterio", params.criterio.trim());
  }

  // 🔥 SOLO enviar si tiene valor
  if (params.prefijo) {
    searchParams.set("prefijo", params.prefijo);
  }

  searchParams.set("page", String(params.page ?? 0));
  searchParams.set("size", String(params.size ?? 25));

  return apiPaginated<FondCode>(
    "GET",
    `/api/nombres-fideicomisos?${searchParams.toString()}`
  );
};

export const saveNombreFideicomiso = (data: NombresFideicomiso): Promise<GeneratedResult[]> => {
  return apiJson(
    "POST",
    "/api/nombres-fideicomisos/guardar",
    data
  );
};

export const updateFondCode = async (id: number, data: FondCode) => {
  const res = await apiRequest("PUT", `/api/fond-codes/${id}`, data);
  return res.json() as Promise<FondCode>;
};

export const deleteFondCode = async (id: number) => {
  const res = await apiRequest("POST", `/api/nombres-fideicomisos/${id}/anular`);
  return res.json().catch(() => null);
};


export const assingFondCode = async (id: number) => {
  const res = await apiRequest("POST", `/api/nombres-fideicomisos/${id}/asignar`);
  return res.json().catch(() => null);
};

export const exportFondCodesExcel = async (params: FondCodesQuery = {}) => {
  const searchParams = new URLSearchParams();

  if (params.criterio?.trim()) {
    searchParams.set("criterio", params.criterio.trim());
  }

  if (params.prefijo) {
    searchParams.set("prefijo", params.prefijo);
  }

  return apiBlob(
    "GET",
    `/api/export/nombres-fideicomisos?${searchParams.toString()}`
  );
};

export const getFondPrefixes = async (): Promise<FondPrefix[]> => {
  return apiJson("GET", "/api/prefijos-fideicomisos");
};

export const getSubtiposNegocio = async (): Promise<SubtipoFideicomisoDto[]> => {
  return apiJson("GET", "/api/subtipos-fideicomisos");
};

export const getSucursales = async (): Promise<SucursalDTO[]> => {
  return apiJson("GET", "/api/sucursales")
}