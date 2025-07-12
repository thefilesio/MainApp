"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiKeyProvider } from "@/contexts/ApiKeyContext";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Bell, User } from "lucide-react";
import PageWrapper from "./PageWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { useLoading } from "@/contexts/LoadingContext";

interface LayoutProps {
    children: React.ReactNode;
}

function getPageTitle(pathname: string, translations: any) {
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/build"))
        return translations.navigation.buildAgent || "Agent erstellen";
    if (pathname.startsWith("/improve"))
        return translations.navigation.improveAgent || "Agent verbessern";
    if (pathname.startsWith("/demo"))
        return translations.navigation.demoAgent || "Agent testen";
    if (pathname.startsWith("/launch"))
        return translations.navigation.launchAgent || "Agent starten";
    if (pathname.startsWith("/api-key"))
        return translations.navigation.apiKey || "API Key";
    if (pathname.startsWith("/support"))
        return translations.navigation.support || "Support";
    return "";
}

export default function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useAuth();
    const { loading } = useLoading();
    const { translations } = useLanguage();
    const router = useRouter();
    useEffect(() => {
        // Set the page title based on the current route
        // if route has a "live" segment, don't show the sidebar
        if (
            router.pathname.includes("live") ||
            router.pathname.includes("widget") || 
            router.pathname.includes("reset-password")
            || router.pathname.includes("auth") || router.pathname.includes("confirm-user")
            || router.pathname.includes("update-password")
        ) {
            setSidebarOpen(false);
        } else {
            setSidebarOpen(true);
        }
    }, [router.pathname]);

    return (
        <ApiKeyProvider>
            <Toaster />
            {loading && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black opacity-10 cursor-progress">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2AB6A6]"></div>{" "}
                </div>
            )}

            {sidebarOpen && (
                <div className="flex min-h-screen w-full">
                    {/* Only render Sidebar, no <aside> or sidebar styling here */}
                    {user && (
                        <Sidebar
                            onClose={() => setSidebarOpen(false)}
                            translatedLinks={translations.navigation}
                        />
                    )}
                    {/* Main content area: only main now, with overflow-hidden */}
                    <div className="flex flex-col flex-1 min-h-screen overflow-hidden">
                        {/* Main Content: standalone with padding */}
                        <main className="flex-1 overflow-y-auto p-6">
                            <PageWrapper>{children}</PageWrapper>
                        </main>
                    </div>
                </div>
            )}

            {!sidebarOpen && (
                <div className="flex min-h-screen w-full">
                    <main className="flex-1 overflow-y-auto">
                        <PageWrapper>{children}</PageWrapper>
                    </main>
                </div>
            )}

            {/* Header with title and user info */}
        </ApiKeyProvider>
    );
}
