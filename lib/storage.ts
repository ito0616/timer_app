import {
    AppData,
    FocusSession,
    ScheduleItem,
    Memo,
    ChatMessage,
} from "./types";

const STORAGE_KEY = "focus_app_data";

const defaultData: AppData = {
    sessions: [],
    schedules: [],
    memos: [],
    chatHistory: [],
    totalRewardsToday: 0,
    tutorialDone: false,
};

export function loadData(): AppData {
    if (typeof window === "undefined") return defaultData;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultData;
        return { ...defaultData, ...JSON.parse(raw) };
    } catch {
        return defaultData;
    }
}

export function saveData(data: AppData): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addSession(session: FocusSession): void {
    const data = loadData();
    data.sessions.push(session);
    saveData(data);
}

export function addSchedule(item: ScheduleItem): void {
    const data = loadData();
    data.schedules.push(item);
    saveData(data);
}

export function deleteSchedule(id: string): void {
    const data = loadData();
    data.schedules = data.schedules.filter((s) => s.id !== id);
    saveData(data);
}

export function addMemo(memo: Memo): void {
    const data = loadData();
    data.memos.push(memo);
    saveData(data);
}

export function updateMemo(memo: Memo): void {
    const data = loadData();
    data.memos = data.memos.map((m) => (m.id === memo.id ? memo : m));
    saveData(data);
}

export function deleteMemo(id: string): void {
    const data = loadData();
    data.memos = data.memos.filter((m) => m.id !== id);
    saveData(data);
}

export function addChatMessage(msg: ChatMessage): void {
    const data = loadData();
    data.chatHistory.push(msg);
    saveData(data);
}

export function getTodaySessionMinutes(): number {
    const data = loadData();
    const today = new Date().toISOString().slice(0, 10);
    return data.sessions
        .filter((s) => s.completedAt.startsWith(today))
        .reduce((acc, s) => acc + s.durationMinutes, 0);
}

export function getStatsByGenre(): Record<string, number> {
    const data = loadData();
    const result: Record<string, number> = {};
    for (const s of data.sessions) {
        result[s.genre] = (result[s.genre] || 0) + s.durationMinutes;
    }
    return result;
}

export function getLast7DaysStats(): { date: string, minutes: number }[] {
    const data = loadData();
    const result = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const minutes = data.sessions
            .filter(s => s.completedAt.startsWith(dateStr))
            .reduce((acc, s) => acc + s.durationMinutes, 0);
        result.push({ date: dateStr.slice(5), minutes });
    }
    return result;
}

export function getSessionsByDate(): Record<string, number> {
    const data = loadData();
    const result: Record<string, number> = {};
    for (const s of data.sessions) {
        const day = s.completedAt.slice(0, 10);
        result[day] = (result[day] || 0) + s.durationMinutes;
    }
    return result;
}

export function getTodayRewards(): number {
    const data = loadData();
    const today = new Date().toISOString().slice(0, 10);
    return data.sessions
        .filter((s) => s.completedAt.startsWith(today))
        .reduce((acc, s) => acc + (s.reward || 0), 0);
}

export function getTotalRewards(): number {
    const data = loadData();
    return data.sessions.reduce((acc, s) => acc + (s.reward || 0), 0);
}

export function markTutorialDone(): void {
    const data = loadData();
    data.tutorialDone = true;
    saveData(data);
}
