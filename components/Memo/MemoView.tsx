"use client";
import { useState } from "react";
import { Plus, X, Tag } from "lucide-react";
import { Memo } from "@/lib/types";
import { useApp } from "@/contexts/AppContext";

export default function MemoView() {
    const { data, addMemo, deleteMemo } = useApp();
    const [showAdd, setShowAdd] = useState(false);
    const [content, setContent] = useState("");
    const [tag, setTag] = useState("");

    const tags = Array.from(new Set(data.memos.map((m) => m.tag).filter(Boolean)));

    function handleAdd() {
        if (!content.trim()) return;
        const item: Memo = {
            id: crypto.randomUUID(),
            content: content.trim(),
            tag: tag.trim() || "未分類",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        addMemo(item);
        setContent("");
        setTag("");
        setShowAdd(false);
    }

    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black gradient-text">メモ帳</h2>
                <button
                    onClick={() => setShowAdd(true)}
                    className="btn-primary flex items-center gap-1.5 text-sm"
                >
                    <Plus size={16} /> 追加
                </button>
            </div>

            {tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {tags.map((t) => (
                        <span
                            key={t}
                            className="text-xs font-bold px-2 py-1 rounded-md"
                            style={{ background: "rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
                        >
                            #{t}
                        </span>
                    ))}
                </div>
            )}

            {data.memos.length === 0 ? (
                <div className="text-center py-10" style={{ color: "var(--text-muted)" }}>
                    <p className="text-sm">メモがありません。<br />タスクやアイデアを記録しましょう！</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.memos
                        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                        .map((m) => (
                            <div key={m.id} className="glass p-5 relative group flex flex-col gap-3">
                                <button
                                    onClick={() => deleteMemo(m.id)}
                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                                >
                                    <X size={16} />
                                </button>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                <div className="flex items-center gap-1 mt-auto pt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                                    <Tag size={12} /> {m.tag}
                                    <span className="ml-auto" style={{ fontSize: "0.65rem" }}>
                                        {new Date(m.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {showAdd && (
                /* 外側: 背景オーバーレイ（overflow-y:auto でキーボード時もスクロール可能） */
                <div
                    className="fixed inset-0 z-50"
                    style={{ background: "rgba(0,0,0,0.7)", overflowY: "auto" }}
                >
                    {/* 内側: min-height:100% + flex で縦横中央揃え */}
                    <div
                        style={{
                            minHeight: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "1rem",
                        }}
                    >
                        <div className="glass p-6 max-w-md w-full flex flex-col gap-4 animate-popIn">
                            <div className="flex justify-between items-center">
                                <h3 className="font-black text-lg gradient-text">メモを追加</h3>
                                <button onClick={() => setShowAdd(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <textarea
                                className="app-input min-h-[120px] resize-y"
                                placeholder="メモの内容"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>タグ (任意)</label>
                                <input
                                    className="app-input"
                                    placeholder="例: 課題, アイデア"
                                    value={tag}
                                    onChange={(e) => setTag(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleAdd}
                                disabled={!content.trim()}
                                className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                保存する
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
