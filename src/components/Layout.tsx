"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiKeyProvider } from "@/contexts/ApiKeyContext";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Bell, User } from "lucide-react";
import PageWrapper from "./PageWrapper";

interface LayoutProps {
  children: React.ReactNode;
}

function getPageTitle(pathname: string, translations: any) {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/build")) return translations.navigation.buildAgent || "Agent erstellen";
  if (pathname.startsWith("/improve")) return translations.navigation.improveAgent || "Agent verbessern";
  if (pathname.startsWith("/demo")) return translations.navigation.demoAgent || "Agent testen";
  if (pathname.startsWith("/launch")) return translations.navigation.launchAgent || "Agent starten";
  if (pathname.startsWith("/api-key")) return translations.navigation.apiKey || "API Key";
  if (pathname.startsWith("/support")) return translations.navigation.support || "Support";
  return "";
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { translations } = useLanguage();
  const router = useRouter();

  return (
    <ApiKeyProvider>
      <div className="flex min-h-screen w-full">
        {/* Only render Sidebar, no <aside> or sidebar styling here */}
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          translatedLinks={translations.navigation}
        />
        {/* Main content area: only main now, with overflow-hidden */}
        <div className="flex flex-col flex-1 min-h-screen overflow-hidden">
          {/* Main Content: standalone with padding */}
          <main className="flex-1 overflow-y-auto p-6">
            <PageWrapper>
              {children}
            </PageWrapper>
          </main>
        </div>
      </div>
    </ApiKeyProvider>
  );
}
