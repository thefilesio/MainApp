import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ChatInterface from "@/components/ChatInterface";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Copy, Moon, Sun, Check } from "lucide-react";
import { useBots } from "@/hooks/useBots";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { usePrompts } from "@/hooks/usePrompts";
import { useLoading } from "@/contexts/LoadingContext";
import { useRouter } from "next/router";
import withAuth from "@/hooks/use-auth";
interface Message {
    id: string;
    content: string;
    sender: "user" | "bot";
    timestamp: Date;
}
const DemoLive = () => {
    const router = useRouter();
    const { botId,demoName, welcomeMessage, avatarUrl, logoUrl ,themeColor} = router.query; // get botId from URL
    // get query parameter domoName from URL


    const { bots, isLoading: isBotsLoading } = useBots();
    const { setLoading } = useLoading();

    const [selectedBot, setSelectedBot] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome-message",
            content: welcomeMessage?.toString() || "Welcome to the demo!",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [openChat, setOpenChat] = useState(false);
    const [position, setPosition] = useState("bottom-right");
    const [promptText, setPromptText] = useState("");

    const bubbleSize = 50; // Size of the chat bubble
    const width = 400;
    const height = 600; // Height of the chat interface
    const bg = isDarkMode ? "#1a1a1a" : "#ffffff"; // Background color
    const fg = isDarkMode ? "#ffffff" : "#000000"; // Foreground color
    const { prompts } = usePrompts(selectedBot);

    useEffect(() => {
        setLoading(true);
            console.log("Demo Name from URL:", demoName);
        setSelectedBot((botId as string) || "");

        if (isBotsLoading) return; // ⛔️ Jangan lakukan apa pun saat masih loading

        if (bots.length === 0) {
            setSelectedBot("");
            toast.error("No bots available. Please create a bot first.");
        } else if (!bots.some((bot) => bot.id === selectedBot)) {
            setSelectedBot(bots[0].id);
        }

        loadPromptContent();
        setLoading(false);
    }, [
        bots,
        isBotsLoading,
        demoName,
        welcomeMessage,
        avatarUrl,
        logoUrl,
        selectedBot,
    ]);

    //  useEffect(() => {
    //     setParamId(params?.botId || null);
    //     if (paramId) {
    //         setSelectedBot(paramId);
    //     } else if (bots.length > 0) {
    //         setSelectedBot(bots[0].id);
    //     }
    //         console.log("Param ID:", paramId);

    // }, [params?.botId, bots]);

    const handleCreateDemo = () => {
        // Implementation would connect to backend
        console.log("Creating demo with settings:", {
            selectedBot,
            logoUrl,
            avatarUrl,
            welcomeMessage,
            themeColor,
            demoName,
            isDarkMode,
        });
        toast.success("Demo created successfully!");
    };

    const loadPromptContent = async () => {
        if (selectedBot) {
            try {
                const step1 = prompts.find((p) => p.step === 1);
                const step2 = prompts.find((p) => p.step === 2);
                let combinedContent = "";
                if (step1) {
                    const content = JSON.parse(step1!.content || "{}");

                    combinedContent = `~Personality\n${
                        content!.personality || ""
                    }\n~Personality\n\n~Purpose\n${
                        content!.purpose || ""
                    }\n~Purpose\n\n~Tone\n${content!.tone || ""}\n~Tone\n\n`;
                }

                if (step2) {
                    try {
                        const content2 = JSON.parse(step2!.content || "{}");

                        combinedContent += `\n\n~Rules\n${
                            content2!.rules
                        }\n~Rules\n\n~FAQ\n${content2!.faq}\n~FAQ\n`;
                    } catch (error) {
                        console.log("Error parsing step 2 content:", error);
                    }
                }
                setPromptText(combinedContent);
            } catch (error) {
                console.error("Error loading prompt content:", error);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-7xl mx-auto   ">
                <div className="w-full">
                    <Card
                        className="lg:col-span-2   rounded-xl w-full h-[95vh] text-white shadow-md overflow-hidden"
                        style={{
                            transition:
                                "background-color 0.3s ease, color 0.3s ease",
                            backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
                        }}
                    >
                        <CardContent className="p-0 flex items-end w-full h-full">
                            <div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    height: "75%",
                                }}
                            >
                                {/* Bubble Button */}
                                <div
                                    style={{
                                        position: "absolute",
                                        zIndex: 10,
                                        bottom: 24,
                                        [position === "bottom-left"
                                            ? "left"
                                            : "right"]: 24,
                                        width: bubbleSize + "px",
                                        height: bubbleSize + "px",
                                        borderRadius: "50%",
                                        background: themeColor?.toString() || "#3a9e91",
                                        display: openChat ? "none" : "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow:
                                            "0 4px 12px rgba(0,0,0,0.15)",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setOpenChat(true)}
                                >
                                    {logoUrl ? (
                                        <img
                                            src={logoUrl.toString()}
                                            alt="Chat"
                                            style={{
                                                width: bubbleSize * 0.5 + "px",
                                                height: bubbleSize * 0.5 + "px",
                                            }}
                                        />
                                    ) : (
                                        <div>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={bubbleSize * 0.5}
                                                height={bubbleSize * 0.5}
                                                viewBox="0 0 24 24"
                                                fill={
                                                    isDarkMode
                                                        ? "#ffffff"
                                                        : "#000000"
                                                }
                                                stroke="#001A72"
                                            >
                                                <path
                                                    d="M20 4H4V16H7V21L12 16H20V4Z"
                                                    stroke="#001A72"
                                                    stroke-width="1.5"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <AnimatePresence>
                                    {openChat && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 30 }}
                                            transition={{ duration: 0.3 }}
                                            style={{
                                                position: "absolute",
                                                zIndex: 20,
                                                bottom: bubbleSize ,
                                                [position === "bottom-left"
                                                    ? "left"
                                                    : "right"]: 24,
                                                width: width + "px",
                                                height: height + "px",
                                                background: bg,
                                                color: fg,
                                                boxShadow:
                                                    "0 8px 24px rgba(0,0,0,0.25)",
                                                display: "flex",
                                                flexDirection: "column",
                                                overflow: "hidden",
                                            }}
                                            className="rounded"
                                        >
                                            <button
                                                className="absolute top-3 right-5"
                                                onClick={() =>
                                                    setOpenChat(false)
                                                }
                                                style={{
                                                    color: "#fff",
                                                    background: "none",
                                                    border: "none",
                                                    fontSize: 20,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                ✖
                                            </button>
                                            <ChatInterface
                                                botName={demoName?.toString() || "Demo Bot"}
                                                botId={selectedBot}
                                                chooseColor={themeColor?.toString() || "#3a9e91"}
                                                openingMessage={welcomeMessage?.toString() || "Hello! How can I help you today?"}
                                                urlProfile={avatarUrl?.toString() || ""}
                                                messages={messages}
                                                setMessages={setMessages}
                                                className="w-full h-full"
                                                rules={promptText}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default withAuth(DemoLive);
