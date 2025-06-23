// public/widget.js
(function () {
    const loadWidget = async (widgetId) => {
        try {
            // const response = await fetch(`http://localhost:3000/api/widget/${widgetId}`);
            // const config = await response.json();
            let firsClick = true;
            const container = document.createElement("div");
            container.id = "chatbot-widget";
            document.body.appendChild(container);
            const config = {
                color: "#4CAF50", // Default color
                position: "bottom-right", // Default position
                width: 400, // Default width
                height: 600, // Default height
                buttonIconUrl: "https://your-cdn.com/default-icon.png", // Default icon URL
            };

            const iframe = document.createElement("iframe");
            iframe.id = "chatbot-iframe";
            iframe.style.display = "none"; // Initially hidden
            iframe.src = `http://localhost:3000/widget/${widgetId}`;
            container.appendChild(iframe);
            // animate the iframe when it is displayed
            iframe.style.transition = "transform 0.3s ease";
            iframe.addEventListener("load", () => {
                iframe.style.transform = "translateY(0)";
            });
            iframe.style.transform = "translateY(20px)";
            // after iframe is loaded, set the display to block
            iframe.onload = () => {
                const style = document.createElement("style");
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
                const bubble = document.createElement("div");
                bubble.id = "chatbot-bubble";
                bubble.innerHTML = `<img src="${
                    config.buttonIconUrl ||
                    "https://your-cdn.com/default-icon.png"
                }" width="28" height="28">`;
                container.appendChild(bubble);

                const closeButton = document.createElement("button");
                closeButton.innerHTML = "&times;";
                closeButton.style.position = "absolute";
                closeButton.style.top = "8px";
                closeButton.style.right = "8px";
                closeButton.style.fontSize = "32px";
                closeButton.style.background = "transparent";
                closeButton.style.border = "none";
                closeButton.style.display = "none"; // Initially hidden
                closeButton.style.color = "#fff";
                closeButton.style.cursor = "pointer";
                closeButton.addEventListener("click", () => {
                    iframe.style.display = "none";
                    bubble.style.display = "flex";
                    closeButton.style.display = "none";
                });
                container.appendChild(closeButton);

                bubble.addEventListener("click", () => {
                    console.log("Bubble clicked");
                    if (firsClick) {
                        firsClick = false;
                        iframe.style.display = "block";
                        bubble.style.display = "none";
                        closeButton.style.display = "block";
                    } else {
                        iframe.style.display =
                            iframe.style.display === "none" ? "block" : "none";
                        bubble.style.display =
                            iframe.style.display === "none" ? "flex" : "none";
                        closeButton.style.display =
                            iframe.style.display === "none" ? "none" : "block";
                    }
                });

                // add animation to the bubble
                bubble.style.transition = "transform 0.3s ease";
                bubble.addEventListener("mouseover", () => {
                    bubble.style.transform = "scale(1.1)";
                });
                bubble.addEventListener("mouseout", () => {
                    bubble.style.transform = "scale(1)";
                });
            };
        } catch (error) {
            console.error("[AI Widget] Error loading widget config:", error);
        }
    };

    window.AIChatWidget = {
        init: ({ widgetId }) => {
            if (!widgetId) return console.error("No widgetId provided");
            console.log(`[AI Widget] Initializing widget with ID: ${widgetId}`);
            loadWidget(widgetId);
        },
    };
})();
