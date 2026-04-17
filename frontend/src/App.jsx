import { useEffect, useRef, useState } from "react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I’m your AI Study Tutor. Ask me any study question and I’ll explain it simply.",
    },
  ]);
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

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      const data = await res.json();

      const aiMessage = {
        role: "assistant",
        content: data.response || "No response from AI.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong while contacting the backend.",
        },
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
    setMessages([
      {
        role: "assistant",
        content:
          "Hi! I’m your AI Study Tutor. Ask me any study question and I’ll explain it simply.",
      },
    ]);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        padding: "24px",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
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
              AI Study Tutor
            </h1>
            <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: "14px" }}>
              Ask a study question and get a simple explanation.
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
            height: "500px",
            overflowY: "auto",
            padding: "20px",
            backgroundColor: "#f9fafb",
          }}
        >
          {messages.map((message, index) => {
            const isUser = message.role === "user";

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
                    backgroundColor: isUser ? "#2563eb" : "#ffffff",
                    color: isUser ? "#ffffff" : "#111827",
                    border: isUser ? "none" : "1px solid #e5e7eb",
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
                      opacity: 0.8,
                    }}
                  >
                    {isUser ? "You" : "AI Tutor"}
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
              Single-turn tutor UI with local chat history
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