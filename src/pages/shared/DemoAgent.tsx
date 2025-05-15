import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ChatInterface from "@/components/ChatInterface";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Copy, Moon, Sun, Check } from "lucide-react";
import { useBots } from "@/hooks/useBots";
import { useToast } from "@/hooks/use-toast";

const DemoAgent = () => {
  const { toast } = useToast();
  const { bots } = useBots();
  
  const [selectedBot, setSelectedBot] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("Hi there! How can I help you today?");
  const [themeColor, setThemeColor] = useState("#3a9e91");
  const [demoName, setDemoName] = useState("My Demo Bot");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [embedCode, setEmbedCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  
  const handleCreateDemo = () => {
    // Implementation would connect to backend
    toast({
      title: "Demo Created",
      description: `Your demo "${demoName}" has been created successfully.`,
    });
  };

  const handleEmbedAgent = () => {
    const code = `<!-- Demo Agent Embed Code -->
<script>
  window.demoAgentSettings = {
    botId: "${selectedBot}",
    name: "${demoName}",
    theme: "${isDarkMode ? 'dark' : 'light'}",
    primaryColor: "${themeColor}",
    logoUrl: "${logoUrl}",
    avatarUrl: "${avatarUrl}",
    welcomeMessage: "${welcomeMessage}"
  };
</script>
<script src="https://cdn.chatbotbuilder.example/demo-agent.js" async></script>
<div id="demo-agent-container" style="width: 100%; height: 600px;"></div>`;

    setEmbedCode(code);
    setIsEmbedModalOpen(true);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCodeCopied(true);
    toast({
      title: "Copied",
      description: "The embed code has been copied to your clipboard.",
    });
    
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div>
      <h1 className="chatbot-heading mb-8">Demo Agent</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-xl bg-card shadow-md lg:col-span-1">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="demo-name">Demo Name</Label>
              <Input 
                id="demo-name" 
                value={demoName} 
                onChange={(e) => setDemoName(e.target.value)} 
                placeholder="My Demo Bot"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bot-select">Select Bot</Label>
              <Select value={selectedBot} onValueChange={setSelectedBot}>
                <SelectTrigger id="bot-select">
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="theme-mode" className="block mb-2">Theme Mode</Label>
              <div className="flex items-center space-x-2">
                <Toggle 
                  pressed={!isDarkMode} 
                  onPressedChange={() => toggleTheme()}
                  className="data-[state=on]:bg-primary"
                  size="sm"
                  aria-label="Toggle light mode"
                >
                  <Sun className="h-4 w-4" />
                </Toggle>
                <Toggle 
                  pressed={isDarkMode}
                  onPressedChange={() => toggleTheme()}
                  className="data-[state=on]:bg-primary"
                  size="sm"
                  aria-label="Toggle dark mode"
                >
                  <Moon className="h-4 w-4" />
                </Toggle>
                <span className="text-sm text-muted-foreground">
                  {isDarkMode ? 'Dark mode' : 'Light mode'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input 
                id="logo-url" 
                value={logoUrl} 
                onChange={(e) => setLogoUrl(e.target.value)} 
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatar-url">Avatar URL</Label>
              <Input 
                id="avatar-url" 
                value={avatarUrl} 
                onChange={(e) => setAvatarUrl(e.target.value)} 
                placeholder="https://example.com/avatar.png"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="theme-color">Theme Color</Label>
              <div className="flex gap-3">
                <Input 
                  type="color" 
                  id="theme-color" 
                  value={themeColor} 
                  onChange={(e) => setThemeColor(e.target.value)} 
                  className="w-12 h-10" 
                />
                <Input 
                  value={themeColor} 
                  onChange={(e) => setThemeColor(e.target.value)} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="welcome-message">Welcome Message</Label>
              <Input 
                id="welcome-message" 
                value={welcomeMessage} 
                onChange={(e) => setWelcomeMessage(e.target.value)} 
              />
            </div>
            
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                className="w-full transition-opacity hover:bg-opacity-90"
                onClick={handleCreateDemo}
                disabled={!selectedBot || !demoName}
              >
                Create Demo
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleEmbedAgent}
                disabled={!selectedBot}
              >
                Embed Agent
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="lg:col-span-2 rounded-xl shadow-md overflow-hidden"
          style={{
            backgroundColor: isDarkMode ? '#1a1c23' : '#ffffff',
            color: isDarkMode ? '#e4e4e4' : '#1b2a2e',
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }}
        >
          <CardContent className="p-0 h-full">
            <div 
              className="p-4 flex items-center"
              style={{ backgroundColor: themeColor, transition: 'background-color 0.3s ease' }}
            >
              <div className="flex items-center flex-1">
                {logoUrl && (
                  <img src={logoUrl} alt="Logo" className="h-8 w-8 mr-3 rounded" />
                )}
                <h3 className="text-white font-medium">{demoName || "Demo Bot"}</h3>
              </div>
            </div>
            <div 
              className="p-4"
              style={{
                backgroundColor: isDarkMode ? '#1a1c23' : '#ffffff',
                color: isDarkMode ? '#e4e4e4' : '#1b2a2e',
                transition: 'background-color 0.3s ease, color 0.3s ease'
              }}
            >
              <ChatInterface botName={demoName || "Demo Bot"} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Embed Code Modal */}
      <Dialog open={isEmbedModalOpen} onOpenChange={setIsEmbedModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Embed Demo Agent</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Copy this code and paste it into your website to embed the demo agent.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="relative">
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm max-w-full">
                <code className="whitespace-pre-wrap">{embedCode}</code>
              </pre>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
              >
                {codeCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DemoAgent;
