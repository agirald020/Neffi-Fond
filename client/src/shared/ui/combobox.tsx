import { useState } from "react";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; grupo?: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
}

export default function Combobox({
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
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm transition",
            "hover:bg-slate-50 focus:outline-none focus:ring-0",
            disabled && "cursor-not-allowed opacity-60",
            !value && "text-slate-400"
          )}
        >
          <span className="truncate text-left">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-full border border-slate-200 bg-white p-0 shadow-lg"
        align="start"
        style={{ minWidth: "var(--radix-popover-trigger-width)" }}
      >
        <Command className="rounded-xl bg-white">
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-10 border-0 border-b border-slate-200 bg-white text-sm text-slate-700 focus:ring-0"
          />
          <CommandList>
            <CommandEmpty className="py-6 text-sm text-slate-500">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[
                    option.label.toLowerCase(),
                    option.grupo?.toLowerCase() || "",
                  ]}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700",
                    "data-[selected=true]:bg-slate-100 data-[selected=true]:text-slate-900",
                    "hover:bg-slate-100"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 text-slate-500",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="min-w-0">
                    <span className="text-sm">{option.label}</span>
                    {option.grupo && (
                      <span className="ml-2 text-xs text-slate-400">
                        — {option.grupo}
                      </span>
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