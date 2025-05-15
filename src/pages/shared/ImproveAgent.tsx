import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, RotateCcw } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import { useBots } from "@/hooks/useBots";
import { usePrompts } from "@/hooks/usePrompts";
import { useFaqData } from "@/hooks/useFaqData";
import { useVersions } from "@/hooks/useVersions";
import AIPrompter from "@/components/AIPrompter";

const ImproveAgent = () => {
  const { toast } = useToast();
  const { bots, isLoading: isLoadingBots } = useBots();

  const [selectedBotId, setSelectedBotId] = useState<string | undefined>(undefined);
  const [originalText, setOriginalText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);

  const { prompts, isLoading: isLoadingPrompts, createPrompt, updatePrompt } = usePrompts(selectedBotId);
  const { faqData, saveFaq } = useFaqData(selectedBotId);
  const { versions } = useVersions(selectedBotId);

  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (bots.length > 0 && !selectedBotId) {
      setSelectedBotId(bots[0].id);
    }
  }, [bots, selectedBotId]);

  useEffect(() => {
    setOriginalText("");
    setGeneratedText("");
    setSelectedVersion(undefined);

    const loadPromptContent = async () => {
      if (selectedBotId) {
        try {
          const step1Prompts = prompts.filter(p => p.step === 1);
          if (step1Prompts.length > 0 && step1Prompts[0].content) {
            try {
              const content = JSON.parse(step1Prompts[0].content);
              const combinedContent = `Personality: ${content.personality || ""}\n\nPurpose: ${content.purpose || ""}\n\nTone: ${content.tone || ""}`;
              setOriginalText(combinedContent);
            } catch (e) {
              console.error("JSON parse error", e);
            }
          }
        } catch (error) {
          console.error("Error loading prompt content:", error);
        }
      }
    };

    loadPromptContent();
  }, [selectedBotId, prompts]);

  const handleBotChange = (botId: string) => {
    setSelectedBotId(botId);
  };

  const handleVersionChange = (versionId: string) => {
    setSelectedVersion(versionId);
    const version = versions.find(v => v.id === versionId);
    if (version && version.prompt_snapshot) {
      try {
        const snapshot = version.prompt_snapshot;
        if (typeof snapshot === 'object' && !Array.isArray(snapshot) && snapshot !== null && 'content' in snapshot) {
          const content = snapshot.content;
          if (typeof content === 'string') {
            setOriginalText(content);
          }
        }
      } catch (error) {
        console.error("Error parsing version content:", error);
        toast({ title: "Error", description: "Could not load this version.", variant: "destructive" });
      }
    }
  };

  const generateFaq = () => {
    if (!originalText.trim()) {
      toast({ title: "Error", description: "Please enter some text.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const sampleFaq = `# FAQ\n\n## What is this?\nA chatbot builder tool.`;
      setGeneratedText(sampleFaq);
      setIsGenerating(false);
      toast({ title: "FAQ Generated", description: "Success" });
    }, 2000);
  };

  const revertToOriginal = () => {
    setGeneratedText("");
    toast({ title: "Reverted", description: "Original restored." });
  };

  const savePrompt = async () => {
    if (!selectedBotId || !originalText.trim()) {
      toast({ title: "Error", description: "Select bot and enter text.", variant: "destructive" });
      return;
    }
    try {
      const existing = prompts.find(p => p.step === 1);
      if (existing) {
        updatePrompt({ id: existing.id, content: originalText });
      } else {
        createPrompt({ bot_id: selectedBotId, step: 1, content: originalText });
      }
      toast({ title: "Success", description: "Prompt saved." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Save failed.", variant: "destructive" });
    }
  };

  const saveFaqContent = async () => {
    if (!selectedBotId || !generatedText) {
      toast({ title: "Error", description: "Generate FAQ first.", variant: "destructive" });
      return;
    }
    try {
      saveFaq({ bot_id: selectedBotId, original_text: originalText, generated_faq: generatedText });
      toast({ title: "Success", description: "FAQ saved." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Save FAQ failed.", variant: "destructive" });
    }
  };

  const handleAcceptSuggestion = (text: string) => {
    setOriginalText(text);
    toast({ title: "Applied", description: "Suggestion accepted." });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2AB6A6] mb-1">Improve Agent</h1>
          <p className="text-gray-500 dark:text-gray-300 mt-2 text-base">Refine your AI agent's abilities.</p>
        </div>
        <div className="w-full md:w-64">
          {isLoadingBots ? (
            <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
          ) : (
            <Select value={selectedBotId} onValueChange={handleBotChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a bot" />
              </SelectTrigger>
              <SelectContent>
                {bots.map(bot => (
                  <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {selectedBotId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prompt Editor */}
          <div className="bg-white rounded-2xl shadow border border-neutral-200 p-6 space-y-4 transition-all min-h-[500px]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Prompt Editor</h2>
              {versions.length > 0 && (
                <div className="w-48">
                  <Select value={selectedVersion} onValueChange={handleVersionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Latest version" />
                    </SelectTrigger>
                    <SelectContent>
                      {versions.map(version => (
                        <SelectItem key={version.id} value={version.id}>
                          {new Date(version.created_at).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Textarea value={originalText} onChange={(e) => setOriginalText(e.target.value)} className="min-h-[200px] rounded-xl border p-4 resize-none" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={savePrompt} disabled={!originalText.trim()}>Save</Button>
              <Button onClick={generateFaq} disabled={isGenerating || !originalText.trim()}>
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>

          {/* Ergebnisbereich (Tabs + Inhalte) */}
          <div className="bg-white rounded-2xl shadow border border-neutral-200 p-6 space-y-4 transition-all min-h-[500px]">
            <Tabs defaultValue="ai-prompter">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="ai-prompter">AI Prompter</TabsTrigger>
                <TabsTrigger value="test-ai">Test AI</TabsTrigger>
              </TabsList>

              <TabsContent value="ai-prompter" className="mt-4">
                {generatedText ? (
                  <>
                    <pre className="bg-muted p-4 rounded text-sm whitespace-pre-wrap max-h-[300px] overflow-auto">{generatedText}</pre>
                    <div className="flex justify-between mt-4">
                      <Button variant="outline" size="sm" onClick={revertToOriginal}><RotateCcw className="mr-2 h-4 w-4" />Revert</Button>
                      <Button size="sm" onClick={saveFaqContent}>Save as FAQ</Button>
                    </div>
                  </>
                ) : (
                  <AIPrompter onAccept={handleAcceptSuggestion} originalText={originalText} />
                )}
              </TabsContent>

              <TabsContent value="test-ai" className="mt-4">
                <ChatInterface botName="Test Bot" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed rounded-xl">
          <h3 className="text-lg font-medium mb-2">No AI Agents Available</h3>
          <p className="text-muted-foreground mb-6">Create your first AI agent to begin.</p>
          <Button onClick={() => typeof window !== "undefined" && (window.location.href = "/build")}> 
            <Plus className="h-4 w-4 mr-2" /> Create Agent
          </Button>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button onClick={() => setIsIntegrationModalOpen(true)} variant="outline">
          <Plus className="h-4 w-4 mr-2" /> Add Integration
        </Button>
      </div>
    </div>
  );
};

export default ImproveAgent;
