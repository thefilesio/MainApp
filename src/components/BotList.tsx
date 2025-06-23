import { Button } from "@/components/ui/button";
import { Bot, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
interface BotCardProps {
    name: string;
    description?: string;
    className?: string;
    bots: any;
    setSelectedBot: (bot: any) => void;
    onDelete: (id:string) => void;
    onClick?: () => void;
}

const BotList = ({
    name,
    bots,
    setSelectedBot,
    className,
    onDelete,
    onClick,
}: BotCardProps) => {
    return (
        <div className={cn("", className)}>
            <motion.div
                className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4"
                // variants={gridVariants}
                initial="hidden"
                animate="show"
            >
                {bots.map((bot, idx) => (
                    <motion.div
                        key={bot.id}
                        custom={Math.floor(idx / 6)}
                        // variants={cardVariants}
                        className="relative group hover:scale-[1.03] transition-transform duration-300 ease-in-out cursor-pointer min-h-[220px]  w-full"
                        style={{ fontFamily: "Inter, sans-serif" }}
                        onClick={() => {
                            setSelectedBot(bot);
                        }}
                    >
                        <div
                            className={cn(
                                "relative bg-[#fefcf9] dark:bg-[#101624] rounded-2xl shadow-lg border border-[#D9F4F0] dark:border-[#22304a] p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-[#2AB6A6] dark:hover:border-[#2AB6A6] flex flex-col gap-3",
                                className
                            )}
                        >
                            <div className="flex justify-between items-start mb-2 ">
                                <div className="flex flex-col items-center gap-4 w-full">
                                    <div className="w-28 h-28 rounded-full bg-[#D9F4F0] dark:bg-[#22304a] flex items-center justify-center shadow-md">
                                        <Bot className="h-16 w-16 text-[#2AB6A6] dark:text-[#D9F4F0]" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-xl text-[#2AB6A6] dark:text-[#D9F4F0] leading-tight text-center">
                                            {bot.name || name}
                                        </h3>
                                       
                                    </div>
                                </div>
                                
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 ext-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                                onDelete(bot.id);
                                        }}
                                                
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 font-mono tracking-wide mt-2">
                                ID: {bot.id.substring(0, 8)}...
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default BotList;
