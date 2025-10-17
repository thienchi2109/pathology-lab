"use client";

import { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header for all screen sizes */}
      <Header />
      
      {/* Main content area with padding for header and mobile nav */}
      <main className="pt-16 pb-20 lg:pb-8 px-4 lg:px-8 max-w-[1400px] mx-auto">
        {children}
      </main>
      
      {/* Mobile bottom navigation (hidden on desktop) */}
      <MobileNav />
    </div>
  );
}
