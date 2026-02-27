/**
 * クライアントサイドからGemini APIを呼び出すためのユーティリティ。
 * APIキーはサーバー側の /api/gemini Route Handler でのみ使用されるため安全です。
 * ローカルストレージへのキャッシュにより、同じ内容のAPIリクエストを節約します。
 */

// キャッシュの有効期限（24時間）
const CACHE_TTL = 24 * 60 * 60 * 1000;

/** プロンプト文字列を短いキーに変換 */
function makeCacheKey(prompt: string): string {
    // btoa は ASCII のみなので encodeURIComponent でエスケープ
    try {
        return "gemini_" + btoa(encodeURIComponent(prompt).slice(0, 200));
    } catch {
        return "gemini_" + prompt.slice(0, 80).replace(/\s+/g, "_");
    }
}

/** キャッシュから取得（期限切れは自動削除） */
function getCache(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const { text, timestamp } = JSON.parse(raw) as { text: string; timestamp: number };
        if (Date.now() - timestamp > CACHE_TTL) {
            localStorage.removeItem(key);
            return null;
        }
        return text;
    } catch {
        return null;
    }
}

/** キャッシュに保存 */
function setCache(key: string, text: string): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify({ text, timestamp: Date.now() }));
    } catch {
        // ストレージ容量超過などは無視
    }
}

async function callGemini(prompt: string): Promise<string> {
    const cacheKey = makeCacheKey(prompt);

    // キャッシュヒットならAPIを呼ばずに返す
    const cached = getCache(cacheKey);
    if (cached) {
        console.log("[Gemini] キャッシュから返却");
        return cached;
    }

    try {
        const res = await fetch("/api/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });

        if (!res.ok) {
            const body = await res.json();
            console.error(`Gemini API error [HTTP ${res.status}]:`, body.error);
            return `AIとの通信でエラーが発生しました（${body.error ?? res.status}）`;
        }

        const { text } = await res.json();
        const result = text ?? "";

        // 正常なレスポンスのみキャッシュに保存
        if (result) setCache(cacheKey, result);

        return result;
    } catch (e) {
        console.error("Gemini fetch error:", e);
        return "AIとの通信でエラーが発生しました。";
    }
}

export async function generateTimerComplete(
    title: string,
    genre: string,
    minutes: number
): Promise<string> {
    const prompt = `あなたは勉強を応援するかわいいAIアシスタントです。
ユーザーが「${genre}」のジャンルで「${title}」を${minutes}分頑張って終わりました。
日本語で、短く（2〜3文）、元気よく、かつ温かく褒めてあげてください。
最初の文は必ず「お疲れ様！${title}を頑張った君に報酬だよ！」から始めてください。
絵文字を使ってください。`;
    return callGemini(prompt);
}

export async function generateCharacterMessage(
    rewards: number,
    totalMinutes: number
): Promise<string> {
    const level =
        rewards === 0
            ? "今日はまだ頑張れていない"
            : rewards <= 2
                ? `今日${rewards}回集中した`
                : `今日${rewards}回も集中して大活躍した`;
    const prompt = `あなたはユーザーのお供をするかわいいキャラクターです。
ユーザーは「${level}」状況で、合計${totalMinutes}分勉強しました。
キャラクターとして、日本語で短く（1〜2文）、その状況に合った一言を言ってください。
絵文字を使ってください。${rewards === 0 ? "少し寂しそうにしてください。" : rewards <= 2 ? "まあまあ褒めてください。" : "めちゃくちゃ喜んでください！"}`;
    return callGemini(prompt);
}

export async function processAIChat(
    userMessage: string,
    today: string
): Promise<{ reply: string; action?: any }> {
    const prompt = `あなたは学習計画をサポートするAIアシスタントです。今日の日付: ${today}
ユーザーのメッセージ: 「${userMessage}」

以下のいずれかを判断してJSON形式で返してください:

1. 締切・スケジュール追加の依頼の場合:
{"type":"add_schedule","reply":"〇〇を△月△日にカレンダーに追加しました！","title":"タイトル","date":"YYYY-MM-DD","isDeadline":true/false}

2. 勉強ペースを聞いてきた場合:
{"type":"pace_advice","reply":"アドバイス文（最後に『カレンダーに登録しますか？』と聞く）","title":"タスク名","date":"YYYY-MM-DD","dailyGoal":"1日あたりの目標"}

3. それ以外の雑談・質問:
{"type":"chat","reply":"返答"}

必ずJSONのみを返してください。余計なテキストは不要です。`;

    try {
        const raw = await callGemini(prompt);
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return { reply: parsed.reply, action: parsed };
    } catch {
        return { reply: await callGemini(`ユーザーへの返答を日本語で: ${userMessage}`) };
    }
}
