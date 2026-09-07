import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import MunicipioSelector from "@/components/municipio-selector";
import type { Municipio } from "@/data/divipola";
import {
  Copy,
  Check,
  Wand2,
  Hash,
  Search,
  Download,
  User,
  Clock,
  ChevronsUpDown,
  Tag,
  Layers,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const TRUST_TYPES = [
  { value: "FA", label: "FA", fullLabel: "Fiducia de Administración" },
  { value: "MR", label: "MR", fullLabel: "Manejo de Recursos" },
  { value: "FG", label: "FG", fullLabel: "Fiducia en Garantía" },
];

const TYPE_COLORS: Record<string, string> = {
  FA: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700",
  MR: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700",
  FG: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
};

const SUBTIPOS_NEGOCIO = [
  { value: "Preventas Inmobiliarias", label: "Preventas Inmobiliarias", tipo: "Fiducia Inmobiliaria" },
  { value: "Construcción y Desarrollo", label: "Construcción y Desarrollo", tipo: "Fiducia Inmobiliaria" },
  { value: "Parqueo y Estacionamiento", label: "Parqueo y Estacionamiento", tipo: "Fiducia Inmobiliaria" },
  { value: "Proyectos Comerciales", label: "Proyectos Comerciales", tipo: "Fiducia Inmobiliaria" },
  { value: "Proyectos Residenciales", label: "Proyectos Residenciales", tipo: "Fiducia Inmobiliaria" },
  { value: "Desarrollo Urbano", label: "Desarrollo Urbano", tipo: "Fiducia Inmobiliaria" },
  { value: "Administración General", label: "Administración General", tipo: "Fiducia de Administración" },
  { value: "Administración de Proyectos", label: "Administración de Proyectos", tipo: "Fiducia de Administración" },
  { value: "Manejo de Recursos de Preventas", label: "Manejo de Recursos de Preventas", tipo: "Fiducia de Administración" },
  { value: "Administración de Patrimonios", label: "Administración de Patrimonios", tipo: "Fiducia de Administración" },
  { value: "Administración de Nómina", label: "Administración de Nómina", tipo: "Fiducia de Administración" },
  { value: "Administración de Fondos", label: "Administración de Fondos", tipo: "Fiducia de Administración" },
  { value: "Garantía Empresarial", label: "Garantía Empresarial", tipo: "Fiducia en Garantía" },
  { value: "Garantía Inmobiliaria", label: "Garantía Inmobiliaria", tipo: "Fiducia en Garantía" },
  { value: "Garantía de Crédito", label: "Garantía de Crédito", tipo: "Fiducia en Garantía" },
  { value: "Garantía Hipotecaria", label: "Garantía Hipotecaria", tipo: "Fiducia en Garantía" },
  { value: "Garantía de Obra Civil", label: "Garantía de Obra Civil", tipo: "Fiducia en Garantía" },
  { value: "Inversión a la Vista", label: "Inversión a la Vista", tipo: "Fiducia de Inversión" },
  { value: "Inversión a Plazo Fijo", label: "Inversión a Plazo Fijo", tipo: "Fiducia de Inversión" },
  { value: "Portafolio Colectivo", label: "Portafolio Colectivo", tipo: "Fiducia de Inversión" },
  { value: "Fondos de Capital Privado", label: "Fondos de Capital Privado", tipo: "Fiducia de Inversión" },
  { value: "Inversión en Títulos", label: "Inversión en Títulos", tipo: "Fiducia de Inversión" },
];

const formSchema = z.object({
  type: z.enum(["FA", "MR", "FG"], { required_error: "Seleccione el tipo" }),
  superfinancieraCode: z.string().optional(),
  tipoNegocio: z.string().optional(),
  subtipoNegocio: z.string().optional(),
  businessName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  ciudadEjecucion: z.string().optional(),
  codigoDivipola: z.string().optional(),
  departamento: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const editSchema = z.object({
  businessName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  superfinancieraCode: z.string().optional(),
  subtipoNegocio: z.string().optional(),
  tipoNegocio: z.string().optional(),
});

type EditValues = z.infer<typeof editSchema>;

interface FondCode {
  id: string;
  type: string;
  consecutive: number;
  superfinancieraCode?: string;
  tipoNegocio?: string;
  subtipoNegocio?: string;
  businessName: string;
  generatedName: string;
  assignedBy: string;
  assignedByEmail: string;
  ciudadEjecucion?: string;
  codigoDivipola?: string;
  departamento?: string;
  createdAt: string;
}

interface GeneratedResult {
  generatedName: string;
  type: string;
  typeLabel: string;
  consecutive: number;
  superfinancieraCode: string;
  tipoNegocio: string;
  subtipoNegocio: string;
  assignedBy: string;
  assignedByEmail: string;
  ciudadEjecucion?: string;
  codigoDivipola?: string;
  departamento?: string;
  createdAt: string;
}

interface NextConsecutiveInfo {
  type: string;
  typeLabel: string;
  nextConsecutive: number;
}

function formatDateTime(isoString: string): string {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    return date.toLocaleString("es-CO", {
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

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; grupo?: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
}

function Combobox({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyText = "No encontrado",
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal h-10 px-3 input-modern",
            !value && "text-muted-foreground"
          )}
        >
          <span className="truncate text-left">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" style={{ minWidth: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div>
                    <span className="text-sm">{option.label}</span>
                    {option.grupo && (
                      <span className="ml-2 text-xs text-muted-foreground">— {option.grupo}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function GeneradorPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSearch, setFilterSearch] = useState("");
  const [editingRecord, setEditingRecord] = useState<FondCode | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<FondCode | null>(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<Municipio | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: undefined,
      superfinancieraCode: "",
      tipoNegocio: "",
      subtipoNegocio: "",
      businessName: "",
    },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      businessName: "",
      superfinancieraCode: "",
      subtipoNegocio: "",
      tipoNegocio: "",
    },
  });

  const selectedType = form.watch("type");
  const watchedName = form.watch("businessName");
  const watchedTipo = form.watch("tipoNegocio");
  const watchedSubtipo = form.watch("subtipoNegocio");

  const { data: nextInfo } = useQuery<NextConsecutiveInfo>({
    queryKey: ["/api/fond-codes", selectedType, "next-consecutive"],
    queryFn: async () => {
      const res = await fetch(`/api/fond-codes/${selectedType}/next-consecutive`);
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    enabled: !!selectedType,
  });

  const { data: allCodes = [], isLoading: loadingCodes } = useQuery<FondCode[]>({
    queryKey: ["/api/fond-codes"],
    queryFn: async () => {
      const res = await fetch("/api/fond-codes");
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiRequest("POST", "/api/fond-codes/generate", {
        ...values,
        ciudadEjecucion: selectedMunicipio?.nombre ?? null,
        codigoDivipola: selectedMunicipio?.codigo ?? null,
        departamento: selectedMunicipio?.departamento ?? null,
        assignedBy: user?.name || user?.username || "Desconocido",
        assignedByEmail: user?.email || "",
      }),
    onSuccess: async (res) => {
      const data: GeneratedResult = await res.json();
      setGeneratedResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/fond-codes"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/fond-codes", data.type, "next-consecutive"],
      });
      toast({ title: "Nombre generado y reservado", description: data.generatedName });
    },
    onError: async (err: any) => {
      let message = "Error al generar el nombre";
      try {
        const text = await err.text?.();
        const body = JSON.parse(text || "{}");
        if (body?.error) message = body.error;
      } catch {
        if (err.message) message = err.message;
      }
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: EditValues }) =>
      apiRequest("PUT", `/api/fond-codes/${id}`, {
        ...values,
        updatedBy: user?.name || user?.username || "Desconocido",
        updatedByEmail: user?.email || "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fond-codes"] });
      setEditingRecord(null);
      toast({ title: "Registro actualizado correctamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fond-codes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fond-codes"] });
      setDeletingRecord(null);
      toast({ title: "Registro eliminado" });
    },
    onError: () => {
      toast({ title: "Error al eliminar", variant: "destructive" });
    },
  });

  function openEdit(tc: FondCode) {
    setEditingRecord(tc);
    editForm.reset({
      businessName: tc.businessName,
      superfinancieraCode: tc.superfinancieraCode || "",
      subtipoNegocio: tc.subtipoNegocio || "",
      tipoNegocio: tc.tipoNegocio || "",
    });
  }

  function onEditSubmit(values: EditValues) {
    if (!editingRecord) return;
    editMutation.mutate({ id: editingRecord.id, values });
  }

  function handleEditSubtipoChange(subtipo: string, fieldOnChange: (v: string) => void) {
    fieldOnChange(subtipo);
    if (subtipo) {
      const found = SUBTIPOS_NEGOCIO.find((s) => s.value === subtipo);
      if (found) editForm.setValue("tipoNegocio", found.tipo);
    } else {
      editForm.setValue("tipoNegocio", "");
    }
  }

  function onSubmit(values: FormValues) {
    setGeneratedResult(null);
    mutation.mutate(values);
  }

  async function handleCopy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copiado al portapapeles" });
  }

  function handleNewGeneration() {
    setGeneratedResult(null);
    setSelectedMunicipio(null);
    form.reset({
      type: selectedType,
      superfinancieraCode: "",
      tipoNegocio: "",
      subtipoNegocio: "",
      businessName: "",
      ciudadEjecucion: "",
      codigoDivipola: "",
      departamento: "",
    });
  }

  function handleExport() {
    window.open("/api/fond-codes/export/xlsx", "_blank");
  }

  function handleSubtipoChange(subtipo: string, fieldOnChange: (v: string) => void) {
    fieldOnChange(subtipo);
    if (subtipo) {
      const found = SUBTIPOS_NEGOCIO.find((s) => s.value === subtipo);
      if (found) {
        form.setValue("tipoNegocio", found.tipo, { shouldValidate: true });
      }
    }
  }

  const previewName =
    selectedType && nextInfo && watchedName
      ? `${selectedType}-${nextInfo.nextConsecutive} ${watchedName.toUpperCase()}`
      : null;

  const subtipesConGrupo = SUBTIPOS_NEGOCIO.map((s) => ({
    value: s.value,
    label: s.label,
    grupo: s.tipo,
  }));

  const filteredCodes = allCodes
    .filter((c) => filterType === "all" || c.type === filterType)
    .filter(
      (c) =>
        !filterSearch ||
        c.generatedName.toLowerCase().includes(filterSearch.toLowerCase()) ||
        String(c.consecutive).includes(filterSearch) ||
        (c.superfinancieraCode || "").includes(filterSearch) ||
        (c.assignedBy || "").toLowerCase().includes(filterSearch.toLowerCase()) ||
        (c.tipoNegocio || "").toLowerCase().includes(filterSearch.toLowerCase()) ||
        (c.subtipoNegocio || "").toLowerCase().includes(filterSearch.toLowerCase())
    )
    .sort((a, b) => {
      const typeOrder = a.type.localeCompare(b.type);
      if (typeOrder !== 0) return typeOrder;
      return a.consecutive - b.consecutive;
    });

  const countByType = allCodes.reduce(
    (acc, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      {/* Page header — full width */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-blue-50 rounded-lg p-2">
            <Wand2 className="h-5 w-5 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Generador de Nombres de Fideicomisos
          </h1>
        </div>
        <p className="text-gray-500 text-sm ml-12 leading-relaxed">
          El sistema asigna el consecutivo automáticamente. El código Superfinanciera se guarda como referencia. Se registra el usuario y la fecha de cada asignación.
        </p>

        {/* Stats */}
        <div className="flex gap-3 mt-5 ml-12 flex-wrap">
          {TRUST_TYPES.map((t) => (
            <div
              key={t.value}
              className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200 min-w-[130px]"
            >
              <p className="text-[11px] text-gray-500 font-medium truncate">{t.fullLabel}</p>
              <p className="text-2xl font-bold text-gray-900 leading-tight">{countByType[t.value] || 0}</p>
              <p className="text-[11px] text-gray-400">registrados</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main content — full width with padding */}
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6 xl:gap-8 items-start">

          {/* LEFT: Form */}
          <div className="lg:col-span-1 xl:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Nuevo nombre
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  El consecutivo es asignado automáticamente por el sistema
                </p>
                {user && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                    <User className="h-3.5 w-3.5" />
                    <span>Asignando como: <strong className="text-gray-600 dark:text-gray-300">{user.name || user.username}</strong></span>
                  </div>
                )}
              </div>

              <div className="p-6">
                {!generatedResult ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                      {/* Tipo de Fideicomiso (FA/MR/FG) */}
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Fideicomiso</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="input-modern">
                                  <SelectValue placeholder="Seleccione el tipo..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TRUST_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    <span className="font-semibold">{t.value}</span>
                                    <span className="text-gray-500 ml-2">— {t.fullLabel}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Consecutivo informativo */}
                      {selectedType && nextInfo && (
                        <div className="flex items-center gap-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50 px-4 py-3">
                          <div className="bg-indigo-100 dark:bg-indigo-800 rounded-lg p-2">
                            <Hash className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                          </div>
                          <div>
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium uppercase tracking-wide">
                              Consecutivo a asignar
                            </p>
                            <p className="text-xl font-bold text-indigo-700 dark:text-indigo-200 leading-tight">
                              {selectedType}-{nextInfo.nextConsecutive}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Código Superfinanciera */}
                      <FormField
                        control={form.control}
                        name="superfinancieraCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Código Superfinanciera
                              <span className="ml-2 text-xs font-normal text-gray-400">(referencia externa — opcional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ej: 2799"
                                className="input-modern"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Código asignado por la Superfinanciera. Se guarda como referencia pero no forma parte del nombre generado.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Subtipo de Negocio (primero — infiere el tipo) */}
                      <FormField
                        control={form.control}
                        name="subtipoNegocio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Layers className="h-3.5 w-3.5 text-gray-500" />
                              Subtipo de NegocioXXXX
                              <span className="text-xs font-normal text-gray-400">(opcional)</span>
                            </FormLabel>
                            <FormControl>
                              <Combobox
                                value={field.value || ""}
                                onChange={(val) => handleSubtipoChange(val, field.onChange)}
                                options={subtipesConGrupo}
                                placeholder="Buscar y seleccionar subtipo..."
                                searchPlaceholder="Escriba para filtrar subtipos..."
                                emptyText="No se encontró este subtipo"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              El tipo se infiere automáticamente al seleccionar el subtipo.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Nombre del negocio */}
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Negocio</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ej: FIDEICOMISO PARQUEO MAJOR-EL MANANTIAL"
                                className="input-modern"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Ciudad de Ejecución */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none flex items-center gap-1.5">
                          <span>Ciudad de Ejecución</span>
                          <span className="text-xs font-normal text-gray-400">(opcional)</span>
                        </label>
                        <MunicipioSelector
                          value={selectedMunicipio?.codigo}
                          onChange={setSelectedMunicipio}
                          placeholder="Buscar municipio..."
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                          Municipio colombiano donde se ejecuta el fideicomiso (código DIVIPOLA).
                        </p>
                      </div>

                      {/* Vista previa */}
                      {previewName && (
                        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-2.5">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                            Vista previa del nombre
                          </p>
                          <p className="text-sm font-mono font-semibold text-gray-800 dark:text-gray-200 break-all">
                            {previewName}
                          </p>
                          {(watchedTipo || watchedSubtipo) && (
                            <div className="pt-1 border-t border-gray-200 dark:border-gray-600 flex flex-wrap gap-1.5">
                              {watchedTipo && (
                                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                  <Tag className="h-3 w-3" />
                                  {watchedTipo}
                                </span>
                              )}
                              {watchedSubtipo && (
                                <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                                  <Layers className="h-3 w-3" />
                                  {watchedSubtipo}
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-400">
                            * El consecutivo {selectedType}-{nextInfo?.nextConsecutive} se reservará al generar
                          </p>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full btn-gradient-primary"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? "Generando..." : "Generar y Reservar Nombre"}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700/50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-2">
                        Nombre oficial generado y reservado
                      </p>
                      <p className="text-base font-mono font-bold text-gray-900 dark:text-white leading-relaxed break-all">
                        {generatedResult.generatedName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${TYPE_COLORS[generatedResult.type]}`}>
                          {generatedResult.type}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{generatedResult.typeLabel}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          Consecutivo <strong>{generatedResult.consecutive}</strong>
                        </span>
                      </div>

                      {/* Clasificación negocio */}
                      {(generatedResult.tipoNegocio || generatedResult.subtipoNegocio) && (
                        <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-800 flex flex-wrap gap-2">
                          {generatedResult.tipoNegocio && (
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                              <Tag className="h-3 w-3" />{generatedResult.tipoNegocio}
                            </span>
                          )}
                          {generatedResult.subtipoNegocio && (
                            <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                              <Layers className="h-3 w-3" />{generatedResult.subtipoNegocio}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Trazabilidad */}
                      <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <User className="h-3 w-3" />
                          <span>Asignado por: <strong>{generatedResult.assignedBy}</strong>
                            {generatedResult.assignedByEmail && ` (${generatedResult.assignedByEmail})`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>Fecha: <strong>{formatDateTime(generatedResult.createdAt)}</strong></span>
                        </div>
                        {generatedResult.superfinancieraCode && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Cód. Superfinanciera: <span className="font-medium">{generatedResult.superfinancieraCode}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      className="w-full btn-gradient-primary gap-2"
                      onClick={() => handleCopy(generatedResult.generatedName, "result")}
                    >
                      {copiedId === "result" ? (
                        <><Check className="h-4 w-4" /> ¡Copiado!</>
                      ) : (
                        <><Copy className="h-4 w-4" /> Copiar nombre</>
                      )}
                    </Button>
                    <Button className="w-full" variant="outline" onClick={handleNewGeneration}>
                      Generar otro nombre
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Leyenda tipos */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tipos de negocio</h3>
              <div className="space-y-2">
                {TRUST_TYPES.map((t) => (
                  <div key={t.value} className="flex items-center gap-3">
                    <span className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold border ${TYPE_COLORS[t.value]}`}>
                      {t.value}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.fullLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: History table */}
          <div className="lg:col-span-1 xl:col-span-3">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                      Consecutivos registrados
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {allCodes.length} nombres generados en total
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="gap-1.5 text-xs hidden sm:flex"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Exportar Excel
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[140px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      placeholder="Buscar por nombre, tipo, usuario..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {[{ value: "all", label: "Todos" }, ...TRUST_TYPES.map(t => ({ value: t.value, label: t.value }))].map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setFilterType(f.value)}
                        className={cn(
                          "px-3 py-2 text-xs font-medium rounded-lg border transition-colors",
                          filterType === f.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full">
                {loadingCodes ? (
                  <div className="p-12 text-center text-gray-400"><p>Cargando registros...</p></div>
                ) : filteredCodes.length === 0 ? (
                  <div className="p-12 text-center">
                    <Wand2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">
                      {allCodes.length === 0 ? "No hay nombres registrados aún" : "No hay resultados para este filtro"}
                    </p>
                    {allCodes.length === 0 && (
                      <p className="text-xs text-gray-400 mt-1">Genera el primer nombre usando el formulario</p>
                    )}
                  </div>
                ) : (
                  <table className="w-full table-fixed text-sm">
                    <colgroup>
                      <col className="w-[9%]" />
                      <col className="w-[6%]" />
                      <col className="w-[30%]" />
                      <col className="w-[22%]" />
                      <col className="w-[21%]" />
                      <col className="w-[12%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tipo</th>
                        <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">#</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nombre generado</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Clasificación</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Trazabilidad</th>
                        <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {filteredCodes.map((tc) => (
                        <tr key={tc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold border ${TYPE_COLORS[tc.type]}`}>
                              {tc.type}
                            </span>
                          </td>
                          <td className="px-2 py-3 font-mono text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {tc.consecutive}
                          </td>
                          <td className="px-3 py-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-mono text-xs text-gray-800 dark:text-gray-200 block truncate cursor-default">
                                  {tc.generatedName}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-sm">
                                <p className="font-mono text-xs break-all">{tc.generatedName}</p>
                              </TooltipContent>
                            </Tooltip>
                            {tc.superfinancieraCode && (
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 block">
                                Superfin: {tc.superfinancieraCode}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              {tc.tipoNegocio ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full cursor-default max-w-full">
                                      <Tag className="h-2.5 w-2.5 flex-shrink-0" />
                                      <span className="truncate">{tc.tipoNegocio}</span>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent><p className="text-xs">{tc.tipoNegocio}</p></TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-[10px] text-gray-300 dark:text-gray-600">—</span>
                              )}
                              {tc.subtipoNegocio && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full cursor-default max-w-full">
                                      <Layers className="h-2.5 w-2.5 flex-shrink-0" />
                                      <span className="truncate">{tc.subtipoNegocio}</span>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent><p className="text-xs">{tc.subtipoNegocio}</p></TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-default space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                      <span className="text-white text-[10px] font-bold leading-none">
                                        {(tc.assignedBy || "?").charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                      {tc.assignedBy || "—"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 pl-0.5">
                                    <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                    <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                                      {formatDateTime(tc.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                <div className="text-xs space-y-1">
                                  <p className="font-semibold">{tc.assignedBy}</p>
                                  {tc.assignedByEmail && <p className="text-gray-400">{tc.assignedByEmail}</p>}
                                  <p className="text-gray-400">{formatDateTime(tc.createdAt)}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex items-center justify-center gap-0.5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    onClick={() => handleCopy(tc.generatedName, tc.id)}
                                  >
                                    {copiedId === tc.id ? (
                                      <Check className="h-3.5 w-3.5 text-green-600" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top"><p className="text-xs">Copiar</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                    onClick={() => openEdit(tc)}
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-amber-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top"><p className="text-xs">Editar</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => setDeletingRecord(tc)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top"><p className="text-xs">Eliminar</p></TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Diálogo de edición ─────────────────────────────────────────────── */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => { if (!open) setEditingRecord(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-amber-500" />
              Modificar asignación
            </DialogTitle>
            <DialogDescription>
              Puedes modificar los datos del nombre. El tipo y el consecutivo no se pueden cambiar.
            </DialogDescription>
          </DialogHeader>

          {editingRecord && (
            <>
              {/* Info fija del consecutivo */}
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 mb-2">
                <span className={`inline-flex items-center justify-center w-12 h-7 rounded text-sm font-bold border ${TYPE_COLORS[editingRecord.type]}`}>
                  {editingRecord.type}
                </span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Consecutivo reservado</p>
                  <p className="text-lg font-bold font-mono text-gray-800 dark:text-gray-100">
                    {editingRecord.type}-{editingRecord.consecutive}
                  </p>
                </div>
              </div>

              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">

                  <FormField
                    control={editForm.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Negocio</FormLabel>
                        <FormControl>
                          <Input {...field} className="input-modern" placeholder="Nombre del negocio" />
                        </FormControl>
                        <FormDescription className="text-xs">
                          El nombre generado se actualizará a: <strong className="font-mono">
                            {editingRecord.type}-{editingRecord.consecutive} {(editForm.watch("businessName") || "").toUpperCase()}
                          </strong>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="superfinancieraCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Código Superfinanciera
                          <span className="ml-2 text-xs font-normal text-gray-400">(opcional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="input-modern" placeholder="Ej: 2799" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="subtipoNegocio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-gray-500" />
                          Subtipo de Negocio
                          <span className="text-xs font-normal text-gray-400">(opcional)</span>
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            value={field.value || ""}
                            onChange={(val) => handleEditSubtipoChange(val, field.onChange)}
                            options={SUBTIPOS_NEGOCIO.map((s) => ({ value: s.value, label: s.label, grupo: s.tipo }))}
                            placeholder="Buscar subtipo..."
                            searchPlaceholder="Escriba para filtrar..."
                            emptyText="No encontrado"
                          />
                        </FormControl>
                        {editForm.watch("tipoNegocio") && (
                          <p className="text-xs text-indigo-500 mt-1 flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            Tipo inferido: <strong>{editForm.watch("tipoNegocio")}</strong>
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingRecord(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="btn-gradient-primary"
                      disabled={editMutation.isPending}
                    >
                      {editMutation.isPending ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Confirmación de eliminación ────────────────────────────────────── */}
      <AlertDialog open={!!deletingRecord} onOpenChange={(open) => { if (!open) setDeletingRecord(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Eliminar asignación
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Esta acción no se puede deshacer. Se eliminará permanentemente el siguiente registro:</p>
                {deletingRecord && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 px-4 py-3">
                    <p className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {deletingRecord.generatedName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {deletingRecord.type}-{deletingRecord.consecutive} · Asignado por {deletingRecord.assignedBy}
                    </p>
                  </div>
                )}
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  El consecutivo no se reutilizará aunque se elimine el registro.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deletingRecord && deleteMutation.mutate(deletingRecord.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
