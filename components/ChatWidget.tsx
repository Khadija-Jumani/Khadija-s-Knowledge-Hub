"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Trash2, FileText, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [localInput, setLocalInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, isLoading, error, setMessages }: any = useChat({
        // @ts-ignore
        api: "/api/chat",
        onError: (err: any) => console.error("Chat error:", err),
    });

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (localInput.trim()) {
            sendMessage({ content: localInput, role: 'user' });
            setLocalInput("");
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const clearChat = () => {
        if (confirm("Are you sure you want to clear the chat history?")) {
            setMessages([]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end pointer-events-none sm:pointer-events-auto">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-[calc(100vw-3rem)] sm:w-[400px] mb-4 flex flex-col overflow-hidden !pointer-events-auto"
                        style={{ height: "calc(100vh - 120px)", maxHeight: "550px" }}
                    >
                        {/* Header */}
                        <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-base">Study Assistant</span>
                                    <span className="text-[10px] text-white/90 font-medium tracking-wide">POWERED BY AI</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={clearChat}
                                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                                    title="Clear chat"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.length === 0 && (
                                <div className="text-center text-slate-400 mt-10">
                                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                                        <Bot size={32} className="text-primary/40" />
                                    </div>
                                    <p className="font-medium text-slate-500">How can I help you study today?</p>
                                    <p className="text-xs mt-2">Ask me anything about your university subjects.</p>
                                </div>
                            )}

                            {messages.map((m: any) => (
                                <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "user" ? "bg-slate-800 text-white" : "bg-primary text-white"
                                        }`}>
                                        {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${m.role === "user"
                                        ? "bg-slate-800 text-white rounded-tr-none"
                                        : "bg-white border border-slate-100 text-slate-700 rounded-tl-none prose prose-sm prose-p:leading-relaxed prose-pre:bg-slate-50 prose-pre:text-slate-800"
                                        }`}>
                                        {m.content || (m.parts && m.parts.map((p: any) => p.text).join(""))}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex flex-col gap-2 min-w-[80px]">
                                        <Loader2 size={16} className="text-primary animate-spin" />
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                                    {error.message || "An error occurred connecting to the AI."}
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-slate-100 relative z-50 overflow-visible">
                            <input
                                value={localInput}
                                onChange={(e) => setLocalInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-slate-700 !pointer-events-auto relative z-50 cursor-text"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !localInput.trim()}
                                className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-sm shadow-primary/20 pointer-events-auto"
                            >
                                <Send size={14} className="ml-0.5" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-white transition-all z-50 float-animation pointer-events-auto"
            >
                {isOpen ? <X size={26} /> : <MessageCircle size={28} />}
            </motion.button>
        </div>
    );
}
