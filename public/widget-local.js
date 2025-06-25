// public/widget.js
(function () {
    const loadWidget = async (widgetId) => {
        try {
            // const response = await fetch(`http://localhost:3000/api/widget/${widgetId}`);
            // const config = await response.json();
            let firsClick = true;
            await fetch(`http://localhost:3000/api/widget-client/${widgetId}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((conf) => {
                    console.log("[AI Widget] Config loaded:", conf.widget);
                    if (!conf) {
                        throw new Error(
                            "No config found for widget ID: " + widgetId
                        );
                    }

                    const config = {
                        color: conf?.widget?.color || "#4A90E2", // Default color
                        position: conf?.widget?.position || "bottom-right", // Default position
                        width: conf?.widget?.width || 400, // Default width
                        height: conf?.widget?.height || 600, // Default height
                        buttonIconUrl: conf?.widget?.icon_url, // Default icon URL
                    };

                    const container = document.createElement("div");
                    container.id = "chatbot-widget";
                    document.body.appendChild(container);

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
                        if (config.buttonIconUrl) {
                            const icon = document.createElement("img");
                            icon.src = config.buttonIconUrl;
                            icon.style.width = "32px";
                            icon.style.height = "32px";
                            icon.style.borderRadius = "50%";
                            icon.style.objectFit = "cover";
                            bubble.appendChild(icon);
                        } else {
                            bubble.innerHTML = `<div>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="28"
                                                height="28"
                                                viewBox="0 0 24 24"
                                                fill="#fff"
                                                stroke="none"
                                            >
                                                <path
                                                    d="M20 4H4V16H7V21L12 16H20V4Z"
                                                    stroke="#fff"
                                                    stroke-width="1.5"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                />
                                            </svg>
                                        </div>`;
                        }
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
                                    iframe.style.display === "none"
                                        ? "block"
                                        : "none";
                                bubble.style.display =
                                    iframe.style.display === "none"
                                        ? "flex"
                                        : "none";
                                closeButton.style.display =
                                    iframe.style.display === "none"
                                        ? "none"
                                        : "block";
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

                    // Create the widget container and iframe
                })
                .catch((error) => {
                    console.error(
                        "[AI Widget] Error loading widget config:",
                        error
                    );
                    // Fallback to default configuration if the fetch fails
                });
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
