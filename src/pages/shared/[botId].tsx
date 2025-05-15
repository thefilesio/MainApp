export const dynamic = "force-dynamic";

import ChatWidget from '@/components/ChatWidget';

export default function SharedBotPage({ params }: { params: { botId?: string } }) {
  if (!params?.botId) {
    return <div>Missing botId</div>;
  }
  return (
    <div className="w-screen h-screen bg-background text-foreground">
      <ChatWidget widgetId={params.botId} />
    </div>
  );
}
