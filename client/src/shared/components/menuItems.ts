import { ArrowLeftRight, Wand2Icon, type LucideIcon } from "lucide-react";

/** Enlace del menu lateral (shape original, se mantiene intacto). */
export interface MenuLink {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Rol Keycloak requerido; si se omite el enlace es visible para todos. */
  permission?: string;
}

/** Agrupador con titulo (p.ej. "Parametrizacion") y sus enlaces. */
export interface MenuSection {
  section: string;
  items: MenuLink[];
}

export type MenuEntry = MenuLink | MenuSection;

export const isMenuSection = (entry: MenuEntry): entry is MenuSection => "items" in entry;

/**
 * Entradas del Sidebar. Admite enlaces planos y secciones.
 * Para un nuevo modulo de Parametrizacion, agregar el enlace en `items`
 * de la seccion correspondiente.
 */
export const menuItems: MenuEntry[] = [
  {
    label: "Asignación Codigo Interno _ Negocios Nuevos",
    href: "/crear-nombre-fideicomiso",
    icon: Wand2Icon,
    permission: "fond:MenuCrearNombreFideicomiso",
  },
  {
    section: "Parametrización",
    items: [
      {
        label: "Transacciones internas",
        href: "/parametrizacion/transacciones-internas",
        icon: ArrowLeftRight,
        permission: "fond:MenuTransaccionesInternas",
      },
    ],
  },
];
