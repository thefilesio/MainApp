import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic"; // Wichtig bei App Router für Edge Support

// OPTIONS für CORS
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}

// POST für Chat
export async function GET(
    req: NextRequest,
    { params }: { params: { widgetId: string } }
) {
    try {

        // allow all requests from all origins
       
        const { widgetId } = params;

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! // only on server
        );
        const { data: widget, error:widgetError } = await supabase
            .from("widgets")
            .select("*)")
            .eq("id", widgetId)
            .single();

       
        if (widgetError || !widget) {
            return new Response(JSON.stringify({ error: "Widget not found" }), {
                status: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            });
        }

        return new Response(JSON.stringify({ widget }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error: any) {
        console.error("Chat API error:", error);
        return new Response(
            JSON.stringify({ error: "Internal error", detail: error.message }),
            {
                status: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            }
        );
    }
}
