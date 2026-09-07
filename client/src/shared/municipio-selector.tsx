import { useState } from "react";
import { Check, ChevronsUpDown, MapPin, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buscarMunicipio, getMunicipioByCodigo, type Municipio } from "@/data/divipola";

interface MunicipioSelectorProps {
  value?: string;
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
  const selected = value ? getMunicipioByCodigo(value) : undefined;

  const results = buscarMunicipio(query).slice(0, 100);

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between rounded-md border border-input bg-background",
            "px-3 py-2 text-sm ring-offset-background transition-colors min-h-[40px] text-left",
            "hover:border-ring/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-destructive focus:ring-destructive/20"
          )}
        >
          {selected ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin className="h-4 w-4 text-primary-solid flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground truncate block">
                  {selected.nombre}
                </span>
                <span className="text-xs text-muted-foreground truncate block">
                  {selected.departamento} · Cód. {selected.codigo}
                </span>
              </div>
              <span
                onClick={handleClear}
                role="button"
                aria-label="Limpiar selección"
                className="ml-1 p-0.5 rounded hover:bg-accent transition-colors flex-shrink-0 cursor-pointer"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            </div>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground ml-2" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[480px] p-0 shadow-modern border border-border" align="start" sideOffset={4}>
        <Command shouldFilter={false} className="rounded-lg">
          <div className="border-b border-border">
            <CommandInput
              placeholder="Buscar por nombre, código DIVIPOLA o departamento..."
              value={query}
              onValueChange={setQuery}
              className="h-10 text-sm"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>
              <div className="py-8 text-center text-sm text-muted-foreground">
                <MapPin className="h-7 w-7 mx-auto mb-2 text-muted-foreground/40" />
                No se encontraron municipios con "{query}"
              </div>
            </CommandEmpty>

            {results.length > 0 && (
              <CommandGroup className="p-1">
                {results.map((municipio) => {
                  const isSelected = selected?.codigo === municipio.codigo;
                  return (
                    <CommandItem
                      key={municipio.codigo}
                      value={municipio.codigo}
                      onSelect={() => handleSelect(municipio)}
                      className={cn(
                        "flex items-start gap-3 py-2 px-3 rounded-md cursor-pointer text-foreground",
                        "[&[aria-selected=true]]:!bg-accent [&[aria-selected=true]]:!text-accent-foreground",
                        isSelected && "bg-accent/50"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 mt-0.5 flex-shrink-0 text-primary-solid",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm leading-snug">
                            {municipio.nombre}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 font-mono text-muted-foreground border-border bg-muted"
                          >
                            {municipio.codigo}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {municipio.departamento}
                        </p>
                      </div>
                    </CommandItem>
                  );
                })}
                {buscarMunicipio(query).length > 100 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border text-center mt-1">
                    Mostrando 100 de {buscarMunicipio(query).length} resultados — escriba más para filtrar
                  </div>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
