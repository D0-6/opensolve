"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, ShieldAlert, Users, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/moderation", label: "Moderation Queue", icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-transparent/5 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#050505] text-zinc-400 flex flex-col shrink-0 min-h-[100dvh] border-r border-white/10">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/" className="font-bold text-lg text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>hexagon</span>
            OpenSolve Admin
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active ? "bg-transparent/10 text-white" : "hover:bg-transparent/5 hover:text-white"
                }`}
              >
                <Icon size={18} className={active ? "text-amber-500" : ""} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">System Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header (only visible on small screens to push content down) */}
        <header className="h-16 bg-transparent border-b border-white/10 flex items-center px-6 md:hidden">
          <span className="font-medium text-white">Admin Portal</span>
        </header>

        <div className="flex-1 p-6 md:p-10 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
