// public/widget.js
(function () {
    const loadWidget = async (widgetId) => {
      try {
        const response = await fetch(`https://your-backend.com/api/widget/${widgetId}`);
        const config = await response.json();
  
        const container = document.createElement('div');
        container.id = 'chatbot-widget';
        document.body.appendChild(container);
  
        const style = document.createElement('style');
        style.innerHTML = `
          #chatbot-widget {
            position: fixed;
            ${config.position === 'bottom-left' ? 'left: 1.5rem;' : 'right: 1.5rem;'}
            bottom: 1.5rem;
            z-index: 9999;
          }
          #chatbot-bubble {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background-color: ${config.color};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          #chatbot-iframe {
            display: none;
            width: ${config.width}px;
            height: ${config.height}px;
            max-height: 80vh;
            border: none;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.25);
          }
        `;
        document.head.appendChild(style);
  
        const bubble = document.createElement('div');
        bubble.id = 'chatbot-bubble';
        bubble.innerHTML = `<img src="${config.buttonIconUrl || 'https://your-cdn.com/default-icon.png'}" width="28" height="28">`;
        container.appendChild(bubble);
  
        const iframe = document.createElement('iframe');
        iframe.id = 'chatbot-iframe';
        iframe.src = `https://your-widget-host.com/embed/${widgetId}`;
        container.appendChild(iframe);
  
        bubble.addEventListener('click', () => {
          iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none';
        });
      } catch (error) {
        console.error('[AI Widget] Error loading widget config:', error);
      }
    };
  
    window.AIChatWidget = {
      init: ({ widgetId }) => {
        if (!widgetId) return console.error('No widgetId provided');
        loadWidget(widgetId);
      }
    };
  })();
  