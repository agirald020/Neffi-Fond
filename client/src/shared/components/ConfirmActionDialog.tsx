import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/ui/alert-dialog";
import { cn } from "@/shared/lib/utils";

type Variant = "delete" | "assign";

type ConfirmActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: Variant;

  title: string;
  description: React.ReactNode;

  onConfirm: () => void;
  loading?: boolean;

  confirmText?: string;
  cancelText?: string;
};

const variantStyles = {
  delete: {
    title: "text-red-600 dark:text-red-400",
    action: "bg-red-600 hover:bg-red-700 text-white",
  },
  assign: {
    title: "text-green-600 dark:text-green-400",
    action: "bg-green-600 hover:bg-green-700 text-white",
  },
};

export const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
  open,
  onOpenChange,
  variant,
  title,
  description,
  onConfirm,
  loading = false,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}) => {
  const styles = variantStyles[variant];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle
            className={cn("flex items-center gap-2", styles.title)}
          >
            {variant === "delete" && (
              <span className="text-lg">⚠️</span>
            )}
            {variant === "assign" && (
              <span className="text-lg">✅</span>
            )}
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-3">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>

          <AlertDialogAction
            className={cn(styles.action)}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};