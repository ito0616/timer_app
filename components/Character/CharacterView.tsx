"use client";
import { useState } from "react";
import { generateCharacterMessage } from "@/lib/gemini";
import { useApp } from "@/contexts/AppContext";
import { getTodaySessionMinutes } from "@/lib/storage";
import { MessageCircle, Star } from "lucide-react";

function CharacterSVG({ mood }: { mood: "sad" | "normal" | "happy" | "ecstatic" }) {
    const eyeY = mood === "happy" || mood === "ecstatic" ? 42 : 44;
    const mouthPath =
        mood === "sad"
            ? "M 38 60 Q 50 54 62 60"
            : mood === "normal"
                ? "M 38 58 Q 50 60 62 58"
                : "M 38 54 Q 50 66 62 54";

    const blush = mood === "happy" || mood === "ecstatic";
    const bodyColor =
        mood === "ecstatic" ? "#f59e0b" : mood === "happy" ? "#a855f7" : mood === "normal" ? "#9333ea" : "#6b7280";
    const earColor =
        mood === "ecstatic" ? "#fbbf24" : mood === "happy" ? "#c084fc" : mood === "normal" ? "#a855f7" : "#9ca3af";

    return (
        <svg viewBox="0 0 100 130" width="160" height="160" className="animate-float">
            {/* Ears */}
            <ellipse cx="22" cy="40" rx="10" ry="14" fill={earColor} />
            <ellipse cx="78" cy="40" rx="10" ry="14" fill={earColor} />
            <ellipse cx="22" cy="40" rx="6" ry="9" fill="#fce7f3" />
            <ellipse cx="78" cy="40" rx="6" ry="9" fill="#fce7f3" />
            {/* Head */}
            <ellipse cx="50" cy="52" rx="32" ry="34" fill={bodyColor} />
            {/* Eyes */}
            {mood === "ecstatic" ? (
                <>
                    <text x="34" y={eyeY + 4} fontSize="12" textAnchor="middle">★</text>
                    <text x="66" y={eyeY + 4} fontSize="12" textAnchor="middle">★</text>
                </>
            ) : (
                <>
                    <ellipse cx="37" cy={eyeY} rx="5" ry={mood === "sad" ? 4 : 5} fill="white" />
                    <ellipse cx="63" cy={eyeY} rx="5" ry={mood === "sad" ? 4 : 5} fill="white" />
                    <circle cx="38" cy={eyeY + 1} r="2.5" fill="#1e1b4b" />
                    <circle cx="64" cy={eyeY + 1} r="2.5" fill="#1e1b4b" />
                    <circle cx="39" cy={eyeY} r="1" fill="white" />
                    <circle cx="65" cy={eyeY} r="1" fill="white" />
                </>
            )}
            {/* Blush */}
            {blush && (
                <>
                    <ellipse cx="30" cy="58" rx="7" ry="4" fill="#fda4af" opacity="0.6" />
                    <ellipse cx="70" cy="58" rx="7" ry="4" fill="#fda4af" opacity="0.6" />
                </>
            )}
            {/* Mouth */}
            <path d={mouthPath} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            {/* Body */}
            <ellipse cx="50" cy="105" rx="24" ry="22" fill={bodyColor} opacity="0.85" />
            {/* Arms */}
            <ellipse cx="20" cy="98" rx="9" ry="5" fill={bodyColor} transform="rotate(-20 20 98)" />
            <ellipse cx="80" cy="98" rx="9" ry="5" fill={bodyColor} transform="rotate(20 80 98)" />
            {/* Stars for ecstatic */}
            {mood === "ecstatic" && (
                <>
                    <text x="8" y="30" fontSize="12">✨</text>
                    <text x="78" y="25" fontSize="12">✨</text>
                    <text x="85" y="75" fontSize="10">⭐</text>
                </>
            )}
        </svg>
    );
}

export default function CharacterPage() {
    const { todayRewards } = useApp();
    const todayMins = getTodaySessionMinutes();
    const [speech, setSpeech] = useState("");
    const [loading, setLoading] = useState(false);

    const mood: "sad" | "normal" | "happy" | "ecstatic" =
        todayRewards === 0 ? "sad" : todayRewards <= 2 ? "normal" : todayRewards <= 4 ? "happy" : "ecstatic";

    const moodLabel = {
        sad: "今日はまだ頑張ってないにゃ…",
        normal: "ちょっと頑張ったね！",
        happy: "すごく頑張ってる！えらい！🎉",
        ecstatic: "最高だにゃ！！！✨🌟",
    }[mood];

    async function handleSpeak() {
        setLoading(true);
        setSpeech("");
        const msg = await generateCharacterMessage(todayRewards, todayMins);
        setSpeech(msg);
        setLoading(false);
    }

    return (
        <div className="flex flex-col items-center gap-6 animate-fadeIn">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                <div className="glass p-4 text-center">
                    <div className="text-3xl font-black gradient-text">{todayRewards}</div>
                    <div className="text-xs font-bold mt-1" style={{ color: "var(--text-muted)" }}>今日の報酬</div>
                    <div className="flex justify-center gap-0.5 mt-1">
                        {Array.from({ length: Math.min(todayRewards, 10) }).map((_, i) => (
                            <Star key={i} size={10} fill="#fbbf24" stroke="none" />
                        ))}
                    </div>
                </div>
                <div className="glass p-4 text-center">
                    <div className="text-3xl font-black gradient-text">{todayMins}</div>
                    <div className="text-xs font-bold mt-1" style={{ color: "var(--text-muted)" }}>今日の集中時間(分)</div>
                </div>
            </div>

            {/* Character */}
            <div className="relative flex flex-col items-center">
                <CharacterSVG mood={mood} />

                {/* Speech bubble */}
                {(speech || loading) && (
                    <div
                        className="absolute -top-4 left-1/2 -translate-x-1/2 w-56 glass p-3 rounded-2xl text-center animate-popIn text-sm"
                        style={{ border: "1px solid rgba(192,132,252,0.4)" }}
                    >
                        <div
                            className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0"
                            style={{
                                borderLeft: "8px solid transparent",
                                borderRight: "8px solid transparent",
                                borderTop: "10px solid rgba(255,255,255,0.1)",
                            }}
                        />
                        {loading ? (
                            <div className="flex items-center justify-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                                <div className="w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                                考え中...
                            </div>
                        ) : (
                            <p className="text-xs leading-relaxed">{speech}</p>
                        )}
                    </div>
                )}
            </div>

            <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>{moodLabel}</p>

            <button onClick={handleSpeak} className="btn-primary flex items-center gap-2">
                <MessageCircle size={18} />
                一言もらう！
            </button>

            {/* Mood guide */}
            <div className="glass p-4 max-w-sm w-full">
                <div className="text-xs font-black mb-3" style={{ color: "var(--text-muted)" }}>キャラクターの気分</div>
                <div className="flex flex-col gap-2">
                    {[
                        { range: "0回", mood: "😿 寂しい", color: "#6b7280" },
                        { range: "1〜2回", mood: "😊 普通", color: "#9333ea" },
                        { range: "3〜4回", mood: "😄 嬉しい", color: "#a855f7" },
                        { range: "5回以上", mood: "🤩 大興奮！", color: "#f59e0b" },
                    ].map((item) => (
                        <div key={item.range} className="flex items-center justify-between text-xs">
                            <span style={{ color: "var(--text-muted)" }}>{item.range}の報酬</span>
                            <span className="font-bold" style={{ color: item.color }}>{item.mood}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
