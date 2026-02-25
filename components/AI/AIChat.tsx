"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, CalendarPlus } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { processAIChat } from "@/lib/gemini";
import { ChatMessage } from "@/lib/types";

export default function AIChat() {
    const { data, addChatMessage, addSchedule } = useApp();
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [data.chatHistory, loading]);

    async function handleSend() {
        if (!input.trim() || loading) return;
        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };
        addChatMessage(userMsg);
        setInput("");
        setLoading(true);

        const today = new Date().toISOString().slice(0, 10);
        const { reply, action } = await processAIChat(userMsg.content, today);

        const aiMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: reply,
            timestamp: new Date().toISOString(),
            pendingAction: action?.type === "add_schedule" || action?.type === "pace_advice"
                ? {
                    type: "add_schedule",
                    scheduleItem: {
                        title: action.title || "追加タスク",
                        date: action.date || today,
                        isDeadline: action.isDeadline ?? false,
                    },
                }
                : undefined,
        };
        addChatMessage(aiMsg);
        setLoading(false);
    }

    function handleAction(msgId: string, actionData: any) {
        if (actionData.type === "add_schedule") {
            addSchedule({
                id: crypto.randomUUID(),
                ...actionData.scheduleItem,
                color: actionData.scheduleItem.isDeadline ? "#f87171" : "#60a5fa",
            });
            // Replace button with confirmation text
            const msg = data.chatHistory.find(m => m.id === msgId);
            if (msg) {
                addChatMessage({
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: "カレンダーに追加しました！",
                    timestamp: new Date().toISOString(),
                });
            }
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Bot size={24} className="text-pink-400" />
                <h2 className="text-xl font-black gradient-text">AI サポート</h2>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 glass p-4 overflow-y-auto flex flex-col gap-4 mb-4"
                style={{ scrollBehavior: "smooth" }}
            >
                {data.chatHistory.length === 0 && (
                    <div className="text-center py-10" style={{ color: "var(--text-muted)" }}>
                        <p className="text-sm">
                            スケジュールの相談やタスクの締切管理をAIにお任せ！<br /><br />
                            例: 「レポートの締切を明日に設定して」<br />
                            例: 「単語帳100個を1週間でやるペースは？」
                        </p>
                    </div>
                )}

                {data.chatHistory.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                        <div
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                                background: msg.role === "user" ? "var(--accent)" : "rgba(244,114,182,0.2)",
                                color: msg.role === "user" ? "white" : "#f472b6",
                            }}
                        >
                            {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        <div className="flex flex-col gap-2 relative">
                            <div
                                className="p-3 text-sm leading-relaxed rounded-2xl whitespace-pre-wrap"
                                style={{
                                    background: msg.role === "user" ? "var(--accent)" : "rgba(255,255,255,0.07)",
                                    border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.1)",
                                    borderTopRightRadius: msg.role === "user" ? 4 : 16,
                                    borderTopLeftRadius: msg.role === "assistant" ? 4 : 16,
                                }}
                            >
                                {msg.content}
                            </div>

                            {/* Pending Action Bubble */}
                            {msg.pendingAction && (
                                <div
                                    className="glass p-3 mt-1 rounded-xl flex flex-col gap-2 text-xs animate-popIn"
                                    style={{ border: "1px solid rgba(192,132,252,0.4)" }}
                                >
                                    <div className="font-bold flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                                        <CalendarPlus size={14} /> カレンダー登録提案
                                    </div>
                                    <div>
                                        <strong>{msg.pendingAction.scheduleItem.title}</strong><br />
                                        日付: {msg.pendingAction.scheduleItem.date}
                                    </div>
                                    <button
                                        onClick={() => handleAction(msg.id, msg.pendingAction)}
                                        className="btn-primary py-1.5 px-3 rounded-lg text-xs mt-1 self-start"
                                    >
                                        登録する
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="mr-auto flex gap-3 max-w-[85%]">
                        <div
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(244,114,182,0.2)", color: "#f472b6" }}
                        >
                            <Bot size={16} />
                        </div>
                        <div
                            className="p-3 text-sm leading-relaxed rounded-2xl flex items-center gap-1"
                            style={{ background: "rgba(255,255,255,0.07)", borderTopLeftRadius: 4 }}
                        >
                            <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                            <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                            <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="flex items-end gap-2 relative">
                <textarea
                    className="app-input pr-12 min-h-[50px] max-h-[120px] resize-y"
                    placeholder="AIに相談..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="absolute right-2 bottom-2 p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: input.trim() ? "var(--accent)" : "rgba(255,255,255,0.1)",
                        color: input.trim() ? "white" : "var(--text-muted)",
                    }}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
