import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Building2, Code, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBots } from "@/hooks/useBots";
import { usePrompts } from "@/hooks/usePrompts";
import { useFaqData } from "@/hooks/useFaqData";
import { useAuth } from "@/contexts/AuthContext";

interface CreateBotModalProps {
  open: boolean;
  onClose: () => void;
}

type Template = "sales" | "support" | "blank";
type Step = "initial" | "configuration";

const CreateBotModal = ({ open, onClose }: CreateBotModalProps) => {
  const { toast } = useToast();
  const { createBot } = useBots();
  const { user, loading } = useAuth();
  const [currentBotId, setCurrentBotId] = useState<string | null>(null);
  const { createPrompt } = usePrompts(currentBotId || undefined);
  const { saveFaq } = useFaqData(currentBotId || undefined);

  const [step, setStep] = useState<Step>("initial");
  const [currentTab, setCurrentTab] = useState("personality");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
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
    }
  }, [open]);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    
    // Set default content based on template
    if (template === "sales") {
      setPersonality("Create an AI that works as a receptionist for a test Company. Friendly, engaging, but also have the sales skills of Jeremy Miner.");
      setPurpose("The AI should ALWAYS answer any questions and objections first, AND ALWAYS ask this question first:\n1. (Insert: sales question based on industry)\nThen ask:\n2. (second industry-relevant question)\n3. Would mornings or afternoons work better for a quick phone call?");
      setTone("The AI should speak in the selected language. The prompt should be written in that language. Tone: informal, friendly, like two friends texting (Hemingway grade 3).");
      setRules("1. Only ask one question at a time.\n2. Never repeat a question.\n3. Don't use !'s extensively.\n4. Use smiley emojis sometimes.");
      setFaq("Q: What payment methods do you accept?\nA: We accept all major credit cards, PayPal, and bank transfers.\n\nQ: What is your return policy?\nA: We offer a 30-day satisfaction guarantee on all our products.");
    } else if (template === "support") {
      setPersonality("Create an AI that should work as a support agent for a zugdienstleister Company. Friendly, engaging, with great support skills and empathy.");
      setPurpose("The AI should handle any objections and questions from zugdienstleister customers. Then ask a variation of is there anything else I can help you with?");
      setTone("The AI should speak deutsch. The prompt should be written in deutsch. AI should speak Informal and friendly tone. Like 2 friends texting on SMS. Grade 3 according to the Hemingway app.");
      setRules("1. Handle questions with empathy and understanding.\n2. Never repeat a customer's question.\n3. Don't use !'s extensively.\n4. Use smiley emojis sometimes.");
      setFaq("Q: How do I reset my password?\nA: You can reset your password by clicking the 'Forgot Password' link on the login page.\n\nQ: How do I cancel my subscription?\nA: You can cancel your subscription by going to Account Settings > Subscriptions > Cancel.");
    } else {
      // blank template
      setPersonality("");
      setPurpose("");
      setTone("");
      setRules("");
      setFaq("");
    }
  };

  const handleContinue = () => {
    if (!name.trim() || !selectedTemplate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
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
      let salesQuestion = `What challenges are you facing in the ${industry} industry?`;
      let secondQuestion = `How is your ${industry} business currently handling these challenges?`;
      
      // Replace placeholders
      result = result.replace(/\(Insert: sales question based on industry\)/g, salesQuestion);
      result = result.replace(/\(second industry-relevant question\)/g, secondQuestion);
      result = result.replace(/\(Insert: sales question based on user's "industry"\)/g, salesQuestion);
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
        toast({
          title: "Error",
          description: "Please complete all fields before proceeding.",
          variant: "destructive",
        });
        return;
      }
      setCurrentTab("knowledge");
    }
  };

  const handleSubmit = async () => {
    if (!user || loading) return; // Warten bis geladen
    try {
      if (!name) {
        toast({
          title: "Error",
          description: "Please provide a name for your bot.",
          variant: "destructive",
        });
        return;
      }
      console.log("Creating bot...");
      const newBot = await createBot({
        name,
        industry,
        language,
        template: selectedTemplate || undefined,
      });
      console.log("Bot created:", newBot);
      setCurrentBotId(newBot.id);

      // Process template texts to replace placeholders
      const processedPersonality = replacePlaceholders(personality);
      const processedPurpose = replacePlaceholders(purpose);
      const processedTone = replacePlaceholders(tone);

      // Then create prompts for personality, purpose and tone (step 1)
      if (processedPersonality || processedPurpose || processedTone) {
        createPrompt({
          bot_id: newBot.id,
          step: 1,
          content: JSON.stringify({
            personality: processedPersonality,
            purpose: processedPurpose,
            tone: processedTone,
          }),
        });
      }

      // Create prompts for rules (step 2)
      if (rules) {
        createPrompt({
          bot_id: newBot.id,
          step: 2,
          content: rules,
        });
      }

      // Create FAQ data if available
      if (faq) {
        saveFaq({
          bot_id: newBot.id,
          original_text: "",
          generated_faq: faq,
        });
      }

      toast({
        title: "Success",
        description: "Your AI agent has been created successfully.",
      });

      onClose();
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderInitialStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-extrabold tracking-tight text-[#2AB6A6] dark:text-[#D9F4F0] mb-2">Create AI Agent</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-6 py-4">
        <div className="grid gap-3">
          <Label htmlFor="name">AI Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g., Sales Assistant"
            className="rounded-xl border border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base"
          />
        </div>
        
        <div className="grid gap-3">
          <Label htmlFor="industry">Industry</Label>
          <Input 
            id="industry" 
            value={industry} 
            onChange={(e) => setIndustry(e.target.value)} 
            placeholder="e.g., E-commerce, Healthcare, Education"
            className="rounded-xl border border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base"
          />
        </div>
        
        <div className="grid gap-3">
          <Label htmlFor="language">Language</Label>
          <Input 
            id="language" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)} 
            placeholder="e.g., English, German, Spanish"
            className="rounded-xl border border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base"
          />
        </div>
        
        <div className="grid gap-3 pt-3">
          <Label>Choose a Template</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card 
              className={`cursor-pointer rounded-xl border border-[#D9F4F0] dark:border-[#22304a] bg-[#fefcf9] dark:bg-[#22304a] shadow-md hover:shadow-xl transition-all ${selectedTemplate === "sales" ? "ring-2 ring-[#2AB6A6]" : ""}`}
              onClick={() => handleSelectTemplate("sales")}
            >
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#D9F4F0] dark:bg-[#101624] flex items-center justify-center mb-3 shadow">
                  <MessageSquare className="h-6 w-6 text-[#2AB6A6] dark:text-[#D9F4F0]" />
                </div>
                <h3 className="font-bold mb-2 text-[#2AB6A6] dark:text-[#D9F4F0]">Sales AI</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">Perfect for product recommendations and sales inquiries</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer rounded-xl border border-[#D9F4F0] dark:border-[#22304a] bg-[#fefcf9] dark:bg-[#22304a] shadow-md hover:shadow-xl transition-all ${selectedTemplate === "support" ? "ring-2 ring-[#2AB6A6]" : ""}`}
              onClick={() => handleSelectTemplate("support")}
            >
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#D9F4F0] dark:bg-[#101624] flex items-center justify-center mb-3 shadow">
                  <Bot className="h-6 w-6 text-[#2AB6A6] dark:text-[#D9F4F0]" />
                </div>
                <h3 className="font-bold mb-2 text-[#2AB6A6] dark:text-[#D9F4F0]">Support AI</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">Helps users with common issues and questions</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer rounded-xl border border-[#D9F4F0] dark:border-[#22304a] bg-[#fefcf9] dark:bg-[#22304a] shadow-md hover:shadow-xl transition-all ${selectedTemplate === "blank" ? "ring-2 ring-[#2AB6A6]" : ""}`}
              onClick={() => handleSelectTemplate("blank")}
            >
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#D9F4F0] dark:bg-[#101624] flex items-center justify-center mb-3 shadow">
                  <Code className="h-6 w-6 text-[#2AB6A6] dark:text-[#D9F4F0]" />
                </div>
                <h3 className="font-bold mb-2 text-[#2AB6A6] dark:text-[#D9F4F0]">Start Blank</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">Create a custom AI from scratch</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
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
        <DialogTitle className="text-2xl font-extrabold tracking-tight text-[#2AB6A6] dark:text-[#D9F4F0] mb-2">Configure Your AI</DialogTitle>
      </DialogHeader>
      
      <Tabs 
        defaultValue="personality" 
        value={currentTab}
        onValueChange={setCurrentTab}
        className="mt-4"
      >
        <TabsList className="grid w-full grid-cols-2 rounded-xl bg-[#D9F4F0] dark:bg-[#22304a] p-1 mb-4">
          <TabsTrigger className="rounded-xl font-bold text-[#2AB6A6] dark:text-[#D9F4F0] data-[state=active]:bg-white dark:data-[state=active]:bg-[#101624] data-[state=active]:shadow" value="personality">Step 1: Personality & Purpose</TabsTrigger>
          <TabsTrigger value="knowledge">Step 2: Knowledge & Rules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personality" className="py-4 space-y-6">
          <div className="grid gap-3">
            <Label htmlFor="personality">Describe the AI</Label>
            <p className="text-xs text-gray-500 dark:text-gray-300">The AIs job, name, purpose, and goal with each conversation.</p>
            <Textarea 
              id="personality" 
              value={personality} 
              onChange={(e) => setPersonality(e.target.value)} 
              placeholder="Describe the personality of your AI..."
              rows={3}
              className="rounded-xl border border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base resize-none"
            />
          </div>
          
          <div className="grid gap-3">
            <Label htmlFor="purpose">What questions should the AI ask?</Label>
            <p className="text-xs text-gray-500 dark:text-gray-300">What questions should be asked? Should it have a structured flow?</p>
            <Textarea 
              id="purpose" 
              value={purpose} 
              onChange={(e) => setPurpose(e.target.value)} 
              placeholder="What is the main purpose of this AI?"
              rows={3}
              className="rounded-xl border border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base resize-none"
            />
          </div>
          
          <div className="grid gap-3">
            <Label htmlFor="tone">Language, Style and Tone</Label>
            <p className="text-xs text-gray-500 dark:text-gray-300">What language should the AI use? Formal/Informal? What tone should the AI use?</p>
            <Textarea 
              id="tone" 
              value={tone} 
              onChange={(e) => setTone(e.target.value)} 
              placeholder="How should the AI communicate?"
              rows={3}
              className="rounded-xl border border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base resize-none"
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
              className="rounded-xl border border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base resize-none"
            />
          </div>
          
          <div className="grid gap-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="faq">Company FAQ</Label>
              <div className="space-x-2">
                <Button variant="outline" size="sm">Import from Website</Button>
                <Button variant="outline" size="sm">Turn into FAQ</Button>
              </div>
            </div>
            <Textarea 
              id="faq" 
              value={faq} 
              onChange={(e) => setFaq(e.target.value)} 
              placeholder="Add frequently asked questions and answers..."
              rows={6}
              className="rounded-xl border border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 focus:ring-2 focus:ring-[#2AB6A6] transition-all text-base resize-none"
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleBack}>Back</Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={currentTab === "personality" ? handleNextInConfiguration : handleSubmit}
            className="rounded-xl bg-[#2AB6A6] text-white font-bold px-6 py-2 shadow hover:bg-[#229b8e] transition-all disabled:opacity-60"
          >
            {currentTab === "personality" ? "Next" : "Create AI"}
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-[#fefcf9] dark:bg-[#101624] border border-[#D9F4F0] dark:border-[#22304a] rounded-2xl shadow-2xl p-8 max-w-xl w-full transition-colors duration-300"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {step === "initial" ? renderInitialStep() : renderConfigurationStep()}
      </DialogContent>
    </Dialog>
  );
};

export default CreateBotModal;
