import React from "react";
import { hasPermission } from "@/shared/lib/permissions";
import { cn } from "@/shared/lib/utils";

type NoPermBehavior = "hide" | "disable";

interface ConPermisoProps {
  permKey: string;
  noPermBehavior?: NoPermBehavior;
  className?: string;
  children: React.ReactNode;
}

type AnyProps = Record<string, any>;

function isReactElement(node: React.ReactNode): node is React.ReactElement {
  return React.isValidElement(node);
}

export function ConPermiso({
  permKey,
  noPermBehavior = "hide",
  className,
  children,
}: ConPermisoProps) {
  const tienePermiso = hasPermission(permKey);

  // 🔓 TIENE PERMISO
  if (tienePermiso) {
    if (!isReactElement(children)) return <>{children}</>;

    const childProps = children.props as AnyProps;
    const childType = children.type;

    const esBotonNativo = childType === "button";
    const esInteractivo = typeof childProps.onClick === "function";

    // 👉 Si es clickeable pero NO botón → lo volvemos accesible
    if (esInteractivo && !esBotonNativo) {
      return React.cloneElement(children, {
        role: childProps.role ?? "button",
        tabIndex: childProps.tabIndex ?? 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          childProps.onKeyDown?.(e);
          if (e.defaultPrevented) return;

          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            (e.currentTarget as HTMLElement).click();
          }
        },
      });
    }

    return children;
  }

  // 🔒 SIN PERMISO → HIDE
  if (noPermBehavior === "hide") {
    return null;
  }

  // 🔒 SIN PERMISO → DISABLE
  if (!isReactElement(children)) {
    return (
      <div
        className={cn("opacity-50 cursor-not-allowed", className)}
        aria-disabled="true"
      >
        {children}
      </div>
    );
  }

  const childProps = children.props as AnyProps;
  const childType = children.type;

  const esBotonNativo = childType === "button";
  const esInteractivo =
    typeof childProps.onClick === "function" || esBotonNativo;

  const disabledStyles = "opacity-50 cursor-not-allowed";

  const blockedProps: AnyProps = {
    className: cn(childProps.className, disabledStyles, className),
    "aria-disabled": true,
  };

  if (esBotonNativo) {
    // ✅ botón real → disabled nativo
    blockedProps.disabled = true;
  } else if (esInteractivo) {
    // ⚠️ div/card clickeable → simular disabled
    blockedProps.role = childProps.role ?? "button";
    blockedProps.tabIndex = -1;

    blockedProps.onClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    blockedProps.onKeyDown = (e: React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
  }

  return React.cloneElement(children, blockedProps);
}