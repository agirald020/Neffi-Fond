export interface Municipio {
  codigoMunicipio: string;
  nombreMunicipio: string;
  codigoDepartamento: string;
  nombreDepartamento: string;
}

export interface BuscarMunicipiosParams {
  criterio?: string;
  page?: number;
  size?: number;
}