---
name: frontend-gotchas
description: Trampas no obvias del frontend de Neffi-Fond — alias de use-toast, rojo de marca vs --primary azul, errores TS preexistentes, Alert con svg absoluto
type: project
---

- **use-toast**: existen `client/src/hooks/use-toast.ts` y `client/src/shared/hooks/use-toast.ts` (copias identicas con estado separado). El `<Toaster>` importa `@/hooks/use-toast`, asi que los toasts SOLO se ven si se importa desde `@/hooks/use-toast`.
- **Color de marca**: `--primary` del tema es AZUL (y un gradiente), pero la marca visual es ROJA (Header `bg-red-700`, Sidebar `text-red-600`). Para botones primarios usar clases explicitas `bg-red-600 hover:bg-red-700` (ver `BRAND_BUTTON_CLASSES` en transaccionesInternas). SweetAlert2 usa `#dc2626`.
- **tsc**: `npm run check` / `npx tsc --noEmit` tiene ~46 errores PREEXISTENTES (legacy: `shared/layout.tsx`, `shared/municipio-selector.tsx`, `pages/`, `features/findName.tsx`). Verificar comparando contra una linea base, no esperar 0 errores.
- **shared/ui/alert.tsx** posiciona en absoluto cualquier `<svg>` hijo directo; envolver el icono en `<span>` si se usa layout flex.
- `AppButton` con `permKey=""` se considera con permiso; con `noPermBehavior="hide"` (default) oculta el boton si falta el rol — en bypass de auth (sin token) todo boton con permKey queda oculto/deshabilitado.
- Raiz del repo = proyecto Vite (`package.json`, `vite.config.ts`, `tailwind.config.ts`); `npm install` se corre en la raiz, no en `client/`.

**Why:** cada punto costo una verificacion explicita al implementar Transacciones Internas (2026-10-01).

**How to apply:** revisar esta lista antes de crear componentes nuevos o validar con tsc. Relacionado: [[project_transacciones_internas_module]].
