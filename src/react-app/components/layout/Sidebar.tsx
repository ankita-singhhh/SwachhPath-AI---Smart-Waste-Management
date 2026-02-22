import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { useAuth } from "@/react-app/context/AuthContext";
import { gsap } from "gsap";
import {
  LayoutDashboard,
  MapPin,
  Trash2,
  MessageSquareWarning,
  LogOut,
  Recycle,
  Menu,
  X,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/react-app/lib/utils";

const adminNavItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/localities", label: "Localities", icon: MapPin },
  { path: "/dustbins", label: "Dustbins", icon: Trash2 },
  { path: "/complaints", label: "Complaints", icon: MessageSquareWarning },
  { path: "/settings", label: "Settings", icon: Settings },
];

const userNavItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/dustbins", label: "My Area Dustbins", icon: Trash2 },
  { path: "/complaints", label: "Complaints", icon: MessageSquareWarning },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const navItems = user?.role === "admin" ? adminNavItems : userNavItems;

  // GSAP animation on mount
  useEffect(() => {
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { x: -280, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    }

    if (navRef.current) {
      const items = navRef.current.querySelectorAll("a");
      gsap.fromTo(
        items,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.08, delay: 0.3, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-[60] p-2 rounded-xl bg-card border border-border lg:hidden"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 flex flex-col transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center neon-glow-sm">
            <Recycle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground tracking-tight">
              SwachhPath
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              AI Waste Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-primary/15 text-primary neon-glow-sm border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="px-4 py-3 rounded-xl bg-sidebar-accent/50">
          <p className="text-sm font-semibold text-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
            {user?.role === "admin" ? "Administrator" : "User"}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-[10px] text-muted-foreground text-center">
            Made by Priyanshu Vishwakarma
          </p>
        </div>
      </aside>
    </>
  );
}
