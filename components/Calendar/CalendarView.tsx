"use client";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { getSessionsByDate } from "@/lib/storage";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
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
    const [viewDate, setViewDate] = useState(new Date());
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ title: "", date: "", time: "", isDeadline: false });

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
        <div className="flex flex-col gap-5 animate-fadeIn">
            {/* Header */}
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
                        <Plus size={16} /> 追加
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
                        const schedules = data.schedules.filter((s) => s.date === dateStr);
                        return (
                            <div
                                key={idx}
                                className="relative rounded-lg flex flex-col items-center pt-1 pb-1 group"
                                style={{
                                    background: getHeatmapColor(mins),
                                    border: isToday ? "2px solid var(--accent)" : "2px solid transparent",
                                    minHeight: "2.8rem",
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
                                {schedules.map((s) => (
                                    <div
                                        key={s.id}
                                        className="absolute bottom-0.5 left-0.5 right-0.5 rounded text-[9px] font-bold truncate px-0.5"
                                        style={{ background: s.color || "#60a5fa", color: "white" }}
                                    >
                                        {s.isDeadline ? "🔴" : "📌"}{s.title}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>活動量:</span>
                {[0, 15, 30, 60, 120].map((m, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-sm" style={{ background: getHeatmapColor(m === 0 ? 0 : m - 1 + 1) }} />
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {m === 0 ? "0" : m === 15 ? "~15m" : m === 30 ? "~30m" : m === 60 ? "~1h" : "2h+"}
                        </span>
                    </div>
                ))}
            </div>

            {/* Schedule list */}
            {schedulesThisMonth.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-black" style={{ color: "var(--text-muted)" }}>今月のスケジュール</h3>
                    {schedulesThisMonth
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map((s) => (
                            <div key={s.id} className="glass px-4 py-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ background: s.color || "#60a5fa" }} />
                                    <div>
                                        <div className="text-sm font-bold">
                                            {s.isDeadline && "🔴 "}{s.title}
                                        </div>
                                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                                            {s.date}{s.time ? ` ${s.time}` : ""}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => deleteSchedule(s.id)} className="text-red-400 hover:text-red-300 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                </div>
            )}

            {/* Add modal */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
                    <div className="glass p-6 max-w-sm w-full flex flex-col gap-4 animate-popIn">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-lg gradient-text">スケジュール追加</h3>
                            <button onClick={() => setShowAdd(false)}><X size={18} /></button>
                        </div>
                        <input className="app-input" placeholder="タイトル（必須）" value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                        <input className="app-input" type="date" value={form.date}
                            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                        <input className="app-input" type="time" value={form.time}
                            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
                        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                            <input type="checkbox" checked={form.isDeadline}
                                onChange={(e) => setForm((f) => ({ ...f, isDeadline: e.target.checked }))} />
                            締切として登録
                        </label>
                        <button onClick={handleAdd} className="btn-primary w-full">追加する</button>
                    </div>
                </div>
            )}
        </div>
    );
}
