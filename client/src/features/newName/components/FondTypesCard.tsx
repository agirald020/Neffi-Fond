import React from "react";
import { useNewNameStore } from "../stores/newName.store";

export const colorMap: Record<string, string> = {
  FA: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
  MR: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  FG: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
};

const FondTypesCard: React.FC = () => {
  const { FondTypes } = useNewNameStore();

  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Tipos de negocio
      </h3>

      <div className="mt-3 space-y-3">
        {FondTypes.map((type) => (
          <div key={type.prefijo} className="flex items-center gap-3 text-sm">
            <span
              className={`inline-flex items-center justify-center w-10 h-6 rounded-[4px] text-xs font-bold border ${colorMap[type.prefijo]}`}
            >
              {type.prefijo}
            </span>

            <span className="text-slate-600">
              {type.descripcion}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FondTypesCard;