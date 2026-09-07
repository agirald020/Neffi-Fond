import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Wand2, AlertCircle, ListChecks } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const TRUST_TYPES = [
  { value: "FA", label: "FA — Fiducia de Administración" },
  { value: "MR", label: "MR — Manejo de Recursos" },
  { value: "FG", label: "FG — Fiducia en Garantía" },
];

const formSchema = z.object({
  type: z.enum(["FA", "MR", "FG"], { required_error: "Seleccione el tipo" }),
  code: z
    .string()
    .min(1, "El código es requerido")
    .regex(/^\d+$/, "Solo se permiten números"),
  businessName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

interface FondCode {
  id: string;
  type: string;
  code: string;
  businessName: string;
  generatedName: string;
  createdAt: string;
}

interface GeneratedResult {
  generatedName: string;
  type: string;
  typeLabel: string;
  code: string;
  businessName: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FondNameGenerator({ open, onClose }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: undefined, code: "", businessName: "" },
  });

  const selectedType = form.watch("type");

  const { data: usedCodes = [] } = useQuery<string[]>({
    queryKey: ["/api/fond-codes", selectedType, "used"],
    queryFn: async () => {
      if (!selectedType) return [];
      const res = await fetch(`/api/fond-codes/${selectedType}/used`);
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    enabled: !!selectedType,
  });

  const { data: allCodes = [] } = useQuery<FondCode[]>({
    queryKey: ["/api/fond-codes"],
    queryFn: async () => {
      const res = await fetch("/api/fond-codes");
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiRequest("POST", "/api/fond-codes/generate", values),
    onSuccess: async (res) => {
      const data: GeneratedResult = await res.json();
      setGeneratedResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/fond-codes"] });
      toast({
        title: "Nombre generado y reservado",
        description: `${data.generatedName} ha sido registrado correctamente.`,
      });
    },
    onError: async (err: any) => {
      let message = "Error al generar el nombre";
      try {
        const body = await err.json?.();
        if (body?.error) message = body.error;
      } catch {
        if (err.message) message = err.message;
      }
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  function onSubmit(values: FormValues) {
    setGeneratedResult(null);
    setCopied(false);
    mutation.mutate(values);
  }

  async function handleCopy() {
    if (!generatedResult) return;
    await navigator.clipboard.writeText(generatedResult.generatedName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copiado", description: "Nombre copiado al portapapeles." });
  }

  function handleClose() {
    form.reset();
    setGeneratedResult(null);
    setCopied(false);
    setShowHistory(false);
    onClose();
  }

  function handleNewGeneration() {
    setGeneratedResult(null);
    setCopied(false);
    form.reset({ type: selectedType, code: "", businessName: "" });
  }

  const typeBadgeColor: Record<string, string> = {
    FA: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    MR: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    FG: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wand2 className="h-5 w-5 text-blue-600" />
            Generador de Nombres de Fideicomisos
          </DialogTitle>
          <DialogDescription>
            Ingrese el tipo, código Superfinanciera XXXXX y nombre del negocio para
            generar el nombre oficial del fideicomiso.
          </DialogDescription>
        </DialogHeader>

        {!generatedResult ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de FideicomisoXXX</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-modern">
                          <SelectValue placeholder="Seleccione el tipo..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRUST_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Código Superfinanciera
                      {selectedType && usedCodes.length > 0 && (
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          ({usedCodes.length} códigos {selectedType} ya registrados)
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ej: 2799"
                        className="input-modern"
                        type="text"
                        inputMode="numeric"
                      />
                    </FormControl>
                    {field.value && selectedType && usedCodes.includes(field.value) && (
                      <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          El código {selectedType}-{field.value} ya está registrado
                        </span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {form.watch("type") && form.watch("code") && form.watch("businessName") && (
                <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">
                    Vista previa
                  </p>
                  <p className="text-base font-mono font-semibold text-gray-800 dark:text-gray-200">
                    {form.watch("type")}-{form.watch("code")}{" "}
                    {form.watch("businessName").toUpperCase()}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ListChecks className="h-4 w-4 mr-1" />
                  {showHistory ? "Ocultar" : "Ver"} historial ({allCodes.length})
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="btn-gradient-primary"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Generando..." : "Generar Nombre"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700/50 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-3">
                Nombre oficial generado y reservado
              </p>
              <p className="text-xl font-mono font-bold text-gray-900 dark:text-white leading-relaxed">
                {generatedResult.generatedName}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    typeBadgeColor[generatedResult.type]
                  }`}
                >
                  {generatedResult.type}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {generatedResult.typeLabel}
                </span>
                <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                  Código: <strong>{generatedResult.code}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 btn-gradient-primary gap-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar nombre
                  </>
                )}
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={handleNewGeneration}
              >
                Generar otro
              </Button>
              <Button variant="ghost" onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        )}

        {showHistory && !generatedResult && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Códigos registrados ({allCodes.length})
            </h4>
            {allCodes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No hay códigos registrados aún
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {allCodes
                  .slice()
                  .sort((a, b) => a.type.localeCompare(b.type) || a.code.localeCompare(b.code))
                  .map((tc) => (
                    <div
                      key={tc.id}
                      className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm"
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          typeBadgeColor[tc.type] ?? ""
                        }`}
                      >
                        {tc.type}
                      </span>
                      <span className="font-mono text-gray-800 dark:text-gray-200 truncate flex-1">
                        {tc.generatedName}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
