import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export const Navbar = () => {
  const { signOut } = useAuth();
  const { translations } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-white dark:bg-chatbot-darker flex items-center px-4 md:px-6">
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Removed title for cleaner look */}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline-block">
              {translations.common.signOut}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};
