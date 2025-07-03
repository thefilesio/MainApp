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
            "Access-Control-Allow-Methods": "POST, OPTIONS",
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
        const { widgetId } = params;

        if (!widgetId) {
            return new Response(JSON.stringify({ error: "Widget ID is required" }), {
                status: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! // only on server
        );
        const { data: widget, error:widgetError } = await supabase
            .from("widgets")
            .select("*, bots(*, versions(*))")
            .eq("id", widgetId)
            .single();

        if (widget?.bots?.versions?.length) {
            widget.bots.versions.sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            );
            widget.bots.latest_version = widget.bots.versions[0];

            // remove versions from widget response
            delete widget.bots.versions;
        }
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
