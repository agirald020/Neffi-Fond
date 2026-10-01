---
name: Modulo Transacciones Internas — precedente maestro-detalle de Parametrizacion
description: Patron maestro-detalle (tabla + panel derecho con panelMode), wrapper SweetAlert2 y menu con secciones establecidos en 2026-10-01; plantilla para futuros modulos de Parametrizacion/Operacion
type: project
---

`client/src/features/transaccionesInternas/` (ruta `/parametrizacion/transacciones-internas`) es el PRIMER modulo CRUD de Parametrizacion y quedo como plantilla para los siguientes (decidido con el usuario, 2026-10-01).

Decisiones confirmadas por el usuario (no repreguntar en modulos similares):
- Panel derecho reutilizado para ver/editar/crear (NO modal, NO navegacion). Store Zustand con `panelMode: "empty"|"view"|"edit"|"create"`, `selectedId`, flags `loading/saving/deleting/exporting`, `confirmOpen`; acciones de escritura devuelven `Promise<boolean>`.
- Borrado con SweetAlert2 real (`shared/lib/sweetAlert.ts` -> `confirmDelete()`, hook generico `shared/hooks/useConfirmDelete.ts`, wrapper por entidad en `features/x/hooks/useConfirmDeleteX.ts`). No usar Radix AlertDialog para esto.
- AdmonFondos-Api no pagina: el backend devuelve todo; busqueda/paginado client-side con `useMemo` en la tabla (no en el store).
- Formulario: seccion general + `Collapsible` "Configuracion avanzada"; campos declarados en `config/*Form.fields.ts` y renderizados genericamente; valores del form como strings, conversion en `toRequestPayload`.
- `menuItems.ts` soporta `MenuLink | MenuSection` (`{section, items}`), con `isMenuSection`. Nuevos modulos de Parametrizacion se agregan en `items` de la seccion "Parametrización".
- Permisos con prefijo `fond:` (MenuX, BtnCrearX, BtnEditarX, BtnEliminarX, BtnExportarX), centralizados en `config/*.constants.ts`. El prefijo era `trust:` y se renombro a `fond:` en todo el proyecto el 2026-10-01 (el proyecto se llama Neffi-Fond). Pendiente crear/renombrar los roles correspondientes en Keycloak (client `neffiTrust-app`, realm `neffiLaft`).

**Why:** el usuario aprobo este plan y mockups (breadcrumb PARAMETRIZACION / OPERACION, fila seleccionada rose-50, banner verde "Cambios guardados." 4s).

**How to apply:** para otro modulo de Parametrizacion, copiar la estructura de carpetas (config/, schemas/, services/, stores/, hooks/, utils/, components/) y los nombres de acciones del store. Ver [[frontend-gotchas]].
