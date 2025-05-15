import { supabase } from '../supabaseClient';

export async function getWidgetById(widgetId: string) {
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('id', widgetId)
    .single();

  if (error) throw error;
  return data;
}
