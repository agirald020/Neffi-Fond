---
name: Módulo Parametrización — estructura y decisiones
description: Cómo está organizado el feature parametrizacion (procesos, niveles, transiciones, condiciones, variables) y decisiones de diseño clave
type: project
---

Feature `client/src/features/parametrizacion/` implementa la gestión de procesos de autorización con niveles, transiciones condicionadas y variables de contexto. Estructura:

- `pages/ParametrizacionPage.tsx` — layout 2 columnas (panel procesos + canvas flujo + variables colapsable)
- `components/FlujoDiagrama.tsx` — canvas SVG puro (no React Flow) con layout BFS automático; nodos como `<foreignObject>` con Tailwind; wildcard "*" se renderiza como nodo especial bajo el flujo principal
- `components/NodoNivel.tsx` — tarjeta de nivel (160x80). Constantes `NODO_ANCHO` / `NODO_ALTO` exportadas porque las usa `FlechaTransicion`
- `components/FlechaTransicion.tsx` — curva Bezier con anchors dinámicos según dirección dominante (horizontal vs vertical); color naranja si condicional, gris si no
- `components/modales/CondicionBuilder.tsx` — editor recursivo del árbol `CondicionNodo` (AND/OR/NOT + hojas valor/referencia_contexto); conmuta hoja ↔ compuesto desde la raíz
- `services/parametrizacion.service.ts` — endpoints bajo `/api/autorizacion/*`. `listarVariables()` hace fallback a datos mock si el endpoint falla, porque las variables de contexto no están implementadas en todos los entornos
- `hooks/useParametrizacion.ts` — query keys centralizados en `qk`; mutaciones invalidan niveles + transiciones cuando se guarda un nivel (por los estados finales)

**Why:** El canvas es chico (~12 nodos) por lo que un SVG puro con layout BFS es más mantenible que integrar react-flow. Las constantes de dimensión están en `NodoNivel.tsx` porque son contratos compartidos entre nodo y flecha.

**How to apply:** Si hay que agregar nuevos tipos de nodos de condición, extender `CondicionNodo` en `types/` y agregar un caso en `NodoEditor` dentro de `CondicionBuilder`. Para nuevos endpoints de parametrización, seguir el patrón de `qk.*` + hook dedicado. TypeScript no permite iteración directa de `Map/Set` (target pre-ES2015 en tsconfig) — usar siempre `Array.from()`.

**Interacción en el canvas (implementada):**
- Drag libre: `FlujoDiagrama` mantiene un `posicionesOverride: Map<codigo, {x,y}>` que se combina con el layout BFS; `NodoNivel` notifica `onDragStart` en mousedown y `FlujoDiagrama` engancha listeners `mousemove`/`mouseup` a `window` para evitar problemas con foreignObject. Umbral 4px distingue drag de click. Botón "Resetear layout" limpia overrides.
- Modo conectar: toggle button en la barra de acciones; en modo conectar se muestran puntos de conexión azules (círculo -right-3) en cada nodo; click inicia línea dinámica (dasharray, con marker `arrow-draft`) desde el cursor hasta que otro nodo se clickea → dispara `onConectarNodos(origen, destino)`. Escape o click en vacío cancela. `ModalEditarTransicion` acepta prop `prefill: Partial<ProcTransicion>` para crear con valores prellenados sin tratarlo como edición.
- Eliminación: `useEliminarNivel` en el hook + `eliminarNivel(idProceso, id)` en el service. `ModalEditarNivel` recibe `transiciones` como prop y valida localmente antes de llamar al backend (origen → error, destino → error, único punto de entrada → confirmación reforzada). Confirmación vía `AlertDialog` (shared/ui/alert-dialog). Botón Trash2 en esquina superior derecha del nodo (hover only) dispara `onEliminarNivel` en la página, que abre el modal de edición para que se maneje allí el flujo de validaciones.
