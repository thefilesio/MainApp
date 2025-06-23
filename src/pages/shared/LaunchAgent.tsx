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
import { toast as toastLib } from "sonner";
import ChatInterface from "@/components/ChatInterface";

const LaunchAgent = () => {
    const { toast } = useToast();
    const { bots } = useBots();
    const { translations } = useLanguage();
    const { user } = useAuth();

    const [isIntegrationTypeModalOpen, setIsIntegrationTypeModalOpen] =
        useState(false);
    const [isWidgetEditorOpen, setIsWidgetEditorOpen] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState<
        string | null
    >(null);

    const [position, setPosition] = useState("bottom-right");
    const [color, setColor] = useState("#3a9e91");
    const [widgetTitle, setWidgetTitle] = useState("Chat with us");
    const [selectedBot, setSelectedBot] = useState<string>("");
    const [connectionName, setConnectionName] = useState("");

    const [logoUrl, setLogoUrl] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [buttonIconUrl, setButtonIconUrl] = useState("");
    const [welcomeMessage, setWelcomeMessage] = useState(
        "Hi there! How can I help you today?"
    );
    const [widgetWidth, setWidgetWidth] = useState("400");
    const [widgetHeight, setWidgetHeight] = useState("500");
    const [widgetCollapsed, setWidgetCollapsed] = useState(true);
    const [activeWidgetTab, setActiveWidgetTab] = useState("appearance");

    const [connections, setConnections] = useState<any[]>([]);
    const [showEmbed, setShowEmbed] = useState(false);

    const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
    const [bubbleSize, setBubbleSize] = useState(56);
    const [open, setOpen] = useState(false);

    const handleCreateConnection = async () => {
        if (!user) {
            toast({
                title: "Error",
                description: "User not authenticated",
                variant: "destructive",
            });
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
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Widget deployed",
                description: "Widget wurde gespeichert.",
            });
            // Optional: Widget-Liste neu laden oder UI updaten
        }
        setIsIntegrationTypeModalOpen(true);
    };

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

    // Dummy/Preview ChatWidget für Live-Preview (ohne Backend)
    function LivePreviewChatWidget({
        title,
        position,
        color,
        logoUrl,
        avatarUrl,
        buttonIconUrl,
        welcomeMessage,
        width,
        height,
        theme,
        bubbleSize,
    }: any) {
        const [input, setInput] = useState("");
        // Farben und Layout je nach Theme
        useEffect(() => {
            setOpen(true);
        }, [theme]);
        const isDark = theme === "dark";
        const bg = isDark ? "#1f2937" : "#fff";
        const fg = isDark ? "#fff" : "#000";
        const border = isDark ? "#444" : "#eee";
        // const bot = bot
        return (
            <div style={{ position: "relative", width: "100%", height: "75%" }}>
                {/* Bubble Button */}
                <div
                    style={{
                        position: "absolute",
                        zIndex: 10,
                        bottom: 24,
                        [position === "bottom-left" ? "left" : "right"]: 24,
                        width: bubbleSize,
                        height: bubbleSize,
                        borderRadius: "50%",
                        background: color,
                        display: open ? "none" : "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        cursor: "pointer",
                    }}
                    onClick={() => setOpen(true)}
                >
                    <img
                        src={buttonIconUrl || "/chat-icon.svg"}
                        alt="Chat"
                        style={{
                            width: bubbleSize * 0.5,
                            height: bubbleSize * 0.5,
                        }}
                    />
                </div>
                {/* Chat Window */}
                {open && (
                    <div
                        style={{
                            position: "absolute",
                            zIndex: 20,
                            bottom: bubbleSize + 32,
                            [position === "bottom-left" ? "left" : "right"]: 24,
                            width: width + "px",
                            height: height + "px",
                            background: bg,
                            borderColor: "none",
                            color: fg,
                            borderRadius: 16,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                    >
                        <button
                            className="absolute top-3 right-5"
                            onClick={() => setOpen(false)}
                            style={{
                                color: fg,
                                background: "none",
                                border: "none",
                                fontSize: 20,
                                cursor: "pointer",
                            }}
                        >
                            ✖
                        </button>
                        <ChatInterface
                            botName={widgetTitle}
                            botId={selectedBot}
                            chooseColor={color}
                            openingMessage={welcomeMessage}
                            bots={bots}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
           
            <h1 className="chatbot-heading mb-8">
                {translations.launchAgent.title}
            </h1>

            {/* Connection List */}
            {connections.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">Connections</h2>
                    <div className="space-y-4">
                        {connections.map((conn, idx) => (
                            <div
                                key={conn.id}
                                className="flex items-center justify-between bg-card p-4 rounded shadow"
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

            <div className="flex flex-col items-center justify-center py-16">
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

            {/* Integration Type Modal */}
            <Dialog
                open={isIntegrationTypeModalOpen}
                onOpenChange={(open) => {
                    if (!open) setIsIntegrationTypeModalOpen(false);
                }}
            >
                <DialogContent className="sm:max-w-[600px] bg-white">
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
                                    // Connection anlegen
                                    setConnections((prev) => [
                                        ...prev,
                                        {
                                            id: Date.now().toString(),
                                            name: connectionName,
                                            integrationType:
                                                selectedIntegration,
                                            buildId: selectedBot,
                                            buildName:
                                                bots.find(
                                                    (b) => b.id === selectedBot
                                                )?.name || "",
                                            enabled: true,
                                        },
                                    ]);
                                    setIsIntegrationTypeModalOpen(false);
                                    if (selectedIntegration === "website")
                                        setIsWidgetEditorOpen(true);
                                }}
                                disabled={
                                    !connectionName.trim() ||
                                    !selectedBot ||
                                    !selectedIntegration
                                }
                                className="w-full"
                                size="lg"
                            >
                                {translations.launchAgent.createConnection}
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
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            Widget Editor
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                        {/* Editor Form */}
                        <div className="space-y-4">
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
                                <Label>Choose Build</Label>
                                <Select
                                    value={selectedBot}
                                    onValueChange={setSelectedBot}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose Build" />
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
                                        value={widgetWidth}
                                        onChange={(e) =>
                                            setWidgetWidth(e.target.value)
                                        }
                                        type="number"
                                        min={300}
                                        max={600}
                                    />
                                </div>
                                <div>
                                    <Label>Height</Label>
                                    <Input
                                        value={widgetHeight}
                                        onChange={(e) =>
                                            setWidgetHeight(e.target.value)
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
                            <Button
                                className="w-full mt-4"
                                onClick={() => setShowEmbed(true)}
                            >
                                Deploy Widget
                            </Button>
                        </div>
                        {/* Live Preview */}
                        <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                            <Label className="mb-2">Preview</Label>
                            <LivePreviewChatWidget
                                title={widgetTitle}
                                position={position}
                                color={color}
                                logoUrl={logoUrl}
                                avatarUrl={avatarUrl}
                                buttonIconUrl={buttonIconUrl}
                                welcomeMessage={welcomeMessage}
                                width={widgetWidth}
                                height={widgetHeight}
                                theme={previewTheme}
                                bubbleSize={bubbleSize}
                            />
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
