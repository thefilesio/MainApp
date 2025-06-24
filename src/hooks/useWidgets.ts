import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useWidgets = () => {
    const { user } = useAuth();
  
  const findWidgetById = async (widgetId: string) => {
    try {
      const res = await fetch(`/api/widget/${widgetId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Include any necessary authentication headers here
        },
      });
      if (!res.ok) {
        throw new Error(`Error fetching widget: ${res.statusText}`);
      }
      const response = await res.json();
      return response.widget;
    } catch (error) {
      console.error("Error fetching bots:", error);
      throw error;
    }
  };

  const fetchWidgets = async () => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
            .from("widgets")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching widgets:", error);
      throw error;
    }
  };
  return {
    findWidgetById,
    fetchWidgets,
  };
};
