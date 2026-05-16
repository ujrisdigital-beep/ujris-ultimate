"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FolderOpen, Search, FileText,
  Calendar, Network, ShoppingBag, Settings, Shield,
  LogOut, Scale, Mic
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/dashboard",        icon: LayoutDashboard, label: "Dashboard" },
  { href: "/research",         icon: Search,          label: "AI Research" },
  { href: "/citation-graph",   icon: Network,         label: "Citation Graph" },
  { href: "/deadlines",        icon: Calendar,        label: "Deadlines" },
  { href: "/marketplace",      icon: ShoppingBag,     label: "Marketplace" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-[#0D1B2A] border-r border-white/8 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-[#C9A84C]" />
          <span className="text-xl font-black text-[#C9A84C] tracking-tight">UJRIS</span>
        </Link>
        <p className="text-xs text-[#7A8FA6] mt-0.5">Justice Intelligence</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wider">Platform</p>
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={cn(path === href || path.startsWith(href + "/") ? "sidebar-link-active" : "sidebar-link")}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}

        <div className="pt-4">
          <p className="px-3 py-1.5 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wider">Tools</p>
          <Link href="/?sue=1"
            className="sidebar-link text-[#C9A84C] hover:text-[#C9A84C]"
          >
            <FileText className="w-4 h-4 shrink-0" />
            Sue Wizard
          </Link>
          <Link href="/dashboard?voice=1"
            className="sidebar-link"
          >
            <Mic className="w-4 h-4 shrink-0" />
            Voice Dictation
          </Link>
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/8 space-y-1">
        <Link href="/admin/dashboard" className="sidebar-link">
          <Shield className="w-4 h-4 shrink-0" />
          Admin
        </Link>
        <Link href="/settings" className="sidebar-link">
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="sidebar-link w-full text-left">
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
