
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  user_id: string;
  openai_api_key: string;
  created_at: string;
}

export const useApiKey = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchApiKey = async (): Promise<ApiKey | null> => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) throw error;
    return data;
  };

  const saveApiKey = async (apiKey: string): Promise<ApiKey> => {
    if (!user) throw new Error("User not authenticated");
    
    // First check if the user already has an API key
    const { data: existingKey } = await supabase
      .from("api_keys")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    
    if (existingKey) {
      // Update existing key
      const { data, error } = await supabase
        .from("api_keys")
        .update({ openai_api_key: apiKey })
        .eq("id", existingKey.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } else {
      // Create new key
      const { data, error } = await supabase
        .from("api_keys")
        .insert({ 
          user_id: user.id, 
          openai_api_key: apiKey 
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    }
  };

  const deleteApiKey = async (): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from("api_keys")
      .delete()
      .eq("user_id", user.id);
      
    if (error) throw error;
  };

  const testApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) {
      throw new Error("API key is required for testing");
    }
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API key test failed: ${errorData.error.message}`);
    }
    return true; // If the request was successful, the API key is valid
  };

  const apiKeyQuery = useQuery({
    queryKey: ["apiKey", user?.id],
    queryFn: fetchApiKey,
    enabled: !!user,
  });

  const saveApiKeyMutation = useMutation({
    mutationFn: saveApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKey", user?.id] });
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save API key",
        variant: "destructive",
      });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKey", user?.id] });
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive",
      });
    },
  });

  const testApiKeyMutation = useMutation({
    mutationFn: testApiKey,
  });

  return {
    apiKey: apiKeyQuery.data,
    isLoading: apiKeyQuery.isLoading,
    error: apiKeyQuery.error,
    saveApiKey: saveApiKeyMutation.mutate,
    deleteApiKey: deleteApiKeyMutation.mutate,
    testApiKey: testApiKeyMutation.mutateAsync,
  };
};
