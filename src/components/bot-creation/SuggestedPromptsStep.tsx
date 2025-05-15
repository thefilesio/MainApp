import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SuggestedPrompt {
  id?: string;
  question: string;
  fixed_response?: string;
  context?: string;
}

interface Step3SuggestedProps {
  botId: string;
  companyInfo: string;
  rules: string;
  onComplete: () => void;
  onBack: () => void;
}

export function Step3Suggested({
  botId,
  companyInfo,
  rules,
  onComplete,
  onBack,
}: Step3SuggestedProps) {
  const [prompts, setPrompts] = useState<SuggestedPrompt[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addPrompt = () => {
    setPrompts([...prompts, { question: '', fixed_response: '', context: '' }]);
  };

  const removePrompt = (index: number) => {
    setPrompts(prompts.filter((_, i) => i !== index));
  };

  const updatePrompt = (index: number, field: keyof SuggestedPrompt, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = { ...newPrompts[index], [field]: value };
    setPrompts(newPrompts);
  };

  const generatePrompts = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/suggest-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyInfo,
          rules,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate prompts');

      const { prompts: generatedPrompts } = await response.json();
      setPrompts(generatedPrompts.map((p: string) => ({ 
        question: p,
        context: `Generated from company info and rules`,
      })));
    } catch (error) {
      console.error('Error generating prompts:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const savePrompts = async () => {
    try {
      const { error } = await supabase
        .from('suggested_prompts')
        .upsert(
          prompts.map(prompt => ({
            bot_id: botId,
            question: prompt.question,
            fixed_response: prompt.fixed_response || null,
            context: prompt.context || null,
            step: 3,
          }))
        );

      if (error) throw error;
      onComplete();
    } catch (error) {
      console.error('Error saving prompts:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Step 3: Suggested Prompts</h2>
        <Button
          variant="outline"
          onClick={generatePrompts}
          disabled={isGenerating}
        >
          <Wand2 className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Automatically'}
        </Button>
      </div>

      <p className="text-muted-foreground">
        Add suggested questions that will help visitors start a conversation with your bot.
        Optionally, you can provide fixed responses that will be shown immediately.
      </p>

      <div className="space-y-4">
        {prompts.map((prompt, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <Input
                    placeholder="Suggested question"
                    value={prompt.question}
                    onChange={(e) => updatePrompt(index, 'question', e.target.value)}
                  />
                  <Textarea
                    placeholder="Fixed response (optional)"
                    value={prompt.fixed_response || ''}
                    onChange={(e) => updatePrompt(index, 'fixed_response', e.target.value)}
                  />
                  <Textarea
                    placeholder="Context (optional)"
                    value={prompt.context || ''}
                    onChange={(e) => updatePrompt(index, 'context', e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePrompt(index)}
                  className="ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <Button
          variant="outline"
          onClick={addPrompt}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Question
        </Button>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={savePrompts}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
} 