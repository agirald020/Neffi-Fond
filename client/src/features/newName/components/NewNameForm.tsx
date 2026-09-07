import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useNewNameStore } from "../stores/newName.store";
import { EstadosNombreFideicomiso, NombresFideicomiso, FondType, TYPE_COLORS } from "../types/newName.types";
import { Check, Copy, Layers, Tag, User, Clock, OctagonAlert, CalendarIcon } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import Combobox from "@/shared/ui/combobox";
import { formatDateTime } from "@/shared/utils/utils";
import { useFideicomiso } from "../hooks/useFideicomiso";
import { useFondCodesStore } from "../stores/useFondCodes.store";
import { AppButton } from "@/shared/components/AppButton";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/shared/ui/calendar";

const NewNameForm: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const mutation = useFideicomiso();

  const {
    FondTypes,
    selectedType,
    subtipoNegocio,
    businessName,
    generatedResult,
    nextInfo,
    error,
    copiedId,
    loadingTypes,
    loadingSubtipos,
    subtiposNegocio,
    sucursales,
    fechaSubContrato,
    loadingSucursales,
    selectedSucursal,
    setSelectedType,
    setSubtipoNegocio,
    setBusinessName,
    resetForm,
    copyToClipboard,
    loadFondTypes,
    loadSubtiposNegocio,
    loadSucursales,
    setSelectedSucursal,
    setFechaSubContrato
  } = useNewNameStore();

  const [hasInvalidChars, setHasInvalidChars] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);

  const subtypeOptions = subtiposNegocio.map((s) => ({
    id: `${s.tipoFideicomiso}-${s.subtipo}`,
    value: `${s.tipoFideicomiso}-${s.subtipo}`,
    label: s.nombre,
    grupo: s.tipoFideicomisoNombre,
  }));

  useEffect(() => {
    loadSucursales();
    loadSubtiposNegocio();
    loadFondTypes();
  }, []);

  const assignedBy = user?.name || user?.username || "Desconocido";


  function parseLocalDate(dateStr?: string | null) {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      return toast({
        title: "Falta información",
        description: "Debe seleccionar el tipo de fideicomiso",
        variant: "destructive",
      });
    }

    if (!businessName.trim()) {
      return toast({
        title: "Falta información",
        description: "Debe ingresar el nombre del negocio",
        variant: "destructive",
      });
    }

    if (/[^A-Z0-9\s]/i.test(businessName)) {
      return toast({
        title: "Nombre inválido",
        description: "El nombre del negocio no puede contener caracteres especiales",
        variant: "destructive",
      });
    }

    if (!subtipoNegocio) {
      return toast({
        title: "Falta información",
        description: "Debe seleccionar el subtipo de negocio",
        variant: "destructive",
      });
    }

    if (!selectedSucursal) {
      return toast({
        title: "Falta información",
        description: "Debe seleccionar la sucursal",
        variant: "destructive",
      });
    }

    const codCiudad = Number(selectedSucursal?.codigoCiudad ?? 0);
    if (!codCiudad) {
      throw new Error("Sucursal sin ciudad válida");
    }

    if (!nextInfo?.nextConsecutive) {
      return toast({
        title: "Error",
        description: "No se pudo obtener el consecutivo",
        variant: "destructive",
      });
    }

    // 🔥 payload limpio
    const payload: NombresFideicomiso = {
      prefijo: selectedType,
      consecutivo: nextInfo.nextConsecutive,
      nombreFideicomiso: businessName.trim().toUpperCase(),
      estado: "REG" as EstadosNombreFideicomiso,
      codTipoFideicomiso: subtipoNegocio.tipoFideicomiso,
      codSubTipoFideicomiso: subtipoNegocio.subtipo,
      codCiudad: codCiudad,
      codSucursal: selectedSucursal.codigoSucursal,
      fechaSubContrato: fechaSubContrato
        ? toLocalDateString(fechaSubContrato)
        : null,
    };

    mutation.mutate(payload, {
      onSuccess: async (data) => {
        // 🔥 ya NO haces res.json()
        useNewNameStore.getState().setGeneratedResult(data[0]);

        // 🔥 refrescar lista manualmente (Zustand)
        await useFondCodesStore.getState().loadRecords();

        // 🔥 refrescar lista
        await useFondCodesStore.getState().loadRecords();

        toast({
          title: "Nombre generado y reservado",
          description: `${data[0].prefijo}-${data[0].consecutivo} ${data[0].nombreFideicomiso}`,
        });
      },

      onError: (err: any) => {
        const message = err?.message || "Error al generar el nombre";

        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      },
    });
  };

  function toLocalDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  //! render
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Nuevo nombre</h2>
        <p className="mt-1 text-sm text-slate-500">
          El consecutivo es asignado automáticamente por el sistema
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <User className="h-3.5 w-3.5" />
          <span>
            Asignando por:{" "}
            <strong className="text-slate-700">{assignedBy}</strong>
          </span>
        </div>
      </div>
      <div className="px-5 py-5">
        {!generatedResult ? (
          <form onSubmit={onSubmit} className="space-y-5">

            {/* PREFIJO DEL NOMBRE DEL FIDEICOMISO */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">
                Prefijo del nombre del fideicomiso
              </label>

              <Select
                value={selectedType}
                onValueChange={(val) => setSelectedType(val as FondType)}
              >
                <SelectTrigger className="input-modern">
                  <SelectValue placeholder="Seleccione el tipo..." />
                </SelectTrigger>

                <SelectContent>
                  {FondTypes.map((t) => (
                    <SelectItem key={t.prefijo} value={t.prefijo}>
                      <span className="font-semibold">{t.prefijo}</span>
                      <span className="text-gray-500 ml-2">
                        — {t.descripcion}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="mt-1 text-xs text-slate-500">
                Solo se permiten FA, MR o FG.
              </p>
            </div>

            {/* VISTA DEL CONSECUTIVO */}
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: "var(--highlight-primary-bg)",
                border: "1px solid var(--highlight-primary-border)",
              }}
            >
              <div
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--highlight-primary-icon-text)" }}
              >
                Consecutivo a asignar
              </div>

              <div
                className="mt-1 text-2xl font-bold"
                style={{ color: "var(--highlight-primary-text)" }}
              >
                {loadingTypes
                  ? "..."
                  : nextInfo
                    ? `${selectedType}-${nextInfo.nextConsecutive + 1}`
                    : "—"}
              </div>
            </div>

            {/*FECHA SUSCRIPCION DEL CONTRATO*/}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">
                Fecha suscripción del contrato
              </label>

              <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 w-full justify-start rounded-xl font-normal text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaSubContrato
                      ? format(fechaSubContrato, "PPP", { locale: es })
                      : "Seleccione una fecha"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-auto p-0 bg-white border shadow-md rounded-xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={fechaSubContrato || new Date()}
                    onSelect={(date) => {
                      if (date) {
                        setFechaSubContrato(date);
                        setOpenCalendar(false);
                      }
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const checkDate = new Date(date);
                      checkDate.setHours(0, 0, 0, 0);
                      return checkDate > today;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* SUBTIPO DE NEGOCIO */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-slate-500" />
                  Tipo y subtipo de Negocio
                </span>
              </label>

              <Combobox
                value={
                  subtipoNegocio
                    ? `${subtipoNegocio.tipoFideicomiso}-${subtipoNegocio.subtipo}`
                    : ""
                }
                onChange={(val) => {
                  const [tipoFideicomiso, subtipo] = val.split("-");
                  const found = subtiposNegocio.find(
                    (s) =>
                      s.tipoFideicomiso === Number(tipoFideicomiso) &&
                      s.subtipo === Number(subtipo)
                  );
                  setSubtipoNegocio(found ?? null);
                }}
                options={subtypeOptions}
                placeholder={loadingSubtipos ? "Cargando subtipos..." : "Buscar y seleccionar subtipo..."}
                searchPlaceholder="Escriba para filtrar subtipos..."
                emptyText="No se encontró este subtipo"
                disabled={loadingSubtipos}
              />

              <p className="mt-1 text-xs text-slate-500">
                El tipo se infiere automáticamente al seleccionar el subtipo.
              </p>
            </div>

            {/* NOMBRE DEL NEGOCIO */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">
                Nombre del Negocio
              </label>
              <Input
                value={businessName}
                onChange={(e) => {
                  let value = e.target.value;

                  // detectar si hay caracteres inválidos
                  const invalid = /[^A-Z0-9\s]/i.test(value);

                  setHasInvalidChars(invalid);

                  // mantener limpieza suave (pero sin bloquear escritura)
                  value = value.replace(/\s+/g, " ");
                  value = value.replace(/^\s+/, "");

                  setBusinessName(value.toUpperCase());
                }}
                onBlur={() => {
                  const trimmed = businessName.trim();
                  setBusinessName(trimmed);

                  // validar otra vez por seguridad
                  setHasInvalidChars(/[^A-Z0-9\s]/i.test(trimmed));
                }}

                placeholder="Fideicomiso / Encargo Fiduciario"
                className="h-11 rounded-xl uppercase"
              />
              <p className="mt-1 text-xs text-slate-500">
                <span>No incluir el Codigo Interno ni el Codigo Super.</span>
              </p>
              {hasInvalidChars &&
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <OctagonAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>No se permiten caracteres especiales.</span>
                </p>
              }
            </div>

            {/* OFICINA ADMINISTRACIÓN */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">
                Oficina Administración
              </label>

              <Combobox
                value={
                  selectedSucursal
                    ? String(selectedSucursal.codigoSucursal)
                    : ""
                }
                onChange={(val) => {
                  const sucursal =
                    sucursales.find(
                      (s) => String(s.codigoSucursal) === val
                    ) || null;
                  setSelectedSucursal(sucursal);
                }}
                options={sucursales.map((s) => ({
                  value: String(s.codigoSucursal),
                  label: `${s.codigoSucursal} - ${s.nombre}`,
                  grupo: s.nombreCiudad,
                }))}
                placeholder={
                  loadingSucursales
                    ? "Cargando oficinas..."
                    : "Buscar oficina..."
                }
                searchPlaceholder="Buscar por código, nombre o ciudad..."
                emptyText="No hay oficinas para esta ciudad"
                disabled={loadingSucursales}
              />
            </div>

            {/* VISTA PREVIA */}
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-2.5">

              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Vista previa del nombre
              </p>

              <p className="text-sm font-mono font-semibold text-gray-800 dark:text-gray-200 break-all">
                {selectedType ?? "CC"} - {businessName.trim() !== "" ? businessName.trim().toUpperCase() : "NOMBRE DEL NEGOCIO"}
              </p>

              {subtipoNegocio || selectedSucursal ? (
                <div className="pt-1 border-t border-gray-200 dark:border-gray-600 flex flex-wrap gap-1.5">

                  {subtipoNegocio && (
                    <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                      <Layers className="h-3 w-3" />
                      {subtipoNegocio.nombre}
                    </span>
                  )}

                  {selectedSucursal && (
                    <>
                      {/* Sucursal */}
                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        <span className="font-semibold">
                          {selectedSucursal.nombre}
                        </span>
                      </span>

                      {/* Ciudad */}
                      <span className="inline-flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                        <span className="font-semibold">{selectedSucursal.codigoCiudad} - {selectedSucursal.nombreCiudad}
                        </span>
                      </span>
                    </>
                  )}

                </div>
              ) : null}

              <p className="text-xs text-gray-400">
                * El consecutivo{" "}
                {nextInfo ? `${selectedType}-${nextInfo.nextConsecutive + 1}` : "—"} se reservará al generar
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <AppButton
              permKey="trust:BtnCrearNombreFideicomiso"
              noPermBehavior="disable"
              type="submit"
              className="w-full btn-gradient-primary"
              extraDisabled={mutation.isPending}
            >
              {mutation.isPending ? "Generando..." : "Generar y Reservar Nombre"}
            </AppButton>
          </form>
        ) : (
          <div className="space-y-5">
            <div
              className="rounded-2xl p-5"
              style={{
                background: "hsl(0, 0%, 98%)",
                border: "1px solid hsl(0, 0%, 90%)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "var(--highlight-primary-icon-text)" }}
              >
                Nombre oficial generado y reservado
              </p>

              <p
                className="text-base font-mono font-bold leading-relaxed break-all"
                style={{ color: "var(--highlight-primary-text)" }}
              >
                {generatedResult.prefijo}-{generatedResult.consecutivo}{" "}
                {generatedResult.nombreFideicomiso}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${TYPE_COLORS[generatedResult.prefijo]}`}
                >
                  {generatedResult.prefijo}
                </span>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {generatedResult.prefijo === "FA"
                    ? "Fiducia de Administración"
                    : generatedResult.prefijo === "MR"
                      ? "Manejo de Recursos"
                      : "Fiducia en Garantía"}
                </span>

                <span className="text-xs text-gray-500 ml-auto">
                  Consecutivo <strong>{generatedResult.consecutivo}</strong>
                </span>
              </div>

              {/* 🔥 Clasificación */}
              <div
                className="mt-2 pt-2 flex flex-wrap gap-2"
                style={{ borderTop: "1px solid var(--highlight-primary-border)" }}
              >
                {generatedResult.codTipoFideicomiso != null && (
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    <Tag className="h-3 w-3" />
                    Tipo {generatedResult.codTipoFideicomiso}
                  </span>)}

                {generatedResult.codSubTipoFideicomiso != null && (
                  <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                    <Layers className="h-3 w-3" /> Subtipo {generatedResult.codSubTipoFideicomiso}
                  </span>
                )}

                {generatedResult.codCiudad != null && (
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    Ciudad {generatedResult.codCiudad}
                  </span>
                )}

                {generatedResult.codSucursal != null && (
                  <span className="inline-flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                    Sucursal {generatedResult.codSucursal}
                  </span>
                )}

              </div>

              {/* 🔥 Trazabilidad */}
              <div
                className="mt-3 pt-3 space-y-1"
                style={{ borderTop: "1px solid var(--highlight-primary-border)" }}
              >
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <User className="h-3 w-3" />
                  <span>
                    Creado por: <strong>{generatedResult.usuarioCreacion}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>
                    Fecha:{" "}
                    <strong>{formatDateTime(generatedResult.fechaCreacion)}</strong>
                  </span>
                </div>

                {generatedResult.fechaSubContrato != null && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Fecha contrato:{" "}
                    <span className="font-medium">
                      {parseLocalDate(generatedResult.fechaSubContrato)?.toLocaleDateString("es-CO")}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* BOTÓN COPIAR */}
            <AppButton
              permKey="trust:BtnCopiarNombreFideicomiso"
              noPermBehavior="disable"
              className="w-full btn-gradient-primary gap-2"
              onClick={() =>
                copyToClipboard(
                  `${generatedResult.prefijo}-${generatedResult.consecutivo} ${generatedResult.nombreFideicomiso}`,
                  "result"
                )
              }
            >
              {copiedId === "result" ? (
                <>
                  <Check className="h-4 w-4" /> ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copiar nombre
                </>
              )}
            </AppButton>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => resetForm(true)}
            >
              Generar otro nombre
            </Button>
          </div>
        )}
      </div>
    </section>

  );
};

export default NewNameForm;