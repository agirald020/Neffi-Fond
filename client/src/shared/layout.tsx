import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Building2,
  Wand2,
  Menu,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  ExternalLink,
  Shield,
  User,
  List,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/* ── Nav tree definition ─────────────────────────────────────────────────── */
interface NavChild {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  children: NavChild[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "negocios",
    label: "Negocios Fiduciarios",
    icon: <Building2 className="h-[18px] w-[18px]" />,
    children: [
      {
        href: "/",
        label: "Listado de Negocios",
        icon: <List className="h-[15px] w-[15px]" />,
      },
      {
        href: "/generador",
        label: "Generador de Nombres",
        icon: <Wand2 className="h-[15px] w-[15px]" />,
      },
    ],
  },
];

const MODULES = [
  {
    id: "fond",
    name: "Neffi-com",
    description: "Adm. y Recaudo de Comisiones",
    icon: <Building2 className="h-5 w-5 text-blue-600" />,
    active: true,
  },
  {
    id: "laft",
    name: "Neffi Laft",
    description: "Validación en Listas Restrictivas",
    icon: <Shield className="h-5 w-5 text-orange-500" />,
    active: false,
  },
];

/* ── Module switcher popover ─────────────────────────────────────────────── */
function ModuleSwitcher() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-1.5 rounded-md hover:bg-white/15 transition-colors text-white/70 hover:text-white"
          title="Cambiar módulo"
        >
          <LayoutGrid className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 shadow-xl border border-gray-200"
        align="start"
        sideOffset={8}
      >
        <div className="px-4 py-2.5 border-b border-gray-100">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Módulos Neffi-com
          </p>
        </div>
        <div className="py-1">
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                mod.active ? "opacity-100" : "opacity-70"
              }`}
              onClick={() => setOpen(false)}
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                {mod.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {mod.name}
                </p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">
                  {mod.description}
                </p>
              </div>
              {!mod.active && (
                <ExternalLink className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ── User button (top-right of header) ──────────────────────────────────── */
function HeaderUserButton() {
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.username || "Usuario";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2.5 px-3 py-1.5 h-auto rounded-lg hover:bg-white/15 text-white"
        >
          <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">{initial}</span>
          </div>
          <span className="text-sm font-medium hidden sm:block">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-3 py-2 text-sm">
          <p className="font-medium text-gray-900 truncate">{displayName}</p>
          {user?.email && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
          )}
          {user?.roles && user.roles.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {user.roles.join(", ")}
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer text-red-600 focus:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Top header bar ──────────────────────────────────────────────────────── */
function TopHeader({ onMobileMenu }: { onMobileMenu?: () => void }) {
  return (
    <header className="h-14 bg-blue-900 flex items-center justify-between px-4 flex-shrink-0 z-40 relative">
      <div className="flex items-center gap-3">
        {onMobileMenu && (
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-white/15 text-white mr-1"
            onClick={onMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner flex-shrink-0">
            <span className="text-white font-extrabold text-base leading-none">N</span>
          </div>
          <ModuleSwitcher />
        </div>
        <div className="leading-tight">
          <p className="text-white font-bold text-[15px] leading-tight">Neffi-com</p>
          <p className="text-blue-300 text-[11px] leading-tight">Adm. y Recaudo de Comisiones</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg hover:bg-white/15 transition-colors text-white/80 hover:text-white">
          <Bell className="h-5 w-5" />
        </button>
        <HeaderUserButton />
      </div>
    </header>
  );
}

/* ── Two-level sidebar nav ───────────────────────────────────────────────── */
function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const [location] = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(NAV_GROUPS.map((g) => [g.id, true]))
  );

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const isChildActive = (group: NavGroup) =>
    group.children.some((c) =>
      c.href === "/" ? location === "/" : location.startsWith(c.href)
    );

  return (
    <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
      {NAV_GROUPS.map((group) => {
        const groupActive = isChildActive(group);
        const isOpen = openGroups[group.id] ?? true;

        if (collapsed) {
          /* ── Collapsed: show parent icon with popover for children ── */
          return (
            <Popover key={group.id}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button
                      className={`
                        w-full flex items-center justify-center p-2.5 rounded-lg transition-colors relative
                        ${groupActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}
                      `}
                    >
                      {groupActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 rounded-r-full" />
                      )}
                      <span className={groupActive ? "text-blue-600" : ""}>{group.icon}</span>
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {group.label}
                </TooltipContent>
              </Tooltip>

              <PopoverContent side="right" align="start" sideOffset={4} className="w-52 p-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
                  {group.label}
                </p>
                {group.children.map((child) => {
                  const active =
                    child.href === "/"
                      ? location === "/"
                      : location.startsWith(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
                      className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${active
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"}
                      `}
                    >
                      <span className={active ? "text-blue-600" : "text-gray-400"}>
                        {child.icon}
                      </span>
                      {child.label}
                    </Link>
                  );
                })}
              </PopoverContent>
            </Popover>
          );
        }

        /* ── Expanded: collapsible group with children ── */
        return (
          <div key={group.id}>
            {/* Group header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold
                transition-colors duration-150 relative
                ${groupActive
                  ? "text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700/50"}
              `}
            >
              {groupActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 rounded-r-full" />
              )}
              <span className={groupActive ? "text-blue-600" : ""}>{group.icon}</span>
              <span className="flex-1 text-left truncate">{group.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 text-gray-400
                  ${isOpen ? "rotate-0" : "-rotate-90"}`}
              />
            </button>

            {/* Children */}
            {isOpen && (
              <div className="mt-0.5 ml-3 pl-3 border-l border-gray-200 dark:border-gray-700 space-y-0.5">
                {group.children.map((child) => {
                  const active =
                    child.href === "/"
                      ? location === "/"
                      : location.startsWith(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
                      className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                        transition-colors duration-150
                        ${active
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"}
                      `}
                    >
                      <span className={active ? "text-blue-500" : "text-gray-400"}>
                        {child.icon}
                      </span>
                      <span className="truncate">{child.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/* ── Desktop sidebar (resizable) ─────────────────────────────────────────── */
const SIDEBAR_MIN = 60;
const SIDEBAR_MAX = 400;
const COLLAPSED_THRESHOLD = 100;
const SIDEBAR_DEFAULT = 220;

function DesktopSidebar() {
  const stored = typeof window !== "undefined"
    ? Number(localStorage.getItem("sidebar-width") || SIDEBAR_DEFAULT)
    : SIDEBAR_DEFAULT;

  const [width, setWidth] = useState(Math.min(Math.max(stored, SIDEBAR_MIN), SIDEBAR_MAX));
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const collapsed = width < COLLAPSED_THRESHOLD;

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - startX.current;
    const next = Math.min(Math.max(startWidth.current + delta, SIDEBAR_MIN), SIDEBAR_MAX);
    setWidth(next);
  }, []);

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    setWidth((w) => {
      localStorage.setItem("sidebar-width", String(w));
      return w;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const onDragHandleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <aside
      className="hidden lg:flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 relative"
      style={{ width }}
    >
      {/* Top bar with collapse toggle */}
      <div className="h-10 flex items-center justify-end px-2 border-b border-gray-100 dark:border-gray-700/50">
        <button
          onClick={() => {
            const next = collapsed ? SIDEBAR_DEFAULT : SIDEBAR_MIN;
            setWidth(next);
            localStorage.setItem("sidebar-width", String(next));
          }}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <SidebarNav collapsed={collapsed} />

      {/* Drag handle on right edge */}
      <div
        onMouseDown={onDragHandleMouseDown}
        className="absolute right-0 top-0 h-full w-[5px] cursor-col-resize z-10 group"
        title="Arrastrar para ajustar ancho"
      >
        <div className="absolute right-0 top-0 h-full w-[2px] bg-transparent group-hover:bg-blue-400 transition-colors duration-150" />
      </div>
    </aside>
  );
}

/* ── Mobile sidebar (Sheet) ──────────────────────────────────────────────── */
function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="left" className="w-64 p-0 flex flex-col bg-white">
        <div className="h-10 flex items-center px-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menú
          </p>
        </div>
        <SidebarNav collapsed={false} onNavigate={onClose} />
      </SheetContent>
    </Sheet>
  );
}

/* ── Root layout ─────────────────────────────────────────────────────────── */
export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <TopHeader onMobileMenu={() => setMobileOpen(true)} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <DesktopSidebar />
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
