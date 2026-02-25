export type Genre = "勉強" | "読書" | "運動" | "趣味" | "その他";

export interface FocusSession {
  id: string;
  title: string;
  genre: Genre;
  durationMinutes: number;
  completedAt: string; // ISO string
  reward: number; // 報酬ポイント (1固定)
}

export interface ScheduleItem {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  time?: string; // "HH:mm"
  color?: string;
  isDeadline?: boolean;
}

export interface Memo {
  id: string;
  content: string;
  tag: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  pendingAction?: PendingAction;
}

export interface PendingAction {
  type: "add_schedule";
  scheduleItem: Omit<ScheduleItem, "id">;
}

export interface AppData {
  sessions: FocusSession[];
  schedules: ScheduleItem[];
  memos: Memo[];
  chatHistory: ChatMessage[];
  totalRewardsToday: number;
  tutorialDone: boolean;
}
