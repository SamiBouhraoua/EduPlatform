"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Bot, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";

interface Message {
    role: "user" | "system" | "assistant";
    content: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Bonjour ! Je suis ton assistant pédagogique. Comment puis-je t'aider dans tes cours aujourd'hui ?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user" as const, content: input.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const user = auth.user();
            const token = auth.token();

            if (!user || (!user.id && !user._id)) {
                setMessages((prev) => [...prev, { role: "assistant", content: "Erreur : Impossible de t'identifier (Pas d'ID). Recharge la page." }]);
                setIsLoading(false);
                return;
            }

            // API Call - Using localhost:4000 (API Gateway)
            const response = await fetch("http://localhost:4000/chat/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: user.id || user._id, // Handle potential ID field diffs
                    message: userMessage.content,
                    history: messages.map(m => ({ role: m.role, content: m.content })).slice(-5)
                })
            });

            if (!response.ok) {
                throw new Error("Erreur de communication avec l'IA");
            }

            const data = await response.json();
            setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Désolé, j'ai eu un petit problème technique. Réessaie dans un instant." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            <div
                className={`
          pointer-events-auto
          mb-4 w-[380px] h-[550px] 
          bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 
          rounded-2xl shadow-2xl flex flex-col overflow-hidden
          transition-all duration-300 ease-in-out origin-bottom-right
          ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none absolute bottom-0 right-0 h-[0px] w-[0px]"}
        `}
            >
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-white">
                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Assistant IA</h3>
                            <p className="text-xs text-indigo-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                En ligne
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`
                  max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                  ${msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700"}
                `}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-700 flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin text-indigo-400" />
                                <span className="text-xs text-slate-400">Réflexion en cours...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Posez votre question..."
                            className="w-full bg-slate-800 text-white placeholder-slate-400 text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-slate-700 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-1.5 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            </div>

            {/* FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          pointer-events-auto
          group relative flex items-center justify-center w-14 h-14 
          bg-gradient-to-r from-indigo-600 to-purple-600 
          rounded-full shadow-lg shadow-indigo-600/30
          hover:scale-110 active:scale-95 transition-all duration-300
          z-50
        `}
            >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                {isOpen ? (
                    <X size={24} className="text-white" />
                ) : (
                    <Sparkles size={24} className="text-white fill-white/20" />
                )}

                {/* Notification dot example (optional) */}
                {!isOpen && messages.length > 0 && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-slate-950 rounded-full" />
                )}
            </button>

        </div>
    );
}
