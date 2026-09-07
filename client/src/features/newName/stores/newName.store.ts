import { create } from "zustand";
import type {
  GeneratedResult,
  FondType,
  FondPrefix,
} from "../types/newName.types";
import {
  getSubtiposNegocio,
  getSucursales,
  getFondPrefixes,
} from "../services/newNameServices";
import { SubtipoFideicomisoDto } from "../types/TipoFideicomisoDTO";
import { SucursalDTO } from "../types/SucursalDTO";
import { Municipio } from "@/shared/data/davipola/types/davipola.types";

interface NextConsecutiveInfo {
  nextConsecutive: number;
}

interface NewNameState {
  selectedType: FondType;
  superfinancieraCode: string;
  subtipoNegocio: SubtipoFideicomisoDto | null;
  businessName: string;
  selectedMunicipio: Municipio | null;
  selectedSucursal: SucursalDTO | null;
  fechaSubContrato: Date | undefined;

  sucursales: SucursalDTO[];
  loadingSucursales: boolean;
  subtiposNegocio: SubtipoFideicomisoDto[];
  loadingSubtipos: boolean;
  FondTypes: FondPrefix[];
  loadingTypes: boolean;

  generatedResult: GeneratedResult | null;
  nextInfo: NextConsecutiveInfo | null;

  saving: boolean;
  error: string | null;
  copiedId: string | null;

  setSelectedType: (type: FondType) => void;
  setSuperfinancieraCode: (value: string) => void;
  setSubtipoNegocio: (value: SubtipoFideicomisoDto | null) => void;
  setBusinessName: (value: string) => void;
  setSelectedMunicipio: (value: Municipio | null) => void;
  setSelectedSucursal: (value: SucursalDTO | null) => void;
  setFechaSubContrato: (value: Date | undefined) => void;

  resetForm: (keepType?: boolean) => void;
  copyToClipboard: (text: string, id: string) => Promise<void>;
  clearError: () => void;

  loadSubtiposNegocio: () => Promise<void>;
  loadFondTypes: () => Promise<void>;
  loadSucursales: () => Promise<void>;

  setGeneratedResult: (value: GeneratedResult | null) => void;
}

function calculateNext(FondTypes: FondPrefix[], type: FondType) {
  const found = FondTypes.find((t) => t.prefijo === type);
  return found ? found.consecutivo : null;
}

export const useNewNameStore = create<NewNameState>((set, get) => ({
  selectedType: "FA",
  superfinancieraCode: "",
  subtipoNegocio: null,
  businessName: "",
  selectedMunicipio: null,
  selectedSucursal: null,
  fechaSubContrato: new Date(),

  sucursales: [],
  loadingSucursales: false,

  subtiposNegocio: [],
  loadingSubtipos: false,

  FondTypes: [],
  loadingTypes: false,

  generatedResult: null,
  nextInfo: null,

  saving: false,
  error: null,
  copiedId: null,

  setSelectedType: (type) => {
    const FondTypes = get().FondTypes;
    const next = calculateNext(FondTypes, type);

    set({
      selectedType: type,
      subtipoNegocio: null,
      selectedSucursal: null,
      nextInfo: next ? { nextConsecutive: next } : null,
      error: null,
    });
  },

  setSuperfinancieraCode: (value) => set({ superfinancieraCode: value }),
  setSubtipoNegocio: (value) => set({ subtipoNegocio: value }),
  setBusinessName: (value) => set({ businessName: value }),
  setSelectedMunicipio: (value) =>
    set({
      selectedMunicipio: value,
      selectedSucursal: null,
    }),
  setSelectedSucursal: (value) => set({ selectedSucursal: value }),
  setFechaSubContrato: (value) => set({ fechaSubContrato: value }),

  loadSubtiposNegocio: async () => {
    // 1. Evitar llamadas infinitas si ya está cargando
    if (get().loadingSubtipos) return;

    set({ loadingSubtipos: true });

    try {
      const response = await getSubtiposNegocio();

      // 2. Obtener las parejas de (tipoFideicomiso, subtipo) permitidas desde la variable de entorno
      const paresPermitidos: [number, number][] = JSON.parse(
        import.meta.env.VITE_SUBTIPOS_PARES_PERMITIDOS || "[]"
      );

      console.log("Parejas permitidas:", paresPermitidos);

      // 3. Filtrado estricto por parejas (tipoFideicomiso, subtipo)
      const filtrados = response.filter((item: SubtipoFideicomisoDto) =>
        paresPermitidos.some(
          ([tipo, subtipo]) =>
            Number(item.tipoFideicomiso) === tipo &&
            Number(item.subtipo) === subtipo
        )
      );

      console.log("Subtipos originales:", response.length);
      console.log("Subtipos filtrados:", filtrados.length);

      set({
        subtiposNegocio: filtrados,
        loadingSubtipos: false,
        error: null,
      });
    } catch (err) {
      console.error("Error en loadSubtiposNegocio:", err);
      set({ loadingSubtipos: false, error: "Error al cargar subtipos" });
    }
  },

  loadFondTypes: async () => {
    set({ loadingTypes: true });
    try {
      const data = await getFondPrefixes();
      const active = data.filter((t: FondPrefix) => t.estado === "ACT");

      const selectedType = get().selectedType;
      const next = calculateNext(active, selectedType);

      set({
        FondTypes: active,
        nextInfo: next ? { nextConsecutive: next } : null,
        loadingTypes: false,
      });
    } catch (err) {
      console.error(err);
      set({ loadingTypes: false });
    }
  },

  loadSucursales: async () => {
    set({ loadingSucursales: true });
    try {
      const data = await getSucursales();
      set({ sucursales: data, loadingSucursales: false });
    } catch (err) {
      console.error(err);
      set({ loadingSucursales: false });
    }
  },

  resetForm: async (keepType = true) => {
    const currentType = get().selectedType;
    const FondTypes = get().FondTypes;
    const next = calculateNext(FondTypes, keepType ? currentType : "FA");

    set({
      selectedType: keepType ? currentType : "FA",
      superfinancieraCode: "",
      subtipoNegocio: null,
      businessName: "",
      selectedMunicipio: null,
      selectedSucursal: null,
      generatedResult: null,
      nextInfo: next ? { nextConsecutive: next } : null,
      error: null,
    });

    await get().loadFondTypes();
  },

  copyToClipboard: async (text, id) => {
    await navigator.clipboard.writeText(text);
    set({ copiedId: id });

    setTimeout(() => {
      if (get().copiedId === id) {
        set({ copiedId: null });
      }
    }, 1600);
  },

  clearError: () => set({ error: null }),

  setGeneratedResult: (value) => set({ generatedResult: value }),
}));