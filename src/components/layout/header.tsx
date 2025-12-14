"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";

export function Header() {
    const { user, isLoaded } = useUser();

    return (
        <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex items-center gap-4 flex-1 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <input
                        type="text"
                        placeholder="Search simulations..."
                        className="w-full pl-10 pr-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm 
                       focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                       placeholder:text-[var(--muted-foreground)]"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
                    <Bell className="w-5 h-5 text-[var(--muted-foreground)]" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--primary)] rounded-full" />
                </button>

                {/* User */}
                <div className="flex items-center gap-3">
                    {isLoaded && user && (
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium">{user.fullName || user.username}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">Free Tier</p>
                        </div>
                    )}
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox: "w-10 h-10"
                            }
                        }}
                    />
                </div>
            </div>
        </header>
    );
}
