"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Play, Settings, Sparkles } from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/simulations", label: "Simulations", icon: Sparkles },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-[var(--border)]">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">SimWorld</h1>
                        <p className="text-xs text-[var(--muted-foreground)]">AI Simulation</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                            ? "bg-[var(--primary)] text-white"
                                            : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Credits Section */}
            <div className="p-4 border-t border-[var(--border)]">
                <div className="bg-[var(--muted)] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--muted-foreground)]">Credits</span>
                        <span className="text-lg font-bold text-[var(--primary)]">100</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">100 ticks remaining today</p>
                </div>
            </div>
        </aside>
    );
}
