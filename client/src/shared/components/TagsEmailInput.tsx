import { useState, useRef, KeyboardEvent } from "react";
import { X, Mail } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface TagsEmailInputProps {
  value: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function TagsEmailInput({
  value,
  onChange,
  placeholder = "Agregar correo y presionar Enter…",
  className,
  disabled,
}: TagsEmailInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addEmail(raw: string) {
    const email = raw.trim().toLowerCase();
    if (!email) return;
    if (!isValidEmail(email)) { setError(true); return; }
    if (value.includes(email)) { setInputValue(""); return; }
    onChange([...value, email]);
    setInputValue("");
    setError(false);
  }

  function removeEmail(email: string) {
    onChange(value.filter((e) => e !== email));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addEmail(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    } else {
      setError(false);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 rounded-md border bg-background px-2.5 py-2 text-sm",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0",
        error && "border-destructive focus-within:ring-destructive/30",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((email) => (
        <span
          key={email}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
        >
          <Mail className="h-2.5 w-2.5 shrink-0" />
          {email}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeEmail(email); }}
              className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
              aria-label={`Quitar ${email}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </span>
      ))}

      <input
        ref={inputRef}
        type="email"
        value={inputValue}
        onChange={(e) => { setInputValue(e.target.value); setError(false); }}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (inputValue.trim()) addEmail(inputValue); }}
        placeholder={value.length === 0 ? placeholder : ""}
        disabled={disabled}
        className="min-w-[160px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60 text-xs"
      />
    </div>
  );
}
