"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
    Play, Pause, RotateCcw, CheckCircle, BookOpen,
    Dumbbell, Music, HelpCircle, GraduationCap,
} from "lucide-react";
import { Genre } from "@/lib/types";
import { generateTimerComplete } from "@/lib/gemini";
import { useApp } from "@/contexts/AppContext";

const GENRES: { value: Genre; icon: React.ReactNode; color: string }[] = [
    { value: "勉強", icon: <GraduationCap size={18} />, color: "#9333ea" },
    { value: "読書", icon: <BookOpen size={18} />, color: "#10b981" },
    { value: "運動", icon: <Dumbbell size={18} />, color: "#f59e0b" },
    { value: "趣味", icon: <Music size={18} />, color: "#3b82f6" },
    { value: "その他", icon: <HelpCircle size={18} />, color: "#ec4899" },
];

const PRESET_MINUTES = [5, 10, 15, 25, 30, 45, 60, 90];

export default function TimerComponent() {
    const { addSession } = useApp();
    const [title, setTitle] = useState("");
    const [genre, setGenre] = useState<Genre>("勉強");
    const [totalSeconds, setTotalSeconds] = useState(25 * 60);
    const [remaining, setRemaining] = useState(25 * 60);
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(false);
    const [aiMessage, setAiMessage] = useState("");
    const [loadingAI, setLoadingAI] = useState(false);
    const [phase, setPhase] = useState<"setup" | "running" | "done">("setup");
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // handleComplete を ref で保持することで、useEffect の依存配列に含めず
    // タイマーのリセット・二重呼び出しを防ぐ
    const handleCompleteRef = useRef<() => void>(() => { });

    const handleComplete = useCallback(async () => {
        clearTimer();
        setRunning(false);
        setDone(true);
        setPhase("done");

        // アラーム音を鳴らす (public/alarm.mp3 がある前提、なければエラーを無視)
        try {
            const audio = new Audio("/Kitchen_Timer03-01(Alarm).mp3");
            audio.play();
        } catch (e) {
            console.error("Alarm sound error:", e);
        }

        const mins = Math.round(totalSeconds / 60);
        // 10分ごとに1個の報酬 (最低でも1個はもらえるように設定)
        const rewardCount = Math.max(1, Math.floor(mins / 10));

        addSession({
            id: crypto.randomUUID(),
            title: title || "集中セッション",
            genre,
            durationMinutes: mins,
            completedAt: new Date().toISOString(),
            reward: rewardCount,
        });
        setLoadingAI(true);
        const msg = await generateTimerComplete(title || "集中セッション", genre, mins);
        setAiMessage(msg);
        setLoadingAI(false);
    }, [totalSeconds, title, genre, addSession]);

    // 最新の handleComplete を常に ref に同期
    useEffect(() => {
        handleCompleteRef.current = handleComplete;
    }, [handleComplete]);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setRemaining((prev) => {
                    if (prev <= 1) {
                        // ref 経由で呼ぶことでこの useEffect の依存に handleComplete を含めない
                        handleCompleteRef.current();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearTimer();
        }
        return clearTimer;
    }, [running]); // running だけに依存 → handleComplete の変化でタイマーがリセットされない


    function handleStart() {
        if (remaining === 0) return;
        setPhase("running");
        setRunning(true);
    }

    function handlePause() {
        setRunning(false);
    }

    function handleReset() {
        clearTimer();
        setRunning(false);
        setDone(false);
        setRemaining(totalSeconds);
        setPhase("setup");
        setAiMessage("");
    }

    function setMinutes(m: number) {
        const s = m * 60;
        setTotalSeconds(s);
        setRemaining(s);
        setRunning(false);
        setDone(false);
        setPhase("setup");
        setAiMessage("");
    }

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;
    const circum = 2 * Math.PI * 90;

    return (
        <div className="animate-fadeIn flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            {/* Title input */}
            {phase === "setup" && (
                <div className="w-full glass p-4 flex flex-col gap-3">
                    <label className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>
                        今日のタスク名
                    </label>
                    <input
                        className="app-input text-base"
                        placeholder="例: 英語の単語帳50個"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <label className="text-sm font-bold mt-1" style={{ color: "var(--text-muted)" }}>
                        ジャンル
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {GENRES.map((g) => (
                            <button
                                key={g.value}
                                onClick={() => setGenre(g.value)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all"
                                style={{
                                    background: genre === g.value ? g.color + "33" : "rgba(255,255,255,0.07)",
                                    border: `2px solid ${genre === g.value ? g.color : "transparent"}`,
                                    color: genre === g.value ? g.color : "var(--text-muted)",
                                }}
                            >
                                {g.icon}
                                {g.value}
                            </button>
                        ))}
                    </div>

                    <label className="text-sm font-bold mt-1" style={{ color: "var(--text-muted)" }}>
                        時間設定
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {PRESET_MINUTES.map((m) => (
                            <button
                                key={m}
                                onClick={() => setMinutes(m)}
                                className="px-3 py-1 rounded-lg text-sm font-bold transition-all"
                                style={{
                                    background:
                                        totalSeconds === m * 60
                                            ? "rgba(192,132,252,0.25)"
                                            : "rgba(255,255,255,0.07)",
                                    border: `1px solid ${totalSeconds === m * 60 ? "var(--accent)" : "transparent"}`,
                                    color: totalSeconds === m * 60 ? "var(--accent)" : "var(--text-muted)",
                                }}
                            >
                                {m}分
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Timer ring */}
            <div
                className="relative flex items-center justify-center"
                style={{ width: 220, height: 220 }}
            >
                <svg
                    width="220"
                    height="220"
                    className="absolute"
                    style={{ transform: "rotate(-90deg)" }}
                >
                    <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                    <circle
                        cx="110"
                        cy="110"
                        r="90"
                        fill="none"
                        stroke="url(#timerGrad)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circum}
                        strokeDashoffset={circum * (1 - progress)}
                        style={{ transition: "stroke-dashoffset 0.9s linear" }}
                    />
                    <defs>
                        <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#9333ea" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                </svg>

                <div className="text-center z-10">
                    {done ? (
                        <CheckCircle size={48} style={{ color: "#10b981", margin: "0 auto" }} />
                    ) : (
                        <>
                            <div
                                className="font-black"
                                style={{ fontSize: "3.2rem", lineHeight: 1, letterSpacing: "-2px" }}
                            >
                                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                            </div>
                            <div className="text-xs mt-1 font-bold" style={{ color: "var(--text-muted)" }}>
                                {Math.round((1 - progress) * (totalSeconds / 60))}分残り
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 items-center">
                {!done && (
                    <>
                        {!running ? (
                            <button
                                onClick={handleStart}
                                className="btn-primary flex items-center gap-2 px-6 py-3 text-base animate-pulse-glow"
                            >
                                <Play size={20} fill="white" />
                                {phase === "setup" ? "スタート" : "再開"}
                            </button>
                        ) : (
                            <button
                                onClick={handlePause}
                                className="btn-primary flex items-center gap-2 px-6 py-3 text-base"
                                style={{ background: "rgba(255,255,255,0.15)" }}
                            >
                                <Pause size={20} />
                                一時停止
                            </button>
                        )}
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1 px-4 py-3 rounded-xl transition-all font-bold text-sm"
                            style={{
                                background: "rgba(255,255,255,0.07)",
                                color: "var(--text-muted)",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                        >
                            <RotateCcw size={16} />
                        </button>
                    </>
                )}
                {done && (
                    <button onClick={handleReset} className="btn-primary flex items-center gap-2">
                        <RotateCcw size={16} />
                        もう一回！
                    </button>
                )}
            </div>

            {/* AI message on complete */}
            {done && (
                <div
                    className="glass p-5 w-full text-center animate-popIn flex flex-col gap-3"
                    style={{ border: "1px solid rgba(192,132,252,0.35)" }}
                >
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl">🎁</span>
                        <span className="text-lg font-black text-pink-400">
                            報酬を {Math.max(1, Math.floor(totalSeconds / 60 / 10))} 個ゲット！
                        </span>
                    </div>

                    {loadingAI ? (
                        <div className="flex items-center justify-center gap-2 text-sm py-4" style={{ color: "var(--text-muted)" }}>
                            <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                            AIメッセージを生成中...
                        </div>
                    ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-line border-t border-white/5 pt-3">{aiMessage}</p>
                    )}
                </div>
            )}
        </div>
    );
}
