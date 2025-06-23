export const dynamic = "force-dynamic";

import ChatWidget from '@/components/ChatWidget';
import { useRouter } from 'next/navigation';

export default function SharedBotPage({ params }: { params: { botId?: string } }) {
  const router = useRouter();
  if (!params?.botId) {
  // redirect to 404 page if botId is not provided
    router.push('/404');
    return null;
  }
  return (
    <div className="w-screen h-screen bg-background text-foreground">
      <ChatWidget widgetId={params.botId} />
    </div>
  );
}
