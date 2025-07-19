// LaunchAgent.tsx
import { use, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
    Check,
    Copy,
    Globe,
    Facebook,
    Instagram,
    MessageSquare,
    Rocket,
    Smartphone,
    ChevronDown,
    Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBots } from "@/hooks/useBots";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import EmbedSnippet from "@/components/ui/EmbedSnippet";
import { Switch } from "@/components/ui/switch";
import ChatWidget from "@/components/ChatWidget";
import { supabase, SUPABASE_KEY } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useApiKeyContext } from "@/contexts/ApiKeyContext";
import { toast, toast as toastLib } from "sonner";
import ChatInterface from "@/components/ChatInterface";
import { useWidgets } from "@/hooks/useWidgets";
import { motion, AnimatePresence } from "framer-motion";
import { t } from "framer-motion/dist/types.d-B_QPEvFK";
import { usePrompts } from "@/hooks/usePrompts";
import { useLoading } from "@/contexts/LoadingContext";
import Swal from "sweetalert2";

const DemoPage = () => {
    const { bots } = useBots();
    const { translations } = useLanguage();
    const { user } = useAuth();
    const [loading, setLoadings] = useState(false);
    const { setLoading } = useLoading();

    const [isIntegrationTypeModalOpen, setIsIntegrationTypeModalOpen] =
        useState(false);
    const [isWidgetEditorOpen, setIsWidgetEditorOpen] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState<
        string | null
    >(null);

    const [botStatus, setBotStatus] = useState<"draft" | "published">("draft");

    const [position, setPosition] = useState("bottom-right");
    const [color, setColor] = useState("#3a9e91");
    const [widgetTitle, setWidgetTitle] = useState("Chat with us");
    const [selectedBot, setSelectedBot] = useState<string>("");
    const [botName, setBotName] = useState<string>("");
    const [connectionName, setConnectionName] = useState("");
    const [popupDelay, setPopupDelay] = useState(0);

    const [createConnection, setCreateConnection] = useState({
        name: "",
        botId: "",
        integrationType: "",
    });

    const [openChat, setOpenChat] = useState(true);

    const [logoUrl, setLogoUrl] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [buttonIconUrl, setButtonIconUrl] = useState("");
    const [widgetSetup, setWidgetSetup] = useState({
        width: 400,
        height: 500,
    });
    const [widgetId, setWidgetId] = useState<string>("");
    const [welcomeMessage, setWelcomeMessage] = useState(
        "Hi there! How can I help you today?"
    );
    const [widgetWidth, setWidgetWidth] = useState("400");
    const [widgetHeight, setWidgetHeight] = useState("500");
    const [widgetCollapsed, setWidgetCollapsed] = useState(true);
    const [activeWidgetTab, setActiveWidgetTab] = useState("appearance");
    const [limitChat, setLimitChat] = useState(10);
    const [promptText, setPromptText] = useState("");

    const [connections, setConnections] = useState<any[]>([]);
    const [showEmbed, setShowEmbed] = useState(false);

    const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
    const [popupText, setPopupText] = useState("Ask me anything!");
    const [isPopupVisible, setIsPopupVisible] = useState(true);

    const [bubbleSize, setBubbleSize] = useState(56);
    const [open, setOpen] = useState(false);
    const { prompts } = usePrompts(selectedBot);
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

    const [messages, setMessages] = useState<
        {
            id: string;
            content: string;
            sender: "bot" | "user";
            timestamp: Date;
        }[]
    >([
        {
            id: "welcome-message",
            content: welcomeMessage || "Hi there! How can I help you today?",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const bg = previewTheme == "dark" ? "#1a1a1a" : "#ffffff";
    const fg = previewTheme == "dark" ? "#ffffff" : "#000000";

    const storeConnection = async () => {
       
        setLoading(true);
        if (!user) {
            toast.error("You must be logged in to create a widget.");
            return;
        }
        const widgetData = {
            bot_id: selectedBot,
            user_id: user.id,
            title: widgetTitle,
            welcome_msg: welcomeMessage,
            theme: previewTheme,
            color,
            avatar_url: avatarUrl,
            logo_url: logoUrl,
            icon_url: buttonIconUrl,
            position,
            bubble_size: bubbleSize,
            width: Number(widgetWidth),
            height: Number(widgetHeight),
            popup_text: popupText,
            popup_delay: popupDelay,
            limit_chat: limitChat,
            is_demo: true, // Set to true for demo widgets
        };

        const { data, error } = await supabase
            .from("widgets")
            .insert([widgetData])
            .select()
            .single();
        if (error) {
            setLoading(false);
            toast.error("Failed to save widget. Please try again later.");
        } else {
            setLoading(false);
            toast.success(
                "Widget saved successfully! You can now embed it on your website."
            );
            resetForm();
            setBotStatus("published");
            reloadWidgets();
            setIsWidgetEditorOpen(false); // Optional: Widget-Liste neu laden oder UI updaten
        }
    };

    const updateConnection = async () => {
        
        setLoading(true);
        if (!user) {
            toast.error("You must be logged in to create a widget.");
            return;
        }

        const widgetData = {
            bot_id: selectedBot,
            user_id: user.id,
            title: widgetTitle,
            welcome_msg: welcomeMessage,
            theme: previewTheme,
            color,
            avatar_url: avatarUrl,
            logo_url: logoUrl,
            icon_url: buttonIconUrl,
            position,
            popup_delay: popupDelay,
            bubble_size: bubbleSize,
            width: Number(widgetSetup.width),
            height: Number(widgetSetup.height),
            popup_text: popupText,
            limit_chat: limitChat,
            is_demo: true, // Set to true for demo widgets
        };

        const { data, error } = await supabase
            .from("widgets")
            .update(widgetData)
            .eq("id", connections.find((c) => c.buildId === selectedBot)?.id)
            .select()
            .single();
        if (error) {
            setLoading(false);
            toast.error("Failed to save widget. Please try again later.");
        } else {
            setLoading(false);
            reloadWidgets();
            toast.success(
                "Widget updated successfully! You can now embed it on your website."
            );
        }
    };

    const resetForm = () => {
        setWidgetTitle("Chat with us");
        setSelectedBot("");
        setLogoUrl("");
        setAvatarUrl("");
        setButtonIconUrl("");
        setWelcomeMessage("Hi there! How can I help you today?");
        setWidgetWidth("400");
        setWidgetHeight("500");
        setWidgetSetup({
            width: 400,
            height: 500,
        });
        setLogoUrl("");
        setPosition("bottom-right");
        setPopupDelay(0);
        setColor("#3a9e91");
        setBubbleSize(56);
        setPreviewTheme("dark");
        setPopupText("Ask me anything!");
        setOpen(false);
        setLimitChat(10);
        setMessages([
            {
                id: "welcome-message",
                content: "Hi there! How can I help you today?",
                sender: "bot",
                timestamp: new Date(),
            },
        ]);
        setShowEmbed(false);
        setIsWidgetEditorOpen(false);
        setIsIntegrationTypeModalOpen(false);
        setSelectedIntegration(null);
        setConnectionName("");
        setShowEmbed(false);
        setIsPopupVisible(true);
        setBotStatus("draft");
    };

    const handleCreateConnection = async () => {
        if (!user) {
            toast.error("You must be logged in to create a connection.");
            return;
        }
        resetForm();
        setIsIntegrationTypeModalOpen(true);
    };

    const handleEditConnection = (connection: any) => {
        console.log("Editing connection:", connection);
        setSelectedBot(connection.buildId);
        setWidgetId(connection.id);
        setBotName(bots.find((b) => b.id === connection.buildId)?.name || "");
        setLogoUrl(connection.logoUrl || "");
        setAvatarUrl(connection.avatarUrl || "");
        setButtonIconUrl(connection.buttonIconUrl || "");
        setWidgetSetup({
            width: connection.width || 400,
            height: connection.height || 500,
        });
        setPosition(connection.position || "bottom-right");
        setPreviewTheme(connection.theme || "dark");
        setColor(connection.color || "#3a9e91");
        setBubbleSize(connection.bubbleSize || 56);
        setWidgetTitle(connection.name);
        setConnectionName(connection.name);
        setPopupText(connection.popupText || "");
        setPopupDelay(connection.popupDelay || 0);
        setLimitChat(connection.limitChat);
        setBotStatus("published");
        setShowEmbed(true);
        setIsPopupVisible(true);
        setIsWidgetEditorOpen(true);
    };

    useEffect(() => {
        setMessages([
            {
                id: "welcome-message",
                content: welcomeMessage || "Welcome to the demo!",
                sender: "bot",
                timestamp: new Date(),
            },
        ]);
    }, [welcomeMessage]);
    const { fetchWidgets } = useWidgets();

    const reloadWidgets = () => {
        setLoading(true);
        fetchWidgets({ isDemo: true })
            .then((fetchedWidgets) => {
                setConnections(
                    fetchedWidgets.map((widget: any) => ({
                        id: widget.id,
                        name: widget.title,
                        buildName:
                            bots.find((b) => b.id === widget.bot_id)?.name ||
                            "Unknown Bot",
                        welcomeMessage: widget.welcome_msg,
                        integrationType: "website",
                        buildId: widget.bot_id,
                        logoUrl: widget.logo_url,
                        avatarUrl: widget.avatar_url,
                        buttonIconUrl: widget.icon_url,
                        bubbleSize: widget.bubble_size || 56,
                        width: widget.width,
                        height: widget.height,
                        position: widget.position,
                        popupText: widget.popup_text || "",
                        popupDelay: widget.popup_delay || 0,
                        theme: widget.theme,
                        color: widget.color,
                        enabled: true,
                        limitChat: widget.limit_chat,
                    }))
                );
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching widgets:", error);
                setConnections([]);
                setLoading(false);
            });
    };
    useEffect(() => {
        setLoading(true);
        fetchWidgets({ isDemo: true })
            .then((fetchedWidgets) => {
                setConnections(
                    fetchedWidgets.map((widget: any) => ({
                        id: widget.id,
                        name: widget.title,
                        buildName:
                            bots.find((b) => b.id === widget.bot_id)?.name ||
                            "Unknown Bot",
                        welcomeMessage: widget.welcome_msg,
                        integrationType: "website",
                        buildId: widget.bot_id,
                        logoUrl: widget.logo_url,
                        avatarUrl: widget.avatar_url,
                        buttonIconUrl: widget.icon_url,
                        bubbleSize: widget.bubble_size || 56,
                        width: widget.width,
                        height: widget.height,
                        position: widget.position,
                        popupText: widget.popup_text || "",
                        theme: widget.theme,
                        color: widget.color,
                        popupDelay: widget.popup_delay || 0,
                        enabled: true,
                        limitChat: widget.limit_chat,
                    }))
                );
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching widgets:", error);
                setConnections([]);
                setLoading(false);
            });
    }, []);

    const handleIntegrationSelect = (type: string) => {
        setSelectedIntegration(type);
    };

    const integrationTypes = [
        {
            id: "website",
            title: translations.launchAgent.integrationTypes.websiteWidget,
            description:
                translations.launchAgent.integrationTypes.websiteWidgetDesc,
            icon: <Globe className="h-6 w-6" />,
            disabled: false,
        },
        {
            id: "instagram-dms",
            title: translations.launchAgent.integrationTypes.instagramDMs,
            description:
                translations.launchAgent.integrationTypes.instagramDMsDesc,
            icon: <Instagram className="h-6 w-6" />,
            disabled: true,
        },
        {
            id: "facebook-messenger",
            title: translations.launchAgent.integrationTypes.facebookMessenger,
            description:
                translations.launchAgent.integrationTypes.facebookMessengerDesc,
            icon: <Facebook className="h-6 w-6" />,
            disabled: true,
        },
        {
            id: "sms",
            title: translations.launchAgent.integrationTypes.sms,
            description: translations.launchAgent.integrationTypes.smsDesc,
            icon: <Smartphone className="h-6 w-6" />,
            disabled: true,
        },
    ];

    const handleDeleteConnection = (id: string) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                const { error } = await supabase
                    .from("widgets")
                    .delete()
                    .eq("id", id);
                if (error) {
                    toast.error("Failed to delete connection.");
                } else {
                    setConnections((prev) =>
                        prev.filter((conn) => conn.id !== id)
                    );
                    toast.success("Connection deleted successfully.");
                }
                setLoading(false);
            }
        });
    };

    return (
        <div className="dark:bg-dark overflow-y-auto px-4  h-[97vh] py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2AB6A6] mb-1">
                        Demo Agent
                    </h1>
                    <p className="text-gray-500 dark:text-gray-300 mt-2 text-base">
                        Define your demo agent
                    </p>
                </div>
                <Button
                    onClick={handleCreateConnection}
                    className="gap-2 self-start rounded-xl shadow-md px-6 py-3 text-base font-bold bg-[#2AB6A6] hover:bg-[#229b8e] transition-all"
                    size="lg"
                >
                    <Plus className="h-5 w-5" /> Create Demo
                </Button>
            </div>

            {/* Connection List */}
            {connections.length > 0 && (
                <div className="mb-8 text-black dark:text-white  overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-4">
                        Demo Agent List
                    </h2>
                    <div className="space-y-4 ">
                        {connections.map((conn, idx) => (
                            <div
                                key={conn.id}
                                className="flex items-center cursor-pointer justify-between bg-card p-4 rounded shadow dark:bg-main-dark border dark:border-[#22304a] "
                            >
                                <div
                                    onClick={() => {
                                        handleEditConnection(conn);
                                    }}
                                    className="flex-1  mr-4"
                                >
                                    <div className="font-medium">
                                        {conn.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {conn.integrationType} •{" "}
                                        {conn.buildName}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* <Switch
                                        checked={conn.enabled}
                                        onCheckedChange={(val) => {
                                            setConnections((prev) =>
                                                prev.map((c, i) =>
                                                    i === idx
                                                        ? { ...c, enabled: val }
                                                        : c
                                                )
                                            );
                                        }}
                                    /> */}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            handleDeleteConnection(conn.id)
                                        }
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {connections.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-black dark:text-white">
                    <div className="text-center max-w-md mb-8">
                        <div className="mx-auto w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                            <Rocket className="h-8 w-8 text-accent" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            Demo Agent Ready to Launch
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Create your first demo agent to get started.
                        </p>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleCreateConnection}
                        className="gap-2 px-8"
                    >
                        <Plus className="h-5 w-5" />
                        Create Demo Agent
                    </Button>
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center h-64 w-full">
                    <p className="text-lg text-gray-500">
                        Loading connections...
                    </p>
                </div>
            )}

            {/* Integration Type Modal */}
            <Dialog
                open={isIntegrationTypeModalOpen}
                onOpenChange={(open) => {
                    if (!open) setIsIntegrationTypeModalOpen(false);
                }}
            >
                <DialogContent className="sm:max-w-[600px] bg-white dark:bg-main-dark dark:text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            {translations.launchAgent.selectIntegration}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-3">
                            <Label htmlFor="connection-name">
                                {translations.launchAgent.nameConnection}
                            </Label>
                            <Input
                                id="connection-name"
                                value={connectionName}
                                onChange={(e) =>
                                    setConnectionName(e.target.value)
                                }
                                placeholder="My Website Connection"
                            />
                        </div>

                        <div className="grid gap-4">
                            <Label>
                                {translations.launchAgent.selectIntegration}
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {integrationTypes.map((type) => (
                                    <Card
                                        key={type.id}
                                        className={cn(
                                            "cursor-pointer hover:shadow-md transition-shadow",
                                            type.disabled &&
                                                "opacity-50 cursor-not-allowed",
                                            selectedIntegration === type.id &&
                                                !type.disabled
                                                ? "ring-2 ring-primary"
                                                : ""
                                        )}
                                        onClick={() =>
                                            !type.disabled &&
                                            handleIntegrationSelect(type.id)
                                        }
                                    >
                                        <CardContent className="p-6 flex flex-col items-center md:items-start md:flex-row md:space-x-4">
                                            <div className="bg-primary/10 p-3 rounded-full md:mr-3 mb-3 md:mb-0">
                                                {type.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-center md:text-left">
                                                    {type.title}
                                                    {type.disabled && (
                                                        <span className="text-xs ml-2 text-muted-foreground">
                                                            (Coming soon)
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-muted-foreground text-center md:text-left">
                                                    {type.description}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <Label>
                                {translations.launchAgent.selectAiBuild}
                            </Label>
                            <Select
                                value={selectedBot}
                                onValueChange={setSelectedBot}
                                disabled={bots.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            translations.launchAgent
                                                .selectAiBuild
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {bots.map((bot) => (
                                        <SelectItem key={bot.id} value={bot.id}>
                                            {bot.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button
                                onClick={() => {
                                    setCreateConnection({
                                        name: connectionName ?? "",
                                        botId: selectedBot,
                                        integrationType:
                                            selectedIntegration ?? "",
                                    });
                                    setBotName(
                                        bots.find((b) => b.id === selectedBot)
                                            ?.name || ""
                                    );
                                    loadPromptContent()
                                        .then(() => {
                                            setIsIntegrationTypeModalOpen(
                                                false
                                            );
                                            if (
                                                selectedIntegration ===
                                                "website"
                                            )
                                                setIsWidgetEditorOpen(true);
                                        })
                                        .catch((error) => {
                                            setIsIntegrationTypeModalOpen(
                                                false
                                            );

                                            console.error(
                                                "Error loading prompts:",
                                                error
                                            );
                                            toastLib.error(
                                                "Failed to load prompts."
                                            );
                                        });
                                }}
                                disabled={
                                    !connectionName.trim() ||
                                    !selectedBot ||
                                    !selectedIntegration
                                }
                                className="w-full"
                                size="lg"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Widget Editor Modal */}
            <style>{`
                .chat-popup-bubble {
                    position: relative;
                    padding: 10px 16px;
                    padding-right: 36px; /* Beri ruang untuk tombol close */
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    color: #1f2937; /* Teks lebih gelap untuk kontras */
                    font-size: 14px;
                    max-width: 240px;
                    line-height: 1.4;
                }

                .chat-popup-bubble-dark {
                    background: #374151; /* Warna dark mode yang lebih baik */
                    color: #f3f4f6;
                }

                /* CSS untuk membuat "ekor" atau bagian lancip */
                .chat-popup-bubble::after {
                    content: '';
                    position: absolute;
                    bottom: -8px; /* Posisi ekor di bawah bubble */
                    width: 0;
                    height: 0;
                    border-style: solid;
                }

                /* Posisi ekor untuk widget di kanan */
                .chat-popup-bubble.pos-right::after {
                    right: 20px;
                    border-width: 8px 8px 0 8px;
                    border-color: #ffffff transparent transparent transparent;
                }

                /* Posisi ekor untuk widget di kiri */
                .chat-popup-bubble.pos-left::after {
                    left: 20px;
                    border-width: 8px 8px 0 8px;
                    border-color: #ffffff transparent transparent transparent;
                }

                /* Warna ekor untuk mode gelap */
                .chat-popup-bubble-dark.pos-right::after,
                .chat-popup-bubble-dark.pos-left::after {
                    border-color: #374151 transparent transparent transparent;
                }

                /* Tombol Close (X) */
                .popup-close-btn {
                    position: absolute;
                    top: 50%;
                    right: 8px;
                    transform: translateY(-50%);
                    background: transparent;
                    border: none;
                    color: #9ca3af; /* Abu-abu */
                    cursor: pointer;
                    font-size: 24px;
                    padding: 0;
                    line-height: 1;
                    font-weight: bold;
                }
                .popup-close-btn:hover {
                    color: #1f2937; /* Hitam saat hover */
                }
                .chat-popup-bubble-dark .popup-close-btn {
                    color: #9ca3af;
                }
                .chat-popup-bubble-dark .popup-close-btn:hover {
                    color: #ffffff;
                }
            `}</style>
            <Dialog
                open={isWidgetEditorOpen}
                onOpenChange={(open) => {
                    setIsWidgetEditorOpen(open);
                    if (open) {
                        setIsPopupVisible(true); // Selalu reset visibilitas saat modal dibuka
                    }
                }}
            >
                <DialogContent
                    style={{ maxWidth: "90vw", maxHeight: "90vh" }}
                    className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:text-white"
                >
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            Widget Editor -{" "}
                            {botStatus === "draft" ? (
                                <span className="text-yellow-500">Draft</span>
                            ) : (
                                <span className="text-green-500">
                                    Published
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                        {/* Editor Form */}
                        <div className="space-y-4 col-span-1">
                            <div>
                                <Label>Widget Title</Label>
                                <Input
                                    value={widgetTitle}
                                    onChange={(e) =>
                                        setWidgetTitle(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label>Agent</Label>
                                <input
                                    type="text"
                                    value={botName}
                                    readOnly
                                    className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <Label>Logo URL</Label>
                                <Input
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <Label>Avatar URL</Label>
                                <Input
                                    value={avatarUrl}
                                    onChange={(e) =>
                                        setAvatarUrl(e.target.value)
                                    }
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <Label>Chat Button Icon URL</Label>
                                <Input
                                    value={buttonIconUrl}
                                    onChange={(e) =>
                                        setButtonIconUrl(e.target.value)
                                    }
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <Label>Theme Color</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="color"
                                        value={color}
                                        onChange={(e) =>
                                            setColor(e.target.value)
                                        }
                                        style={{
                                            width: 40,
                                            height: 40,
                                            padding: 0,
                                            border: "none",
                                            background: "none",
                                        }}
                                    />
                                    <Input
                                        value={color}
                                        onChange={(e) =>
                                            setColor(e.target.value)
                                        }
                                        style={{ width: 100 }}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Welcome Message</Label>
                                <Input
                                    value={welcomeMessage}
                                    onChange={(e) =>
                                        setWelcomeMessage(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label>Popup Text Above Bubble</Label>
                                <Input
                                    value={popupText}
                                    onChange={(e) =>
                                        setPopupText(e.target.value)
                                    }
                                    placeholder="Any questions?"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Appears above the chat bubble before it's
                                    opened.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <Label>Width</Label>
                                    <Input
                                        value={widgetSetup.width}
                                        onChange={(e) =>
                                            setWidgetSetup({
                                                ...widgetSetup,
                                                width: Number(e.target.value),
                                            })
                                        }
                                        type="number"
                                        min={300}
                                        max={600}
                                    />
                                </div>
                                <div>
                                    <Label>Height</Label>
                                    <Input
                                        value={widgetSetup.height}
                                        onChange={(e) =>
                                            setWidgetSetup({
                                                ...widgetSetup,
                                                height: Number(e.target.value),
                                            })
                                        }
                                        type="number"
                                        min={300}
                                        max={700}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Widget Placement</Label>
                                <Select
                                    value={position}
                                    onValueChange={setPosition}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Placement" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bottom-right">
                                            Bottom Right
                                        </SelectItem>
                                        <SelectItem value="bottom-left">
                                            Bottom Left
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Limit Chat</Label>
                                <Input
                                    value={limitChat}
                                    onChange={(e) =>
                                        setLimitChat(Number(e.target.value))
                                    }
                                    type="number"
                                    min={-1} // -1 for unlimited
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Set to -1 for unlimited messages.
                                </p>
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                                <Label>Dark/Light</Label>
                                <Button
                                    variant={
                                        previewTheme === "dark"
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => setPreviewTheme("dark")}
                                >
                                    Dark
                                </Button>
                                <Button
                                    variant={
                                        previewTheme === "light"
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => setPreviewTheme("light")}
                                >
                                    Light
                                </Button>
                            </div>
                            <div>
                                <Label>Bubble Size</Label>
                                <Input
                                    type="number"
                                    min={32}
                                    max={120}
                                    value={bubbleSize}
                                    onChange={(e) =>
                                        // remove 0 if bubbleSize is 0
                                        setBubbleSize(
                                            Number(e.target.value) || 32
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <Label>Popup Delay (ms)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={popupDelay}
                                    onChange={(e) =>
                                        setPopupDelay(
                                            Number(e.target.value) || 1
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Delay before the popup appears after the
                                    chat bubble is clicked.
                                </p>
                            </div>
                            {botStatus === "draft" ? (
                                <Button
                                    className="w-full mt-4"
                                    onClick={() => storeConnection()}
                                >
                                    Deploy Widget
                                </Button>
                            ) : (
                                <Button
                                    className="w-full mt-4"
                                    onClick={() => {
                                        updateConnection();
                                    }}
                                >
                                    Update Widget{" "}
                                </Button>
                            )}
                        </div>
                        {/* Live Preview */}
                        <div className=" flex flex-col items-center col-span-2">
                            <Label className="mb-2">Preview</Label>
                            <div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    height: "75%",
                                    backgroundColor: "#000",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        zIndex: 10,
                                        bottom: 24,
                                        [position === "bottom-left"
                                            ? "left"
                                            : "right"]: 24,
                                        display: openChat ? "none" : "flex",
                                        flexDirection: "column",
                                        alignItems:
                                            position === "bottom-left"
                                                ? "flex-start"
                                                : "flex-end",
                                    }}
                                >
                                    {isPopupVisible && popupText && (
                                        <div
                                            className={cn(
                                                "chat-popup-bubble",
                                                position === "bottom-right"
                                                    ? "pos-right"
                                                    : "pos-left",
                                                previewTheme === "dark" &&
                                                    "chat-popup-bubble-dark"
                                            )}
                                            style={{ marginBottom: "16px" }} // Jarak antara pop-up dan bubble
                                        >
                                            {popupText}
                                            <button
                                                className="popup-close-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Mencegah bubble ikut ter-klik
                                                    setIsPopupVisible(false);
                                                }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    )}

                                    {/* Bubble Button (tidak berubah, hanya posisinya relatif terhadap container baru) */}
                                    <div
                                        style={{
                                            width: bubbleSize + "px",
                                            height: bubbleSize + "px",
                                            borderRadius: "50%",
                                            background: color,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            boxShadow:
                                                "0 4px 12px rgba(0,0,0,0.15)",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => setOpenChat(true)}
                                    >
                                        {/* ... (logika ikon di dalam bubble) ... */}
                                        {buttonIconUrl ? (
                                            <img
                                                src={buttonIconUrl}
                                                alt="Chat"
                                                style={{
                                                    width:
                                                        bubbleSize * 0.5 + "px",
                                                    height:
                                                        bubbleSize * 0.5 + "px",
                                                }}
                                            />
                                        ) : (
                                            <div>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="#ffffff"
                                                    height={
                                                        bubbleSize * 0.5 + "px"
                                                    }
                                                    viewBox="0 0 60 60"
                                                    width={
                                                        bubbleSize * 0.5 + "px"
                                                    }
                                                    version="1.1"
                                                    id="Capa_1"
                                                >
                                                    <path d="M55.232,43.104C58.354,38.746,60,33.705,60,28.5c0-14.888-13.458-27-30-27S0,13.612,0,28.5s13.458,27,30,27  c4.262,0,8.378-0.79,12.244-2.348c6.805,3.927,16.212,5.282,16.618,5.338c0.046,0.007,0.093,0.01,0.139,0.01  c0.375,0,0.725-0.211,0.895-0.554c0.192-0.385,0.116-0.849-0.188-1.153C57.407,54.493,55.823,49.64,55.232,43.104z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
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
                                                width: widgetSetup.width + "px",
                                                height:
                                                    widgetSetup.height + "px",
                                                background: bg,
                                                borderRadius: 10,
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
                                                onClick={() => {
                                                    setOpenChat(false);
                                                    setIsPopupVisible(true);
                                                }}
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
                                                botName={botName}
                                                botId={selectedBot}
                                                title={widgetTitle}
                                                chooseColor={color}
                                                openingMessage={welcomeMessage}
                                                urlProfile={avatarUrl}
                                                messages={messages}
                                                setMessages={setMessages}
                                                logoIconURL={logoUrl}
                                                className="w-full h-full"
                                                rules={promptText}
                                                isDarkMode={
                                                    previewTheme === "dark"
                                                }
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                    {/* Embed Code Anzeige nach Deploy */}
                    {showEmbed && (
                        <div className="mt-8">
                            <EmbedSnippet
                                botId={selectedBot}
                                title={widgetTitle}
                                position={position}
                                color={color}
                                logoUrl={logoUrl}
                                widgetId={widgetId}
                                avatarUrl={avatarUrl}
                                buttonIconUrl={buttonIconUrl}
                                welcomeMessage={welcomeMessage}
                                width={widgetWidth}
                                height={widgetHeight}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DemoPage;
