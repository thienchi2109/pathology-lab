"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  FlaskConical, 
  Package, 
  BarChart3, 
  Settings
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const navigationItems = [
  { name: "Home", href: "/dashboard", icon: Home, roles: ["editor", "viewer"] },
  { name: "Records", href: "/lab-records", icon: FlaskConical, roles: ["editor", "viewer"] },
  { name: "Kits", href: "/kits", icon: Package, roles: ["editor", "viewer"] },
  { name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["editor", "viewer"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["editor"] },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavItems = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
      <div className="h-full flex items-center justify-around px-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[44px] min-h-[44px]
                ${isActive 
                  ? "text-primary" 
                  : "text-text-secondary"
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
              <span className={`text-xs font-medium ${isActive ? "text-primary" : ""}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
