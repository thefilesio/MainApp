import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Building2, Code, MessageSquare } from "lucide-react";
import { useBots } from "@/hooks/useBots";
import { usePrompts } from "@/hooks/usePrompts";
import { useFaqData } from "@/hooks/useFaqData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { json } from "stream/consumers";
import { ref } from "process";
import { useLoading } from "@/contexts/LoadingContext";

interface EditBotModalProps {
    open: boolean;
    bot: any; // Replace with actual Bot type if available
    onClose: () => void;
}

type Template = "sales" | "support" | "blank";
type Step = "initial" | "configuration";

const EditBotModal = ({ open, onClose, bot }: EditBotModalProps) => {
    const { updateBot } = useBots();
    const { user, loading } = useAuth();
    const [currentBotId, setCurrentBotId] = useState<string | null>(null);
    const { updatePrompt } = usePrompts(currentBotId || undefined);
    const { updateFaq } = useFaqData(currentBotId || undefined);

    const [step, setStep] = useState<Step>("initial");
    const [currentTab, setCurrentTab] = useState("personality");
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
        null
    );
    const [botId, setBotId] = useState<string | null>(null);

    // Form fields
    const [name, setName] = useState("");
    const [industry, setIndustry] = useState("");
    const [language, setLanguage] = useState("");

    // Template content
    const [personality, setPersonality] = useState("");
    const [purpose, setPurpose] = useState("");
    const [tone, setTone] = useState("");
    const [rules, setRules] = useState("");
    const [faq, setFaq] = useState("");
const { setLoading } = useLoading();

    const  { refreshBots } = useBots();

    // Reset the form when the modal closes
    useEffect(() => {
        if (!open) {
            setStep("initial");
            setCurrentTab("personality");
            setSelectedTemplate(null);
            setName("");
            setIndustry("");
            setLanguage("");
            setPersonality("");
            setPurpose("");
            setTone("");
            setRules("");
            setFaq("");
            setCurrentBotId(null);
        } else {
            console.log("Editing bot:", bot);
            setBotId(bot.id || null);
            bot.prompts.forEach((prompt: any) => {
                if (prompt.step === 1) {
                    const content = JSON.parse(prompt.content);
                    setPersonality(content.personality || "");
                    setPurpose(content.purpose || "");
                    setTone(content.tone || "");
                } else if (prompt.step === 2) {
                    setRules(prompt.content || "");
                }
            });
            setName(bot.name || "");
            setIndustry(bot.industry || "");
            setLanguage(bot.language || "");
            setSelectedTemplate((bot.template as Template) || null);
            setCurrentBotId(bot.id || null);
            setFaq(bot.faq_data[0]?.generated_faq || "");
            console.log("Current Bot ID set to:", bot.id);
        }
    }, [open]);

    const handleContinue = () => {
        if (!name.trim() || !selectedTemplate) {
            toast.error(
                "Please provide a name and select a template before proceeding."
            );
            return;
        }
        setStep("configuration");
    };

    const handleBack = () => {
        setStep("initial");
    };

    // This function replaces placeholders in templates with user values
    const replacePlaceholders = (text: string) => {
        let result = text;

        if (industry) {
            // Generate industry specific questions
            const salesQuestion = `What challenges are you facing in the ${industry} industry?`;
            const secondQuestion = `How is your ${industry} business currently handling these challenges?`;

            // Replace placeholders
            result = result.replace(
                /\(Insert: sales question based on industry\)/g,
                salesQuestion
            );
            result = result.replace(
                /\(second industry-relevant question\)/g,
                secondQuestion
            );
            result = result.replace(
                /\(Insert: sales question based on user's "industry"\)/g,
                salesQuestion
            );
            result = result.replace(/zugdienstleister/g, industry);
        }

        if (language) {
            result = result.replace(/the selected language/g, language);
            result = result.replace(/that language/g, language);
            result = result.replace(/the user-selected language/g, language);
            result = result.replace(/deutsch/g, language);
        }

        return result;
    };

    const handleNextInConfiguration = () => {
        if (currentTab === "personality") {
            if (!personality || !purpose || !tone) {
                toast.error(
                    "Please fill in all fields in Step 1 before proceeding."
                );
                return;
            }
            setCurrentTab("knowledge");
        }
    };

    const handleSubmit = async () => {
        console.log("Submitting bot creation...");
        if (!user || loading) return; // Warten bis geladen
        try {
            if (!bot) {
                toast.error("No bot data available. Please try again later.");
                return;
            }
            setLoading(true);
            console.log("Creating bot...");
            const id = bot.id || null;
            const botNewest = await updateBot({
                id: id,
                name : name,
                industry : industry,
                language : language,
            });
            console.log("Bot created:", updateBot);
            setCurrentBotId(botNewest.id);

           

            // Then create prompts for personality, purpose and tone (step 1)
            if (personality || purpose || tone) {
              await  updatePrompt({
                    id: bot.prompts.find((p: any) => p.step === 1)?.id || "",
                    content: JSON.stringify({
                        personality: personality,
                        purpose: purpose,
                        tone: tone,
                    }),
                });
            }

            // Create prompts for rules (step 2)
            if (rules) {
              console.log("Updating rules prompt:", rules);
               await updatePrompt({
                    id: bot.prompts.find((p: any) => p.step === 2)?.id || "",
                    content: rules,
                });
            }

            // Create FAQ data if available
            if (faq) {
               await updateFaq({
                    bot_id: botNewest.id,
                    original_text: "",
                    generated_faq: faq,
                });
            }

            toast.success(
                `AI Agent "${name}" updated successfully! You can now chat with it.`
            );
            // refresh the bot list
            refreshBots().then(() => {
                console.log("Bots refreshed successfully.");
                onClose(); // Close the modal after successful update
            }).catch((error) => {
                console.error("Error refreshing bots:", error);
                toast.error("Failed to refresh bots. Please try again.");
            });
            setLoading(false);
        } catch (error: any) {
            console.error("Error in handleSubmit:", error);
            toast.error(
                `Failed to update AI Agent: ${error.message || "Unknown error"}`
            );
            setLoading(false);
        }
    };

    const renderInitialStep = () => (
        <>
            <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold tracking-tight text-[#2AB6A6] dark:text-[#D9F4F0] mb-2">
                    Edit AI Agent : Dena
                </DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 py-4">
                <div className="grid gap-3">
                    <Label htmlFor="name">AI Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Sales Assistant"
                        className="rounded-xl border border-[#D9F4F0] dark:border-[#22304a] dark:text-white bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base"
                    />
                </div>

                <div className="grid gap-3">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                        id="industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g., E-commerce, Healthcare, Education"
                        className="rounded-xl border border-[#D9F4F0] dark:border-[#22304a] dark:text-white bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base"
                    />
                </div>

                <div className="grid gap-3">
                    <Label htmlFor="language">Language</Label>
                    <Input
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        placeholder="e.g., English, German, Spanish"
                        className="rounded-xl border border-[#D9F4F0] dark:border-[#22304a] dark:text-white bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleContinue}
                    disabled={!name || !selectedTemplate}
                    className="rounded-xl bg-[#2AB6A6] text-white font-bold px-6 py-2 shadow hover:bg-[#229b8e] transition-all disabled:opacity-60"
                >
                    {currentTab === "personality" ? "Next" : "Create AI"}
                </Button>
            </div>
        </>
    );

    const renderConfigurationStep = () => (
        <>
            <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold tracking-tight text-[#2AB6A6] dark:text-[#D9F4F0] mb-2">
                    Configure Your AI : {name || "New AI Agent"}
                </DialogTitle>
            </DialogHeader>

            <Tabs
                defaultValue="personality"
                value={currentTab}
                onValueChange={setCurrentTab}
                className="mt-4"
            >
                <TabsList className="grid w-full grid-cols-2 rounded-xl bg-[#D9F4F0] dark:bg-[#22304a] p-1 mb-4">
                    <TabsTrigger
                        className="rounded-xl font-bold text-[#2AB6A6] dark:text-[#D9F4F0] data-[state=active]:bg-white dark:data-[state=active]:bg-[#101624] data-[state=active]:shadow"
                        value="personality"
                    >
                        Step 1: Personality & Purpose
                    </TabsTrigger>
                    <TabsTrigger value="knowledge" className="rounded-xl font-bold text-[#2AB6A6] dark:text-[#D9F4F0] data-[state=active]:bg-white dark:data-[state=active]:bg-[#101624] data-[state=active]:shadow">
                        Step 2: Knowledge & Rules
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personality" className="py-4 space-y-6">
                    <div className="grid gap-3">
                        <Label htmlFor="personality">Describe the AI</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                            The AIs job, name, purpose, and goal with each
                            conversation.
                        </p>
                        <Textarea
                            id="personality"
                            value={personality}
                            onChange={(e) => setPersonality(e.target.value)}
                            placeholder="Describe the personality of your AI..."
                            rows={3}
                            className="rounded-xl dark:text-white border border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base resize-none"
                        />
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="purpose">
                            What questions should the AI ask?
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                            What questions should be asked? Should it have a
                            structured flow?
                        </p>
                        <Textarea
                            id="purpose"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            placeholder="What is the main purpose of this AI?"
                            rows={3}
                            className="rounded-xl border dark:text-white border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base resize-none"
                        />
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="tone">Language, Style and Tone</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                            What language should the AI use? Formal/Informal?
                            What tone should the AI use?
                        </p>
                        <Textarea
                            id="tone"
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            placeholder="How should the AI communicate?"
                            rows={3}
                            className="rounded-xl border dark:text-white border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base resize-none"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="knowledge" className="py-4 space-y-6">
                    <div className="grid gap-3">
                        <Label htmlFor="rules">Rules & Guidelines</Label>
                        <Textarea
                            id="rules"
                            value={rules}
                            onChange={(e) => setRules(e.target.value)}
                            placeholder="Specify rules the AI should follow..."
                            rows={4}
                            className="rounded-xl border dark:text-white  border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base resize-none"
                        />
                    </div>

                    <div className="grid gap-3">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="faq">Company FAQ</Label>
                        </div>
                        <Textarea
                            id="faq"
                            value={faq}
                            onChange={(e) => setFaq(e.target.value)}
                            placeholder="Add frequently asked questions and answers..."
                            rows={6}
                            className="rounded-xl border dark:text-white  border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base resize-none"
                        />
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack}>
                    Back
                </Button>
                <div className="space-x-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={
                            currentTab === "personality"
                                ? handleNextInConfiguration
                                : handleSubmit
                        }
                        className="rounded-xl bg-[#2AB6A6] text-white font-bold px-6 py-2 shadow hover:bg-[#229b8e] transition-all disabled:opacity-60"
                    >
                        {currentTab === "personality" ? "Next" : "Update AI"}
                    </Button>
                </div>
            </div>
        </>
    );

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="bg-[#fefcf9] dark:bg-[#101624] border border-[#D9F4F0] dark:border-[#22304a] shadow-2xl p-8 max-w-xl w-full transition-colors duration-300"
                style={{
                    fontFamily: "Inter, sans-serif",
                    borderRadius: "10px !important",
                }}
            >
                {step === "initial"
                    ? renderInitialStep()
                    : renderConfigurationStep()}
            </DialogContent>
        </Dialog>
    );
};

export default EditBotModal;
