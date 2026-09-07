import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/shared/ui/form";
import Combobox from "@/shared/ui/combobox";

import {
  NombresFideicomiso,
  TYPE_COLORS,
} from "../types/newName.types";
import type { SubtipoFideicomisoDto } from "../types/TipoFideicomisoDTO";
import { useFondCodesStore } from "../stores/useFondCodes.store";
import { useNewNameStore } from "../stores/newName.store";
import { saveNombreFideicomiso } from "../services/newNameServices";
import { CalendarIcon, Pencil, Layers, Tag } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";

type EditFondFormValues = {
  nombreFideicomiso: string;
  fechaSubContrato: Date | undefined;
};

type SubtipoOption = {
  value: string;
  label: string;
  grupo: string;
};

function toSubtipoKey(tipo: number, subtipo: number): string {
  return `${tipo}-${subtipo}`;
}

const EditFondDialog: React.FC = () => {
  const { toast } = useToast();

  const {
    editingRecord,
    closeEdit,
    editNombreFideicomiso,
    editCodigoSuper,
    editCodCiudad,
    editCodSucursal,
    setEditNombreFideicomiso,
    setEditCodigoSuper,
    setEditCodCiudad,
    setEditCodSucursal,
    loadRecords,
  } = useFondCodesStore();

  const {
    subtiposNegocio,
    loadingSubtipos,
    loadSubtiposNegocio,
    sucursales,
    loadingSucursales,
    loadSucursales,
  } = useNewNameStore();

  const [saving, setSaving] = useState(false);
  const [selectedSubtipoKey, setSelectedSubtipoKey] = useState<string>(""); 
  const [openFecha, setOpenFecha] = useState(false);

  const editForm = useForm<EditFondFormValues>({
    defaultValues: {
      nombreFideicomiso: "",
      fechaSubContrato: undefined,
    },
  });

  useEffect(() => {
    if (!subtiposNegocio.length && !loadingSubtipos) {
      void loadSubtiposNegocio();
    }
  }, [subtiposNegocio.length, loadingSubtipos, loadSubtiposNegocio]);

  useEffect(() => {
    if (!sucursales.length && !loadingSucursales) {
      void loadSucursales();
    }
  }, [sucursales.length, loadingSucursales, loadSucursales]);

  useEffect(() => {
    if (!editingRecord) {
      setSelectedSubtipoKey("");
      editForm.reset({
        nombreFideicomiso: "",
        fechaSubContrato: undefined,
      });
      return;
    }

    editForm.reset({
      nombreFideicomiso: editingRecord.nombreFideicomiso ?? "", 
      fechaSubContrato: parseLocalDate(editingRecord.fechaSubContrato),
    });

    setEditNombreFideicomiso(editingRecord.nombreFideicomiso ?? "");
    setEditCodCiudad(editingRecord.codCiudad != null ? String(editingRecord.codCiudad) : "");
    setEditCodSucursal(editingRecord.codSucursal != null ? String(editingRecord.codSucursal) : "");

    if (
      editingRecord.codTipoFideicomiso != null &&
      editingRecord.codSubTipoFideicomiso != null
    ) {
      setSelectedSubtipoKey(
        toSubtipoKey(
          editingRecord.codTipoFideicomiso,
          editingRecord.codSubTipoFideicomiso
        )
      );
    } else {
      setSelectedSubtipoKey("");
    }
  }, [
    editingRecord,
    editForm,
    setEditNombreFideicomiso,
    setEditCodCiudad,
    setEditCodSucursal,
  ]);

  function parseLocalDate(dateStr?: string | null) {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  
  const subtiposMap = useMemo(() => {
    const map = new Map<string, SubtipoFideicomisoDto>();

    for (const s of subtiposNegocio) {
      map.set(toSubtipoKey(s.tipoFideicomiso, s.subtipo), s);
    }

    return map;
  }, [subtiposNegocio]);

  const subtypeOptions: SubtipoOption[] = useMemo(() => {
    return subtiposNegocio.map((s) => ({
      value: toSubtipoKey(s.tipoFideicomiso, s.subtipo),
      label: s.nombre,
      grupo: s.tipoFideicomisoNombre,
    }));
  }, [subtiposNegocio]);

  const selectedSubtipo = selectedSubtipoKey
    ? subtiposMap.get(selectedSubtipoKey) ?? null
    : null;

  function toLocalDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const handleSubmit = async (values: EditFondFormValues) => {
    if (!editingRecord?.id) {
      toast({
        title: "Error",
        description: "No se encontró el registro a editar",
        variant: "destructive",
      });
      return;
    }

    const subtipo = selectedSubtipoKey
      ? subtiposMap.get(selectedSubtipoKey) ?? null
      : null;

    const payload: NombresFideicomiso = {
      ...editingRecord,
      id: editingRecord.id,
      nombreFideicomiso: values.nombreFideicomiso.trim(),
      fechaSubContrato: values.fechaSubContrato
        ? toLocalDateString(values.fechaSubContrato)
        : null,
      codTipoFideicomiso: subtipo ? subtipo.tipoFideicomiso : null,
      codSubTipoFideicomiso: subtipo ? subtipo.subtipo : null,
      codCiudad: editCodCiudad ? Number(editCodCiudad) : null,
      codSucursal: editCodSucursal ? Number(editCodSucursal) : null,
      estado: "REG",
    };

    setSaving(true);
    try {
      await saveNombreFideicomiso(payload);

      toast({
        title: "Registro actualizado",
        description: payload.nombreFideicomiso,
      });

      closeEdit();
      await loadRecords();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={Boolean(editingRecord)}
      onOpenChange={(open) => {
        if (!open) closeEdit();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="flex items-center justify-center gap-2 text-lg">
            <Pencil className="h-4 w-4 text-amber-500" />
            Modificar asignación
          </DialogTitle>

          <DialogDescription className="text-center text-sm">
            Puedes modificar nombre, fecha del contrato, clasificación, ciudad y sucursal.
          </DialogDescription>
        </DialogHeader>

        {editingRecord && (
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleSubmit)}
              className="space-y-5 mt-2"
            >
              {/* HEADER */}
              <div className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-12 h-7 rounded text-sm font-bold border ${TYPE_COLORS[
                      editingRecord.prefijo as keyof typeof TYPE_COLORS
                      ]
                      }`}
                  >
                    {editingRecord.prefijo}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Consecutivo reservado
                    </p>
                    <p className="text-lg font-bold font-mono text-gray-800 dark:text-gray-100">
                      {editingRecord.prefijo}-{editingRecord.consecutivo}
                    </p>
                    <p className="mt-1 text-sm font-mono text-gray-700 dark:text-gray-200 break-all">
                      {editForm.watch("nombreFideicomiso") ||
                        editingRecord.nombreFideicomiso}
                    </p>
                  </div>
                </div>
              </div>

              {/* NOMBRE */}
              <FormField
                control={editForm.control}
                name="nombreFideicomiso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del fideicomiso</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nombre del fideicomiso"
                        onChange={(e) => {
                          field.onChange(e);
                          setEditNombreFideicomiso(e.target.value);
                        }}
                      />
                    </FormControl>

                    <FormDescription className="text-xs">
                      Se generará:
                      <strong className="font-mono block mt-1">
                        {editingRecord.prefijo}-{editingRecord.consecutivo}{" "}
                        {(editForm.watch("nombreFideicomiso") || "").toUpperCase()}
                      </strong>
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* FECHA SUSCRIPCION DEL CONTRATO */}
              <FormField
                control={editForm.control}
                name="fechaSubContrato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha suscripción del contrato</FormLabel>

                    <Popover open={openFecha} onOpenChange={setOpenFecha}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 w-full justify-start rounded-xl font-normal text-left"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "dd/MM/yyyy")
                              : "Seleccione una fecha"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-auto p-0 bg-white border shadow-md rounded-xl"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          month={field.value ?? undefined}
                          onSelect={(date) => {
                            field.onChange(date);
                            setOpenFecha(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SUBTIPO */}
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-gray-500" />
                  Subtipo de negocio
                </FormLabel>

                <FormControl>
                  <Combobox
                    value={selectedSubtipoKey}
                    onChange={setSelectedSubtipoKey}
                    options={subtypeOptions}
                    placeholder="Buscar subtipo..."
                    searchPlaceholder="Escriba para filtrar..."
                    emptyText="No encontrado"
                  />
                </FormControl>

                {selectedSubtipo && (
                  <p className="text-xs text-indigo-500 mt-1 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Tipo inferido:{" "}
                    <strong>{selectedSubtipo.tipoFideicomisoNombre}</strong>
                  </p>
                )}
              </FormItem>

              {/* SUCURSAL */}
              <FormItem>
                <FormLabel>Oficina Administración</FormLabel>

                <FormControl>
                  <Combobox
                    value={editCodSucursal}
                    onChange={setEditCodSucursal}
                    options={sucursales.map((s) => ({
                      value: String(s.codigoSucursal),
                      label: `${s.codigoSucursal} - ${s.nombre}`,
                      grupo: s.nombreCiudad,
                    }))}
                    placeholder={
                      loadingSucursales
                        ? "Cargando sucursales..."
                        : "Buscar sucursal..."
                    }
                    searchPlaceholder="Buscar por código, nombre o ciudad..."
                    emptyText="No hay sucursales disponibles"
                    disabled={loadingSucursales}
                  />
                </FormControl>
              </FormItem>

              {/* BOTONES */}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEdit}
                  disabled={saving}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  className="btn-gradient-primary"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditFondDialog;