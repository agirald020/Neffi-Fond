import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthHeader } from "@/shared/lib/keycloak";
import { Page } from "../types/pagination.types";

function buildHeaders(data?: unknown): Record<string, string> {
  const headers: Record<string, string> = {};
  // Don't set Content-Type for FormData - browser will set it with boundary
  if (data && !(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  // Always include Bearer token if Keycloak has one (no-op in bypass mode)
  Object.assign(headers, getAuthHeader());
  return headers;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  timeoutMs = 300_000, // 5 minutes by default
): Promise<Response> {
  // AbortController para poder cancelar la petición si pasa el timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const isFormData = data instanceof FormData;
    const res = await fetch(url, {
      method,
      headers: buildHeaders(data),
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    await throwIfResNotOk(res);
    return res;
  } catch (err: any) {
    clearTimeout(timeoutId);

    // Si fue abortada por el timeout, normalizamos el error para facilitar manejo
    if (err && err.name === "AbortError") {
      throw new Error(`Timeout: la petición a ${url} superó ${Math.round(timeoutMs / 1000)}s`);
    }

    // Re-lanzamos el error original (fetch/network/otros)
    throw err;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        headers: buildHeaders(),
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export async function apiJson<T>(
  method: string,
  url: string,
  data?: unknown,
  timeoutMs?: number
): Promise<T> {
  const res = await apiRequest(method, url, data, timeoutMs);
  const json = await res.json();

  // 👇 Soporta ambos formatos (por si algo viejo sigue igual)
  if (json && typeof json === "object" && "data" in json) {
    return json.data;
  }

  return json;
}

export async function apiPaginated<T>(
  method: string,
  url: string,
  data?: unknown,
  timeoutMs?: number
): Promise<Page<T>> {
  const res = await apiRequest(method, url, data, timeoutMs);
  const json = await res.json();

  // 👉 Caso 1: tu backend actual (wrapper custom)
  if (json && typeof json === "object" && "data" in json && "totalCount" in json) {
    const totalElements = json.totalCount;
    const size = json.pageSize ?? json.data.length ?? 0;
    const page = json.currentPage ?? 0;

    const totalPages = size > 0 ? Math.ceil(totalElements / size) : 0;

    return {
      content: json.data ?? [],
      page,
      size,
      totalElements,
      totalPages,
      last: page >= totalPages - 1,
    };
  }

  // 👉 Caso 2: Spring Page<T> clásico (por si algún endpoint sí lo usa)
  if (json && typeof json === "object" && "content" in json) {
    return {
      content: json.content ?? [],
      page: json.number ?? 0,
      size: json.size ?? 0,
      totalElements: json.totalElements ?? 0,
      totalPages: json.totalPages ?? 0,
      last: json.last ?? true,
    };
  }

  // 👉 Caso fallback (array plano)
  if (Array.isArray(json)) {
    return {
      content: json,
      page: 0,
      size: json.length,
      totalElements: json.length,
      totalPages: 1,
      last: true,
    };
  }

  throw new Error("Formato de paginación no soportado");
}

export async function apiBlob(
  method: string,
  url: string,
  data?: unknown,
  timeoutMs?: number
): Promise<Blob> {
  const res = await apiRequest(method, url, data, timeoutMs);

  return await res.blob();
}
