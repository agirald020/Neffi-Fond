-- V6: Agrega campo 'permiso' a nt_proc_niveles para parametrizar el rol de Keycloak
-- requerido para consultar órdenes en cada paso del flujo.

ALTER TABLE nt_proc_niveles ADD COLUMN IF NOT EXISTS permiso VARCHAR(200);

-- Poblar los permisos actuales del proceso AUT_OG
UPDATE nt_proc_niveles
SET permiso = CASE codigo
    WHEN 'REG' THEN 'trust:og:ConsultaRegistrada'
    WHEN 'SUB' THEN 'trust:og:ConsultaSubdirector'
    WHEN 'SAV' THEN 'trust:og:ConsultaValidacion'
    WHEN 'SIF' THEN 'trust:og:ConsultaSincronizacion'
    WHEN 'CAU' THEN 'trust:og:ConsultaCausacion'
    WHEN 'RCO' THEN 'trust:og:ConsultaRevisionContable'
    WHEN 'PRV' THEN 'trust:og:ConsultaProvision'
    WHEN 'PRO' THEN 'trust:og:ConsultaProgramada'
    WHEN 'PAG' THEN 'trust:og:ConsultaPagada'
    WHEN 'REC' THEN 'trust:og:ConsultaRechazada'
    ELSE NULL
END
WHERE id_proceso = (SELECT id FROM nt_procesos WHERE codigo = 'AUT_OG')
  AND codigo IN ('REG','SUB','SAV','SIF','CAU','RCO','PRV','PRO','PAG','REC');
