import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Key } from "lucide-react";
import { useApiKeyContext } from "@/contexts/ApiKeyContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

const ApiKey = () => {
    const { apiKey, saveApiKey, deleteApiKey } = useApiKeyContext();
    const [input, setInput] = useState("");
    const [showApiKey, setShowApiKey] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        if (!input.trim()) {
            toast.error("API-Key is required.");
            return;
        }
        saveApiKey(input.trim())
        toast.success("API Key saved successfully.");
        setError("");

    };

    const handleDelete = async () => {
        deleteApiKey();

        setInput("");
        setError("");

        await supabase
            .from("api_keys")
            .delete()
            .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
            .then(({ error }) => {
                if (error) {
                    toast.error("Failed to delete API Key.");
                } else {
                    toast.success("API Key deleted successfully.");
                }
            });
        setInput("");
        setError("");
        setShowApiKey(false);
        setInput("");
        setError("");
    };

    const handleCheckApiKey = () => {
        if (!input.trim()) {
            setError("Bitte gib einen API-Key ein.");
            return;
        }
        if (input.trim() === apiKey) {
            setError("API-Key ist korrekt.");
        } else {
            setError("API-Key ist falsch.");
        }
    };

    return (
        <div>
            <h1 className="chatbot-heading mb-8">API Key Management</h1>
            <div
                className="max-w-4xl mx-auto
        p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md
        border border-gray-200 dark:border-gray-700
        "
            >
                <Card
                    style={{ borderRadius: "8px" }}
                    className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300
        border border-gray-200 dark:bg-gray-800 dark:border-gray-700
        p-6
        "
                >
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 mb-4">
                            <Key className="h-5 w-5" /> OpenAI API Key
                        </CardTitle>
                        <CardDescription>
                            Verwalte deinen OpenAI API-Key für alle Chatbots.
                            Der Key wird nur lokal gespeichert.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                API Key
                            </label>
                            <div className="flex space-x-2">
                                <div className="flex-1 relative">
                                    <Input
                                        type={showApiKey ? "text" : "password"}
                                        placeholder="sk-..."
                                        value={input || apiKey || ""}
                                        onChange={(e) =>
                                            setInput(e.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        onClick={() =>
                                            setShowApiKey(!showApiKey)
                                        }
                                    >
                                        {showApiKey ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <Button
                                    onClick={handleSave}
                                    disabled={!input.trim()}
                                >
                                    Speichern
                                </Button>
                            </div>
                            {error && (
                                <div className="text-red-500 text-sm">
                                    {error}
                                </div>
                            )}
                        </div>
                        {apiKey && (
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <span className="font-medium">Status:</span>{" "}
                                    <span className="text-green-500">
                                        API key gespeichert
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Verwendeter Key: {apiKey.slice(0, 8)}...
                                    </span>
                                </p>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                    >
                                        API-Key löschen
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className="border-t pt-4">
                            <h3 className="font-medium mb-2">
                                API Key Hinweise
                            </h3>
                            <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
                                <li>
                                    Dein API-Key wird nur lokal im Browser
                                    gespeichert.
                                </li>
                                <li>
                                    Er wird für alle GPT-Anfragen und Chatbots
                                    verwendet.
                                </li>
                                <li>
                                    Du kannst ihn jederzeit ändern oder löschen.
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ApiKey;
