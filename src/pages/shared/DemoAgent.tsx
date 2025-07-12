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
import { useRouter } from "next/navigation";
interface Message {
    id: string;
    content: string;
    sender: "user" | "bot";
    timestamp: Date;
}
const DemoAgent = () => {
    const { bots, isLoading: isBotsLoading } = useBots();
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [selectedBot, setSelectedBot] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [welcomeMessage, setWelcomeMessage] = useState(
        "Hi there! How can I help you today?"
    );

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome-message",
            content: welcomeMessage || `Hello! How can I help you today?`,
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [themeColor, setThemeColor] = useState("#3a9e91");
    const [demoName, setDemoName] = useState("My Demo Bot");
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
    const [embedCode, setEmbedCode] = useState("");
    const [codeCopied, setCodeCopied] = useState(false);
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
        console.log("Selected Bot ID:", selectedBot);
        if (isBotsLoading) return; // ⛔️ Jangan lakukan apa pun saat masih loading

        if (bots.length === 0) {
            setSelectedBot("");
            toast.error("No bots available. Please create a bot first.");
        } else if (!bots.some((bot) => bot.id === selectedBot)) {
            setSelectedBot(bots[0].id);
        }

        loadPromptContent();

        setIsLoading(false);
    }, [
        bots,
        isBotsLoading,
        demoName,
        welcomeMessage,
        avatarUrl,
        logoUrl,
        selectedBot,
    ]);

    const handleCreateDemo = () => {
        // window.open(`/shared/${selectedBot}`, "_blank");
        if (!selectedBot) {
            toast.error("Please select a bot to create a demo.");
            return;
        }

        if (!demoName) {
            toast.error("Please enter a name for the demo agent.");
            return;
        } else if (!welcomeMessage) {
            toast.error("Please enter a welcome message for the demo agent.");
            return;
        }

        window.open(
            `/live/${selectedBot}?demoName=${encodeURIComponent(
                demoName
            )}&welcomeMessage=${encodeURIComponent(
                welcomeMessage
            )}&logoUrl=${encodeURIComponent(
                logoUrl
            )}&avatarUrl=${encodeURIComponent(
                avatarUrl
            )}&themeColor=${encodeURIComponent(themeColor)}`,
            "_blank"
        );
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

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 max-h-[88vh] ">
            <div className="max-w-7xl mx-auto   ">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#2AB6A6] mb-1">
                            Demo Agent
                        </h1>
                        <p className="text-gray-500 dark:text-gray-300 mt-2 text-base">
                            Create a demo agent to showcase your bot's
                            capabilities. Customize the appearance and embed it
                            on yo ur website.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1  mt-4   lg:grid-cols-3 gap-6">
                    <Card className="rounded  shadow-md lg:col-span-1 bg-white dark:bg-main-dark overflow-y-auto max-h-[85vh] ">
                        <CardContent className="p-6 space-y-6 dark:text-white">
                            <div className="space-y-2">
                                <Label htmlFor="demo-name">Demo Name</Label>
                                <Input
                                    id="demo-name"
                                    value={demoName}
                                    onChange={(e) =>
                                        setDemoName(e.target.value)
                                    }
                                    placeholder="My Demo Bot"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bot-select">Select Bot</Label>
                                <Select
                                    value={selectedBot}
                                    onValueChange={setSelectedBot}
                                >
                                    <SelectTrigger id="bot-select">
                                        <SelectValue placeholder="Select a bot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bots.map((bot) => (
                                            <SelectItem
                                                key={bot.id}
                                                value={bot.id}
                                            >
                                                {bot.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="theme-mode"
                                    className="block mb-2"
                                >
                                    Theme Mode
                                </Label>
                                <div className="flex items-center space-x-2">
                                    <Toggle
                                        pressed={!isDarkMode}
                                        onPressedChange={() => toggleTheme()}
                                        className="data-[state=on]:bg-primary rounded-full dark:text-white data-[state=on]:text-white"
                                        size="sm"
                                        aria-label="Toggle light mode"
                                    >
                                        <Sun className="h-4 w-4" />
                                    </Toggle>
                                    <Toggle
                                        pressed={isDarkMode}
                                        onPressedChange={() => toggleTheme()}
                                        className="data-[state=on]:bg-primary rounded-full dark:text-white data-[state=on]:text-white"
                                        size="sm"
                                        aria-label="Toggle dark mode"
                                    >
                                        <Moon className="h-4 w-4" />
                                    </Toggle>
                                    <span className="text-sm text-muted-foreground dark:text-white">
                                        {isDarkMode
                                            ? "Dark mode"
                                            : "Light mode"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="logo-url">Logo URL</Label>
                                <Input
                                    id="logo-url"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="avatar-url">Avatar URL</Label>
                                <Input
                                    id="avatar-url"
                                    value={avatarUrl}
                                    onChange={(e) =>
                                        setAvatarUrl(e.target.value)
                                    }
                                    placeholder="https://example.com/avatar.png"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="theme-color">Theme Color</Label>
                                <div className="flex gap-3">
                                    <Input
                                        type="color"
                                        id="theme-color"
                                        value={themeColor}
                                        onChange={(e) =>
                                            setThemeColor(e.target.value)
                                        }
                                        className="w-12 h-10"
                                    />
                                    <Input
                                        value={themeColor}
                                        onChange={(e) =>
                                            setThemeColor(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="welcome-message">
                                    Welcome Message
                                </Label>
                                <Input
                                    id="welcome-message"
                                    value={welcomeMessage}
                                    onChange={(e) =>
                                        setWelcomeMessage(e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex flex-col gap-3 pt-4">
                                <Button
                                    className="w-full transition-opacity hover:bg-opacity-90"
                                    onClick={handleCreateDemo}
                                    disabled={!selectedBot || !demoName}
                                >
                                    View Live
                                </Button>
                                {/* <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleEmbedAgent}
                                    disabled={!selectedBot}
                                >
                                    Embed Agent
                                </Button> */}
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="lg:col-span-2   rounded-xl w-full h-[85vh] text-white shadow-md overflow-hidden"
                        style={{
                            transition:
                                "background-color 0.3s ease, color 0.3s ease",
                            backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
                        }}
                    >
                        <CardContent className="p-0 flex items-end w-full h-full rounded-xl">
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
                                        background: themeColor,
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
                                            src={logoUrl}
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
                                               
                                                fill="#ffffff"
                                                height={bubbleSize * 0.5 + "px"}
                                                viewBox="0 0 60 60"
                                                width={bubbleSize * 0.5 + "px"}
                                                version="1.1"
                                                id="Capa_1"
                                                
                                               
                                            >
                                                <path d="M55.232,43.104C58.354,38.746,60,33.705,60,28.5c0-14.888-13.458-27-30-27S0,13.612,0,28.5s13.458,27,30,27  c4.262,0,8.378-0.79,12.244-2.348c6.805,3.927,16.212,5.282,16.618,5.338c0.046,0.007,0.093,0.01,0.139,0.01  c0.375,0,0.725-0.211,0.895-0.554c0.192-0.385,0.116-0.849-0.188-1.153C57.407,54.493,55.823,49.64,55.232,43.104z" />
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
                                                bottom: bubbleSize,
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
                                                botName={demoName || "Demo Bot"}
                                                botId={selectedBot}
                                                chooseColor={themeColor}
                                                openingMessage={welcomeMessage}
                                                urlProfile={avatarUrl}
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

                {/* Embed Code Modal */}
                {/* <Dialog
                    open={isEmbedModalOpen}
                    onOpenChange={setIsEmbedModalOpen}
                >
                    <DialogContent className="sm:max-w-[600px] bg-white p-6 rounded shadow-lg">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">
                                Embed Demo Agent
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Copy this code and paste it into your website to
                                embed the demo agent.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4">
                            <div className="relative">
                                <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm max-w-full">
                                    <code className="whitespace-pre-wrap">
                                        {embedCode}
                                    </code>
                                </pre>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={copyToClipboard}
                                >
                                    {codeCopied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog> */}
            </div>
        </div>
    );
};

export default DemoAgent;
