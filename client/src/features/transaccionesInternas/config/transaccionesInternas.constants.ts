/**
 * Constantes configurables del modulo Transacciones Internas.
 * Centraliza endpoints, permisos (Keycloak client roles), textos y tiempos
 * para no dispersar "magic values" por los componentes.
 */

export const TRANSACCIONES_INTERNAS_API = "/api/transacciones-internas";

export const TRANSACCIONES_INTERNAS_ROUTE = "/parametrizacion/transacciones-internas";

/** Roles del cliente Keycloak que controlan cada accion (ver AppButton). */
export const TRANSACCIONES_PERMISSIONS = {
  menu: "fond:MenuTransaccionesInternas",
  create: "fond:BtnCrearTransaccionInterna",
  edit: "fond:BtnEditarTransaccionInterna",
  delete: "fond:BtnEliminarTransaccionInterna",
  export: "fond:BtnExportarTransaccionesInternas",
} as const;

/** Filas por pagina de la tabla (paginacion 100% client-side). */
export const TRANSACCIONES_PAGE_SIZE = 10;

/** Tiempo que permanece visible el banner verde de exito. */
export const SUCCESS_BANNER_DURATION_MS = 4000;

/** Nombre del archivo descargado al exportar. */
export const EXPORT_FILENAME = "transacciones-internas.xlsx";

export const TRANSACCIONES_MESSAGES = {
  updated: "Cambios guardados.",
  created: "Transacción creada correctamente.",
  deleted: "Transacción eliminada.",
  loadError: "No se pudo cargar el listado de transacciones internas.",
  saveError: "No se pudieron guardar los cambios.",
  deleteError: "No se pudo eliminar la transacción.",
  exportError: "No se pudo exportar el archivo XLSX.",
} as const;

/**
 * Clases de marca (rojo corporativo, alineado con Header `bg-red-700`
 * y Sidebar `text-red-600`). `--primary` del tema es azul/gradiente, por eso
 * los botones de este modulo usan estas clases explicitas.
 */
export const BRAND_BUTTON_CLASSES = {
  solid: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  outline:
    "border border-red-600 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 dark:bg-transparent dark:hover:bg-red-950/40",
} as const;
