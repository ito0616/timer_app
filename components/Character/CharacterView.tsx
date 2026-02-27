"use client";
import { useState } from "react";
import { generateCharacterMessage } from "@/lib/gemini";
import { useApp } from "@/contexts/AppContext";
import { getTodaySessionMinutes, getTotalRewards } from "@/lib/storage";
import { MessageCircle, Star, TrendingUp, Trophy } from "lucide-react";

interface CharacterProps {
    mood: "sad" | "normal" | "happy" | "ecstatic";
    level: number;
}

function CharacterSVG({ mood, level }: CharacterProps) {
    const eyeY = mood === "happy" || mood === "ecstatic" ? 42 : 44;
    const mouthPath =
        mood === "sad"
            ? "M 38 60 Q 50 54 62 60"
            : mood === "normal"
                ? "M 38 58 Q 50 60 62 58"
                : "M 38 54 Q 50 66 62 54";

    const blush = mood === "happy" || mood === "ecstatic";
    const bodyColor =
        level >= 4 ? "#fbbf24" : // Gold for high level
            mood === "ecstatic" ? "#f59e0b" : mood === "happy" ? "#a855f7" : mood === "normal" ? "#9333ea" : "#6b7280";
    const earColor =
        level >= 4 ? "#fcd34d" :
            mood === "ecstatic" ? "#fbbf24" : mood === "happy" ? "#c084fc" : mood === "normal" ? "#a855f7" : "#9ca3af";

    // Character size grows slightly with level
    const scale = 1 + (level - 1) * 0.05;

    return (
        <svg viewBox="0 0 100 130" width="180" height="180" className="animate-float" style={{ transform: `scale(${scale})` }}>
            {/* Level specific decorations */}
            {level >= 2 && (
                <path d="M 25 25 L 15 15 L 20 10 Z" fill="#ef4444" /> /* Ribbon left */
            )}
            {level >= 2 && (
                <path d="M 75 25 L 85 15 L 80 10 Z" fill="#ef4444" /> /* Ribbon right */
            )}

            {/* Level 3: Crown */}
            {level >= 3 && (
                <path d="M 35 15 L 42 22 L 50 12 L 58 22 L 65 15 L 65 28 L 35 28 Z" fill="#facc15" stroke="#854d0e" strokeWidth="1" />
            )}

            {/* Level 4: Aura/Glow */}
            {level >= 4 && (
                <circle cx="50" cy="65" r="45" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 4" className="animate-spin-slow" />
            )}

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
                    <text x="34" y={eyeY + 4} fontSize="12" textAnchor="middle" fill="white">★</text>
                    <text x="66" y={eyeY + 4} fontSize="12" textAnchor="middle" fill="white">★</text>
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
        </svg>
    );
}

export default function CharacterPage() {
    const { todayRewards } = useApp();
    const todayMins = getTodaySessionMinutes();
    const totalRewards = getTotalRewards();
    const [speech, setSpeech] = useState("");
    const [loading, setLoading] = useState(false);

    // Level Calculation
    const getLevelInfo = (rewards: number) => {
        if (rewards < 30) return { level: 1, next: 30, label: "ベイビー期", icon: "🍼" };
        if (rewards < 100) return { level: 2, next: 100, label: "わんぱく期", icon: "🎈" };
        if (rewards < 300) return { level: 3, next: 300, label: "成長期", icon: "👑" };
        return { level: 4, next: 1000, label: "超越期", icon: "✨" };
    };

    const lvInfo = getLevelInfo(totalRewards);
    const prevThreshold = lvInfo.level === 1 ? 0 : lvInfo.level === 2 ? 30 : lvInfo.level === 3 ? 100 : 300;
    const progress = Math.min(100, ((totalRewards - prevThreshold) / (lvInfo.next - prevThreshold)) * 100);

    const mood: "sad" | "normal" | "happy" | "ecstatic" =
        todayRewards === 0 ? "sad" : todayRewards <= 2 ? "normal" : todayRewards <= 5 ? "happy" : "ecstatic";

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
        <div className="flex flex-col items-center gap-6 animate-fadeIn w-full max-w-md mx-auto">
            {/* Growth Status Card */}
            <div className="glass p-5 w-full flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg">
                            {lvInfo.icon}
                        </div>
                        <div>
                            <div className="text-xs font-black opacity-60 uppercase tracking-wider">Level {lvInfo.level}</div>
                            <div className="text-lg font-black gradient-text">{lvInfo.label}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-muted-foreground flex items-center gap-1 justify-end">
                            <Star size={12} fill="currentColor" /> 累計報酬
                        </div>
                        <div className="text-xl font-black">{totalRewards}</div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                        <span>Growth Progress</span>
                        <span>{Math.floor(progress)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="text-[10px] text-center font-bold opacity-40">
                        次の進化まであと {lvInfo.next - totalRewards} 報酬
                    </div>
                </div>
            </div>

            {/* Today's Stats */}
            <div className="grid grid-cols-2 gap-3 w-full">
                <div className="glass p-4 text-center border-b-2 border-transparent hover:border-pink-500/30 transition-all">
                    <div className="text-2xl font-black gradient-text">{todayRewards}</div>
                    <div className="text-[10px] font-black uppercase mt-1 opacity-60">今日の報酬</div>
                </div>
                <div className="glass p-4 text-center border-b-2 border-transparent hover:border-purple-500/30 transition-all">
                    <div className="text-2xl font-black gradient-text">{todayMins}</div>
                    <div className="text-[10px] font-black uppercase mt-1 opacity-60">今日の集中(分)</div>
                </div>
            </div>

            {/* Character Visual */}
            <div className="relative flex flex-col items-center py-4">
                <CharacterSVG mood={mood} level={lvInfo.level} />

                {/* Speech bubble */}
                {(speech || loading) && (
                    <div
                        className="absolute -top-6 left-1/2 -translate-x-1/2 w-56 glass p-3 rounded-2xl text-center animate-popIn text-sm"
                        style={{ border: "1px solid rgba(192,132,252,0.4)", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}
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
                                想いを受け取り中...
                            </div>
                        ) : (
                            <p className="text-xs leading-relaxed italic">「{speech}」</p>
                        )}
                    </div>
                )}
            </div>

            <div className="text-center space-y-4 w-full">
                <p className="text-sm font-bold bg-white/5 py-2 px-4 rounded-full inline-block" style={{ color: "var(--text-muted)" }}>
                    {moodLabel}
                </p>

                <div className="flex gap-2 justify-center">
                    <button onClick={handleSpeak} className="btn-primary flex items-center gap-2 px-8">
                        <MessageCircle size={18} />
                        一言もらう！
                    </button>
                </div>
            </div>

            {/* Level Guide */}
            <div className="glass p-4 w-full">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={14} className="text-purple-400" />
                    <div className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>進化の記録</div>
                </div>
                <div className="space-y-2">
                    {[
                        { lv: 1, req: "0〜29", label: "ベイビー期", color: "#6b7280" },
                        { lv: 2, req: "30〜99", label: "わんぱく期（リボン付）", color: "#9333ea" },
                        { lv: 3, req: "100〜299", label: "成長期（王冠付）", color: "#a855f7" },
                        { lv: 4, req: "300〜", label: "超越期（黄金・オーラ）", color: "#f59e0b" },
                    ].map((item) => (
                        <div key={item.lv} className={`flex items-center justify-between text-[11px] p-2 rounded-lg ${lvInfo.level === item.lv ? "bg-white/10" : "opacity-40"}`}>
                            <span className="font-bold" style={{ color: item.color }}>Lv.{item.lv} {item.label}</span>
                            <span style={{ color: "var(--text-muted)" }}>{item.req} 報酬</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
