import { Landmark, Shield } from "lucide-react";
import { AppItem } from "./types/redirect.types";

export const AppsItems: AppItem[] = [
  {
    name: "Neffi-fond",
    description: "Sistema de Administración de Fondos de Inversión",
    href: "/",
    icon: Landmark,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    name: "Neffi Laft",
    description: "Validación en Listas Restrictivas",
    href: "",
    icon: Shield,
    color: "text-gray-700",
    bg: "bg-gray-100",
    permission: "fond:NeffiLaft",
  },
];