import { useApiKeyContext } from "@/contexts/ApiKeyContext";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function ApiKeyPage() {
    const { apiKey, saveApiKey, deleteApiKey, testApiKey } =
        useApiKeyContext() as any;
    const [input, setInput] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        if (
            apiKey &&
            typeof apiKey === "object" &&
            (apiKey as any).openai_api_key
        ) {
            setInput((apiKey as any).openai_api_key || "");
            setStatus("API key saved");
        } else {
            setInput("");
            setStatus("");
        }
    }, [apiKey]);

    const handleSave = () => {
        if (!input || !input.startsWith("sk-")) {
            setStatus("Invalid API key");
            return;
        }
        saveApiKey(input);
        setStatus("API key saved");
    };

    const handleDelete = () => {
        deleteApiKey();
        setInput("");
        setStatus("API key deleted");
    };

    const handleTest = async () => {
        setTesting(true);
        try {
            await testApiKey(input);
            setStatus("API key is valid");
        } catch {
            setStatus("API key test failed");
        }
        setTesting(false);
    };

    return (
        <div className="w-full p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2AB6A6] mb-1">
                        API Key Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-300 mt-2 text-base">
                        Manage your OpenAI API key to enable AI chatbots and
                        other features. Ensure your key is valid and has access
                        to the required models.
                    </p>
                </div>
            </div>
            <div
                className="bg-white dark:bg-main-dark dark:text-white rounded-lg shadow-md p-6 mb-8 border-2"
                style={{
                    borderRadius: "8px",
                }}
            >
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <span role="img" aria-label="key">
                        🔑
                    </span>{" "}
                    OpenAI API Key
                </h2>
                <p className="text-muted-foreground mb-4">
                    Manage your OpenAI API key to power your AI chatbots. Your
                    API key will be stored securely.
                </p>
                <div className="mb-4 w-[50%] ">
                    <label className="block font-medium mb-1">
                        Update API Key
                    </label>
                    <div className="flex items-center gap-2">
                        <Input
                            type={showKey ? "text" : "password"}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter your OpenAI API key"
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setShowKey((v) => !v)}
                            aria-label="Show/Hide API Key"
                        >
                            {showKey ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            className="ml-2"
                        >
                            Save
                        </Button>
                    </div>
                    <div className="text-sm mt-2">
                        Get your API key from the{" "}
                        <a
                            href="https://platform.openai.com/api-keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-500"
                        >
                            OpenAI dashboard
                        </a>
                    </div>
                </div>
                <div className="mb-4">
                    <span
                        className={
                            status.includes("invalid") ||
                            status.includes("fail")
                                ? "text-red-500"
                                : "text-green-600"
                        }
                    >
                        Status: {status || "No API key saved"}
                    </span>
                </div>
                <div className="flex gap-2 mb-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleTest}
                        disabled={testing || !input}
                    >
                        {testing ? "Testing..." : "Test API Key"}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!input}
                    >
                        Remove API Key
                    </Button>
                </div>
                <div className="text-sm text-muted-foreground mt-4">
                    <strong>API Key Requirements</strong>
                    <ul className="list-disc ml-6 mt-2">
                        <li>
                            Your API key must have access to the GPT-4o model
                        </li>
                        <li>
                            Ensure you have sufficient credits in your OpenAI
                            account
                        </li>
                        <li>
                            Keep your API key secure and never share it with
                            others
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
