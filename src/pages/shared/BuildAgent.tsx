import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Bot } from "lucide-react";
import CreateBotModal from "@/components/CreateBotModal";
import { useBots } from "@/hooks/useBots";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

// Tag component for metadata badges
const Tag = ({ children, color = "#e0f7f4", textColor = "#008080" }: { children: React.ReactNode; color?: string; textColor?: string }) => (
  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={{ background: color, color: textColor }}>{children}</span>
);

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
      delay: custom * 0.2, // Delay basierend auf Zeilenposition
    },
  }),
};

const BuildAgent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { bots, isLoading } = useBots();

  return (
    <div className="bg-[#fefcf9] min-h-screen px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2AB6A6] mb-1">Agenten verwalten</h1>
          <p className="text-gray-500 dark:text-gray-300 mt-2 text-base">
            Erstelle und verwalte deine KI-Chatbot-Agenten.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="gap-2 self-start rounded-xl shadow-md px-6 py-3 text-base font-bold bg-[#2AB6A6] hover:bg-[#229b8e] transition-all"
          size="lg"
        >
          <Plus className="h-5 w-5" /> Agent erstellen
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2AB6A6]"></div>
        </div>
      ) : bots.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center"
          variants={gridVariants}
          initial="hidden"
          animate="show"
        >
          {bots.map((bot, idx) => (
            <motion.div
              key={bot.id}
              custom={Math.floor(idx / 6)}
              variants={cardVariants}
              className="relative group hover:scale-[1.03] transition-transform duration-300 ease-in-out cursor-pointer min-h-[220px] max-w-[243px] w-full"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full shadow-md border-2 border-white dark:border-gray-800 z-10 bg-[#2AB6A6]"></div>
              <div className="bg-white rounded-2xl shadow-xl border border-[#D9F4F0] group-hover:shadow-2xl transition-all duration-200 flex flex-col justify-center min-h-[220px] z-0">
                <div className="pb-2 px-6 pt-6">
                  <div className="text-2xl font-extrabold text-[#2AB6A6] mb-2">{bot.name}</div>
                  <div className="flex flex-col gap-2 mb-1">
                    <Tag color="#e0f7f4" textColor="#008080">{bot.industry || "Branche: Nicht angegeben"}</Tag>
                    <Tag color="#e0e7ff" textColor="#2a4b8d">{bot.language || "Sprache: Nicht angegeben"}</Tag>
                    <Tag color="#f3e8ff" textColor="#7c3aed">Model: {bot.model || "gpt-4o"}</Tag>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-2 px-6">
                  {/* Optionally add a short description or leave empty for now */}
                </div>
                <div className="flex flex-row items-center justify-center gap-3 pt-2 px-6 pb-4">
                  <Button variant="outline" size="sm" className="rounded-xl shadow hover:shadow-md transition-all w-24">Edit</Button>
                  <Button size="sm" className="rounded-xl shadow bg-[#2AB6A6] text-white hover:bg-[#229b8e] hover:shadow-md transition-all w-24">Manage</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 border border-dashed border-[#D9F4F0] rounded-2xl bg-white dark:bg-chatbot-darker shadow-xl">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#D9F4F0] flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-[#2AB6A6]" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#2AB6A6] mb-2">Erstelle deinen ersten KI-Chatbot</h3>
          <p className="text-gray-500 dark:text-gray-300 mb-6 max-w-md mx-auto">
            Baue einen individuellen KI-Agenten für dein Business. Wähle aus Vorlagen oder starte von Grund auf neu.
          </p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="gap-2 rounded-xl shadow-md px-6 py-3 text-base font-bold bg-[#2AB6A6] hover:bg-[#229b8e] transition-all"
          >
            <Plus className="h-5 w-5" /> Agent erstellen
          </Button>
        </div>
      )}

      <CreateBotModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default BuildAgent;
