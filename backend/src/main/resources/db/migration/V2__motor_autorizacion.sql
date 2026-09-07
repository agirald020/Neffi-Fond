-- Motor de Autorización — tablas transversales
CREATE TABLE IF NOT EXISTS nt_procesos (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    req_autorizacion BOOLEAN NOT NULL DEFAULT TRUE,
    asunto_correo VARCHAR(500),
    desc_llave_proceso VARCHAR(500),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    usuario_creacion VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS nt_proc_niveles (
    id BIGSERIAL PRIMARY KEY,
    id_proceso BIGINT NOT NULL REFERENCES nt_procesos(id),
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo_aprobacion VARCHAR(5) NOT NULL DEFAULT 'ANY' CHECK (tipo_aprobacion IN ('ANY','ALL')),
    es_estado_final BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (id_proceso, codigo)
);

CREATE TABLE IF NOT EXISTS nt_nivel_actores (
    id BIGSERIAL PRIMARY KEY,
    id_nivel BIGINT NOT NULL REFERENCES nt_proc_niveles(id),
    codigo_tipo_responsable INTEGER NOT NULL,
    nombre_tipo_responsable VARCHAR(200) NOT NULL,
    clasificacion VARCHAR(3) NOT NULL CHECK (clasificacion IN ('FID','OFI','GEN')),
    tipo_actor VARCHAR(3) NOT NULL CHECK (tipo_actor IN ('AUT','NOT')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (id_nivel, codigo_tipo_responsable, tipo_actor)
);

CREATE TABLE IF NOT EXISTS nt_proc_transiciones (
    id BIGSERIAL PRIMARY KEY,
    id_proceso BIGINT NOT NULL REFERENCES nt_procesos(id),
    nivel_origen VARCHAR(20) NOT NULL,
    nivel_destino VARCHAR(20) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    prioridad SMALLINT NOT NULL DEFAULT 99,
    etiqueta VARCHAR(200),
    condiciones JSONB,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS nt_proc_variables_contexto (
    id BIGSERIAL PRIMARY KEY,
    id_proceso BIGINT NOT NULL REFERENCES nt_procesos(id),
    codigo VARCHAR(50) NOT NULL,
    etiqueta VARCHAR(200) NOT NULL,
    tipo_dato VARCHAR(10) NOT NULL CHECK (tipo_dato IN ('TEXTO','NUMERO','FECHA','BOOLEANO')),
    es_parametro BOOLEAN NOT NULL DEFAULT FALSE,
    descripcion TEXT,
    UNIQUE (id_proceso, codigo)
);

-- Trazabilidad OG
CREATE TABLE IF NOT EXISTS og_pasos_autorizacion (
    id BIGSERIAL PRIMARY KEY,
    id_orden_giro BIGINT NOT NULL,
    codigo_fideicomiso BIGINT NOT NULL,
    id_proceso BIGINT REFERENCES nt_procesos(id),
    id_nivel BIGINT REFERENCES nt_proc_niveles(id),
    estado_anterior VARCHAR(3) NOT NULL,
    estado_nuevo VARCHAR(3) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    usuario_keycloak VARCHAR(100) NOT NULL,
    nombre_usuario VARCHAR(200),
    codigo_tipo_responsable INTEGER,
    nombre_tipo_responsable VARCHAR(200),
    observacion TEXT,
    confirmado_con VARCHAR(200),
    telefono_extension VARCHAR(50),
    monto_confirmado NUMERIC(18,2),
    fecha_accion TIMESTAMP NOT NULL DEFAULT NOW(),
    exitoso BOOLEAN NOT NULL DEFAULT TRUE,
    mensaje_error TEXT
);

CREATE TABLE IF NOT EXISTS og_trazabilidad (
    id BIGSERIAL PRIMARY KEY,
    id_orden_giro BIGINT NOT NULL,
    codigo_fideicomiso BIGINT NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL,
    endpoint_llamado VARCHAR(300),
    payload_enviado JSONB,
    respuesta_recibida JSONB,
    usuario_keycloak VARCHAR(100),
    fecha_evento TIMESTAMP NOT NULL DEFAULT NOW(),
    duracion_ms INTEGER,
    http_status INTEGER
);

-- Data seed: proceso AUT_OG
INSERT INTO nt_procesos (codigo, nombre, req_autorizacion, asunto_correo, desc_llave_proceso, usuario_creacion)
VALUES ('AUT_OG', 'Autorización Órdenes de Giro', TRUE,
  'Rechazo OG No. #NumeroOrdenGiro - Fideicomiso #NombreFideicomiso',
  'CODIGO_FIDEICOMISO|CONSECUTIVO_MASIVO', 'SYSTEM')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO nt_proc_niveles (id_proceso, codigo, nombre, es_estado_final)
SELECT p.id, v.codigo, v.nombre, v.final FROM nt_procesos p,
(VALUES
  ('REG','Radicada',false),
  ('SUB','Subdirector Oficina',false),
  ('SAV','Validación de Terceros',false),
  ('VAL','Autorización de Monto',false),
  ('CFT','Confirmación Telefónica',false),
  ('AUT','Autorización Final',false),
  ('PRO','Programada',false),
  ('PAG','Pagada',true),
  ('REC','Rechazada',true)
) AS v(codigo, nombre, final)
WHERE p.codigo = 'AUT_OG'
ON CONFLICT (id_proceso, codigo) DO NOTHING;

INSERT INTO nt_proc_transiciones (id_proceso, nivel_origen, nivel_destino, accion, prioridad, etiqueta, condiciones)
SELECT p.id, v.origen, v.destino, v.accion, v.prio, v.etiqueta, v.cond::jsonb
FROM nt_procesos p,
(VALUES
  ('REG','SAV','APROBAR',1,'Enviar a Validación de Terceros','{"operador":"IGUAL","campo":"tipo_orden","valor":"NORMAL"}'),
  ('REG','SUB','APROBAR',2,'Enviar a Subdirector Oficina','{"operador":"IGUAL","campo":"tipo_orden","valor":"INTERNA"}'),
  ('SUB','SAV','APROBAR',1,'Enviar a Validación de Terceros',NULL),
  ('SAV','CFT','APROBAR',1,'Requiere Confirmación Telefónica','{"operador":"MAYOR","campo":"monto_total","referencia_contexto":"MONTO_AUTORIZACION_TELEFONICA"}'),
  ('SAV','VAL','APROBAR',2,'Enviar a Autorización de Monto',NULL),
  ('CFT','AUT','CONFIRMAR_CFT',1,'Confirmación Registrada',NULL),
  ('VAL','AUT','APROBAR',1,'Monto Autorizado',NULL),
  ('AUT','PRO','APROBAR',1,'Autorización Final — Programar Pago',NULL),
  ('*','REC','RECHAZAR',99,'Rechazar Orden de Giro',NULL)
) AS v(origen, destino, accion, prio, etiqueta, cond)
WHERE p.codigo = 'AUT_OG';

INSERT INTO nt_proc_variables_contexto (id_proceso, codigo, etiqueta, tipo_dato, es_parametro)
SELECT p.id, v.codigo, v.etiqueta, v.tipo, v.param FROM nt_procesos p,
(VALUES
  ('tipo_orden','Tipo de Orden','TEXTO',false),
  ('monto_total','Monto Total del Lote','NUMERO',false),
  ('estado_actual','Estado Actual en Oracle','TEXTO',false),
  ('MONTO_AUTORIZACION_TELEFONICA','Límite Confirmación Telef.','NUMERO',true),
  ('MONTO_AUTORIZACION_MAXIMA','Límite Máximo Autorización','NUMERO',true)
) AS v(codigo, etiqueta, tipo, param)
WHERE p.codigo = 'AUT_OG'
ON CONFLICT (id_proceso, codigo) DO NOTHING;
