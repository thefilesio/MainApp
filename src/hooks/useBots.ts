import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Bot {
  id: string;
  name: string;
  industry: string | null;
  language: string | null;
  model: string | null;
  user_id: string;
  created_at: string;
  assistant_id?: string | null;
  template?: string | null;
}

export const useBots = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchBots = async (): Promise<Bot[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("bots")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const query = useQuery({
    queryKey: ["bots", user?.id],
    queryFn: fetchBots,
    enabled: !!user,
  });

  const createBotMutation = useMutation({
    mutationFn: async (bot: any) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("bots")
        .insert([{ ...bot, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots", user?.id] });
    },
  });

  return {
    bots: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createBot: createBotMutation.mutateAsync,
  };
};
