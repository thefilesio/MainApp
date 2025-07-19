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
            return null;
        }
    };

    const fetchWidgets = async (params: { isDemo?: boolean } = {}) => {
        if (!user) return [];
        try {
            if (params.isDemo) {
                const { data, error } = await supabase
                    .from("widgets")
                    .select("*, bots(*, versions(*))")
                    .eq("is_demo", true)
                    .order("created_at", { ascending: false });

                if (error) {
                    throw error;
                }
                return data || [];
            } else {
                const { data, error } = await supabase
                    .from("widgets")
                    .select("*, bots(*, versions(*))")
                    .eq("user_id", user.id)
                    .eq("is_demo", false)
                    .order("created_at", { ascending: false });
                if (error) {
                    throw error;
                }
                return data || [];
            }
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
