const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

interface GeminiResponse {
    text: string;
}

async function callGemini(prompt: string): Promise<string> {
    if (!API_KEY) {
        return "（AIキーが設定されていないため、AIメッセージは表示できません）";
    }
    try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (e) {
        console.error("Gemini error:", e);
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

    if (!API_KEY) {
        return {
            reply:
                "AIキーが設定されていません。.env.localにNEXT_PUBLIC_GEMINI_API_KEYを設定してください。",
        };
    }

    try {
        const raw = await callGemini(prompt);
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return { reply: parsed.reply, action: parsed };
    } catch {
        return { reply: await callGemini(`ユーザーへの返答を日本語で: ${userMessage}`) };
    }
}
