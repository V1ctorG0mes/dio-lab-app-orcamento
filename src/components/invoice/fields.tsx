import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatBRL, parseCurrencyDigits } from "@/lib/invoice";

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

export function Field({ label, value, onChange, placeholder, type = "text", className, inputMode }: FieldProps) {
  const id = useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-card"
      />
    </div>
  );
}

export function CurrencyInput({
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
  id,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  "aria-label"?: string;
  id?: string;
}) {
  return (
    <Input
      id={id}
      aria-label={ariaLabel}
      inputMode="numeric"
      value={formatBRL(value)}
      onChange={(e) => onChange(parseCurrencyDigits(e.target.value))}
      onFocus={(e) => {
        const el = e.currentTarget;
        requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
      }}
      className={cn("tabular bg-card text-right", className)}
    />
  );
}
