
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

interface Version {
  id: string;
  bot_id: string;
  prompt_snapshot: {
    [key: string]: Json | undefined;
    step?: number;
    content?: string;
  } | Json[] | null;
  created_at: string;
}

export const useVersions = (botId?: string) => {
  const { user } = useAuth();

  const fetchVersions = async (): Promise<Version[]> => {
    if (!user || !botId) return [];
    
    const { data, error } = await supabase
      .from("versions")
      .select("*")
      .eq("bot_id", botId)
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to match the Version interface
    const transformedData = data?.map(item => ({
      id: item.id,
      bot_id: item.bot_id,
      created_at: item.created_at,
      prompt_snapshot: typeof item.prompt_snapshot === 'object' 
        ? item.prompt_snapshot 
        : null
    })) || [];
    
    return transformedData;
  };

  const versionsQuery = useQuery({
    queryKey: ["versions", botId, user?.id],
    queryFn: fetchVersions,
    enabled: !!user && !!botId,
  });

  return {
    versions: versionsQuery.data || [],
    isLoading: versionsQuery.isLoading,
    error: versionsQuery.error,
    fetchVersions: versionsQuery.refetch,
  };
};
