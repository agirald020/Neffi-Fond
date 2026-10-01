import { useLocation, Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { hasPermission } from "@/shared/lib/permissions";
import { isMenuSection, menuItems, type MenuLink } from "./menuItems";

const isVisible = (item: MenuLink) => !item.permission || hasPermission(item.permission);

interface SidebarLinkProps {
  item: MenuLink;
  location: string;
  collapsed: boolean;
}

function SidebarLink({ item, location, collapsed }: SidebarLinkProps) {
  const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
  return (
    <Link href={item.href}>
      <div
        className={cn(
          "flex items-center rounded-xl cursor-pointer transition-all duration-200 group",
          collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5 space-x-3",
          isActive
            ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-semibold shadow-sm"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
        )}
        title={collapsed ? item.label : undefined}
        data-testid={`link-sidebar-${item.href.replace("/", "") || "home"}`}
      >
        <item.icon
          className={cn(
            "w-5 h-5 shrink-0",
            isActive
              ? "text-red-600 dark:text-red-400"
              : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
          )}
        />
        {!collapsed && (
          <span className="text-sm truncate">{item.label}</span>
        )}
        {isActive && !collapsed && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500"></div>
        )}
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
      data-testid="sidebar"
    >
      <div className="flex items-center justify-end p-2 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          data-testid="button-toggle-sidebar"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {menuItems.map((entry) => {
          if (!isMenuSection(entry)) {
            return isVisible(entry) ? (
              <SidebarLink key={entry.href} item={entry} location={location} collapsed={collapsed} />
            ) : null;
          }

          const visibleItems = entry.items.filter(isVisible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={entry.section} className="pt-3" role="group" aria-label={entry.section}>
              {collapsed ? (
                <div className="mx-2 mb-2 border-t border-gray-100 dark:border-gray-800" aria-hidden="true" />
              ) : (
                <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {entry.section}
                </p>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => (
                  <SidebarLink key={item.href} item={item} location={location} collapsed={collapsed} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Neffi-fond v1.0</p>
        </div>
      )}
    </aside>
  );
}
