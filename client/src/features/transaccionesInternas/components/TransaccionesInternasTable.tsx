import { useMemo, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, Download, ListX, Loader2, RefreshCw, Search, Lock } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { AppButton } from "@/shared/components/AppButton";
import { cn } from "@/shared/lib/utils";
import { TRANSACCIONES_PERMISSIONS } from "../config/transaccionesInternas.constants";
import { useTransaccionesInternasStore } from "../stores/useTransaccionesInternas.store";
import {
  buildSearchIndex,
  formatPercent,
  formatSenal,
  formatYesNo,
  normalizeSearch,
} from "../utils/transaccionInterna.formatters";
import type { TransaccionInterna } from "../types/transaccionInterna.types";

/** Columnas de la tabla (encabezado + ancho + alineacion). Editar aqui para reordenar. */
const COLUMNS = [
  { key: "transaccion", label: "Transacción / Descripción", width: "w-[36%]", align: "text-left" },
  { key: "senal", label: "Señal", width: "w-[12%]", align: "text-left" },
  { key: "impuesto", label: "Impuesto", width: "w-[11%]", align: "text-right" },
  { key: "clase", label: "Clase", width: "w-[9%]", align: "text-center" },
  { key: "canje", label: "Canje", width: "w-[9%]", align: "text-center" },
  { key: "grupo", label: "Grupo", width: "w-[11%]", align: "text-center" },
  { key: "sms", label: "SMS", width: "w-[12%]", align: "text-center" },
] as const;

const SKELETON_ROWS = 6;

const SENAL_BADGE_CLASSES: Record<string, string> = {
  Ingreso: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  Egreso: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  "—": "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

function SenalBadge({ value }: { value: string | null }) {
  const label = formatSenal(value);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        SENAL_BADGE_CLASSES[label],
      )}
    >
      {label}
    </span>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  onChange: (page: number) => void;
}

function TablePagination({ page, totalPages, from, to, total, onChange }: PaginationProps) {
  if (total === 0) return null;
  return (
    <nav
      className="flex flex-col items-center justify-between gap-2 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 sm:flex-row sm:px-6 dark:border-gray-700"
      aria-label="Paginación de transacciones"
    >
      <span>
        Mostrando {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(page - 1)}
          disabled={page <= 0}
          aria-label="Página anterior"
        >
          <ChevronLeft />
        </Button>
        <span className="min-w-[70px] text-center font-medium text-gray-700 dark:text-gray-300">
          {page + 1} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Página siguiente"
        >
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}

/**
 * Card "Registro de transacciones": buscador + exportar + tabla + paginacion.
 * Busqueda y paginacion 100% client-side (useMemo sobre `records`).
 * Se bloquea con un overlay mientras el panel esta en edicion/creacion o
 * hay un modal de confirmacion abierto.
 */
export function TransaccionesInternasTable() {
  const records = useTransaccionesInternasStore((s) => s.records);
  const loading = useTransaccionesInternasStore((s) => s.loading);
  const exporting = useTransaccionesInternasStore((s) => s.exporting);
  const error = useTransaccionesInternasStore((s) => s.error);
  const search = useTransaccionesInternasStore((s) => s.search);
  const currentPage = useTransaccionesInternasStore((s) => s.currentPage);
  const pageSize = useTransaccionesInternasStore((s) => s.pageSize);
  const selectedId = useTransaccionesInternasStore((s) => s.selectedId);
  const panelMode = useTransaccionesInternasStore((s) => s.panelMode);
  const confirmOpen = useTransaccionesInternasStore((s) => s.confirmOpen);
  const setSearch = useTransaccionesInternasStore((s) => s.setSearch);
  const setPage = useTransaccionesInternasStore((s) => s.setPage);
  const selectRecord = useTransaccionesInternasStore((s) => s.selectRecord);
  const exportExcel = useTransaccionesInternasStore((s) => s.exportExcel);
  const loadRecords = useTransaccionesInternasStore((s) => s.loadRecords);

  const locked = panelMode === "edit" || panelMode === "create" || confirmOpen;

  // Indice de busqueda: se recalcula solo cuando cambia el listado.
  const indexed = useMemo(
    () => records.map((record) => ({ record, index: buildSearchIndex(record) })),
    [records],
  );

  const filtered = useMemo<TransaccionInterna[]>(() => {
    const term = normalizeSearch(search);
    if (!term) return records;
    return indexed.filter((i) => i.index.includes(term)).map((i) => i.record);
  }, [indexed, records, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(currentPage, totalPages - 1);
  const pageRows = useMemo(
    () => filtered.slice(page * pageSize, page * pageSize + pageSize),
    [filtered, page, pageSize],
  );

  const handleRowKeyDown = (e: KeyboardEvent<HTMLTableRowElement>, id: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectRecord(id);
    }
  };

  const showInitialLoading = loading && records.length === 0;
  const showLoadError = !loading && !!error && records.length === 0;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
      aria-labelledby="trx-table-title"
    >
      {/* Encabezado + herramientas */}
      <div className="space-y-4 border-b border-gray-100 px-4 py-5 sm:px-6 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="trx-table-title" className="text-base font-semibold text-gray-900 dark:text-white">
              Registro de transacciones
            </h2>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400" aria-live="polite">
              {filtered.length} de {records.length} registros
            </p>
          </div>
          {loading && records.length > 0 && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-label="Actualizando" />
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, descripción, clase o grupo..."
              aria-label="Buscar transacciones"
              className="bg-gray-50 pl-9 dark:bg-gray-800"
            />
          </div>
          <AppButton
            type="button"
            variant="outline"
            permKey={TRANSACCIONES_PERMISSIONS.export}
            noPermBehavior="disable"
            extraDisabled={exporting || records.length === 0}
            onClick={() => void exportExcel()}
            className="shrink-0"
          >
            {exporting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
            {exporting ? "Exportando..." : "Exportar XLSX"}
          </AppButton>
        </div>
      </div>

      {/* Cuerpo */}
      {showInitialLoading ? (
        <div className="space-y-3 p-4 sm:p-6" aria-busy="true" aria-label="Cargando transacciones">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : showLoadError ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <ListX className="mb-3 h-10 w-10 text-gray-300" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No se pudo cargar el listado</p>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void loadRecords()}>
            <RefreshCw aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <ListX className="mb-3 h-10 w-10 text-gray-300" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {records.length === 0 ? "Aún no hay transacciones registradas" : "No hay resultados para esta búsqueda"}
          </p>
          {records.length > 0 && (
            <Button type="button" variant="link" size="sm" onClick={() => setSearch("")}>
              Limpiar búsqueda
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] table-fixed text-sm">
              <caption className="sr-only">Transacciones internas parametrizadas</caption>
              <colgroup>
                {COLUMNS.map((c) => (
                  <col key={c.key} className={c.width} />
                ))}
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className={cn(
                        "px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 first:pl-4 sm:first:pl-6",
                        c.align,
                      )}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {pageRows.map((r) => {
                  const isSelected = r.codigoReferencia === selectedId;
                  return (
                    <tr
                      key={r.codigoReferencia}
                      tabIndex={locked ? -1 : 0}
                      aria-selected={isSelected}
                      onClick={() => selectRecord(r.codigoReferencia)}
                      onKeyDown={(e) => handleRowKeyDown(e, r.codigoReferencia)}
                      className={cn(
                        "cursor-pointer transition-colors focus-visible:outline-none focus-visible:bg-rose-50/60",
                        isSelected
                          ? "bg-rose-50 shadow-[inset_3px_0_0_0_theme(colors.rose.500)] dark:bg-rose-950/30"
                          : "hover:bg-gray-50 dark:hover:bg-white/5",
                      )}
                    >
                      <td className="px-3 py-3 pl-4 sm:pl-6">
                        <p
                          className={cn(
                            "truncate font-semibold",
                            isSelected ? "text-rose-700 dark:text-rose-300" : "text-gray-900 dark:text-white",
                          )}
                          title={r.nombreTransaccion}
                        >
                          {r.nombreTransaccion}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400" title={r.descripcion ?? ""}>
                          {r.descripcion || "Sin descripción"}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <SenalBadge value={r.senalIngEgr} />
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-xs text-gray-700 dark:text-gray-300">
                        {formatPercent(r.porceImpuesto)}
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-xs text-gray-700 dark:text-gray-300">
                        {r.claseTransaccion || "—"}
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-gray-700 dark:text-gray-300">
                        {formatYesNo(r.entraCanje)}
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-xs text-gray-700 dark:text-gray-300">
                        {r.grupoTrx || "—"}
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-gray-700 dark:text-gray-300">
                        {formatYesNo(r.envioSms)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <TablePagination
            page={page}
            totalPages={totalPages}
            from={page * pageSize + 1}
            to={Math.min(filtered.length, (page + 1) * pageSize)}
            total={filtered.length}
            onChange={setPage}
          />
        </>
      )}

      {/* Overlay de bloqueo durante edicion/creacion/confirmacion */}
      {locked && (
        <div
          className="absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-24 backdrop-blur-[1px] dark:bg-gray-950/60"
          aria-hidden="true"
        >
          <span className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <Lock className="h-3.5 w-3.5" />
            {confirmOpen ? "Confirmando eliminación..." : "Finaliza la edición para continuar"}
          </span>
        </div>
      )}
    </section>
  );
}
