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
    return data.sessions.filter((s) => s.completedAt.startsWith(today)).length;
}

export function markTutorialDone(): void {
    const data = loadData();
    data.tutorialDone = true;
    saveData(data);
}
