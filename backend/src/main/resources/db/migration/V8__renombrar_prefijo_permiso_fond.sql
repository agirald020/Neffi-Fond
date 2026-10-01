-- V8: Renombra el prefijo de los roles de Keycloak usados por la app, de
-- 'trust:' a 'fond:' (el proyecto se llama Neffi-Fond, no Neffi-Trust).
-- No se edita V6 (ya aplicada): se actualizan los datos que esa migración sembró.

UPDATE nt_proc_niveles
SET permiso = REPLACE(permiso, 'trust:', 'fond:')
WHERE permiso LIKE 'trust:%';
