import { useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, MapPin, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { cn } from "@/shared/lib/utils";
import { buscarMunicipios } from "@/shared/data/davipola/services/davipolaService";
import { Municipio } from "@/shared/data/davipola/types/davipola.types";
import { Badge } from "@/shared/ui/badge";
import { apiJson } from "@/shared/lib/queryClient";

interface MunicipioSelectorProps {
  value?: Municipio | string | null;
  onChange: (municipio: Municipio | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

export default function MunicipioSelector({
  value,
  onChange,
  placeholder = "Buscar municipio por nombre o código...",
  disabled = false,
  error = false,
}: MunicipioSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // 🔥 NORMALIZACIÓN CLAVE
  const codigoRaw =
    typeof value === "string"
      ? value
      : value?.codigoMunicipio;

  const codigo = codigoRaw
    ? String(Number(codigoRaw)) // 👈 quita ceros a la izquierda
    : null;

  // ✅ SOLO PARA EDIT (cuando viene string)
  const { data: selectedFromApi } = useQuery({
    queryKey: ["municipio-by-codigo", codigo],
    enabled: !!codigo && typeof value !== "object",
    staleTime: Infinity,
    queryFn: async () => {
      const data = await apiJson<Municipio[]>(
        "GET",
        `/api/municipios?criterio=${codigo}`
      );

      // 👇 tu backend devuelve { data: [...] }
      const list = data

      // 🔥 MATCH EXACTO ignorando ceros
      return (
        list.find(
          (m: any) =>
            String(Number(m.codigoMunicipio)) === codigo
        ) ?? null
      );
    },
  });

  const selected: Municipio | null =
    typeof value === "object"
      ? value
      : selectedFromApi ?? null;

  // 🔵 CREATE (NO TOCAR)
  const {
    data,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["municipios", query],
    queryFn: ({ pageParam = 0 }) =>
      buscarMunicipios({
        criterio: query,
        page: pageParam,
        size: 100,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    enabled: open,
    staleTime: Infinity,
  });

  const results = useMemo(
    () => data?.pages.flatMap((page) => page.content ?? []) ?? [],
    [data]
  );

  const handleSelect = (municipio: Municipio) => {
    onChange(municipio);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white",
            "px-3 py-2 text-sm text-slate-700 shadow-sm transition min-h-[40px] text-left",
            "hover:bg-slate-50",
            disabled && "opacity-50",
            error && "border-red-400"
          )}
        >
          {selected ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin className="h-4 w-4 text-slate-400" />
              <div className="flex-1 min-w-0">
                <span className="font-medium truncate block">
                  {selected.nombreMunicipio}
                </span>
                <span className="text-xs text-slate-500 truncate block">
                  {selected.nombreDepartamento} · Cód.{" "}
                  {selected.codigoMunicipio}
                </span>
              </div>
              <span onClick={handleClear} className="ml-1 cursor-pointer">
                <X className="h-3.5 w-3.5 text-slate-400" />
              </span>
            </div>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 ml-2 text-slate-400" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[480px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar..."
            value={query}
            onValueChange={setQuery}
          />

          <CommandList>
            <CommandEmpty>
              {isLoading
                ? "Buscando..."
                : `No se encontraron municipios con "${query}"`}
            </CommandEmpty>

            <CommandGroup>
              {results.map((municipio) => {
                const isSelected =
                  selected?.codigoMunicipio === municipio.codigoMunicipio;

                return (
                  <CommandItem
                    key={municipio.codigoMunicipio}
                    value={municipio.codigoMunicipio}
                    onSelect={() => handleSelect(municipio)}
                    className={cn(
                      "flex items-start gap-3 py-2 px-3 rounded-md cursor-pointer text-slate-700",
                      "hover:bg-slate-100",
                      isSelected && "bg-slate-100"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 mt-0.5 flex-shrink-0 text-slate-500",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm leading-snug">
                          {municipio.nombreMunicipio}
                        </span>

                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4 font-mono text-slate-500 border border-slate-200 bg-slate-100"
                        >
                          {municipio.codigoMunicipio}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mt-0.5">
                        {municipio.nombreDepartamento}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}