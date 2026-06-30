"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ==========================================
// FORM DIALOG
// ==========================================

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: () => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  variant?: "dialog" | "sheet";
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isSubmitting = false,
  variant = "dialog",
  size = "md",
}: FormDialogProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </>
  );

  if (variant === "sheet") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              {description && <SheetDescription>{description}</SheetDescription>}
            </SheetHeader>
            <div className="py-6 space-y-4">{children}</div>
            <SheetFooter>{footer}</SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sizeClasses[size])}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="py-6 space-y-4">{children}</div>
          <DialogFooter>{footer}</DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// CONFIRM DIALOG
// ==========================================

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// ALERT DIALOG (for delete confirmations)
// ==========================================

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
  itemType?: string;
  title?: string;
  description?: string;
  onDelete?: () => void | Promise<void>;
  onConfirm?: () => void | Promise<void>;
  isDeleting?: boolean;
}

export function DeleteDialog({
  open,
  onOpenChange,
  itemName,
  itemType = "item",
  title,
  description,
  onDelete,
  onConfirm,
  isDeleting = false,
}: DeleteDialogProps) {
  const handleConfirm = onConfirm || onDelete;
  const displayTitle = title || `Delete ${itemType}?`;
  const displayDescription = description || `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
  
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={displayTitle}
      description={displayDescription}
      onConfirm={handleConfirm || (() => {})}
      confirmLabel="Delete"
      variant="destructive"
      isLoading={isDeleting}
    />
  );
}
