import { create } from "zustand";
import { getApiErrorMessage } from "@/shared/lib/apiError";
import { downloadBlob } from "@/shared/lib/downloadBlob";
import {
  createTransaccionInterna,
  deleteTransaccionInterna,
  exportTransaccionesInternasExcel,
  getTransaccionesInternas,
  updateTransaccionInterna,
} from "../services/transaccionesInternasService";
import {
  EXPORT_FILENAME,
  TRANSACCIONES_MESSAGES,
  TRANSACCIONES_PAGE_SIZE,
} from "../config/transaccionesInternas.constants";
import type {
  PanelMode,
  TransaccionInterna,
  TransaccionInternaRequest,
} from "../types/transaccionInterna.types";

/**
 * Store maestro-detalle de Transacciones Internas.
 *
 * - `records` guarda el listado COMPLETO (el backend no pagina).
 * - El filtrado/paginado derivado se calcula con `useMemo` en la tabla,
 *   aqui solo viven `search` / `currentPage` / `pageSize` como estado UI.
 * - `panelMode` gobierna el panel derecho: empty | view | edit | create.
 * - Las acciones de escritura devuelven `boolean` (exito) para que la UI
 *   decida si cierra el modo edicion o mantiene el formulario abierto.
 */
interface TransaccionesInternasState {
  records: TransaccionInterna[];
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  exporting: boolean;
  error: string | null;
  successMessage: string | null;

  search: string;
  currentPage: number;
  pageSize: number;

  selectedId: number | null;
  panelMode: PanelMode;
  /** true mientras el modal SweetAlert2 de confirmacion esta abierto. */
  confirmOpen: boolean;

  loadRecords: () => Promise<void>;
  setSearch: (value: string) => void;
  setPage: (page: number) => void;
  selectRecord: (codigoReferencia: number) => void;
  startCreate: () => void;
  startEdit: () => void;
  cancelPanel: () => void;
  createRecord: (payload: TransaccionInternaRequest) => Promise<boolean>;
  updateRecord: (codigoReferencia: number, payload: TransaccionInternaRequest) => Promise<boolean>;
  deleteRecord: (codigoReferencia: number) => Promise<boolean>;
  exportExcel: () => Promise<void>;
  setConfirmOpen: (open: boolean) => void;
  clearError: () => void;
  clearSuccessMessage: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  records: [] as TransaccionInterna[],
  loading: false,
  saving: false,
  deleting: false,
  exporting: false,
  error: null as string | null,
  successMessage: null as string | null,
  search: "",
  currentPage: 0,
  pageSize: TRANSACCIONES_PAGE_SIZE,
  selectedId: null as number | null,
  panelMode: "empty" as PanelMode,
  confirmOpen: false,
};

export const useTransaccionesInternasStore = create<TransaccionesInternasState>((set, get) => ({
  ...INITIAL_STATE,

  loadRecords: async () => {
    set({ loading: true, error: null });
    try {
      const records = await getTransaccionesInternas();
      const { selectedId } = get();
      const stillExists = selectedId != null && records.some((r) => r.codigoReferencia === selectedId);
      set({
        records,
        // Si el registro seleccionado ya no existe, el panel vuelve a vacio.
        ...(stillExists ? {} : { selectedId: null, panelMode: get().panelMode === "create" ? "create" : "empty" }),
      });
    } catch (err) {
      set({ error: getApiErrorMessage(err, TRANSACCIONES_MESSAGES.loadError) });
    } finally {
      set({ loading: false });
    }
  },

  setSearch: (value) => set({ search: value, currentPage: 0 }),

  setPage: (page) => set({ currentPage: Math.max(0, page) }),

  selectRecord: (codigoReferencia) => {
    // No se permite cambiar de fila mientras se edita/crea.
    const { panelMode } = get();
    if (panelMode === "edit" || panelMode === "create") return;
    set({ selectedId: codigoReferencia, panelMode: "view" });
  },

  startCreate: () => set({ selectedId: null, panelMode: "create", error: null }),

  startEdit: () => {
    if (get().selectedId == null) return;
    set({ panelMode: "edit", error: null });
  },

  cancelPanel: () =>
    set((state) => ({ panelMode: state.selectedId != null ? "view" : "empty", error: null })),

  createRecord: async (payload) => {
    set({ saving: true, error: null });
    try {
      const created = await createTransaccionInterna(payload);
      if (created?.codigoReferencia != null) {
        set((state) => ({
          records: [created, ...state.records],
          selectedId: created.codigoReferencia,
          panelMode: "view",
          search: "",
          currentPage: 0,
          successMessage: TRANSACCIONES_MESSAGES.created,
        }));
      } else {
        // Respuesta sin cuerpo util: se recarga el listado completo.
        set({ panelMode: "empty", successMessage: TRANSACCIONES_MESSAGES.created });
        await get().loadRecords();
      }
      return true;
    } catch (err) {
      set({ error: getApiErrorMessage(err, TRANSACCIONES_MESSAGES.saveError) });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  updateRecord: async (codigoReferencia, payload) => {
    set({ saving: true, error: null });
    try {
      const updated = await updateTransaccionInterna(codigoReferencia, payload);
      set((state) => ({
        records: state.records.map((r) =>
          r.codigoReferencia === codigoReferencia
            ? { ...r, ...payload, ...(updated ?? {}), codigoReferencia }
            : r,
        ),
        panelMode: "view",
        successMessage: TRANSACCIONES_MESSAGES.updated,
      }));
      return true;
    } catch (err) {
      set({ error: getApiErrorMessage(err, TRANSACCIONES_MESSAGES.saveError) });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  deleteRecord: async (codigoReferencia) => {
    set({ deleting: true, error: null });
    try {
      await deleteTransaccionInterna(codigoReferencia);
      set((state) => ({
        records: state.records.filter((r) => r.codigoReferencia !== codigoReferencia),
        selectedId: null,
        panelMode: "empty",
        successMessage: TRANSACCIONES_MESSAGES.deleted,
      }));
      return true;
    } catch (err) {
      set({ error: getApiErrorMessage(err, TRANSACCIONES_MESSAGES.deleteError) });
      return false;
    } finally {
      set({ deleting: false });
    }
  },

  exportExcel: async () => {
    set({ exporting: true, error: null });
    try {
      const blob = await exportTransaccionesInternasExcel();
      downloadBlob(blob, EXPORT_FILENAME);
    } catch (err) {
      set({ error: getApiErrorMessage(err, TRANSACCIONES_MESSAGES.exportError) });
    } finally {
      set({ exporting: false });
    }
  },

  setConfirmOpen: (open) => set({ confirmOpen: open }),
  clearError: () => set({ error: null }),
  clearSuccessMessage: () => set({ successMessage: null }),
  reset: () => set({ ...INITIAL_STATE }),
}));

/** Selector: registro actualmente seleccionado (o null). */
export const selectSelectedRecord = (state: TransaccionesInternasState): TransaccionInterna | null =>
  state.selectedId == null
    ? null
    : state.records.find((r) => r.codigoReferencia === state.selectedId) ?? null;
