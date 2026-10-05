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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-[#FAF9F6] border border-[#E2DFD8] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeInUp">
          
          {/* ── Modernized Compact Header ────────────────────────────── */}
          <div className="bg-[#1E5D50] text-white px-4 py-2.5 flex items-center justify-between shrink-0">
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

          {/* ── Chat Messages Body ──────────────────────────────────── */}
          <div className="p-4 flex-1 h-80 overflow-y-auto space-y-3 bg-[#FAF9F6] select-text">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed break-words shadow-sm ${
                    msg.sender === "user"
                      ? "bg-[#1E5D50] text-white rounded-t-2xl rounded-bl-2xl rounded-br-none"
                      : "bg-white text-[#111827] border border-[#E2DFD8] rounded-t-2xl rounded-br-2xl rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E2DFD8] text-[#6B7280] rounded-t-2xl rounded-br-2xl rounded-bl-none px-3.5 py-2.5 text-xs flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1E5D50]" />
                  <span>Searching guide...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Detached Input Pill Footer Wrapper ───────────────────── */}
          <div className="p-3 bg-[#FAF9F6] border-t border-[#E2DFD8] shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about loans, FOIR, moratorium..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#E2DFD8] rounded-xl text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1E5D50] focus:ring-2 focus:ring-[#1E5D50]/15 transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-[#1E5D50] text-white rounded-lg hover:bg-[#184b41] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Send Message"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-13 h-13 rounded-full bg-[#1E5D50] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center border-2 border-white/20 cursor-pointer"
          aria-label="Open Chatbot"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
