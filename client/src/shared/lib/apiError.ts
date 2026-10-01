/**
 * Extrae un mensaje legible de los errores lanzados por `apiRequest`
 * (`queryClient.ts`), cuyo formato es `"<status>: <body>"`.
 *
 * Soporta los cuerpos de error del backend:
 *  - `BaseApiResponse.error(...)` -> `{ success:false, message, data:[...detalles] }`
 *  - Formato legacy             -> `{ error, status }`
 * Si no se puede interpretar, devuelve `fallback`.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof Error) || !err.message) return fallback;

  const match = err.message.match(/^(\d{3}):\s*([\s\S]*)$/);
  if (!match) {
    // Timeout / red: el mensaje ya es legible.
    return err.message.startsWith("Timeout") ? err.message : fallback;
  }

  const body = match[2];
  try {
    const json = JSON.parse(body) as {
      message?: unknown;
      error?: unknown;
      data?: unknown;
    };
    const details = Array.isArray(json.data)
      ? json.data.filter((d): d is string => typeof d === "string" && d.trim() !== "")
      : [];
    const base =
      (typeof json.message === "string" && json.message) ||
      (typeof json.error === "string" && json.error) ||
      fallback;
    return details.length > 0 ? `${base}: ${details.join(" · ")}` : base;
  } catch {
    return fallback;
  }
}
