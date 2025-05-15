import { useEffect, useState } from 'react';
import { getWidgetById } from '@/lib/api/getWidget';
import { saveMessage } from '@/lib/api/saveMessage';
import { useApiKeyContext } from '@/contexts/ApiKeyContext';

type WidgetProps = {
  widgetId: string;
};

export function ChatWidget({ widgetId }: WidgetProps) {
  const [config, setConfig] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { apiKey } = useApiKeyContext();

  useEffect(() => {
    async function fetchConfig() {
      const data = await getWidgetById(widgetId);
      setConfig(data);
    }
    fetchConfig();
  }, [widgetId]);

  if (!config) return null;

  // Fallback-URLs für alle Icons/Avatare/Logos
  const safeAvatarUrl = config.avatar_url?.trim() ? config.avatar_url : "https://cdn.chat.thefiles.io/defaults/default-avatar.png";
  const safeIconUrl = config.icon_url?.trim() ? config.icon_url : "https://cdn.chat.thefiles.io/defaults/default-icon.png";
  const safeLogoUrl = config.logo_url?.trim() ? config.logo_url : "https://cdn.chat.thefiles.io/defaults/default-logo.png";

  return (
    <>
      {/* Bubble Button */}
      <div
        className={`fixed z-50 ${config.position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-6'}`}
        onClick={() => setOpen(!open)}
      >
        <img
          src={safeIconUrl}
          alt="Chat"
          className="w-14 h-14 rounded-full shadow-lg cursor-pointer"
          style={{ backgroundColor: config.color || '#3a9e91' }}
        />
        {config.popup_text && !open && (
          <div className="absolute bottom-full mb-2 px-3 py-1 text-sm bg-white dark:bg-gray-800 text-black dark:text-white rounded shadow">
            {config.popup_text}
          </div>
        )}
      </div>

      {/* Chat Window */}
      {open && (
        <div
          className="fixed z-50 shadow-lg rounded-lg overflow-hidden"
          style={{
            width: config.width || 400,
            height: config.height || 500,
            bottom: '6rem',
            right: config.position === 'bottom-left' ? 'auto' : '1.5rem',
            left: config.position === 'bottom-left' ? '1.5rem' : 'auto',
            backgroundColor: config.theme === 'dark' ? '#1f2937' : '#ffffff',
            color: config.theme === 'dark' ? '#ffffff' : '#000000',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
              <img src={safeAvatarUrl} alt="Avatar" className="w-6 h-6 rounded-full" />
              <span className="font-medium text-sm">{config.title || 'Chat Widget'}</span>
            </div>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          {/* Chat Body */}
          <div className="flex flex-col justify-between h-[calc(100%-48px)] p-4 text-sm overflow-hidden">
            <div className="flex flex-col gap-2 overflow-y-auto mb-2">
              {config.welcome_msg && (
                <div className="bg-gray-100 dark:bg-gray-700 text-black dark:text-white p-2 rounded max-w-[85%] self-start">
                  {config.welcome_msg}
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-teal-100 self-end'
                      : 'bg-gray-200 dark:bg-gray-700 self-start'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!input.trim() || !apiKey) return;

                const userMessage = { role: 'user' as const, content: input.trim() };
                setMessages((prev) => [...prev, userMessage]);
                setInput('');
                setLoading(true);

                // 🔥 Save user message to Supabase
                await saveMessage({
                  botId: config.bot_id,
                  role: 'user',
                  content: userMessage.content,
                });

                try {
                  const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                      messages: [...messages, userMessage],
                      botId: config.bot_id,
                    }),
                  });

                  const data = await res.json();
                  const assistantMessage = { role: 'assistant' as const, content: data.reply };

                  setMessages((prev) => [...prev, assistantMessage]);

                  // 🔥 Save assistant reply to Supabase
                  await saveMessage({
                    botId: config.bot_id,
                    role: 'assistant',
                    content: assistantMessage.content,
                  });
                } catch (err) {
                  console.error(err);
                } finally {
                  setLoading(false);
                }
              }}
              className="flex gap-2 mt-auto"
            >
              <input
                className="flex-1 px-3 py-2 text-sm rounded border dark:bg-gray-800 dark:text-white"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading || !apiKey}
                className="px-4 text-white bg-teal-600 rounded disabled:opacity-50"
              >
                {loading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWidget;
