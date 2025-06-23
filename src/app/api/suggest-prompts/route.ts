import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { companyInfo, rules } = await req.json();

    if (!companyInfo || !rules) {
      return new Response(
        JSON.stringify({ error: 'Company info and rules are required' }),
        { status: 400 }
      );
    }

    // Get the user's API key
    const { data: apiKey, error: keyError } = await supabase
      .from('api_keys')
      .select('openai_api_key')
      .single();

    if (keyError || !apiKey?.openai_api_key) {
      return new Response(
        JSON.stringify({ error: 'No API key found' }),
        { status: 401 }
      );
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: apiKey.openai_api_key,
    });

    // Generate prompts using GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that generates relevant questions for a chatbot based on company information and rules.
            Generate 5-7 common questions that visitors might ask about this company.
            Consider both the company information and any specific rules or guidelines provided.
            Return ONLY a JSON array of strings, with each string being a question.
            Example: ["What are your business hours?", "How can I contact support?"]`
        },
        {
          role: 'user',
          content: `Generate questions based on this information:

Company Information:
${companyInfo}

Rules and Guidelines:
${rules}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No response content from OpenAI');
    }

    const { prompts } = JSON.parse(responseContent);

    return new Response(
      JSON.stringify({ prompts }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error generating prompts:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate prompts',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
} 