"use client";
import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { getSessionsByDate, getLast7DaysStats, getStatsByGenre } from "@/lib/storage";
import { Plus, X, ChevronLeft, ChevronRight, BarChart3, PieChart, Info } from "lucide-react";
import { ScheduleItem } from "@/lib/types";

function getHeatmapColor(minutes: number): string {
    if (minutes === 0) return "rgba(255,255,255,0.05)";
    if (minutes < 15) return "rgba(192,132,252,0.25)";
    if (minutes < 30) return "rgba(147,51,234,0.45)";
    if (minutes < 60) return "rgba(126,34,206,0.65)";
    if (minutes < 120) return "rgba(109,40,217,0.85)";
    return "rgba(192,132,252,1)";
}

export default function CalendarView() {
    const { data, addSchedule, deleteSchedule } = useApp();
    const sessionsByDate = getSessionsByDate();
    const last7Days = getLast7DaysStats();
    const statsByGenre = getStatsByGenre();

    const [viewDate, setViewDate] = useState(new Date());
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ title: "", date: "", time: "", isDeadline: false });

    const maxMins = Math.max(...last7Days.map(d => d.minutes), 60);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    function prevMonth() {
        setViewDate(new Date(year, month - 1, 1));
    }
    function nextMonth() {
        setViewDate(new Date(year, month + 1, 1));
    }

    function handleAdd() {
        if (!form.title || !form.date) return;
        const item: ScheduleItem = {
            id: crypto.randomUUID(),
            title: form.title,
            date: form.date,
            time: form.time || undefined,
            isDeadline: form.isDeadline,
            color: form.isDeadline ? "#f87171" : "#60a5fa",
        };
        addSchedule(item);
        setForm({ title: "", date: "", time: "", isDeadline: false });
        setShowAdd(false);
    }

    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    const today = new Date().toISOString().slice(0, 10);

    const schedulesThisMonth = data.schedules.filter((s) =>
        s.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)
    );

    return (
        <div className="flex flex-col gap-8 animate-fadeIn w-full max-w-3xl mx-auto">
            {/* 統計セクション (棒グラフ) */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-purple-400" />
                    <h2 className="text-xl font-black gradient-text">学習統計 (直近7日間)</h2>
                </div>

                <div className="glass p-6">
                    <div className="flex items-end justify-between h-40 gap-2 mb-4">
                        {last7Days.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                <div className="relative w-full flex flex-col items-center group">
                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-10">
                                        {d.minutes}分 頑張った！
                                    </div>
                                    <div
                                        className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-purple-600/80 to-pink-500/80 transition-all duration-700 hover:brightness-125"
                                        style={{ height: `${(d.minutes / maxMins) * 100}%`, minHeight: d.minutes > 0 ? "4px" : "0px" }}
                                    />
                                </div>
                                <span className="text-[10px] font-bold opacity-60">{d.date}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                            <PieChart size={14} /> ジャンル別:
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(statsByGenre).length === 0 ? (
                                <span className="opacity-40 font-normal">{"データがまだありません"}</span>
                            ) : (
                                Object.entries(statsByGenre).map(([name, mins]) => (
                                    <div key={name} className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                        <span>{name}: <span className="gradient-text">{mins}分</span></span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* カレンダーセクション */}
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black gradient-text">
                        {year}年{month + 1}月
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="p-2 glass rounded-xl hover:text-white transition-colors" style={{ color: "var(--text-muted)" }}>
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={nextMonth} className="p-2 glass rounded-xl hover:text-white transition-colors" style={{ color: "var(--text-muted)" }}>
                            <ChevronRight size={18} />
                        </button>
                        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5 text-sm">
                            <Plus size={16} /> スケジュール追加
                        </button>
                    </div>
                </div>

                {/* Calendar grid */}
                <div className="glass p-4">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((d) => (
                            <div key={d} className="text-center text-xs font-bold py-1" style={{ color: "var(--text-muted)" }}>
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((day, idx) => {
                            if (!day) return <div key={idx} />;
                            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const mins = sessionsByDate[dateStr] || 0;
                            const isToday = dateStr === today;
                            const daySchedules = data.schedules.filter((s) => s.date === dateStr);

                            return (
                                <div
                                    key={idx}
                                    className="relative rounded-lg flex flex-col items-center pt-1 pb-1 group"
                                    style={{
                                        background: getHeatmapColor(mins),
                                        border: isToday ? "2px solid var(--accent)" : "2px solid transparent",
                                        minHeight: "3.2rem",
                                    }}
                                >
                                    <span className="text-xs font-bold" style={{ color: mins > 60 ? "white" : "var(--text)" }}>
                                        {day}
                                    </span>
                                    {mins > 0 && (
                                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                                            {mins}m
                                        </span>
                                    )}
                                    <div className="flex flex-col gap-0.5 w-full px-0.5 mt-auto">
                                        {daySchedules.map((s) => (
                                            <div
                                                key={s.id}
                                                className="rounded-[2px] text-[8px] font-bold truncate px-0.5 leading-tight"
                                                style={{ background: s.color || "#60a5fa", color: "white" }}
                                            >
                                                {s.isDeadline ? "!" : ""}{s.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 flex-wrap bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">活動量:</span>
                    <div className="flex items-center gap-3">
                        {[0, 15, 30, 60, 120].map((m, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <div className="w-3.5 h-3.5 rounded-sm" style={{ background: getHeatmapColor(m === 0 ? 0 : m) }} />
                                <span className="text-[10px] font-bold opacity-60">
                                    {m === 0 ? "0" : m === 15 ? "15m" : m === 30 ? "30m" : m === 60 ? "1h" : "2h+"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Schedule list */}
            {schedulesThisMonth.length > 0 && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <Info size={16} className="text-blue-400" />
                        <h3 className="text-sm font-black" style={{ color: "var(--text-muted)" }}>今月のスケジュール詳細</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {schedulesThisMonth
                            .sort((a, b) => a.date.localeCompare(b.date))
                            .map((s) => (
                                <div key={s.id} className="glass px-4 py-3 flex items-center justify-between gap-3 border-l-4" style={{ borderLeftColor: s.color || "#60a5fa" }}>
                                    <div className="flex flex-col">
                                        <div className="text-sm font-bold flex items-center gap-2">
                                            {s.isDeadline && <span className="bg-red-500/20 text-red-500 text-[10px] px-1.5 rounded">締切</span>}
                                            {s.title}
                                        </div>
                                        <div className="text-[10px] font-bold opacity-50">
                                            {s.date}{s.time ? ` ${s.time}` : ""}
                                        </div>
                                    </div>
                                    <button onClick={() => deleteSchedule(s.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-red-400/60 hover:text-red-400 transition-all">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Add modal */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass p-6 max-w-sm w-full flex flex-col gap-4 animate-popIn shadow-2xl border border-white/10">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-lg gradient-text">スケジュール追加</h3>
                            <button onClick={() => setShowAdd(false)} className="hover:rotate-90 transition-transform"><X size={18} /></button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-[10px] font-black uppercase opacity-60 mb-1 block">タイトル</label>
                                <input className="app-input w-full" placeholder="例: テスト勉強" value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-60 mb-1 block">日付</label>
                                    <input className="app-input w-full" type="date" value={form.date}
                                        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-60 mb-1 block">時間</label>
                                    <input className="app-input w-full" type="time" value={form.time}
                                        onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
                                </div>
                            </div>
                            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-transparent text-purple-500 focus:ring-purple-500/20" checked={form.isDeadline}
                                    onChange={(e) => setForm((f) => ({ ...f, isDeadline: e.target.checked }))} />
                                <span className="text-sm font-bold">締切（🔴）として登録</span>
                            </label>
                        </div>
                        <button onClick={handleAdd} className="btn-primary w-full py-3 mt-2 shadow-lg shadow-purple-500/20">追加する</button>
                    </div>
                </div>
            )}
        </div>
    );
}
