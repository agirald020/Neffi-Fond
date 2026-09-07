import React from "react";
import TrustList from "./trust-list";

interface NameResultsProps {
  
}
 
const NameResults: React.FC<NameResultsProps> = () => {
  return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="card-modern">
      <div className="px-8 py-6 border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Resultados de Búsqueda
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400 flex items-center" data-testid="results-count">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-secondary text-white mr-3">
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
  </div> );
}
 
export default NameResults;