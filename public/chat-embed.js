import { createRoot } from 'react-dom/client';
import ChatWidget from './ChatWidget.jsx'; // gebuildet nach /public/embed/

export function initWidget(widgetId) {
  const root = createRoot(document.getElementById('chat-root'));
  root.render(<ChatWidget widgetId={widgetId} />);
}
