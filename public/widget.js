// public/widget.js
(function () {
    const loadWidget = async (widgetId, webUrl) => {
        if (!widgetId) {
            console.error("[AI Widget] No widgetId provided");
            return;
        }

        webUrl = webUrl || "https://app.thefiles.io";

        try {
            const response = await fetch(
                `${webUrl}/api/widget-client/${widgetId}`
            );
            if (!response.ok) throw new Error("Network response was not ok");

            const conf = await response.json();
            if (!conf || !conf.widget)
                throw new Error("No config found for widget ID: " + widgetId);

            console.log("[AI Widget] Loaded config:", widgetId);

            const config = {
                color: conf.widget.color || "#4A90E2",
                position: conf.widget.position || "bottom-right",
                width: conf.widget.width || 400,
                height: conf.widget.height || 600,
                buttonIconUrl: conf.widget.icon_url,
                bubbleSize: conf.widget.bubble_size || 56,
                popupText: conf.widget.popup_text || "",
                theme: conf.widget.theme || "light",
                popup_delay: conf.widget.popup_delay || 0,
            };

            // --- 1. Create main containers ---
            const widgetContainer = document.createElement("div");
            widgetContainer.id = "chatbot-widget";
            document.body.appendChild(widgetContainer);

            const iframe = document.createElement("iframe");
            iframe.id = "chatbot-iframe";
            iframe.src = `${webUrl}/widget/${widgetId}`;
            widgetContainer.appendChild(iframe);

            const triggerContainer = document.createElement("div");
            triggerContainer.id = "chatbot-trigger-container";
            widgetContainer.appendChild(triggerContainer);

            // --- 2. Create the main close button for the iframe ---
            const iframeCloseBtn = document.createElement("button");
            iframeCloseBtn.id = "chatbot-close-btn";
            iframeCloseBtn.innerHTML = "&times;";
            iframeCloseBtn.onclick = closeChat;
            widgetContainer.appendChild(iframeCloseBtn);

            // --- 3. Inject all necessary CSS ---
            const style = document.createElement("style");
            // ... (CSS tidak berubah)
            style.innerHTML = `
                #chatbot-widget {
                    position: fixed;
                    ${
                        config.position === "bottom-left"
                            ? "left: 1.5rem;"
                            : "right: 1.5rem;"
                    }
                    bottom: 1.5rem;
                    z-index: 9999;
                }
                
                #chatbot-trigger-container {
                    display: flex; /* Diubah menjadi flex agar setTimeout bisa menampilkannya */
                    flex-direction: column;
                    align-items: ${
                        config.position === "bottom-left"
                            ? "flex-start"
                            : "flex-end"
                    };
                    gap: 12px;
                }

                #chatbot-bubble {
                    width: ${config.bubbleSize}px;
                    height: ${config.bubbleSize}px;
                    border-radius: 50%;
                    background-color: ${config.color};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transition: transform 0.2s ease;
                }
                #chatbot-bubble:hover {
                    transform: scale(1.1);
                }

                #chatbot-iframe {
                    width: ${config.width}px;
                    height: ${config.height}px;
                    max-height: calc(100vh - 4rem);
                    border: none;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
                    overflow: hidden;
                    display: none;
                }

                #chatbot-close-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 30px;
                    height: 30px;
                    background-color: rgba(0, 0, 0, 0.3);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    font-weight: bold;
                    display: none;
                    justify-content: center;
                    align-items: center;
                    line-height: 1;
                    z-index: 10000;
                }
                #chatbot-close-btn:hover {
                    background-color: rgba(0, 0, 0, 0.5);
                }
                
                .chat-popup-bubble {
                    position: relative;
                    padding: 10px 36px 10px 16px;
                    background: ${
                        config.theme === "dark" ? "#374151" : "#ffffff"
                    };
                    color: ${config.theme === "dark" ? "#f3f4f6" : "#1f2937"};
                    border-radius: 12px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    font-family: sans-serif;
                    font-size: 14px;
                    max-width: 240px;
                    line-height: 1.4;
                    cursor: pointer;
                }
                .chat-popup-bubble::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    width: 0;
                    height: 0;
                    border-style: solid;
                    border-width: 8px 8px 0 8px;
                    border-color: ${
                        config.theme === "dark" ? "#374151" : "#ffffff"
                    } transparent transparent transparent;
                    ${
                        config.position === "bottom-left"
                            ? "left: 20px;"
                            : "right: 20px;"
                    }
                }

                .popup-close-btn {
                    position: absolute;
                    top: 50%;
                    right: 8px;
                    transform: translateY(-50%);
                    background: transparent;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    font-size: 24px;
                    padding: 0;
                    line-height: 1;
                    font-weight: bold;
                }
                .popup-close-btn:hover {
                    color: ${config.theme === "dark" ? "#ffffff" : "#1f2937"};
                }
            `;
            document.head.appendChild(style);

            // --- 4. Create Pop-up (if text exists) ---
            if (config.popupText) {
                const popup = document.createElement("div");
                popup.className = "chat-popup-bubble";
                popup.textContent = config.popupText;

                const popupCloseBtn = document.createElement("button");
                popupCloseBtn.className = "popup-close-btn";
                popupCloseBtn.innerHTML = "&times;";
                popupCloseBtn.onclick = (e) => {
                    e.stopPropagation();
                    popup.style.display = "none";
                };

                popup.appendChild(popupCloseBtn);
                triggerContainer.appendChild(popup);
                popup.addEventListener("click", openChat);
                popup.style.display = "none"; // Awalnya sembunyikan popup

                if (config.popup_delay > 0) {
                    // Jika ada delay, gunakan setTimeout untuk menampilkan popup
                    setTimeout(() => {
                        popup.style.display = "block";
                    }, config.popup_delay ); // Penting: dikali 1000 untuk konversi ke milidetik
                } else {
                    // Jika tidak ada delay, langsung tampilkan popup
                    popup.style.display = "block";
                }
            }

            // --- 5. Create Bubble Button ---
            const bubble = document.createElement("div");
            bubble.id = "chatbot-bubble";
            if (config.buttonIconUrl) {
                const icon = document.createElement("img");
                icon.src = config.buttonIconUrl;
                icon.style.width = "60%";
                icon.style.height = "60%";
                bubble.appendChild(icon);
            } else {
                bubble.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff" height="28px" width="28px" version="1.1" id="Capa_1" viewBox="0 0 60 60" xml:space="preserve">
<path d="M55.232,43.104C58.354,38.746,60,33.705,60,28.5c0-14.888-13.458-27-30-27S0,13.612,0,28.5s13.458,27,30,27  c4.262,0,8.378-0.79,12.244-2.348c6.805,3.927,16.212,5.282,16.618,5.338c0.046,0.007,0.093,0.01,0.139,0.01  c0.375,0,0.725-0.211,0.895-0.554c0.192-0.385,0.116-0.849-0.188-1.153C57.407,54.493,55.823,49.64,55.232,43.104z"/>
</svg>`;
            }
            triggerContainer.appendChild(bubble);
            bubble.addEventListener("click", openChat);

            triggerContainer.style.display = "flex";

            // --- 7. Simplified open/close logic ---
            function openChat() {
                triggerContainer.style.display = "none";
                iframe.style.display = "block";
                iframeCloseBtn.style.display = "flex";
            }

            function closeChat() {
                iframe.style.display = "none";
                iframeCloseBtn.style.display = "none";
                triggerContainer.style.display = "flex";
            }
        } catch (error) {
            console.error("[AI Widget] Error loading widget:", error);
        }
    };

    window.AIChatWidget = {
        init: ({ widgetId, webUrl }) => {
            if (document.getElementById("chatbot-widget")) {
                console.warn("[AI Widget] Widget already initialized.");
                return;
            }
            if (!widgetId) {
                console.error("[AI Widget] No widgetId provided for init");
                return;
            }
            console.log(`[AI Widget] Initializing widget with ID: ${widgetId}`);

            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", () =>
                    loadWidget(widgetId, webUrl)
                );
            } else {
                loadWidget(widgetId, webUrl);
            }
        },
    };
})();
