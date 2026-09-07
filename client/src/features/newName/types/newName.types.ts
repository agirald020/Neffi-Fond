export interface NombresFideicomiso {
  id?: number
  prefijo: string; // "FA" | "MR" | etc
  consecutivo: number;

  nombreFideicomiso: string;

  codigoSuper?: string | number | null;
  fechaSubContrato?: string | null;
  estado: EstadosNombreFideicomiso;

  codTipoFideicomiso: number | null;
  codSubTipoFideicomiso: number | null;

  codCiudad: number | null;
  codSucursal: number | null;
}

export type NombresFideicomisoEdit = Required<Pick<NombresFideicomiso, "id">> & NombresFideicomiso;

export type EstadosNombreFideicomiso = "ANU" | "REG" | "ASG" //Anulado, registrado, asignado, en ese orden
export type FondType = "FA" | "MR" | "FG";
export type FondTypeFilter = FondType | "all";
export interface FondPrefix {
  prefijo: string;
  descripcion: string;
  estado: string;
  consecutivo: number;
}

export const TYPE_COLORS: Record<FondType, string> = {
  FA: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  MR: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
  FG: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
};

export interface SubtipoNegocioOption {
  value: string;
  label: string;
  tipo: string;
}

export interface FondCode {
  id: number;
  prefijo: FondType;
  consecutivo: number;
  nombreFideicomiso: string;
  estado: string;

  codTipoFideicomiso: number | null;
  codSubTipoFideicomiso: number | null;
  codCiudad: number | null;
  codSucursal: number | null;
  codigoSuper: number;

  usuarioCreacion: string;
  fechaCreacion: string;
  fechaSubContrato: string | null;
}

export interface GeneratedResult extends FondCode { }

export interface NextConsecutiveInfo {
  type: FondType;
  typeLabel: string;
  nextConsecutive: number;
}

export interface CreateFondCodeDTO {
  type: FondType;
  superfinancieraCode?: string | null;
  subtipoNegocio: number | null;
  codTipoFideicomiso: number | null;
  businessName: string;
  ciudadEjecucion?: string | null;
  codigoDivipola?: string | null;
  departamento?: string | null;
  codigoSucursal: number | null;
  assignedBy: string;
  assignedByEmail: string;
}

export interface UpdateFondCodeDTO {
  businessName: string;
  superfinancieraCode?: string | null;
  subtipoNegocio?: string | null;
  tipoNegocio?: string | null;
  updatedBy: string;
  updatedByEmail: string;
}

export interface ExecutionMunicipio {
  nombre: string;
  codigo: string;
  departamento?: string | null;
}

export interface NewNameFilters {
  search: string;
  type: FondTypeFilter;
}

export type FondCodesQuery = {
  criterio?: string;
  prefijo?: FondType | "";
  page?: number;
  size?: number;
};