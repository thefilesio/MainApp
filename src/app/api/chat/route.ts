import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
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
export async function POST(req: Request) {  
    try {
        const { botId, messages, token } = await req.json(); 
        console.log("Received request with botId:", botId, "and messages:", messages);
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Tetap gunakan anon key sebagai base
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`, // <== Token dari client
                    },
                },
            }
        );
        
        if (!botId || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "Invalid input" }), {
                status: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            });
        }
        console.log("Bot ID:", botId);
        const { data: bot, error: botError } = await supabase
            .from("bots")
            .select("*")
            .eq("id", botId)
            .single();

        if (botError || !bot) {
            return new Response(JSON.stringify({ error: "Bot not found" }), {
                status: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            });
        }

        const lastUserMessage = messages[messages.length - 1].content;

        const { data: suggestedPrompt } = await supabase
            .from("suggested_prompts")
            .select("fixed_response")
            .eq("bot_id", botId)
            .eq("question", lastUserMessage)
            .single();
        if (suggestedPrompt?.fixed_response) {
            return new Response(
                JSON.stringify({
                    message: {
                        role: "assistant",
                        content: suggestedPrompt.fixed_response,
                    },
                }),
                {
                    status: 200,
                    headers: {
                        "Access-Control-Allow-Origin":
                            "https://chat.thefiles.io",
                    },
                }
            );
        }

        const { data: apiKey, error: keyError } = await supabase
            .from("api_keys")
            .select("openai_api_key")
            .eq("user_id", bot.user_id)
            .single();

        if (keyError || !apiKey?.openai_api_key) {
            return new Response(JSON.stringify({ error: "No API key found" }), {
                status: 401,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            });
        }

        const openai = new OpenAI({ apiKey: apiKey.openai_api_key });

        const chatMessages = [
            {
                role: "system",
                content: `You are an AI assistant for [Company Name]. Never fabricate or guess any information about private or internal company details (including history, structure, founders, internal policies, strategy, finances, or client data) unless explicitly provided in your data or documents.

If a user asks something outside your known data, respond politely with:  
"I'm sorry, I don't have enough information about that."  
or  
"That information is not publicly available. Please contact an official representative of the company."

Your job is to respond accurately, truthfully, and without speculation.

Tone: professional, friendly, concise.
`,
            },
            {
                role: "system",
                content: bot.preset_prompt || "You are a helpful assistant.",
            },
            ...messages,
        ];

        const completion = await openai.chat.completions.create({
            model: bot.model || "gpt-3.5-turbo",
            messages: chatMessages,
        });

        const assistantMessage = completion.choices[0].message;
        try {
            await supabase.from("messages").insert([
                {
                    bot_id: botId,
                    user_id: bot.user_id,
                    role: "user",
                    content: lastUserMessage,
                },
                {
                    bot_id: botId,
                    user_id: bot.user_id,
                    role: "assistant",
                    content: assistantMessage.content,
                },
            ]);
        } catch (logError) {
            console.error("Logging failed:", logError);
        }

        return new Response(JSON.stringify({ message: assistantMessage }), {
            status: 200,
            headers: {
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
