import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface EmbedSnippetProps {
    botId: string;
    title?: string;
    position?: string;
    color?: string;
    logoUrl?: string;
    avatarUrl?: string;
    buttonIconUrl?: string;
    welcomeMessage?: string;
    width?: string;
    height?: string;
    widgetId?: string;
}

export default function EmbedSnippet({
    botId,
    title = "Chat with us",
    position = "bottom-right",
    color = "#3a9e91",
    logoUrl = "",
    avatarUrl = "",
    buttonIconUrl = "",
    welcomeMessage = "Hi there! How can I help you today?",
    widgetId,
    width = "400",
    height = "500",
}: EmbedSnippetProps) {
    const [responsive, setResponsive] = useState(false);
    const WEB_URL =
        process.env.NEXT_PUBLIC_APP_URL || "https://app.thefiles.io/widget.js";
    const scriptSnippet = `
<!-- Chatbot Widget -->
 <script src="${WEB_URL}/widget.js"></script>
<script>
document.addEventListener("DOMContentLoaded", function () {
   window.AIChatWidget.init({
     widgetId: "${widgetId}",
     webUrl: "${WEB_URL}",        
    });
});

</script>`;

    const iframeSnippet = responsive
        ? `<iframe
  src="https://cdn.chat.thefiles.io/shared/${botId}"
  width="100%"
  height="600"
  style="border: none; width: 100%; min-height: 400px; height: 90vh; max-height: 90vh"
  allowfullscreen
  loading="lazy">
</iframe>`
        : `<iframe
  src="https://cdn.chat.thefiles.io/shared/${botId}"
  width="${width}"
  height="${height}"
  style="border: none"
  allowfullscreen
  loading="lazy">
</iframe>`;

    const [copied, setCopied] = useState(false);

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <Label>Embed Code</Label>
                <pre className="p-4 mt-2 rounded bg-muted text-sm overflow-x-auto whitespace-pre-wrap">
                    <code>{responsive ? iframeSnippet : scriptSnippet}</code>
                </pre>
                <button
                    onClick={() =>
                        window.open(
                            `${WEB_URL}/embed.html?widgetId=${widgetId}`,
                            "_blank"
                        )
                    }
                    className="mt-2 px-4 py-2 mr-2  border-2  border-primary text-primary rounded"
                >
                    Preview
                </button>
                <button
                    onClick={() =>
                        copyToClipboard(
                            responsive ? iframeSnippet : scriptSnippet
                        )
                    }
                    className="mt-2 px-4 py-2 bg-primary text-white rounded"
                >
                    {copied ? "Copied!" : "Copy Embed Code"}
                </button>
            </div>
        </div>
    );
}
