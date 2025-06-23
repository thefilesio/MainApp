import { Button } from "@/components/ui/button";
import { Bot, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BotCardProps {
  id: string;
  name: string;
  description?: string;
  className?: string;
  onDelete?: () => void;
  onClick?: () => void;
}

const BotCard = ({ 
  id, 
  name, 
  description, 
  className,
  onDelete,
  onClick
}: BotCardProps) => {
  return (
    <div 
      className={cn(
        "bg-[#fefcf9] dark:bg-[#101624] rounded-2xl shadow-lg border border-[#D9F4F0] dark:border-[#22304a] p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-[#2AB6A6] dark:hover:border-[#2AB6A6] flex flex-col gap-3",
        className
      )}
      style={{ fontFamily: 'Inter, sans-serif' }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#D9F4F0] dark:bg-[#22304a] flex items-center justify-center shadow-md">
            <Bot className="h-6 w-6 text-[#2AB6A6] dark:text-[#D9F4F0]" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-[#2AB6A6] dark:text-[#D9F4F0] leading-tight">{name}</h3>
            {description && <p className="text-gray-500 dark:text-gray-300 text-sm mt-1 font-medium">{description}</p>}
          </div>
        </div>
        {onDelete && (
          <Button
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500 font-mono tracking-wide mt-2">
        ID: {id.substring(0, 8)}...
      </div>
    </div>
  );
};

export default BotCard;
