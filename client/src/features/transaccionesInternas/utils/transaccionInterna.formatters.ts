import type { TransaccionInterna } from "../types/transaccionInterna.types";

const percentFormatter = new Intl.NumberFormat("es-CO", {
  style: "percent",
  maximumFractionDigits: 2,
});

/** 0.19 -> "19 %" ; null -> "—" */
export function formatPercent(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? percentFormatter.format(n) : "—";
}

/** "S"/"SI" -> "Sí", "N"/"NO" -> "No", vacio -> "—" */
export function formatYesNo(value: string | null | undefined): string {
  const v = (value ?? "").trim().toUpperCase();
  if (v === "S" || v === "SI") return "Sí";
  if (v === "N" || v === "NO") return "No";
  return v || "—";
}

export function formatSenal(value: string | null | undefined): "Ingreso" | "Egreso" | "—" {
  const v = (value ?? "").trim().toUpperCase();
  if (v === "I") return "Ingreso";
  if (v === "E") return "Egreso";
  return "—";
}

/** Texto indexable para la busqueda client-side (sin tildes, minusculas). */
export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function buildSearchIndex(record: TransaccionInterna): string {
  return normalizeSearch(
    [
      record.codigoReferencia,
      record.nombreTransaccion,
      record.descripcion,
      record.claseTransaccion,
      record.grupoTrx,
      formatSenal(record.senalIngEgr),
    ]
      .filter((v) => v !== null && v !== undefined)
      .join(" "),
  );
}
