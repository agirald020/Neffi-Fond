---
name: Estructura módulo Órdenes de Giro
description: Organización y convenciones específicas del módulo ordenesGiro en Neffi Fond
type: project
---

Módulo `client/src/features/ordenesGiro/` organizado con subcarpetas de componentes por sección funcional:
- `components/bandeja/` — componentes específicos de la página de listado/bandeja
- `components/detalle/` — componentes de la página de detalle de una OG
- `components/acciones/` — subcomponentes usados dentro de modales de acción
- `components/notificaciones/` — badges y counters
- `components/impresion/` — vista print-only
- `components/dashboard/` — KPIs, tablas y gráficos del dashboard de métricas

Endpoints del dashboard (`/api/dashboard-og/*`): el `resumen` regresa un array de un solo elemento (`data[0]`). El service (`dashboardOG.service.ts`) ya normaliza esto. La ruta `/ordenes-giro/dashboard` debe declararse ANTES de `/ordenes-giro/:codigoFideicomiso/:consecutivoMasivo` en `Router.tsx` para evitar que Wouter la matchee como detalle.

**Why:** Feature lo suficientemente grande como para que una sola carpeta `components/` resulte difícil de navegar. Separar por sección funcional evita colisiones de nombres y aclara intención.

**How to apply:** Cuando se agreguen más componentes a OG, ubicarlos en la subcarpeta correspondiente. Para otras features que crezcan de forma similar, considerar el mismo patrón.

Archivos pendientes de endpoint real están documentados en `client/src/features/ordenesGiro/ENDPOINTS_PENDIENTES.md`. Cuando el backend implemente un endpoint, remover el comentario `// MOCK — requiere endpoint: ...` del service y actualizar ese archivo.
