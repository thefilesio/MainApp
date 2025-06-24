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
            "Access-Control-Allow-Origin": "https://chat.thefiles.io",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}

// POST für Chat
export async function POST(req: Request) {
    try {
        const { token } = await req.json(); 
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`, // <== Token dari client
                    },
                },
            }
        );
        const { data: widgets, error: widgetsError } = await supabase
            .from("widgets")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false });
        return new Response(
            JSON.stringify({
                data: widgets || [],
                error: widgetsError ? widgetsError.message : null,
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "https://chat.thefiles.io",
                },
            }
        );
    } catch (error: any) {
        console.error("Chat API error:", error);
        return new Response(
            JSON.stringify({ error: "Internal error", detail: error.message }),
            {
                status: 500,
                headers: {
                    "Access-Control-Allow-Origin": "https://chat.thefiles.io",
                },
            }
        );
    }
}
