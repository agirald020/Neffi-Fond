import { buscarMunicipios } from "../services/davipolaService";
import { Municipio } from "../types/davipola.types";

export async function getMunicipioByCodigo(
  codigo: string
): Promise<Municipio | null> {
  const page = await buscarMunicipios({
    criterio: codigo,
    page: 0,
    size: 100,
  });

  return page.content.find((m) => m.codigoMunicipio === codigo) ?? null;
}