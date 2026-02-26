import { Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard,
  Package,
  Receipt,
  BarChart3,
  LogOut,
  Menu,
  X,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Inventory", path: "/inventory", icon: Package },
  { label: "Billing", path: "/billing", icon: Receipt },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 shrink-0",
          sidebarOpen ? "w-56" : "w-16"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-sidebar-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold font-display truncate">
                GPIS Store
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate({ to: path })}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand text-white"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4 border-t border-sidebar-border pt-4">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-rose-400"
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-14 border-b border-border bg-card flex items-center px-6 shrink-0">
          <h2 className="text-sm font-medium text-muted-foreground">
            {navItems.find((n) => n.path === location.pathname)?.label ?? ""}
          </h2>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
