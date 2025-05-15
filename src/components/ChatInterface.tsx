import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useApiKeyContext } from "@/contexts/ApiKeyContext";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatInterfaceProps {
  botName?: string;
}

const ChatInterface = ({ botName = "Chatbot" }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: `Hello! I'm ${botName}. How can I help you today?`,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const { apiKey } = useApiKeyContext() as any;
  const [loading, setLoading] = useState(false);

  const key = apiKey && typeof apiKey === "object" && "openai_api_key" in apiKey ? apiKey.openai_api_key : null;

  const handleSendMessage = async () => {
    if (!input.trim() || !key) {
      toast({
        title: "API Key fehlt",
        description: "Bitte hinterlege einen gültigen OpenAI API Key unter 'API Key Management'.",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.content })),
            { role: "user", content: input },
          ],
          botId: botName,
        }),
      });
      const data = await res.json();
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: data.reply,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          content: "Fehler bei der Kommunikation mit OpenAI.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-xl overflow-hidden bg-background">
      <div className="bg-muted/30 p-4 border-b">
        <h2 className="font-medium">{botName} Demo</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-xl ${
                  message.sender === "user"
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted"
                }`}
              >
                {message.sender === "bot" && (
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <div className="bg-primary text-primary-foreground text-xs flex items-center justify-center w-full h-full">
                        {botName.charAt(0)}
                      </div>
                    </Avatar>
                    <span className="text-xs font-medium">{botName}</span>
                  </div>
                )}
                <p>{message.content}</p>
                <div
                  className={`text-xs mt-1 ${
                    message.sender === "user"
                      ? "text-accent-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-12 resize-none"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button type="submit" size="icon" disabled={loading || !key}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
