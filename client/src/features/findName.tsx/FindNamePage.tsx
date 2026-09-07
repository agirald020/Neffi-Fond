import React, {useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TrustList from "@/features/findName.tsx/components/trust-list";
import type { Trust } from "@shared/schema";


const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: trusts = [], isLoading } = useQuery<Trust[]>({
    queryKey: ["/api/trusts", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      const response = await fetch(`/api/trusts?${params}`);
      if (!response.ok) {
        throw new Error("Error fetching trusts");
      }
      return response.json();
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="absolute inset-0 [background-image:radial-gradient(circle,rgba(59,130,246,0.1)_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Consulta de Fideicomisos
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Busca y accede a la información completa de los fideicomisos registrados
            </p>
          </div>
          
          {/* <TrustSearch 
            value={searchQuery}
            onChange={setSearchQuery}
            data-testid="trust-search"
          /> */}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="card-modern">
          <div className="px-6 py-5 border-b border-gray-200/60 dark:border-gray-700/60">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Resultados de Búsqueda
                </h3>
                <p
                  className="text-sm text-gray-600 dark:text-gray-400 flex items-center"
                  data-testid="results-count"
                >
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-gradient-secondary text-white mr-2">
                    {trusts.length}
                  </span>
                  fideicomisos encontrados
                </p>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Sistema actualizado</span>
              </div>
            </div>
          </div>

          <TrustList 
            trusts={trusts} 
            isLoading={isLoading}
            data-testid="trust-list"
          />
        </div>
      </div>
    </div>
  );
}
export default Home;