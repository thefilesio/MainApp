import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
interface Message {
    id: string;
    content: string;
    sender: "user" | "bot";
    timestamp: Date;
}

interface ChatInterfaceProps {
    botName?: string;
    title?: string; // Optional prop for title
    widgetId?: string; // Optional prop for widget ID
    className?: string;
    botId?: string;
    chooseColor?: string; // Optional prop for custom color
    bots?: any[]; // Optional prop for bots, if needed
    openingMessage?: string; // Optional prop for initial message
    rules?: string; // Optional prop for rules or guideline
    urlProfile?: string; // Optional prop for user profile URL
    setMessages?: any; // Function to set messages, can be any type
    messages?: Message[]; // Initial messages to display
    logoIconURL?: string; // URL for the bot's logo icon
    isDarkMode?: boolean; // Optional prop to determine if dark mode is enabled
}

const ChatInterfaceUser = ({
    botName = "Chatbot",
    title = "Chat Interface",
    botId,
    className = "",
    chooseColor,
    openingMessage,
    urlProfile,
    setMessages,
    logoIconURL,
    widgetId,
    isDarkMode = false, // Default to false if not provided
    messages = [
        {
            id: "welcome-message",
            content:
                openingMessage ||
                `Hello! I'm ${botName}. How can I help you today?`,
            sender: "bot",
            timestamp: new Date(),
        },
    ],
    rules,
}: ChatInterfaceProps) => {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const [isLimitReached, setIsLimitReached] = useState(false);
    const [botColor, setBotColor] = useState("#4f46e5");

    useEffect(() => {
        // change bot background color if chooseColor is provided
        if (chooseColor) {
            // make dark color from chooseColor
            const deepColor = chooseColor.replace(/^#/, "");
            if (deepColor.length === 6) {
                const r = parseInt(deepColor.slice(0, 2), 16);
                const g = parseInt(deepColor.slice(2, 4), 16);
                const b = parseInt(deepColor.slice(4, 6), 16);
                // Convert to a d arker shade
                const darkColor = `#${Math.max(r - 110, 0)
                    .toString(16)
                    .padStart(2, "0")}${Math.max(g - 110, 0)
                    .toString(16)
                    .padStart(2, "0")}${Math.max(b - 110, 0)
                    .toString(16)
                    .padStart(2, "0")}`;
                setBotColor(darkColor);
            } else {
                console.warn(
                    "Invalid color format. Expected hex format like #RRGGBB."
                );
                setBotColor("#4f46e5"); // Fallback to default color
            }
        }
    }, [chooseColor]);

    useEffect(() => {
        // Scroll ke elemen paling bawah saat render/mount
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    useEffect(() => {
        // Scroll ke elemen paling bawah saat ada perubahan pada messages
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [openingMessage]);

    const handleSendMessage = async () => {
        if (!input.trim()) {
            toast({
                title: "Error",
                description: "Please enter a message before sending.",
                variant: "destructive",
            });
            return;
        }

        // Add user message
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            content: input,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev: any) => [...prev, userMessage]);
        setInput("");
        setLoading(true);
        try {
            let res: Response | undefined;
            try {
                res = await fetch("/api/widget", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        messages: [
                            {
                                role: "system",
                                content: `You are ${rules}`,
                            },

                            ...messages.map((m) => ({
                                role:
                                    m.sender === "user" ? "user" : "assistant",
                                content: m.content,
                            })),
                            { role: "user", content: input },
                        ],
                        botId: botId || "default-bot-id", // Use a default bot ID if none is provided
                        widgetId: widgetId || "", // Use a default widget ID if none is provided
                    }),
                });
            } catch (error) {
                console.error("Fetch error:", error);
            }
            let data: any = { message: { content: "No response from bot." } };
            if (res && res.ok) {
                try {
                    data = await res.json();
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            } else if (res && !res.ok) {
                try {
                    data = await res.json();
                    data.message = {
                        content: data.error || "Error from server.",
                    };
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            }

            const botMessage: Message = {
                id: `bot-${Date.now()}`,
                content: data.message.content || "No response from bot.",
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            console.error("Error sending message:", err);
            setMessages((prev) => [
                ...prev,
                {
                    id: `bot-error-${Date.now()}`,
                    content: "Fehler bei der Kommunikation mit OpenAI.",
                    sender: "bot",
                    timestamp: new Date(),
                },
            ]);
            setLoading(false);
            console.error("Error sending message:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={
                "flex flex-col h-[600px]  border  overflow-hidden " + className
            }
            style={{ borderRadius: "10px" }}
        >
            <style jsx>{`
                .mainColor {
                    background-color: ${chooseColor || "#4f46e5"} !important;
                }
            `}</style>
            <div className="bg-muted/30 p-4  mainColor">
                <div className="flex items-center mb-2">
                    {logoIconURL && (
                        <div className="mr-4">
                            <div className="h-10 w-10">
                                <img
                                    src={logoIconURL}
                                    alt={botName}
                                    className="w-full h-full"
                                />
                            </div>
                        </div>
                    )}
                    <h2 className="font-medium text-white">{title}</h2>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${
                                message.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }
                            text-white
                            

                            
                            `}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-3 rounded-xl ${
                                    message.sender === "user"
                                        ? `mainColor text-accent-foreground`
                                        : `text-secondary-foreground ${
                                              isDarkMode ? "bg-gray-700" : ""
                                          }  ${isDarkMode ? "dark" : ""}`
                                }`}
                                style={
                                    message.sender != "user"
                                        ? { backgroundColor: botColor }
                                        : {}
                                }
                            >
                                {message.sender === "bot" && (
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Avatar className="h-6 w-6">
                                            {urlProfile ? (
                                                <img
                                                    src={urlProfile}
                                                    alt={botName}
                                                    className="w-full h-full rounded-full"
                                                />
                                            ) : (
                                                <div className="bg-black text-primary-foreground text-xs flex items-center justify-center w-full h-full">
                                                    {botName.charAt(0)}
                                                </div>
                                            )}
                                        </Avatar>
                                        <span className="text-xs font-medium">
                                            {botName}
                                        </span>
                                    </div>
                                )}
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                                <div
                                    className={`text-xs mt-1 ${
                                        message.sender === "user"
                                            ? "text-accent-foreground/70"
                                            : "text-muted-foreground"
                                    }`}
                                >
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div
                            className="max-w-[40%] px-4 py-3 rounded-xl  dark:text-secondary-foreground
                            text-white "
                            style={{
                                backgroundColor: botColor,
                            }}
                        >
                            <div
                                className="flex items-center space-x-2 mb-1"
                                style={{ color: "black !important" }}
                            >
                                <Avatar className="h-6 w-6">
                                    {urlProfile ? (
                                        <img
                                            src={urlProfile}
                                            alt={botName}
                                            className="w-full h-full rounded-full"
                                        />
                                    ) : (
                                        <div className="bg-black text-primary-foreground text-xs flex items-center justify-center w-full h-full">
                                            {botName.charAt(0)}
                                        </div>
                                    )}
                                </Avatar>
                                <span className="text-xs font-medium">
                                    {botName}
                                </span>
                            </div>
                            <p className="bg-muted px-4 py-3 rounded-xl max-w-[80%]">
                                <span className="animate-pulse text-muted-foreground">
                                    Typing...
                                </span>
                            </p>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="flex items-center space-x-2"
                >
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className={`min-h-12 resize-none ${
                            isDarkMode
                                ? "bg-gray-800 text-white"
                                : "bg-white text-black"
                        }`}
                        style={
                            isDarkMode
                                ? {
                                      backgroundColor: "#1f2937",
                                      color: "#f3f4f6",
                                  }
                                : {
                                      backgroundColor: "#ffffff",
                                      color: "#000000",
                                  }
                        }
                        disabled={loading}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={loading}
                        style={{ backgroundColor: chooseColor || "#4f46e5" }}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterfaceUser;
