"use client";
import { useState, useEffect } from "react";
import { X, ChevronRight, Sparkles, Timer, CalendarDays, Star, FileText, Bot } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const steps = [
    {
        icon: <Sparkles size={36} className="text-yellow-300" />,
        title: "FocusQuestへようこそ！🎉",
        desc: "集中を楽しく続けるためのアプリです。タイマーで頑張ると報酬がもらえて、キャラクターが喜んでくれます！",
    },
    {
        icon: <Timer size={36} style={{ color: "#c084fc" }} />,
        title: "⏱ タイマー",
        desc: "タイトルとジャンルを設定してタイマースタート。集中完了後、AIが褒めてくれて報酬がもらえます！",
    },
    {
        icon: <CalendarDays size={36} style={{ color: "#34d399" }} />,
        title: "📅 カレンダー",
        desc: "毎日の勉強時間が記録されます。GitHubの草みたいに、頑張った日ほど濃い色になります🌿",
    },
    {
        icon: <Star size={36} style={{ color: "#fbbf24" }} />,
        title: "⭐ キャラクター",
        desc: "集中するほどキャラクターが喜びます！ボタンを押すとAIが今の頑張りに合わせた一言を言ってくれます。",
    },
    {
        icon: <FileText size={36} style={{ color: "#60a5fa" }} />,
        title: "📝 メモ帳",
        desc: "課題や気になったことをサクッとメモ。タグで分類できます。",
    },
    {
        icon: <Bot size={36} style={{ color: "#f472b6" }} />,
        title: "🤖 AIアシスタント",
        desc: "「〇〇の締切は3/20」と話しかけるとカレンダーに追加！ペースも計算してくれます。さあ始めよう！",
    },
];

export default function TutorialOverlay() {
    const { data, completeTutorial } = useApp();
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!data.tutorialDone) {
            setTimeout(() => setVisible(true), 600);
        }
    }, [data.tutorialDone]);

    if (!visible) return null;

    const current = steps[step];
    const isLast = step === steps.length - 1;

    function handleNext() {
        if (isLast) {
            setVisible(false);
            completeTutorial();
        } else {
            setStep((s) => s + 1);
        }
    }

    function handleSkip() {
        setVisible(false);
        completeTutorial();
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(10,4,20,0.85)", backdropFilter: "blur(8px)" }}
        >
            <div
                className="glass animate-popIn relative max-w-sm w-full p-8 flex flex-col items-center gap-5 text-center"
                style={{ border: "1px solid rgba(192,132,252,0.3)" }}
            >
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Step indicator */}
                <div className="flex gap-1.5">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className="h-1.5 rounded-full transition-all duration-300"
                            style={{
                                width: i === step ? "2rem" : "0.5rem",
                                background: i <= step ? "var(--accent)" : "rgba(255,255,255,0.2)",
                            }}
                        />
                    ))}
                </div>

                <div className="animate-float">{current.icon}</div>
                <h2 className="text-xl font-black gradient-text">{current.title}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {current.desc}
                </p>

                <button onClick={handleNext} className="btn-primary flex items-center gap-2 mt-2">
                    {isLast ? "始める！🚀" : "次へ"}
                    {!isLast && <ChevronRight size={16} />}
                </button>

                {!isLast && (
                    <button
                        onClick={handleSkip}
                        className="text-xs mt-1 transition-colors"
                        style={{ color: "var(--text-muted)" }}
                    >
                        スキップ
                    </button>
                )}
            </div>
        </div>
    );
}
