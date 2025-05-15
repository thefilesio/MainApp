import { supabase } from '@/lib/supabaseClient';

type SaveMessageOptions = {
  botId: string;
  role: 'user' | 'assistant';
  content: string;
  userId?: string; // optional for anonymous
};

export async function saveMessage({ botId, role, content, userId }: SaveMessageOptions) {
  const { data, error } = await supabase.from('messages').insert([
    {
      bot_id: botId,
      role,
      content,
      user_id: userId || null,
    },
  ]);

  if (error) {
    console.error('Error saving message:', error.message);
    return { error };
  }

  return { data };
}
