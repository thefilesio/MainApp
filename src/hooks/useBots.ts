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
      .select("* , prompts(*), faq_data(*)")
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
      console.log("Creating bot:", bot);
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

  const updateBotMutation = useMutation({
    mutationFn: async (bot:any) => {
      console.log("Updating bot:", bot);
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("bots")
        .update(bot)
        .eq("id", bot.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots", user?.id] });
    },
  });

  const deleteBotMutation = useMutation({
    mutationFn: async (botId: string) => {
      console.log("Deleting bot with ID:", botId);
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("bots")
        .delete()
        .eq("id", botId); // Ensure botId is passed correctly
      if (error) throw error;
      return botId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots", user?.id] });
    },
  });


  // create find bot by id function using queryClient table bots and relation to table version
  const findBotById = (botId: string) => {
    const bots = queryClient.getQueryData<Bot[]>(["bots", user?.id]);
    return bots?.find((bot) => bot.id === botId) || null;
  }

  // refresh the bots query
  const refreshBots = async () => {
    queryClient.invalidateQueries({ queryKey: ["bots", user?.id] });
  };

  
  return {
    bots: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createBot: createBotMutation.mutateAsync,
    findBotById,
    updateBot: updateBotMutation.mutateAsync,
    refreshBots,
    deleteBot: deleteBotMutation.mutateAsync,
  };
};
