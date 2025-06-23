import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
export async function POST(req: Request) {
    try {
        const { botId, rules, intructions, token } = await req.json();

        if (!botId || !rules || !intructions || !token) {
            return new Response(JSON.stringify({ error: "Invalid input" }), {
                status: 400,
            });
        }
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

        const { data: bot, error: botError } = await supabase
            .from("bots")
            .select("*")
            .eq("id", botId)
            .single();

        // Get the user's API key
        const { data: apiKey, error: keyError } = await supabase
            .from("api_keys")
            .select("openai_api_key")
            .single();

        if (keyError || !apiKey?.openai_api_key) {
            return new Response(JSON.stringify({ error: "No API key found" }), {
                status: 401,
            });
        }

        // Initialize OpenAI
        const openai = new OpenAI({
            apiKey: apiKey.openai_api_key,
        });
        // Generate prompts using GPT-4
        const completion = await openai.chat.completions.create({
            model: bot.model || "gpt-4o",
            messages: [
                {
                    role: "system",

                    content:
                        "You are a prompt optimizer. Your job is to enhance and localize prompts based on user input.",
                },
                {
                    role: "user",
                    content:
                        "Generate a prompt based on the following rules and instructions:\n\n" +
                        `Rules: ${rules}\nInstructions: 
                          Include all relevant details and context from the rules and instructions.If any information is not explicitly categorized (e.g., not clearly part of Tone, Purpose, Rules, or FAQ), treat it as part of the AI's Personality.
                        ${intructions}.
                        Make sure to include all relevant details and context from the rules and instructions.
                        Must be in format:
                        ~Personality
                         personality content
                        ~Personality
                        ~Purpose
                        purpose content
                        ~Purpose
                        ~Tone
                        tone content
                        ~Tone
                        ~Rules
                        rules content
                        ~Rules
                        ~FAQ 
                        faq content
                        ~FAQ 
                        `,
                },
            ],
            temperature: 0.7,
        });

        const responseContent = {
            data: completion.choices[0].message.content,
        };
        if (!responseContent) {
            throw new Error("No response content from OpenAI");
        }

        return new Response(JSON.stringify(responseContent), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // Adjust as needed
            },
        });
    } catch (error) {
        console.error("Error generating prompts:", error);
        return new Response(
            JSON.stringify({
                error: "Failed to generate prompts",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500 }
        );
    }
}
