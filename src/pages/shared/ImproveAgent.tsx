import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, RotateCcw } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import { useBots } from "@/hooks/useBots";
import { usePrompts } from "@/hooks/usePrompts";
import { useFaqData } from "@/hooks/useFaqData";
import { useVersions } from "@/hooks/useVersions";
import AIPrompter from "@/components/AIPrompter";
import { toast } from "sonner";
import { useLoading } from "@/contexts/LoadingContext";
const ImproveAgent = () => {
    const { setLoading } = useLoading();
    const { bots, isLoading: isLoadingBots } = useBots();

    const [selectedBotId, setSelectedBotId] = useState<string | undefined>(
        undefined
    );

    const [selectedBot, setSelectedBot] = useState<{
        id: string;
        name: string;
        description?: string;
        demoName?: string;
        themeColor?: string;
    } | null>(null);
    const [originalText, setOriginalText] = useState("");
    const [botText, setBotText] = useState("");
    const [generatedText, setGeneratedText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);

    const {
        prompts,
        isLoading: isLoadingPrompts,
        createPrompt,
        updatePrompt,
        createVersionSnapshot,
    } = usePrompts(selectedBotId);
    const { faqData, saveFaq } = useFaqData(selectedBotId);
    const { versions, fetchVersions } = useVersions(selectedBotId);

    const [selectedVersion, setSelectedVersion] = useState<string | undefined>(
        undefined
    );

    const extractSection = (key: string, text: string): string => {
        const regex = new RegExp(`~${key}\\s*\\n([\\s\\S]*?)(?=\\n~)`);
        return text.match(regex)?.[1].trim() || "";
    };

    useEffect(() => {
        if (bots.length > 0 && !selectedBotId) {
            setSelectedBotId(bots[0].id);
            setSelectedBot(bots[0]);
        }
    }, [bots, selectedBotId]);

    useEffect(() => {
        setOriginalText("");
        setGeneratedText("");
        setSelectedVersion(versions.length > 0 ? versions[0].id : undefined);
        const loadPromptContent = async () => {
            if (selectedBotId) {
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
                        }\n~Purpose\n\n~Tone\n${
                            content!.tone || ""
                        }\n~Tone\n\n`;
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
                    setBotText(combinedContent);
                    setOriginalText(combinedContent);
                } catch (error) {
                    console.error("Error loading prompt content:", error);
                }
            }
        };
        // version to name Latest Version

        loadPromptContent();
    }, [selectedBotId, prompts]);

    const AfterSubmit = () => {
        fetchVersions();
        setOriginalText("");
        setGeneratedText("");
        setSelectedVersion(versions.length > 0 ? versions[0].id : undefined);
        const loadPromptContent = async () => {
            if (selectedBotId) {
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
                        }\n~Purpose\n\n~Tone\n${
                            content!.tone || ""
                        }\n~Tone\n\n`;
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
                    setBotText(combinedContent);
                    setOriginalText(combinedContent);
                } catch (error) {
                    console.error("Error loading prompt content:", error);
                }
            }
        };
        // version to name Latest Version

        loadPromptContent();
    };

    const handleBotChange = (botId: string) => {
        setSelectedBotId(botId);
    };

    const handleVersionChange = (versionId: string) => {
        setSelectedVersion(versionId);
        const version = versions.find((v) => v.id === versionId);
        if (version && version.prompt_snapshot) {
            try {
                let combinedContent = "";

                const prompts = version.prompt_snapshot;

                if (Array.isArray(prompts)) {
                    const step1 = Array.isArray(prompts)
                        ? prompts.find(
                              (p) =>
                                  typeof p === "object" &&
                                  p !== null &&
                                  "step" in p &&
                                  (p as any).step == 1
                          )
                        : undefined;
                    const step2 = Array.isArray(prompts)
                        ? prompts.find(
                              (p) =>
                                  typeof p === "object" &&
                                  p !== null &&
                                  "step" in p &&
                                  (p as any).step == 2
                          )
                        : undefined;
                    if (step1) {
                        const content = JSON.parse(
                            (step1 as any).content || "{}"
                        );

                        combinedContent = `~Personality\n${
                            content!.personality || ""
                        }\n~Personality\n\n~Purpose\n${
                            content!.purpose || ""
                        }\n~Purpose\n\n~Tone\n${
                            content!.tone || ""
                        }\n~Tone\n\n`;
                    }

                    if (step2) {
                        try {
                            const content2 = JSON.parse(
                                (step2 as any).content || "{}"
                            );

                            combinedContent += `\n\n~Rules\n${
                                content2!.rules
                            }\n~Rules\n\n~FAQ\n${content2!.faq}\n~FAQ\n`;
                        } catch (error) {
                            console.error(
                                "Error parsing step 2 content:",
                                error
                            );
                        }
                    }
                }
                setBotText(combinedContent);
                setOriginalText(combinedContent);
            } catch (error) {
                console.error("Error parsing version content:", error);
                toast.error(
                    "Failed to load version content. Please try again."
                );
            }
        }
    };

    const savePrompt = async () => {
        if (!selectedBotId || !originalText.trim()) {
            toast.error("Please enter some text before saving.");
            return;
        }
        if (originalText === botText) {
            toast.info("No changes detected. Nothing to save.");
            return;
        }
        try {
            setLoading(true);
            const step1Content = {
                personality: extractSection("Personality", originalText),
                purpose: extractSection("Purpose", originalText),
                tone: extractSection("Tone", originalText),
            };
            const step2Content = {
                rules: extractSection("Rules", originalText),
                faq: extractSection("FAQ", originalText),
            };

           

            if (
                step1Content.personality ||
                step1Content.purpose ||
                step1Content.tone
            ) {
                await createPrompt({
                    bot_id: selectedBotId,
                    step: 1,
                    content: JSON.stringify(step1Content),
                });
            }
            if (step2Content.rules || step2Content.faq) {
                await createPrompt({
                    bot_id: selectedBotId,
                    step: 2,
                    content: JSON.stringify(step2Content),
                });
            }

            await createVersionSnapshot(selectedBotId, [
                {
                    step: 1,
                    content: JSON.stringify({
                        personality: step1Content.personality,
                        purpose: step1Content.purpose,
                        tone: step1Content.tone,
                    }),
                },
                {
                    step: 2,
                    content: JSON.stringify({
                        rules: step2Content.rules,
                        faq: step2Content.faq,
                    }),
                },
            ]);
            await AfterSubmit();
            setLoading(false);
            toast.success("Prompt saved successfully.");
        } catch (error) {
            setLoading(false);
            console.error(error);
            toast.error("Failed to save prompt.");
        }
    };

    const saveFaqContent = async () => {
        if (!selectedBotId || !generatedText) {
            toast.error("Please generate FAQ content before saving.");
            return;
        }
        try {
            saveFaq({
                bot_id: selectedBotId,
                original_text: originalText,
                generated_faq: generatedText,
            });
            toast.success("FAQ saved successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save FAQ content.");
        }
    };

    const handleAcceptSuggestion = (text: string) => {
        setOriginalText(text);
        toast.success("Suggestion accepted and applied.");
    };

    return (
        <div className="max-w-7xl mx-auto px-6 pt-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2AB6A6] mb-1">
                        Improve Agent
                    </h1>
                    <p className="text-gray-500 dark:text-gray-300 mt-2 text-base">
                        Refine your AI agent's abilities.
                    </p>
                </div>
                <div className="w-full md:w-64">
                    {isLoadingBots ? (
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                    ) : (
                        <Select
                            value={selectedBotId}
                            onValueChange={handleBotChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a bot" />
                            </SelectTrigger>
                            <SelectContent>
                                {bots.map((bot) => (
                                    <SelectItem key={bot.id} value={bot.id}>
                                        {bot.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {selectedBotId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-white">
                    {/* Prompt Editor */}
                    <div className="dark:bg-main-dark bg-white rounded-2xl shadow border dark:border-line-dark border-neutral-200 p-6 space-y-4 transition-all min-h-[500px]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Prompt Editor
                            </h2>
                            {versions.length > 0 && (
                                <div className="w-48">
                                    <Select
                                        value={selectedVersion}
                                        onValueChange={handleVersionChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Latest version" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {versions.map((version, i) => (
                                                <SelectItem
                                                    key={version.id}
                                                    value={version.id}
                                                >
                                                    {i == 0
                                                        ? "Last Version"
                                                        : new Date(
                                                              version.created_at
                                                          ).toLocaleString()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Textarea
                                value={originalText}
                                onChange={(e) =>
                                    setOriginalText(e.target.value)
                                }
                                className="min-h-[400px] rounded-xl border p-4 resize-none"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                onClick={savePrompt}
                                disabled={!originalText.trim()}
                            >
                                Save
                            </Button>
                        </div>
                    </div>

                    {/* Ergebnisbereich (Tabs + Inhalte) */}
                    <div className="bg-white dark:bg-main-dark rounded-2xl  dark:text-white shadow border border-neutral-200 dark:border-line-dark p-6 space-y-4 transition-all min-h-[500px]">
                        <Tabs defaultValue="ai-prompter">
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger
                                    value="ai-prompter"
                                    className="rounded-xl font-bold text-[#2AB6A6] dark:text-[#D9F4F0] data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow"
                                >
                                    AI Prompter
                                </TabsTrigger>
                                <TabsTrigger
                                    value="test-ai"
                                    className="rounded-xl font-bold text-[#2AB6A6] dark:text-[#D9F4F0] data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow"
                                >
                                    Test AI
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="ai-prompter" className="mt-4">
                                <AIPrompter
                                    onAccept={handleAcceptSuggestion}
                                    originalText={originalText}
                                    setResult={setOriginalText}
                                    botId={selectedBotId}
                                />
                            </TabsContent>

                            <TabsContent value="test-ai" className="mt-4">
                                <ChatInterface  botName={"Test Bot"} botId={selectedBotId} rules={originalText}  />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 border border-dashed rounded-xl">
                    <h3 className="text-lg font-medium mb-2">
                        No AI Agents Available
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        Create your first AI agent to begin.
                    </p>
                    <Button
                        onClick={() =>
                            typeof window !== "undefined" &&
                            (window.location.href = "/build")
                        }
                    >
                        <Plus className="h-4 w-4 mr-2" /> Create Agent
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ImproveAgent;
