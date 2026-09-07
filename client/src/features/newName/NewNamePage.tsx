import React from "react";
import { Wand2 } from "lucide-react";
import NewNameForm from "./components/NewNameForm";
import NamesList from "./components/NamesList";
import FondTypesCard from "./components/FondTypesCard";

const NewNamePage: React.FC = () => {
  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-red-50 rounded-lg p-2">
            <Wand2 className="h-5 w-5 text-red-600" />
          </div>

          <h1 className="text-xl font-bold text-gray-900">
            Asignación Codigo Interno _ Negocios Nuevos
          </h1>
        </div>

        <p className="text-gray-500 text-sm ml-12 leading-relaxed">
          El sistema asigna el consecutivo automáticamente. El código
          Superfinanciera se guarda como referencia. Se registra el usuario
          y la fecha de cada asignación.
        </p>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6 xl:gap-8 items-start">

          {/* LEFT */}
          <div className="xl:col-span-2 space-y-6">
            <NewNameForm />
            <FondTypesCard />
          </div>
          {/* RIGHT */}
          <div className="lg:col-span-1 xl:col-span-3">
            <NamesList />
          </div>

        </div>
      </div>

    </div>
  );
};

export default NewNamePage;