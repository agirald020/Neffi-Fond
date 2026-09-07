-- V7: Corrige el asunto_correo del proceso AUT_OG.
-- La migración V4 dejó el texto de rechazo como asunto para todas las notificaciones.
-- resolverAsunto() usa este campo para las notificaciones de aprobación.
UPDATE nt_procesos
SET asunto_correo = 'Autorización pendiente OG No. #NumeroOrdenGiro - Fideicomiso #NombreFideicomiso'
WHERE codigo = 'AUT_OG';
