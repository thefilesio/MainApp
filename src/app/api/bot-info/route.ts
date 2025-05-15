import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

// CORS Preflight Handler
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://chat.thefiles.io',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId');

    if (!botId) {
      return new Response(
        JSON.stringify({ error: 'Bot ID is required' }),
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': 'https://chat.thefiles.io' }
        }
      );
    }

    const [botResponse, promptsResponse] = await Promise.all([
      supabase
        .from('bots')
        .select('*')
        .eq('id', botId)
        .single(),
      supabase
        .from('suggested_prompts')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: true })
    ]);

    if (botResponse.error) {
      return new Response(
        JSON.stringify({ error: 'Bot not found' }),
        {
          status: 404,
          headers: { 'Access-Control-Allow-Origin': 'https://chat.thefiles.io' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        bot: botResponse.data,
        suggestedPrompts: promptsResponse.data || []
      }),
      {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': 'https://chat.thefiles.io' }
      }
    );

  } catch (error) {
    console.error('Error fetching bot info:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch bot info',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': 'https://chat.thefiles.io' }
      }
    );
  }
}
