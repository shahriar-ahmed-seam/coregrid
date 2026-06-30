"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

// ==========================================
// FIELD WRAPPER
// ==========================================

interface FieldWrapperProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FieldWrapper({
  label,
  error,
  description,
  required,
  className,
  children,
}: FieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn(error && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ==========================================
// TEXT FIELD
// ==========================================

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, description, required, className, ...props }, ref) => {
    return (
      <FieldWrapper
        label={label}
        error={error}
        description={description}
        required={required}
        className={className}
      >
        <Input
          ref={ref}
          className={cn(error && "border-destructive")}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
TextField.displayName = "TextField";

// ==========================================
// NUMBER FIELD
// ==========================================

interface NumberFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  description?: string;
  value?: number | string;
  onChange?: (value: number | undefined) => void;
  allowDecimals?: boolean;
}

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ label, error, description, required, className, value, onChange, allowDecimals = true, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!val) {
        onChange?.(undefined);
        return;
      }
      const num = allowDecimals ? parseFloat(val) : parseInt(val, 10);
      if (!isNaN(num)) {
        onChange?.(num);
      }
    };

    return (
      <FieldWrapper
        label={label}
        error={error}
        description={description}
        required={required}
        className={className}
      >
        <Input
          ref={ref}
          type="number"
          step={allowDecimals ? "0.01" : "1"}
          value={value ?? ""}
          onChange={handleChange}
          className={cn(error && "border-destructive")}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
NumberField.displayName = "NumberField";

// ==========================================
// CURRENCY FIELD
// ==========================================

interface CurrencyFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  description?: string;
  currency?: string;
  value?: number | string;
  onChange?: (value: number | undefined) => void;
}

export const CurrencyField = React.forwardRef<HTMLInputElement, CurrencyFieldProps>(
  ({ label, error, description, required, className, currency = "USD", value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!val) {
        onChange?.(undefined);
        return;
      }
      const num = parseFloat(val);
      if (!isNaN(num)) {
        onChange?.(num);
      }
    };

    return (
      <FieldWrapper
        label={label}
        error={error}
        description={description}
        required={required}
        className={className}
      >
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            ref={ref}
            type="number"
            step="0.01"
            min="0"
            value={value ?? ""}
            onChange={handleChange}
            className={cn("pl-7", error && "border-destructive")}
            {...props}
          />
        </div>
      </FieldWrapper>
    );
  }
);
CurrencyField.displayName = "CurrencyField";

// ==========================================
// TEXT AREA FIELD
// ==========================================

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
}

export const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, error, description, required, className, ...props }, ref) => {
    return (
      <FieldWrapper
        label={label}
        error={error}
        description={description}
        required={required}
        className={className}
      >
        <Textarea
          ref={ref}
          className={cn(error && "border-destructive")}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
TextAreaField.displayName = "TextAreaField";

// ==========================================
// SELECT FIELD
// ==========================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SelectField({
  label,
  error,
  description,
  required,
  placeholder = "Select an option",
  options,
  value,
  onValueChange,
  disabled,
  className,
}: SelectFieldProps) {
  return (
    <FieldWrapper
      label={label}
      error={error}
      description={description}
      required={required}
      className={className}
    >
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn(error && "border-destructive")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}

// ==========================================
// DATE FIELD
// ==========================================

interface DateFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  description?: string;
}

export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  ({ label, error, description, required, className, ...props }, ref) => {
    return (
      <FieldWrapper
        label={label}
        error={error}
        description={description}
        required={required}
        className={className}
      >
        <Input
          ref={ref}
          type="date"
          className={cn(error && "border-destructive")}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
DateField.displayName = "DateField";

// ==========================================
// CHECKBOX FIELD
// ==========================================

interface CheckboxFieldProps {
  label: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function CheckboxField({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  error,
  className,
}: CheckboxFieldProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(error && "border-destructive")}
      />
      <div className="space-y-1">
        <Label className={cn("cursor-pointer", error && "text-destructive")}>
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// FORM SECTION
// ==========================================

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="font-medium text-sm">{title}</h3>}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ==========================================
// FORM GRID
// ==========================================

export interface FormGridProps {
  columns?: 1 | 2 | 3 | 4;
  cols?: 1 | 2 | 3 | 4; // alias for columns
  children: React.ReactNode;
  className?: string;
}

const gridClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function FormGrid({ columns, cols, children, className }: FormGridProps) {
  const colCount = columns ?? cols ?? 2;
  return (
    <div className={cn("grid gap-4", gridClasses[colCount], className)}>
      {children}
    </div>
  );
}

// ==========================================
// FORM DIVIDER
// ==========================================

interface FormDividerProps {
  label?: string;
}

export function FormDivider({ label }: FormDividerProps) {
  return (
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      {label && (
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
