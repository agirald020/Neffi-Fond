-- V5: Agrega campo de plantilla HTML de correo al proceso de autorización.

ALTER TABLE nt_procesos ADD COLUMN IF NOT EXISTS plantilla_correo TEXT;

UPDATE nt_procesos
SET plantilla_correo = $TEMPLATE$
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>{{asuntoCorreo}}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#c0392b 0%,#922b21 100%);padding:28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:6px;">Neffi Fond · Sistema Fiduciario</div>
                    <div style="font-size:22px;font-weight:700;color:#ffffff;line-height:1.2;">Autorización pendiente</div>
                    <div style="font-size:14px;color:rgba(255,255,255,0.85);margin-top:4px;">Orden de Giro #{{numeroOrden}}</div>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:8px 14px;text-align:center;">
                      <div style="font-size:10px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1px;">Estado</div>
                      <div style="font-size:14px;font-weight:700;color:#ffffff;margin-top:2px;">{{estadoSiguiente}}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ALERTA DE ACCIÓN -->
          <tr>
            <td style="background:#fef9f0;border-bottom:1px solid #fde8c8;padding:16px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="28" style="vertical-align:top;padding-top:1px;">
                    <div style="width:20px;height:20px;background:#f39c12;border-radius:50%;text-align:center;line-height:20px;font-size:12px;color:#fff;font-weight:bold;">!</div>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="font-size:13px;color:#856404;">Tienes una orden de giro pendiente de revisión en el paso <strong>{{estadoSiguiente}}</strong>. Tu aprobación es requerida para continuar el proceso.</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DATOS DE LA ORDEN -->
          <tr>
            <td style="padding:28px 36px 8px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;margin-bottom:16px;">Datos de la Orden</div>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td width="50%" style="padding:10px 12px;background:#f8fafc;border-radius:6px 0 0 0;border-bottom:1px solid #e5e7eb;">
                    <div style="font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Fideicomiso</div>
                    <div style="font-size:15px;font-weight:600;color:#111827;">{{codigoFideicomiso}}</div>
                  </td>
                  <td width="50%" style="padding:10px 12px;background:#f8fafc;border-radius:0 6px 0 0;border-left:4px solid #ffffff;border-bottom:1px solid #e5e7eb;">
                    <div style="font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Número de Orden</div>
                    <div style="font-size:15px;font-weight:600;color:#111827;">#{{numeroOrden}}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">
                    <div style="font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Monto Total</div>
                    <div style="font-size:16px;font-weight:700;color:#059669;">{{montoTotal}}</div>
                  </td>
                  <td style="padding:10px 12px;border-left:4px solid #ffffff;border-bottom:1px solid #e5e7eb;">
                    <div style="font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Fecha de Ejecución</div>
                    <div style="font-size:15px;font-weight:600;color:#111827;">{{fechaEjecucion}}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;background:#f8fafc;border-radius:0 0 0 6px;">
                    <div style="font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Tipo de Orden</div>
                    <div style="font-size:15px;font-weight:600;color:#111827;">{{tipoOrden}}</div>
                  </td>
                  <td style="padding:10px 12px;background:#f8fafc;border-radius:0 0 6px 0;border-left:4px solid #ffffff;">
                    <div style="font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Aprobado por</div>
                    <div style="font-size:15px;font-weight:600;color:#111827;">{{aprobadoPor}}</div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- DESCRIPCIÓN DEL PAGO -->
          <tr>
            <td style="padding:8px 36px 24px;">
              <div style="background:#f0fdf4;border-left:3px solid #22c55e;border-radius:0 6px 6px 0;padding:12px 16px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#16a34a;margin-bottom:4px;">Descripción del pago</div>
                <div style="font-size:14px;color:#374151;">{{descripcionPago}}</div>
              </div>
            </td>
          </tr>

          <!-- OBSERVACIÓN (condicional) -->
          {{#observacion}}
          <tr>
            <td style="padding:0 36px 24px;">
              <div style="background:#eff6ff;border-left:3px solid #3b82f6;border-radius:0 6px 6px 0;padding:12px 16px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#1d4ed8;margin-bottom:4px;">Observación</div>
                <div style="font-size:14px;color:#374151;">{{observacion}}</div>
              </div>
            </td>
          </tr>
          {{/observacion}}

          <!-- CTA -->
          <tr>
            <td style="padding:8px 36px 32px;" align="center">
              <a href="{{urlAcceso}}" style="display:inline-block;background:#c0392b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 32px;border-radius:8px;letter-spacing:0.3px;">
                Revisar y Autorizar Orden
              </a>
              <div style="margin-top:12px;font-size:12px;color:#9ca3af;">
                También puedes copiar este enlace: <span style="color:#3b82f6;">{{urlAcceso}}</span>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:20px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:12px;color:#9ca3af;line-height:1.6;">
                      Este correo fue generado automáticamente por <strong>Neffi Fond</strong> · Sistema de Gestión Fiduciaria.<br/>
                      Por favor no respondas a este mensaje. Para soporte contacta al administrador del sistema.
                    </div>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <div style="font-size:11px;color:#d1d5db;">{{fechaEnvio}}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
$TEMPLATE$
WHERE codigo = 'AUT_OG';
