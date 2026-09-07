// src/shared/data/davipolaService.ts
import { apiPaginated } from "@/shared/lib/queryClient";
import { Municipio } from "../types/davipola.types";

export async function buscarMunicipios(params: {
  criterio?: string;
  page?: number;
  size?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.criterio?.trim()) {
    searchParams.set("criterio", params.criterio.trim());
  }

  searchParams.set("page", String(params.page ?? 0));
  searchParams.set("size", String(params.size ?? 100));

  return apiPaginated<Municipio>(
    "GET",
    `/api/municipios?${searchParams.toString()}`
  );
}