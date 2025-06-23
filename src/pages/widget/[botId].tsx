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
    const { botId, demoName, welcomeMessage, avatarUrl, logoUrl, themeColor } =
        router.query; // get botId from URL
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
        <CardContent className="p-0 m-0 flex items-end w-full h-full text-white">
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100vh",
                }}
            >
                <ChatInterface
                    botName={demoName?.toString() || "Demo Bot"}
                    botId={selectedBot}
                    chooseColor={themeColor?.toString() || "#3a9e91"}
                    openingMessage={
                        welcomeMessage?.toString() ||
                        "Hello! How can I help you today?"
                    }
                    urlProfile={avatarUrl?.toString() || ""}
                    messages={messages}
                    setMessages={setMessages}
                    className="w-full h-full"
                    rules={promptText}
                />
            </div>
        </CardContent>
    );
};

export default DemoLive;
