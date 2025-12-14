import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import "./globals.css";

export const metadata: Metadata = {
    title: "AI Simulation Platform",
    description: "Create and observe AI-driven simulations with autonomous agents",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider appearance={{ baseTheme: dark }}>
            <html lang="en">
                <body className="antialiased">
                    <ConvexClientProvider>
                        <div className="flex h-screen">
                            <Sidebar />
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <Header />
                                <main className="flex-1 overflow-auto p-6">
                                    {children}
                                </main>
                            </div>
                        </div>
                    </ConvexClientProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
