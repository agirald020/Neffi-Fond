// useFideicomiso.ts

import { useMutation } from "@tanstack/react-query";
import { saveNombreFideicomiso } from "../services/newNameServices";
import type { NombresFideicomiso } from "../types/newName.types";

export const useFideicomiso = () => {
  const mutation = useMutation({
    mutationFn: (payload: NombresFideicomiso) =>
      saveNombreFideicomiso(payload),
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};