import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Bot } from "lucide-react";
import api from "../services/api";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function EduCapChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hi! I am the EduCap Assistant. Ask me anything about loan calculators, FOIR risk, or financial terms!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post("/api/chat", { message: userMsg });
      const botReply = res.data?.reply || "I don't have that information in my guide.";
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I don't have that information in my guide.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none box-border">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          className="mb-3 w-80 sm:w-96 bg-[#FAF9F6] border border-[#E2DFD8] rounded-2xl shadow-2xl flex flex-col overflow-hidden box-border"
          style={{ overflowX: "hidden", boxSizing: "border-box" }}
        >
          {/* ── Header Banner ─────────────────────────────────── */}
          <div
            className="text-white px-4 py-2.5 flex items-center justify-between shrink-0 box-border"
            style={{ backgroundColor: "#4b9d8e", boxSizing: "border-box" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7.5 h-7.5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm leading-tight text-white tracking-tight">
                  EduCap Assistant
                </h3>
                <p className="text-[10px] sm:text-[11px] text-emerald-100 font-medium leading-none mt-0.5">
                  RAG Guide & Loan Helper
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* ── Scrollable Chat Messages Container ────────────── */}
          <div
            ref={scrollContainerRef}
            className="flex-1 h-80 bg-[#FAF9F6] select-text flex flex-col box-border"
            style={{
              padding: "16px",
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarGutter: "stable",
              boxSizing: "border-box",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className="w-full flex box-border"
                style={{
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: index === messages.length - 1 && !loading ? "0px" : "12px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  className="text-xs leading-relaxed shadow-sm box-border"
                  style={{
                    maxWidth: "80%",
                    marginLeft: msg.sender === "user" ? "auto" : "0",
                    padding: "10px 14px",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    boxSizing: "border-box",
                    backgroundColor: msg.sender === "user" ? "#4b9d8e" : "#ffffff",
                    color: msg.sender === "user" ? "#ffffff" : "#111827",
                    border: msg.sender === "user" ? "none" : "1px solid #e0ece9",
                    borderRadius:
                      msg.sender === "user"
                        ? "16px 16px 0px 16px"
                        : "16px 16px 16px 0px",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="w-full flex justify-start box-border" style={{ boxSizing: "border-box" }}>
                <div
                  className="text-[#6B7280] text-xs flex items-center gap-2 shadow-sm box-border"
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e0ece9",
                    borderRadius: "16px 16px 16px 0px",
                  }}
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" style={{ color: "#4b9d8e" }} />
                  <span>Searching guide...</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Input Footer Area & Embedded Send Button ──────── */}
          <div
            className="shrink-0 box-border"
            style={{
              padding: "12px 16px",
              backgroundColor: "#ffffff",
              borderTop: "1px solid #e5e5e5",
              boxSizing: "border-box",
            }}
          >
            <form onSubmit={handleSend} className="relative flex items-center w-full box-border" style={{ boxSizing: "border-box" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about loans, FOIR, moratorium..."
                className="w-full text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#4b9d8e]/20 focus:border-[#4b9d8e] transition-all shadow-sm box-border"
                style={{
                  width: "100%",
                  borderRadius: "24px",
                  padding: "10px 42px 10px 16px",
                  backgroundColor: "#FAF9F6",
                  border: "1px solid #E2DFD8",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute p-1.5 transition-all cursor-pointer border-none bg-transparent flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed group"
                style={{
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#4b9d8e",
                }}
                aria-label="Send Message"
              >
                <Send className="w-4 h-4 transition-colors group-hover:text-[#3e8679]" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-13 h-13 rounded-full text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center border-2 border-white/20 cursor-pointer"
          style={{ backgroundColor: "#4b9d8e" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3e8679")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4b9d8e")}
          aria-label="Open Chatbot"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
