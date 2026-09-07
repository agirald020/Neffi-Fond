import { apiJson } from "@/shared/lib/queryClient";

export const getNeffiLaftUrl = async (): Promise<string> => {
  const data = await apiJson<string[]>(
    "GET",
    "/api/neffi-laft-url"
  );

  // 👇 viene como array → tomamos el primero
  return data?.[0] ?? "";
};