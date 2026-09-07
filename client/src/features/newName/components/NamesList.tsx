import React, { useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import {
  FondCode,
  FondType,
  FondTypeFilter,
  TYPE_COLORS,
} from "../types/newName.types";
import {
  Clock,
  Copy,
  Download,
  Layers,
  Pencil,
  Search,
  Tag,
  Trash2,
  Wand2,
  Check,
  CheckCircle,
} from "lucide-react";
import { useFondCodesStore } from "../stores/useFondCodes.store";
import { useNewNameStore } from "../stores/newName.store";
import { SubtipoFideicomisoDto } from "../types/TipoFideicomisoDTO";
import { ConfirmActionDialog } from "@/shared/components/ConfirmActionDialog";
import { assingFondCode, deleteFondCode, exportFondCodesExcel } from "../services/newNameServices";
import EditFondDialog from "./EditFondDialog";
import { AppButton } from "@/shared/components/AppButton";

function formatDateTime(isoString: string): string {
  if (!isoString) return "—";
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

const NamesList: React.FC = () => {
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<FondCode | null>(null);
  const [actionType, setActionType] = React.useState<"assign" | "delete" | null>(null);
  const [loadingAction, setLoadingAction] = React.useState(false);

  const {
    records,
    filters,
    loading,
    exporting,
    copiedId,
    page,
    size,
    totalElements,
    totalPages,
    editingRecord,
    setSearch,
    setFilterType,
    setPage,
    setSize,
    loadRecords,
    copyToClipboard,
    openEdit,
    clearError,
    updateRecord
  } = useFondCodesStore();

  const { FondTypes, subtiposNegocio } = useNewNameStore();

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadRecords();
    }, 250);

    return () => window.clearTimeout(t);
  }, [loadRecords, filters.search, filters.type, page, size]);

  const filterOptions: { value: FondTypeFilter; label: string }[] = [
    { value: "all", label: "Todos" },
    ...FondTypes.map((t) => ({
      value: t.prefijo as FondType,
      label: t.prefijo,
    })),
  ];

  const handleExportExcel = async () => {
    try {
      const blob = await exportFondCodesExcel({
        criterio: filters.search,
        prefijo: filters.type !== "all" ? filters.type : "",
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "fond-codes.xlsx";
      a.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Exportación lista",
        description: "El archivo Excel se descargó correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo exportar el Excel",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text, id);
    toast({ title: "Copiado al portapapeles" });
  };

  const handleDelete = (nombre: FondCode) => {
    setSelected(nombre);
    setActionType("delete");
    setDialogOpen(true);
  };

  const handleAssign = (nombre: FondCode) => {
    setSelected(nombre);
    setActionType("assign");
    setDialogOpen(true);
  };

  const subtiposMap = useMemo(() => {
    const map = new Map<string, SubtipoFideicomisoDto>();

    for (const s of subtiposNegocio) {
      const key = `${s.tipoFideicomiso}-${s.subtipo}`;
      map.set(key, s);
    }

    return map;
  }, [subtiposNegocio]);

  const getSubtipoInfo = (tipo?: number | null, subtipo?: number | null) => {
    if (tipo == null || subtipo == null) return null;

    return subtiposMap.get(`${tipo}-${subtipo}`) ?? null;
  };
  const handleConfirmAction = async () => {
    if (!selected || !actionType) return;

    setLoadingAction(true);

    try {
      if (actionType === "delete") {
        await deleteFondCode(selected.id!);
        toast({
          title: "Anulado correctamente",
          description: selected.nombreFideicomiso,
        });
      }

      if (actionType === "assign") {
        await assingFondCode(selected.id!);

        toast({
          title: "Asignado correctamente",
          description: selected.nombreFideicomiso,
        });
      }

      setDialogOpen(false);
      setSelected(null);
      setActionType(null);

      await loadRecords(); // 🔥 refresca tabla
    } catch (e) {
      toast({
        title: "Error",
        description: "No se pudo completar la acción",
        variant: "destructive",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  function formatDate(isoDate?: string | null): string {
    if (!isoDate) return "—";

    try {
      const [year, month, day] = isoDate.split("-").map(Number);

      return new Date(year, month - 1, day).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return isoDate;
    }
  }

  return (<>
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Consecutivos registrados
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {totalElements} nombres generados en total
            </p>
          </div>
          <AppButton
            permKey="trust:BtnExportarExcelNombresFideicomiso"
            noPermBehavior="disable"
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            extraDisabled={exporting}
            className="gap-1.5 text-xs hidden sm:flex"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? "Exportando..." : "Exportar Excel"}
          </AppButton>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary-solid)]"
            />
          </div>

          <div className="flex gap-1 flex-wrap">
            {filterOptions.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterType(f.value)}
                style={
                  filters.type === f.value
                    ? { background: "var(--primary-solid)", color: "#fff" }
                    : {}
                }
                className={cn(
                  "px-3 py-2 text-xs font-medium rounded-lg border transition-colors",
                  filters.type === f.value
                    ? "border-transparent"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <p>Cargando registros...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <Wand2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">
              {totalElements === 0
                ? "No hay nombres registrados aún"
                : "No hay resultados para este filtro"}
            </p>
            {totalElements === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Genera el primer nombre usando el formulario
              </p>
            )}
          </div>
        ) : (
          <>
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[9%]" />
                <col className="w-[6%]" />
                <col className="w-[30%]" />
                <col className="w-[25%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
              </colgroup>

              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Tipo
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    #
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Nombre generado
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Clasificación
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Trazabilidad
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {records.map((tc) => (
                  <tr
                    key={tc.id}
                    className="hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-white/5 transition-colors"
                  >
                    {/* Tipo */}
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold border ${TYPE_COLORS[tc.prefijo as FondType]}`}
                      >
                        {tc.prefijo}
                      </span>
                    </td>

                    {/* # consecutivo */}
                    <td className="px-2 py-3 font-mono text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {tc.consecutivo}
                    </td>

                    {/* Nombre generado */}
                    <td className="px-3 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-mono text-xs text-gray-800 dark:text-gray-200 block truncate cursor-default">
                            {tc.nombreFideicomiso}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-sm">
                          <p className="font-mono text-xs break-all">
                            {tc.nombreFideicomiso}
                          </p>
                        </TooltipContent>
                      </Tooltip>

                      {tc.fechaSubContrato && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 block">
                          Contrato: {formatDate(tc.fechaSubContrato)}
                        </span>
                      )}
                    </td>

                    {/* CLASIFICACION */}
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        {(() => {
                          const info = getSubtipoInfo(
                            tc.codTipoFideicomiso,
                            tc.codSubTipoFideicomiso
                          );

                          if (!info) {
                            return (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full max-w-full cursor-default"
                                style={{
                                  background: "var(--highlight-primary-bg)",
                                  color: "var(--highlight-primary-text)",
                                  border: "1px solid var(--highlight-primary-border)"
                                }}
                              >
                                —
                              </span>
                            );
                          }

                          return (
                            <>
                              {/* Tipo */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full max-w-full cursor-default">
                                    <Tag className="h-2.5 w-2.5 flex-shrink-0" />
                                    <span className="truncate max-w-[140px] inline-block">
                                      {info.tipoFideicomisoNombre}
                                    </span>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs break-words">
                                    {info.tipoFideicomisoNombre}
                                  </p>
                                </TooltipContent>
                              </Tooltip>

                              {/* Subtipo */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full max-w-full cursor-default">
                                    <Layers className="h-2.5 w-2.5 flex-shrink-0" />
                                    <span className="truncate max-w-[140px] inline-block">
                                      {info.nombre}
                                    </span>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs break-words">
                                    {info.nombre}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </>
                          );
                        })()}
                      </div>
                    </td>

                    {/* TRAZABILIDAD */}
                    <td className="px-3 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-default space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: "var(--gradient-primary)" }}
                              >
                                <span className="text-white text-[10px] font-bold leading-none">
                                  {(tc.usuarioCreacion || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                {tc.usuarioCreacion || "—"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 pl-0.5">
                              <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                                {formatDateTime(tc.fechaCreacion)}
                              </span>
                            </div>
                          </div>
                        </TooltipTrigger>
                      </Tooltip>
                    </td>

                    {/* ACCIONES */}
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-0.5">
                        {/* ❌ ANU → nada */}
                        {tc.estado !== "ANU" && (
                          <>
                            {/* ✅ SOLO ASG → COPIAR */}
                            {tc.estado === "ASG" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AppButton
                                    permKey="trust:BtnCopiarNombreFideicomiso"
                                    noPermBehavior="disable"
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    onClick={() =>
                                      handleCopy(
                                        `${tc.prefijo}-${tc.consecutivo} ${tc.nombreFideicomiso}`,
                                        String(tc.id)
                                      )
                                    }
                                  >
                                    {copiedId === String(tc.id) ? (
                                      <Check className="h-3.5 w-3.5 text-green-600" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                                    )}
                                  </AppButton>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Copiar</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* ✅ SOLO REG → ASIGNAR + EDITAR + ANULAR */}
                            {tc.estado === "REG" && (
                              <>
                                {/* Asignar */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AppButton
                                      permKey="trust:BtnAsignarNombreFideicomiso"
                                      noPermBehavior="disable"
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 hover:bg-green-50 dark:hover:bg-green-900/20"
                                      onClick={() => handleAssign(tc)}
                                    >
                                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                    </AppButton>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-xs">Asignar</p>
                                  </TooltipContent>
                                </Tooltip>

                                {/* Editar */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AppButton
                                      permKey="trust:BtnEditarNombreFideicomiso"
                                      noPermBehavior="disable"
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                      onClick={() => openEdit(tc)}
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-amber-500" />
                                    </AppButton>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-xs">Editar</p>
                                  </TooltipContent>
                                </Tooltip>

                                {/* Anular */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AppButton
                                      permKey="trust:BtnAnularNombreFideicomiso"
                                      noPermBehavior="disable"
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 hover:bg-red-50 dark:hover:bg-red-900/20"
                                      onClick={() => handleDelete(tc)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                      
                                    </AppButton>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-xs">Anular</p>
                                  </TooltipContent>
                                </Tooltip>
                              </>
                            )}
                          </>
                        )}
                        {tc.estado === "ANU" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                            ANULADO
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {records.length} de {totalElements} registros
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-gray-200"
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || page <= 0}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>

                <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
                  Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    <ConfirmActionDialog
      open={dialogOpen && actionType === "assign"}
      onOpenChange={setDialogOpen}
      variant="assign"
      title="Asignar fideicomiso"
      description={
        selected && (
          <>
            <p>Va a asignar el siguiente nombre de fideicomiso:</p>

            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 px-4 py-3">
              <p className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-100">
                {selected.nombreFideicomiso}
              </p>
            </div>

            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              Esta acción marcará el registro como asignado.
            </p>
          </>
        )
      }
      confirmText="Sí, asignar"
      cancelText="No, regresar"
      onConfirm={handleConfirmAction}
      loading={loadingAction}
    />
    {/* editar */}
    <EditFondDialog />
    {/* eliminar */}
    <ConfirmActionDialog
      open={dialogOpen && actionType === "delete"}
      onOpenChange={setDialogOpen}
      variant="delete"
      title="Eliminar fideicomiso"
      description={
        selected && (
          <>
            <p>
              Esta acción no se puede deshacer. Se eliminará permanentemente el siguiente registro:
            </p>

            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 px-4 py-3">
              <p className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-100">
                {selected.nombreFideicomiso}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {selected.prefijo}-{selected.consecutivo}
              </p>
            </div>

            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              El consecutivo no se reutilizará aunque se elimine el registro.
            </p>
          </>
        )
      }
      confirmText="Sí, eliminar"
      cancelText="Cancelar"
      onConfirm={handleConfirmAction}
      loading={loadingAction}
    />
  </>
  );
};

export default NamesList;