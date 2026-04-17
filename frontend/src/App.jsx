import { useEffect, useRef, useState } from "react";

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm your AI Study Buddy. Ask a study question, then keep following up and I'll remember the recent context.",
  excludeFromHistory: true,
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();
const MAX_HISTORY_MESSAGES = 12;

function createErrorMessage(content) {
  return {
    role: "error",
    content,
    excludeFromHistory: true,
  };
}

function getApiUrl(path) {
  if (!API_BASE_URL) {
    throw new Error(
      "Frontend API URL is not configured. Set VITE_API_BASE_URL in frontend/.env.local.",
    );
  }

  return `${API_BASE_URL.replace(/\/+$/, "")}${path}`;
}

function getConversationHistory(messages) {
  return messages
    .filter(
      (message) =>
        !message.excludeFromHistory &&
        (message.role === "user" || message.role === "assistant"),
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map(({ role, content }) => ({ role, content }));
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendPrompt = async () => {
    if (!prompt.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: prompt.trim(),
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: getConversationHistory(nextMessages),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.detail || `Request failed with status ${res.status}.`,
        );
      }

      const aiMessage = {
        role: "assistant",
        content: data?.response || "No response from AI.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        createErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while contacting the backend.",
        ),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#f5f7fb",
        width: "100%",
      }}
    >
      <div
        style={{
          width: "100%",
          minHeight: "100dvh",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", color: "#111827" }}>
              AI Study Buddy
            </h1>
            <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: "14px" }}>
              Ask follow-up questions and the tutor will remember the recent conversation.
            </p>
          </div>

          <button
            onClick={clearChat}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Clear Chat
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            backgroundColor: "#f9fafb",
          }}
        >
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const isError = message.role === "error";

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "12px 14px",
                    borderRadius: "16px",
                    backgroundColor: isUser
                      ? "#2563eb"
                      : isError
                        ? "#fef2f2"
                        : "#ffffff",
                    color: isUser ? "#ffffff" : isError ? "#991b1b" : "#111827",
                    border: isUser
                      ? "none"
                      : isError
                        ? "1px solid #fecaca"
                        : "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.5,
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "6px",
                      opacity: isError ? 1 : 0.8,
                    }}
                  >
                    {isUser ? "You" : isError ? "System Error" : "AI Tutor"}
                  </div>
                  <div>{message.content}</div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: "12px 14px",
                  borderRadius: "16px",
                  backgroundColor: "#ffffff",
                  color: "#111827",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "6px",
                    opacity: 0.8,
                  }}
                >
                  AI Tutor
                </div>
                <div>Thinking...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
          }}
        >
          <textarea
            rows="4"
            placeholder="Type your study question here... (Press Enter to send, Shift+Enter for a new line)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              resize: "none",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: "15px",
              boxSizing: "border-box",
              marginBottom: "12px",
              fontFamily: "Arial, sans-serif",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#6b7280" }}>
              Multi-turn study buddy with local session memory
            </span>

            <button
              onClick={sendPrompt}
              disabled={loading || !prompt.trim()}
              style={{
                padding: "12px 18px",
                borderRadius: "12px",
                border: "none",
                backgroundColor:
                  loading || !prompt.trim() ? "#93c5fd" : "#2563eb",
                color: "#ffffff",
                cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
