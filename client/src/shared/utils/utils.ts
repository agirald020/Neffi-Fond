
export function formatDateTime(isoString: string): string {
  if (!isoString) return "—";

  // Si viene solo fecha (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    const [year, month, day] = isoString.split("-");
    return `${day}/${month}/${year}`;
  }

  try {
    return new Date(isoString).toLocaleString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}