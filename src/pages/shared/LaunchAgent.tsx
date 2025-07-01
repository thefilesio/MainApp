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

const LaunchAgent = () => {
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
    const [welcomeMessage, setWelcomeMessage] = useState(
        "Hi there! How can I help you today?"
    );
    const [widgetWidth, setWidgetWidth] = useState("400");
    const [widgetHeight, setWidgetHeight] = useState("500");
    const [widgetCollapsed, setWidgetCollapsed] = useState(true);
    const [activeWidgetTab, setActiveWidgetTab] = useState("appearance");
    const [promptText, setPromptText] = useState("");

    const [connections, setConnections] = useState<any[]>([]);
    const [showEmbed, setShowEmbed] = useState(false);

    const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
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
            popup_text: "",
            popup_delay: null,
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
            setIsWidgetEditorOpen(false); // Optional: Widget-Liste neu laden oder UI updaten
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
        setPosition("bottom-right");

        setColor("#3a9e91");
        setBubbleSize(56);
        setPreviewTheme("dark");
        setOpen(false);
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
        setBotStatus("published");
        setShowEmbed(true);
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
    useEffect(() => {
        setLoading(true);
        fetchWidgets()
            .then((fetchedWidgets) => {
                setConnections(
                    fetchedWidgets.map((widget:any) => ({
                        id: widget.id,
                        name: widget.title,
                        buildName: bots.find((b) => b.id === widget.bot_id)
                            ?.name || "Unknown Bot",
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
                        theme: widget.theme,
                        color: widget.color,
                        enabled: true,
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


    return (
        <div className="dark:bg-dark min-h-screen overflow-y-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2AB6A6] mb-1">
                        Launch Agent
                    </h1>
                    <p className="text-gray-500 dark:text-gray-300 mt-2 text-base">
                        Deploy your AI chatbot agent to various platforms.
                    </p>
                </div>
                <Button
                    onClick={handleCreateConnection}
                    className="gap-2 self-start rounded-xl shadow-md px-6 py-3 text-base font-bold bg-[#2AB6A6] hover:bg-[#229b8e] transition-all"
                    size="lg"
                >
                    <Plus className="h-5 w-5" /> Create Connection
                </Button>
            </div>

            {/* Connection List */}
            {connections.length > 0 && (
                <div className="mb-8 text-black dark:text-white">
                    <h2 className="text-lg font-semibold mb-4">Connections</h2>
                    <div className="space-y-4">
                        {connections.map((conn, idx) => (
                            <div
                                key={conn.id}
                                onClick={() => {
                                    handleEditConnection(conn);
                                }}
                                className="flex items-center cursor-pointer justify-between bg-card p-4 rounded shadow dark:bg-main-dark border dark:border-[#22304a] "
                            >
                                <div>
                                    <div className="font-medium">
                                        {conn.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {conn.integrationType} •{" "}
                                        {conn.buildName}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Switch
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
                                    />
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            setConnections((prev) =>
                                                prev.filter((_, i) => i !== idx)
                                            )
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
                            {translations.launchAgent.readyToLaunch}
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            {translations.launchAgent.readyToLaunchSubtitle}
                        </p>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleCreateConnection}
                        className="gap-2 px-8"
                    >
                        {translations.launchAgent.createConnection}
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
            <Dialog
                open={isWidgetEditorOpen}
                onOpenChange={setIsWidgetEditorOpen}
            >
                <DialogContent
                    style={{ maxWidth: "90vw", maxHeight: "90vh" }}
                    className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white"
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
                                        setBubbleSize(Number(e.target.value))
                                    }
                                />
                            </div>
                           {botStatus === "draft" ? (
                             <Button
                                className="w-full mt-4"
                                onClick={() => storeConnection()}
                            >
                                Deploy Widget
                            </Button>
                            ): (
                                <Button
                                    className="w-full mt-4"
                                    onClick={() => {
                                        setShowEmbed(true);
                                        setBotStatus("published");
                                    }   }
                                >
                                    Update Widget   </Button>
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
                                        background: color,
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
                                                width={bubbleSize * 0.5}
                                                height={bubbleSize * 0.5}
                                                viewBox="0 0 24 24"
                                                fill={"#ffff"}
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
                                                botName={botName}
                                                botId={selectedBot}
                                                title={widgetTitle}
                                                chooseColor={color}
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

export default LaunchAgent;
