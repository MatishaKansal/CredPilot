import { useState } from "react";
import { Bot, Loader2, Send, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const starterMessages = [
  {
    role: "assistant",
    content:
      "Hi! I am your CredPilot officer assistant. Ask about application reviews, risk scores, approvals, escalations, or customer follow-ups.",
  },
];

const EmployeeSupport = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || !user?.user_id) return;

    setError("");
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history = nextMessages
        .filter((message) => message.role === "user" || message.role === "assistant")
        .slice(0, -1)
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));

      const res = await fetch(`http://localhost:8000/employee/${user.user_id}/support-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "Unable to get support response right now.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message || "Something went wrong while contacting support.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I could not fetch a response right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-[#43567C]">Loan Officer</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-950">Support Assistant</h1>
      <p className="mt-2 text-sm text-slate-500">
        Chat with AI support for application reviews, risk guidance, and workflow help.
      </p>

      <div className="mt-5 h-[430px] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="space-y-3">
          {messages.map((message, index) => {
            const isAssistant = message.role === "assistant";
            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`flex max-w-[85%] gap-2 rounded-lg px-3 py-2 text-sm ${
                    isAssistant
                      ? "border border-slate-200 bg-white text-slate-700"
                      : "bg-[#43567C] text-white"
                  }`}
                >
                  <span className="mt-0.5">
                    {isAssistant ? <Bot size={15} /> : <User size={15} />}
                  </span>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask about pending reviews, risk scores, or approval steps..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#43567C]"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#43567C] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Send
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default EmployeeSupport;
