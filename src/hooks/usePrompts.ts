import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Prompt {
  id: string;
  bot_id: string;
  step: number;
  content: string | null;
  created_at: string;
}

interface CreatePromptInput {
  bot_id: string;
  step: number;
  content: string | null;
}

export const usePrompts = (botId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchPrompts = async (): Promise<Prompt[]> => {
    if (!user || !botId) return [];
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("bot_id", botId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  };

  const createPrompt = async (input: CreatePromptInput): Promise<Prompt> => {
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("prompts")
      .insert(input)
      .select()
      .single();
    if (error) throw error;

    return data;
  };

  const updatePrompt = async (id: string, content: string | null): Promise<Prompt> => {
    if (!user) throw new Error("Not authenticated");

    const { data: prompt, error: findError } = await supabase
      .from("prompts")
      .select("bot_id, step")
      .eq("id", id)
      .single();
    if (findError) throw findError;

    const { data, error } = await supabase
      .from("prompts")
      .update({ content })
      .eq("id", id)
      .select()
      .single();

        console.log("Updated prompt:", data);
    if (error) throw error;

    return data;
  };

  const createVersionSnapshot = async (botId: string, data:any) => {
    if (!user) return;
    const { error } = await supabase
      .from("versions")
      .insert({ bot_id: botId, prompt_snapshot: data });
    if (error) console.error("Version snapshot failed:", error);
  };

  const getLatestPrompt = async (botId: string, step: number): Promise<Prompt | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("bot_id", botId)
      .eq("step", step)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  };

  const promptsQuery = useQuery({
    queryKey: ["prompts", botId, user?.id],
    queryFn: fetchPrompts,
    enabled: !!user && !!botId,
  });

  const createMutation = useMutation({
    mutationFn: createPrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts", botId, user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string | null }) => updatePrompt(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts", botId, user?.id] });
    },
  });

  return {
    prompts: promptsQuery.data || [],
    isLoading: promptsQuery.isLoading,
    error: promptsQuery.error,
    createPrompt: createMutation.mutate,
    updatePrompt: updateMutation.mutate,
    getLatestPrompt,
    createVersionSnapshot
  };
};
