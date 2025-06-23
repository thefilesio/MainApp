import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RotateCcw, SendIcon, CheckIcon, XIcon } from "lucide-react";
import { SUPABASE_KEY } from "@/integrations/supabase/client";
import { useApiKeyContext } from "@/contexts/ApiKeyContext";

interface AIPrompterProps {
    onAccept: (text: string) => void;
    originalText: string;
    setResult: (text: string) => void;
    botId?: string;
}

const AIPrompter = ({
    onAccept,
    originalText,
    botId,
    setResult,
}: AIPrompterProps) => {
    const [userInput, setUserInput] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const { apiKey } = useApiKeyContext() as any;

    const handleSubmit = async () => {
        if (!userInput.trim()) {
            toast.error("Please enter a description to generate a prompt.");
            return;
        }

        setIsGenerating(true);

        // Simulating an API call to generate a prompt
        const key =
            apiKey && typeof apiKey === "object" && "openai_api_key" in apiKey
                ? apiKey.openai_api_key
                : null;
        let tokenUser = null;
        if (typeof window !== "undefined") {
            // Fallback to a default key if not set
            const localCk = localStorage.getItem(
                `sb-${SUPABASE_KEY}-auth-token`
            );
            if (localCk) {
                try {
                    const parsedToken = JSON.parse(localCk);
                    tokenUser = parsedToken?.access_token || null;
                } catch (error) {
                    console.error(
                        "Error parsing token from localStorage:",
                        error
                    );
                }
            }
        }
        const res = await fetch("/api/generate-prompts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`,
            },
            credentials: "include",
            body: JSON.stringify({
                rules: originalText,
                intructions: userInput,
                botId: botId || "default-bot-id", // Use a default bot ID if none is provided
                token: tokenUser, // Include the token if available
            }),
        });
        const response = await res.json();
        const generatedPrompt = response.data;
        setAiResponse(generatedPrompt);
        setIsGenerating(false);
        toast.success("AI prompt generated successfully!");
    };

    const acceptSuggestion = () => {
        onAccept(aiResponse);
        setUserInput("");
        setAiResponse("");
        setResult(aiResponse);
        toast.success("Prompt accepted and applied successfully!");
    };

    const rejectSuggestion = () => {
        setAiResponse("");
        toast.error(
            "AI suggestion rejected. You can modify your input and try again."
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4">
                <Textarea
                    placeholder="Describe how you want to improve your AI prompt..."
                    className="min-h-[120px] resize-none"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                />
                <Button
                    onClick={handleSubmit}
                    className="mt-4"
                    disabled={isGenerating || !userInput.trim()}
                >
                    {isGenerating ? "Generating..." : "Generate Suggestion"}
                    {!isGenerating && <SendIcon className="ml-2 h-4 w-4" />}
                </Button>
            </div>

            {aiResponse && (
                <div className="flex-1">
                    <div className="mb-2 font-medium text-sm">
                        AI Suggestion:
                    </div>
                    <div className="bg-muted/50 rounded-md p-4 mb-4 overflow-y-auto max-h-[300px]">
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                            {aiResponse}
                        </pre>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={rejectSuggestion}
                        >
                            <XIcon className="mr-1 h-4 w-4" /> Reject
                        </Button>
                        <Button size="sm" onClick={acceptSuggestion}>
                            <CheckIcon className="mr-1 h-4 w-4" /> Accept
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIPrompter;
