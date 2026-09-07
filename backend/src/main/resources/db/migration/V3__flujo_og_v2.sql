-- ============================================================
-- V3: Rediseño del flujo de autorización de Órdenes de Giro
-- Se eliminan: VAL (Autorización Monto), CFT (Confirmación Tel.), AUT (Autorización Final)
-- Se agregan:  SIF (Sincronización SIFI), CAU (Causación),
--              RCO (Revisión Contable), PRV (Provisión de Recursos)
-- ============================================================

-- 1. Desactivar estados del flujo anterior que ya no aplican
UPDATE nt_proc_niveles SET activo = false
WHERE id_proceso = (SELECT id FROM nt_procesos WHERE codigo = 'AUT_OG')
  AND codigo IN ('VAL', 'CFT', 'AUT');

-- 2. Agregar nuevos estados (ON CONFLICT reactiva si ya existieran)
INSERT INTO nt_proc_niveles (id_proceso, codigo, nombre, tipo_aprobacion, es_estado_final, activo)
SELECT p.id, v.codigo, v.nombre, 'ANY', false, true
FROM nt_procesos p,
(VALUES
  ('SIF', 'Sincronización SIFI'),
  ('CAU', 'Causación'),
  ('RCO', 'Revisión Contable'),
  ('PRV', 'Provisión de Recursos')
) AS v(codigo, nombre)
WHERE p.codigo = 'AUT_OG'
ON CONFLICT (id_proceso, codigo) DO UPDATE
  SET nombre = EXCLUDED.nombre, activo = true;

-- Actualizar etiqueta del estado PRO
UPDATE nt_proc_niveles SET nombre = 'Programación y Pago'
WHERE id_proceso = (SELECT id FROM nt_procesos WHERE codigo = 'AUT_OG')
  AND codigo = 'PRO';

-- 3. Desactivar TODAS las transiciones anteriores del proceso
UPDATE nt_proc_transiciones SET activo = false
WHERE id_proceso = (SELECT id FROM nt_procesos WHERE codigo = 'AUT_OG');

-- 4. Insertar nuevas transiciones del flujo v2
INSERT INTO nt_proc_transiciones (id_proceso, nivel_origen, nivel_destino, accion, prioridad, etiqueta, condiciones)
SELECT p.id, v.origen, v.destino, v.accion, v.prio, v.etiqueta,
       CASE WHEN v.cond IS NULL THEN NULL ELSE v.cond::jsonb END
FROM nt_procesos p,
(VALUES
  -- REG → SUB: solo órdenes internas (prioridad 1)
  ('REG', 'SUB', 'APROBAR', 1, 'Enviar a Subdirector de Oficina',
   '{"operador":"IGUAL","campo":"tipo_orden","valor":"INTERNA"}'),

  -- REG → SAV: órdenes normales con terceros en listas restrictivas (prioridad 2)
  ('REG', 'SAV', 'APROBAR', 2, 'Enviar a Validación SARLAFT',
   '{"operador":"AND","condiciones":[{"operador":"IGUAL","campo":"tipo_orden","valor":"NORMAL"},{"operador":"IGUAL","campo":"tiene_terceros_restrictivos","valor":"true"}]}'),

  -- REG → SIF: flujo normal (prioridad 3, sin condiciones)
  ('REG', 'SIF', 'APROBAR', 3, 'Enviar a Sincronización SIFI', NULL),

  -- SUB → SAV: si hay terceros en listas restrictivas (prioridad 1)
  ('SUB', 'SAV', 'APROBAR', 1, 'Enviar a Validación SARLAFT',
   '{"operador":"IGUAL","campo":"tiene_terceros_restrictivos","valor":"true"}'),

  -- SUB → SIF: flujo normal desde subdirector (prioridad 2)
  ('SUB', 'SIF', 'APROBAR', 2, 'Enviar a Sincronización SIFI', NULL),

  -- SAV → SIF: aprobación SARLAFT
  ('SAV', 'SIF', 'APROBAR', 1, 'Validación SARLAFT aprobada', NULL),

  -- SIF → CAU
  ('SIF', 'CAU', 'APROBAR', 1, 'Sincronización completada — Causación', NULL),

  -- CAU → RCO
  ('CAU', 'RCO', 'APROBAR', 1, 'Causación validada — Revisión Contable', NULL),

  -- RCO → PRV
  ('RCO', 'PRV', 'APROBAR', 1, 'Revisión contable aprobada — Provisión', NULL),

  -- PRV → PRO
  ('PRV', 'PRO', 'APROBAR', 1, 'Recursos provisionados — Programar Pago', NULL),

  -- PRO → PAG
  ('PRO', 'PAG', 'APROBAR', 1, 'Pago programado — Marcar como Pagada', NULL),

  -- Comodín: rechazar desde cualquier estado activo
  ('*', 'REC', 'RECHAZAR', 99, 'Rechazar Orden de Giro', NULL)
) AS v(origen, destino, accion, prio, etiqueta, cond)
WHERE p.codigo = 'AUT_OG';

-- 5. Nueva variable de contexto para listas restrictivas SARLAFT
INSERT INTO nt_proc_variables_contexto (id_proceso, codigo, etiqueta, tipo_dato, es_parametro)
SELECT p.id, 'tiene_terceros_restrictivos',
       'Tiene Terceros en Listas Restrictivas (SARLAFT)', 'BOOLEANO', false
FROM nt_procesos p WHERE p.codigo = 'AUT_OG'
ON CONFLICT (id_proceso, codigo) DO NOTHING;

-- Limpiar variables de contexto que ya no aplican
DELETE FROM nt_proc_variables_contexto
WHERE id_proceso = (SELECT id FROM nt_procesos WHERE codigo = 'AUT_OG')
  AND codigo IN ('MONTO_AUTORIZACION_TELEFONICA', 'MONTO_AUTORIZACION_MAXIMA');
