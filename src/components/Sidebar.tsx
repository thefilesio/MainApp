import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import {
  Bot as BotIcon,
  Lightbulb,
  PlayCircle,
  Rocket,
  Key,
  HelpCircle,
  X,
  User,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

// Avatar placeholder
function Avatar() {
  return (
    <div className="w-10 h-10 rounded-full bg-[#2AB6A6] flex items-center justify-center text-white font-bold text-base">
      D
    </div>
  );
}

interface SidebarProps {
  onClose: () => void;
  translatedLinks: {
    buildAgent: string;
    improveAgent: string;
    demoAgent: string;
    launchAgent: string;
    apiKey: string;
    support: string;
  };
}

function LogoutButton() {
  const { signOut } = useAuth();
  const { translations } = useLanguage();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={signOut}
      className="gap-3"
    >
      <LogOut className="h-5 w-5" />
      <span className="hidden sm:inline-block text-base">
        {translations.common.signOut}
      </span>
    </Button>
  );
}

const Sidebar = ({ onClose, translatedLinks }: SidebarProps) => {
  const router = useRouter();
  const {user} = useAuth();



  const mainNavItems = [
   
    {
      name: translatedLinks.buildAgent,
      path: "/build",
      icon: <BotIcon className="h-6 w-6" />,
    },
    {
      name: translatedLinks.improveAgent,
      path: "/improve",
      icon: <Lightbulb className="h-6 w-6" />,
    },
    {
      name: translatedLinks.demoAgent,
      path: "/demo",
      icon: <PlayCircle className="h-6 w-6" />,
    },
    {
      name: translatedLinks.launchAgent,
      path: "/launch",
      icon: <Rocket className="h-6 w-6" />,
    }
  ];

  const settingsNavItems = [
    {
      name: translatedLinks.apiKey,
      path: "/api-key",
      icon: <Key className="h-6 w-6" />,
    },
    {
      name: translatedLinks.support,
      path: "/supports",
      icon: <HelpCircle className="h-6 w-6" />,
    },
  ];

  const isActive = (path: string) => router.pathname === path;

  return (
    <aside className="flex flex-col h-screen w-[20rem] min-w-[20rem] bg-[#fefcf9] dark:bg-[#1a1a1a] text-black dark:text-white shadow z-10 rounded-tr-xl">
      {/* Branding */}
      <div className="flex items-center gap-4 px-6 py-5 mt-6">
        <BotIcon className="w-11 h-11 text-[#2AB6A6]" />
        <span className="text-[22px] font-bold tracking-wide">YARO BOT</span>
      </div>
      {/* Account/Profile Button */}
      <div className="px-6 pb-4">
        <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-muted transition">
          <Avatar />
          <div className="flex flex-col text-left">
            <span className="text-base font-medium text-foreground">{user?.email || "Guest"}</span>
            <span className="text-xs text-muted-foreground">Account</span>
          </div>
        </button>
      </div>
      {/* Navigation */}
      <nav className="flex flex-col gap-3 px-6">
        {/* Main nav group */}
        {mainNavItems.map((item) => {
          const active = router.pathname === item.path;
          return active ? (
            <div
              key={item.path}
              className={cn(
                "flex items-center gap-3 pl-6 pr-2 py-3 rounded-xl font-semibold text-white dark:text-primary bg-primary dark:bg-black shadow-sm transition-all",
                "text-[15px] h-12"
              )}
            >
              {item.icon && (
                <span className="dark:text-primary">{item.icon}</span>
              )}
              <span>{item.name}</span>
            </div>
          ) : (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 pl-6 pr-2 py-3 rounded-xl text-slate-500 hover:bg-[#e9f8f6] dark:hover:bg-black hover:text-[#179e8c] font-medium text-[15px] h-12 transition-all",
                "focus:outline-none"
              )}
              onClick={() => {
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
            >
              {item.icon && (
                <span className="text-slate-500 group-hover:text-[#179e8c]">{item.icon}</span>
              )}
              <span>{item.name}</span>
            </Link>
          );
        })}
        {/* Settings nav group */}
        {settingsNavItems.map((item) => {
          const active = router.pathname === item.path;
          return active ? (
            <div
              key={item.path}
              className={cn(
                "flex items-center gap-3 pl-6 pr-2 py-3 rounded-xl font-semibold text-white bg-primary dark:bg-black shadow-sm transition-all",
                "text-[15px] h-12"
              )}
            >
              {item.icon && (
                <span className="text-white dark:text-primary">{item.icon}</span>
              )}
              <span>{item.name}</span>
            </div>
          ) : (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 pl-6 pr-2 py-3 rounded-xl text-slate-500 hover:bg-[#e9f8f6] dark:hover:bg-black hover:text-[#179e8c] font-medium text-[15px] h-12 transition-all",
                "focus:outline-none"
              )}
              onClick={() => {
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
            >
              {item.icon && (
                <span className="text-slate-500 group-hover:text-[#179e8c]">{item.icon}</span>
              )}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      {/* Footer Controls */}
      <div className="mt-auto px-6 pb-6 flex flex-col gap-3 text-base text-muted-foreground">
        <LanguageToggle />
        <ThemeToggle />
        <LogoutButton />
      </div>
    </aside>
  );
};

export default Sidebar;
