import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// --- FormField Container ---
export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  helperText,
  required,
  htmlFor,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300"
        >
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs font-medium text-destructive animate-in fade-in-50">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

// --- Textarea ---
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[90px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-all duration-150 ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:border-transparent focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

// --- Select ---
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  error?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground transition-all duration-150 ring-offset-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:border-transparent focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60 cursor-pointer",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled selected={!props.value && !props.defaultValue}>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
);
Select.displayName = "Select";

// --- Checkbox ---
export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  id,
  className,
}: CheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  return (
    <div className={cn("flex items-start gap-2.5 select-none", className)}>
      <button
        type="button"
        role="checkbox"
        id={checkboxId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "h-4 w-4 shrink-0 rounded border transition-colors mt-0.5 flex items-center justify-center",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
          checked
            ? "bg-secondary text-white border-secondary"
            : "border-input bg-background hover:border-secondary/60",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {checked && <Check className="h-3 w-3 stroke-[3]" />}
      </button>
      {label && (
        <div className="flex flex-col">
          <label
            htmlFor={checkboxId}
            className={cn(
              "text-sm font-medium leading-tight cursor-pointer",
              disabled && "cursor-not-allowed opacity-60"
            )}
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}

// --- Switch / Toggle ---
export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className,
}: SwitchProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span
              className={cn(
                "text-sm font-medium leading-tight",
                disabled && "opacity-60"
              )}
            >
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
          checked ? "bg-accent" : "bg-muted-foreground/30",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
