import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Bot } from "lucide-react";
import CreateBotModal from "@/components/CreateBotModal";
import { useBots } from "@/hooks/useBots";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import BotCard from "@/components/BotCard";
import { any } from "zod";
import BotList from "@/components/BotList";
import EditBotModal from "@/components/EditBotModal";
import { toast } from "sonner";
import Swal from "sweetalert2";
// Tag component for metadata badges
const Tag = ({
    children,
    color = "#e0f7f4",
    textColor = "#008080",
}: {
    children: React.ReactNode;
    color?: string;
    textColor?: string;
}) => (
    <span
        className="inline-block px-3 py-1 rounded-full text-sm font-medium"
        style={{ background: color, color: textColor }}
    >
        {children}
    </span>
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
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [bot, setBot] = useState<any>(null);
    const { bots, isLoading, deleteBot } = useBots();
    const router = useRouter();
    const [selectedBot, setSelectedBot] = useState<any>(null);

    const handleDelete = async (id: string) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-success",
                cancelButton: "btn btn-danger",
            },
            buttonsStyling: false,
        });
        swalWithBootstrapButtons
            .fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel!",
                reverseButtons: true,
                customClass: {
                    popup: "bg-main-dark text-white", // 🟩 Tailwind class di sini
                    confirmButton:
                        "bg-primary text-white px-4 mx-2 py-2 rounded",
                    cancelButton:
                        "bg-gray-500 text-white px-4 mx-2 py-2 rounded",
                },
            })
            .then((result) => {
                if (result.isConfirmed) {
                    deleteBot(id)
                        .then(() => {
                            swalWithBootstrapButtons.fire({
                                title: "Deleted!",
                                text: "Your bot has been deleted.",
                                icon: "success",
                                customClass: {
                                    popup: "bg-main-dark text-white", // 🟩 Tailwind class di sini
                                    confirmButton:
                                        "bg-primary text-white px-4 mx-2 py-2 rounded",
                                    cancelButton:
                                        "bg-gray-500 text-white px-4 mx-2 py-2 rounded",
                                },
                            });
                        })
                        .catch((error) => {
                            console.error("Error deleting bot:", error);
                            swalWithBootstrapButtons.fire({
                                title: "Error!",
                                text: "There was an error deleting your bot.",
                                icon: "error",
                                customClass: {
                                    popup: "bg-main-dark text-white", // 🟩 Tailwind class di sini
                                    confirmButton:
                                        "bg-primary text-white px-4 mx-2 py-2 rounded",
                                    cancelButton:
                                        "bg-gray-500 text-white px-4 mx-2 py-2 rounded",
                                },
                            });
                        });
                } else if (
                    /* Read more about handling dismissals below */
                    result.dismiss === Swal.DismissReason.cancel
                ) {
                    swalWithBootstrapButtons.fire({
                        title: "Cancelled",
                        text: "Your bot is safe :)",
                        icon: "error",
                        customClass: {
                            popup: "bg-main-dark text-white", // 🟩 Tailwind class di sini
                            confirmButton:
                                "bg-primary text-white px-4 mx-2 py-2 rounded",
                            cancelButton:
                                "bg-gray-500 text-white px-4 mx-2 py-2 rounded",
                        },
                    });
                }
            });
    };
    useEffect(() => {
        if (selectedBot) {
            router.push(`/improve?bot-id=${selectedBot.id}`);
        }
    }, [selectedBot]);
    return (
        <div className="dark:bg-dark min-h-screen px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2AB6A6] mb-1">
                        Agenten verwalten
                    </h1>
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
                <div className="flex items-center justify-center h-64 w-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2AB6A6]"></div>
                </div>
            ) : bots.length > 0 ? (
                <BotList
                    name="Beispiel Bot"
                    bots={bots}
                    description="Dies ist ein Beispiel-Chatbot, um die Funktionalität zu demonstrieren."
                    className=""
                    setSelectedBot={setSelectedBot}
                    onDelete={handleDelete}
                />
            ) : (
                <div className="text-center py-20 border border-dashed border-[#D9F4F0] rounded-2xl bg-white dark:bg-chatbot-darker shadow-xl">
                    <div className="mx-auto w-16 h-16 rounded-full bg-[#D9F4F0] flex items-center justify-center mb-4">
                        <Bot className="h-8 w-8 text-[#2AB6A6]" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#2AB6A6] mb-2">
                        Erstelle deinen ersten KI-Chatbot
                    </h3>
                    <p className="text-gray-500 dark:text-gray-300 mb-6 max-w-md mx-auto">
                        Baue einen individuellen KI-Agenten für dein Business.
                        Wähle aus Vorlagen oder starte von Grund auf neu.
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
