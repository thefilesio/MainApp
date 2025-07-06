import { useState, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import ChatInterfaceUser from "@/components/ChatInterfaceUser";
import { toast } from "sonner";
import { useLoading } from "@/contexts/LoadingContext";
import { useWidgets } from "@/hooks/useWidgets";
import { useRouter } from "next/router";
interface Message {
    id: string;
    content: string;
    sender: "user" | "bot";
    timestamp: Date;
}
const Widget = () => {
    // get param id from url
    const router = useRouter();
    const { botId } = router.query;

    const { setLoading } = useLoading();
    const [loading, setLoadingState] = useState(true);

    const [selectedBot, setSelectedBot] = useState("");
    const [demoName, setDemoName] = useState<string | null>(null);
    const [themeColor, setThemeColor] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
    const [titleChat, setTitleChat] = useState<string | null>("Chat Interface");
    const [popupText, setPopupText] = useState("Ask me anything!");
    const [isPopupVisible, setIsPopupVisible] = useState(true);
    const [logoIconURL, setLogoIconURL] = useState<string | null>();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome-message",
            content: welcomeMessage?.toString() || "Welcome to the demo!",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [widgetId, setWidgetId] = useState<string | null>(
        botId?.toString() || null
    );
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [promptText, setPromptText] = useState("");
    const { findWidgetById } = useWidgets();

    useEffect(() => {
        setLoading(true);

        if (widgetId) {
            findWidgetById(widgetId).then((widget) => {
                if (widget) {
                    setSelectedBot(widget.bot_id);
                    setDemoName(widget.bots.name);
                    setThemeColor(widget.color);
                    setAvatarUrl(widget.avatar_url);
                    setWelcomeMessage(widget.welcome_msg);
                    setTitleChat(widget.title);
                    setIsDarkMode(widget.theme === "dark");
                    setLogoIconURL(widget.logo_url || null);
                    setPopupText(widget.popup_text || "");
                    setMessages([
                        {
                            id: "welcome-message",
                            content:
                                widget.welcome_msg || "Welcome to the demo!",
                            sender: "bot",
                            timestamp: new Date(),
                        },
                    ]);

                    loadPromptContent(
                        widget.bots.latest_version.prompt_snapshot || []
                    ).then(() => {
                        setLoading(false);
                        setLoadingState(false);
                    });
                } else {
                    console.error("Widget not found");
                }
            });
        }
    }, [widgetId]);

    const loadPromptContent = async (prompts) => {
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
            // console.log("Combined prompt content:", combinedContent);
            setPromptText(combinedContent);
        } catch (error) {
            console.error("Error loading prompt content:", error);
        }
    };

    return (
        <CardContent className="p-0 m-0 flex items-end w-full h-full text-white">
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100vh",
                    background: isDarkMode ? "#1a1a1a" : "#ffffff",
                    color: "#ffffff",
                }}
            >
                {!loading ? (
                    <ChatInterfaceUser
                        botName={demoName?.toString() || "Demo Bot"}
                        title={titleChat?.toString() || "Chat Interface"}
                        botId={selectedBot}
                        chooseColor={themeColor?.toString() || "#3a9e91"}
                        openingMessage={
                            welcomeMessage?.toString() ||
                            "Hello! How can I help you today?"
                        }
                        urlProfile={avatarUrl?.toString() || ""}
                        messages={messages}
                        setMessages={setMessages}
                        logoIconURL={logoIconURL?.toString() || ""}
                        className={`w-full h-full`}
                        rules={promptText}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        <p className="text-lg text-gray-500">Loading...</p>
                    </div>
                )}
            </div>
        </CardContent>
    );
};

export default Widget;
