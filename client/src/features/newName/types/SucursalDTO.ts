export interface SucursalDTO {
  nitCliente: number;
  codigoSucursal: number;
  nombre: string;
  direccion: string;
  codigoCiudad: number;
  nombreCiudad: string;

  codigoZona: number;
  nombreZona: string;
  descripcion: string;

  nitRepresentante: number;

  activa: string;
  preventas: string;

  codigoProyectoPreventas: number;

  prefijoSucursal: string;
  consecFactura: number;

  telefono1: string;
  telefono2: string;
  fax: string;

  resolFac: string;

  sucursalEquivalente: number;
  sedeFisica: number;
}