-- V4: Seed completo del proceso AUT_OG con el flujo actual.
-- Idempotente: seguro de correr aunque ya existan datos parciales.

INSERT INTO nt_procesos (codigo, nombre, descripcion, req_autorizacion, asunto_correo, desc_llave_proceso, usuario_creacion)
VALUES (
  'AUT_OG',
  'Autorización Órdenes de Giro',
  'Flujo de autorización multinivel para órdenes de giro fiduciarias',
  TRUE,
  'Rechazo OG No. #NumeroOrdenGiro - Fideicomiso #NombreFideicomiso',
  'CODIGO_FIDEICOMISO|CONSECUTIVO_MASIVO',
  'SYSTEM'
)
ON CONFLICT (codigo) DO NOTHING;

-- Estados del flujo actual
INSERT INTO nt_proc_niveles (id_proceso, codigo, nombre, tipo_aprobacion, es_estado_final, activo)
SELECT p.id, v.codigo, v.nombre, 'ANY', v.final, true
FROM nt_procesos p,
(VALUES
  ('REG', 'Registrada',             false),
  ('SUB', 'Subdirector de Oficina', false),
  ('SAV', 'Validación de Terceros', false),
  ('SIF', 'Sincronización SIFI',    false),
  ('CAU', 'Causación',              false),
  ('RCO', 'Revisión Contable',      false),
  ('PRV', 'Provisión de Recursos',  false),
  ('PRO', 'Programación y Pago',    false),
  ('PAG', 'Pagada',                 true),
  ('REC', 'Rechazada',              true)
) AS v(codigo, nombre, final)
WHERE p.codigo = 'AUT_OG'
ON CONFLICT (id_proceso, codigo) DO UPDATE
  SET nombre = EXCLUDED.nombre, activo = true;

-- Limpiar transiciones previas y cargar el flujo actual
UPDATE nt_proc_transiciones SET activo = false
WHERE id_proceso = (SELECT id FROM nt_procesos WHERE codigo = 'AUT_OG');

INSERT INTO nt_proc_transiciones (id_proceso, nivel_origen, nivel_destino, accion, prioridad, etiqueta, condiciones)
SELECT p.id, v.origen, v.destino, v.accion, v.prio, v.etiqueta,
       CASE WHEN v.cond IS NULL THEN NULL ELSE v.cond::jsonb END
FROM nt_procesos p,
(VALUES
  ('REG', 'SUB', 'APROBAR', 1, 'Enviar a Subdirector de Oficina',
   '{"operador":"IGUAL","campo":"tipo_orden","valor":"INTERNA"}'),
  ('REG', 'SAV', 'APROBAR', 2, 'Enviar a Validación SARLAFT',
   '{"operador":"AND","condiciones":[{"operador":"IGUAL","campo":"tipo_orden","valor":"NORMAL"},{"operador":"IGUAL","campo":"tiene_terceros_restrictivos","valor":"true"}]}'),
  ('REG', 'SIF', 'APROBAR', 3, 'Enviar a Sincronización SIFI', NULL),
  ('SUB', 'SAV', 'APROBAR', 1, 'Enviar a Validación SARLAFT',
   '{"operador":"IGUAL","campo":"tiene_terceros_restrictivos","valor":"true"}'),
  ('SUB', 'SIF', 'APROBAR', 2, 'Enviar a Sincronización SIFI', NULL),
  ('SAV', 'SIF', 'APROBAR', 1, 'Validación SARLAFT aprobada', NULL),
  ('SIF', 'CAU', 'APROBAR', 1, 'Sincronización completada — Causación', NULL),
  ('CAU', 'RCO', 'APROBAR', 1, 'Causación validada — Revisión Contable', NULL),
  ('RCO', 'PRV', 'APROBAR', 1, 'Revisión contable aprobada — Provisión', NULL),
  ('PRV', 'PRO', 'APROBAR', 1, 'Recursos provisionados — Programar Pago', NULL),
  ('PRO', 'PAG', 'APROBAR', 1, 'Pago programado — Marcar como Pagada', NULL),
  ('*',   'REC', 'RECHAZAR', 99, 'Rechazar Orden de Giro', NULL)
) AS v(origen, destino, accion, prio, etiqueta, cond)
WHERE p.codigo = 'AUT_OG';

-- Variables de contexto
INSERT INTO nt_proc_variables_contexto (id_proceso, codigo, etiqueta, tipo_dato, es_parametro)
SELECT p.id, v.codigo, v.etiqueta, v.tipo, v.param
FROM nt_procesos p,
(VALUES
  ('tipo_orden',                  'Tipo de Orden',                                   'TEXTO',    false),
  ('monto_total',                 'Monto Total del Lote',                            'NUMERO',   false),
  ('estado_actual',               'Estado Actual en Oracle',                         'TEXTO',    false),
  ('tiene_terceros_restrictivos', 'Tiene Terceros en Listas Restrictivas (SARLAFT)', 'BOOLEANO', false)
) AS v(codigo, etiqueta, tipo, param)
WHERE p.codigo = 'AUT_OG'
ON CONFLICT (id_proceso, codigo) DO UPDATE
  SET etiqueta = EXCLUDED.etiqueta;
