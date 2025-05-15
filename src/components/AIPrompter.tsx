
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, SendIcon, CheckIcon, XIcon } from "lucide-react";

interface AIPrompterProps {
  onAccept: (text: string) => void;
  originalText: string;
}

const AIPrompter = ({ onAccept, originalText }: AIPrompterProps) => {
  const { toast } = useToast();
  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = () => {
    if (!userInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description of your needs.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulating an API call to generate a prompt
    setTimeout(() => {
      // Generate a prompt based on the user input and original text
      let generatedPrompt = "";
      
      if (userInput.toLowerCase().includes("sales")) {
        generatedPrompt = `I am a sales assistant focused on helping customers find the right products.
        
I should be friendly, knowledgeable, and persuasive without being pushy. I'll ask relevant questions to understand customer needs better and provide personalized recommendations.

My tone should be professional yet conversational, and I should always highlight the benefits of our products rather than just features.`;
      } else if (userInput.toLowerCase().includes("support")) {
        generatedPrompt = `I am a customer support assistant dedicated to solving user problems efficiently.
        
I should be patient, empathetic, and thorough in my responses. I'll ask clarifying questions when needed and provide step-by-step solutions to technical issues.

My tone should be helpful and reassuring, making sure customers feel heard and valued throughout our interaction.`;
      } else {
        generatedPrompt = `${originalText}

Based on your request, I've refined the prompt to be more ${userInput.includes('friendly') ? 'friendly and conversational' : 'clear and professional'}. 

The AI will now ${userInput.includes('question') ? 'ask more targeted questions to better understand user needs' : 'provide more detailed information upfront before asking questions'}.`;
      }
      
      setAiResponse(generatedPrompt);
      setIsGenerating(false);
      
      toast({
        title: "Prompt Generated",
        description: "AI has suggested a new prompt based on your input.",
      });
    }, 1500);
  };

  const acceptSuggestion = () => {
    onAccept(aiResponse);
    setUserInput("");
    setAiResponse("");
    toast({
      title: "Success",
      description: "The suggested prompt has been accepted.",
    });
  };

  const rejectSuggestion = () => {
    setAiResponse("");
    toast({
      title: "Rejected",
      description: "The suggested prompt has been rejected.",
    });
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
          className="mt-2"
          disabled={isGenerating || !userInput.trim()}
        >
          {isGenerating ? "Generating..." : "Generate Suggestion"}
          {!isGenerating && <SendIcon className="ml-2 h-4 w-4" />}
        </Button>
      </div>

      {aiResponse && (
        <div className="flex-1">
          <div className="mb-2 font-medium text-sm">AI Suggestion:</div>
          <div className="bg-muted/50 rounded-md p-4 mb-4 overflow-y-auto max-h-[300px]">
            <pre className="whitespace-pre-wrap font-sans text-sm">{aiResponse}</pre>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={rejectSuggestion}
            >
              <XIcon className="mr-1 h-4 w-4" /> Reject
            </Button>
            <Button 
              size="sm"
              onClick={acceptSuggestion}
            >
              <CheckIcon className="mr-1 h-4 w-4" /> Accept
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPrompter;
