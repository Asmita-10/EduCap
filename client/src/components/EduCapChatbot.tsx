import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Bot, User } from "lucide-react";
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
  }, [messages, isOpen]);

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
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-[#FAF9F6] border border-[#E2DFD8] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeInUp">
          {/* Header */}
          <div className="bg-[#1E5D50] text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-white">
                  EduCap Assistant
                </h3>
                <p className="text-[11px] text-emerald-100 font-medium">
                  RAG Guide & Loan Helper
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="p-4 flex-1 max-h-80 overflow-y-auto space-y-3 bg-[#FAF9F6]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="w-6.5 h-6.5 rounded-full bg-[#1E5D50]/10 border border-[#1E5D50]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-[#1E5D50]" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#1E5D50] text-white rounded-br-none shadow-sm"
                      : "bg-white text-[#111827] border border-[#E2DFD8] rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.sender === "user" && (
                  <div className="w-6.5 h-6.5 rounded-full bg-[#1E5D50] flex items-center justify-center shrink-0 mt-0.5 text-white">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-6.5 h-6.5 rounded-full bg-[#1E5D50]/10 border border-[#1E5D50]/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-[#1E5D50]" />
                </div>
                <div className="bg-white border border-[#E2DFD8] rounded-2xl rounded-bl-none px-3.5 py-2.5 text-xs text-[#6B7280] flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1E5D50]" />
                  <span>Searching guide...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-[#E2DFD8] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about loans, FOIR, moratorium..."
              className="flex-1 px-3.5 py-2 bg-[#F2F0ED] border border-[#E2DFD8] rounded-xl text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1E5D50] focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-[#1E5D50] text-white rounded-xl hover:bg-[#184b41] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-13 h-13 rounded-full bg-[#1E5D50] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center border-2 border-white/20"
          aria-label="Open Chatbot"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
