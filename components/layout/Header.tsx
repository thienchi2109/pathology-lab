"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  FlaskConical, 
  Package, 
  BarChart3, 
  Settings,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home, roles: ["editor", "viewer"] },
  { name: "Lab Records", href: "/lab-records", icon: FlaskConical, roles: ["editor", "viewer"] },
  { name: "Kit Inventory", href: "/kits", icon: Package, roles: ["editor", "viewer"] },
  { name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["editor", "viewer"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["editor"] },
];

export function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const filteredNavItems = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="h-full max-w-[1400px] mx-auto px-4 lg:px-8 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-primary" />
          <span className="font-heading text-h3 text-text-primary hidden sm:inline">
            Lab Sample
          </span>
        </Link>

        {/* Desktop Navigation (≥1024px) */}
        <nav className="hidden lg:flex items-center gap-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                  ${isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md">
            <User className="w-4 h-4 text-text-secondary" />
            <span className="text-sm text-text-primary">{user?.email}</span>
            <span className="text-xs text-text-secondary px-2 py-0.5 bg-primary/20 rounded">
              {user?.role}
            </span>
          </div>
          
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-error hover:bg-error/10 rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
