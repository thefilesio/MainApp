import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FaqData {
  id: string;
  bot_id: string;
  original_text: string | null;
  generated_faq: string | null;
  created_at: string;
}

interface SaveFaqInput {
  bot_id: string;
  original_text: string | null;
  generated_faq: string | null;
}

export const useFaqData = (botId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchFaqData = async (): Promise<FaqData[]> => {
    if (!user || !botId) return [];
    const { data, error } = await supabase
      .from("faq_data")
      .select("*")
      .eq("bot_id", botId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  };

  const saveFaq = async (input: SaveFaqInput): Promise<FaqData> => {
    if (!user) throw new Error("Not authenticated");
    const { data: existing } = await supabase
      .from("faq_data")
      .select("id")
      .eq("bot_id", input.bot_id)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from("faq_data")
        .update(input)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from("faq_data")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  };


  const updateFaq = async (input: SaveFaqInput): Promise<FaqData> => {
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("faq_data")
      .update(input)
      .eq("bot_id", input.bot_id)
      .select()
      .single();
    if (error) throw error;
    return data;
  };  

  const query = useQuery({
    queryKey: ["faqData", botId, user?.id],
    queryFn: fetchFaqData,
    enabled: !!user && !!botId,
  });

  const mutation = useMutation({
    mutationFn: saveFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqData", botId, user?.id] });
    },
  });

  return {
    faqData: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    saveFaq: mutation.mutate,
    updateFaq: updateFaq,
  };
};
