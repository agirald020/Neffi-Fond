import { create } from "zustand";
import {
  getFondCodes,
  saveNombreFideicomiso,
} from "../services/newNameServices";
import type {
  GeneratedResult,
  NombresFideicomiso,
  FondCode,
  FondType,
} from "../types/newName.types";

interface State {
  records: FondCode[];
  loading: boolean;
  exporting: boolean;
  error: string | null;

  filters: {
    search: string;
    type: FondType | "all";
  };

  page: number;
  size: number;
  totalElements: number;
  totalPages: number;

  editingRecord: FondCode | null;
  deletingRecord: FondCode | null;

  editNombreFideicomiso: string;
  editCodigoSuper: string;
  editCodCiudad: string;
  editCodSucursal: string;

  copiedId: string | null;
  generatedResult: GeneratedResult | null;

  loadRecords: () => Promise<void>;
  setSearch: (v: string) => void;
  setFilterType: (v: FondType | "all") => void;
  setPage: (page: number) => void;
  setSize: (size: number) => void;

  openEdit: (r: FondCode) => void;
  closeEdit: () => void;
  setEditNombreFideicomiso: (v: string) => void;
  setEditCodigoSuper: (v: string) => void;
  setEditCodCiudad: (v: string) => void;
  setEditCodSucursal: (v: string) => void;

  copyToClipboard: (text: string, id: string) => Promise<void>;
  clearError: () => void;
  setGeneratedResult: (result: GeneratedResult | null) => void;

  updateRecord: (data: NombresFideicomiso) => Promise<void>;
}

export const useFondCodesStore = create<State>((set, get) => ({
  records: [],
  loading: false,
  exporting: false,
  error: null,

  filters: {
    search: "",
    type: "all",
  },

  page: 0,
  size: 25,
  totalElements: 0,
  totalPages: 0,

  editingRecord: null,
  deletingRecord: null,

  editNombreFideicomiso: "",
  editCodigoSuper: "",
  editCodCiudad: "",
  editCodSucursal: "",

  copiedId: null,
  generatedResult: null,

  loadRecords: async () => {
    set({ loading: true, error: null });

    try {
      const s = get();

      const result = await getFondCodes({
        criterio: s.filters.search.trim(),
        prefijo: s.filters.type === "all" ? "" : s.filters.type,
        page: s.page,
        size: s.size,
      });

      set({
        records: result.content ?? [],
        totalElements: result.totalElements ?? 0,
        totalPages: result.totalPages ?? 0,
        page: result.page ?? 0,
        size: result.size ?? s.size,
      });
    } catch {
      set({ error: "No se pudo cargar la lista" });
    } finally {
      set({ loading: false });
    }
  },

  setSearch: (v) =>
    set((state) => ({
      filters: { ...state.filters, search: v },
      page: 0,
    })),

  setFilterType: (v) =>
    set((state) => ({
      filters: { ...state.filters, type: v },
      page: 0,
    })),

  setPage: (page) => set({ page }),
  setSize: (size) => set({ size, page: 0 }),

  openEdit: (r) =>
    set({
      editingRecord: r,
      editNombreFideicomiso: r.nombreFideicomiso ?? "",
      editCodigoSuper: r.codigoSuper != null ? String(r.codigoSuper) : "",
      editCodCiudad: r.codCiudad != null ? String(r.codCiudad) : "",
      editCodSucursal: r.codSucursal != null ? String(r.codSucursal) : "",
    }),

  closeEdit: () =>
    set({
      editingRecord: null,
      editNombreFideicomiso: "",
      editCodigoSuper: "",
      editCodCiudad: "",
      editCodSucursal: "",
    }),

  setEditNombreFideicomiso: (v) => set({ editNombreFideicomiso: v }),
  setEditCodigoSuper: (v) => set({ editCodigoSuper: v }),
  setEditCodCiudad: (v) => set({ editCodCiudad: v }),
  setEditCodSucursal: (v) => set({ editCodSucursal: v }),

  copyToClipboard: async (text, id) => {
    await navigator.clipboard.writeText(text);

    set({ copiedId: id });

    setTimeout(() => {
      if (get().copiedId === id) {
        set({ copiedId: null });
      }
    }, 1500);
  },

  clearError: () => set({ error: null }),
  setGeneratedResult: (result) => set({ generatedResult: result }),

  updateRecord: async (data) => {
    try {
      set({ loading: true, error: null });

      await saveNombreFideicomiso(data);

      set({
        editingRecord: null,
        editNombreFideicomiso: "",
        editCodigoSuper: "",
        editCodCiudad: "",
        editCodSucursal: "",
      });

      await get().loadRecords();
    } catch {
      set({ error: "No se pudo actualizar el registro" });
    } finally {
      set({ loading: false });
    }
  },
}));