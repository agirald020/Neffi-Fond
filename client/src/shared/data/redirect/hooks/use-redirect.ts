import { useQuery } from "@tanstack/react-query";
import { getNeffiLaftUrl } from "../services/redirectService";

export const useNeffiLaftUrl = () => {
  return useQuery({
    queryKey: ["neffi-laft-url"],
    queryFn: getNeffiLaftUrl,
    staleTime: Infinity,
  });
};