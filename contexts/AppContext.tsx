"use client";
import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import {
    AppData,
    FocusSession,
    ScheduleItem,
    Memo,
    ChatMessage,
} from "@/lib/types";
import {
    loadData,
    addSession as _addSession,
    addSchedule as _addSchedule,
    deleteSchedule as _deleteSchedule,
    addMemo as _addMemo,
    updateMemo as _updateMemo,
    deleteMemo as _deleteMemo,
    addChatMessage as _addChatMessage,
    getTodayRewards,
    markTutorialDone,
} from "@/lib/storage";

interface AppContextType {
    data: AppData;
    todayRewards: number;
    addSession: (s: FocusSession) => void;
    addSchedule: (s: ScheduleItem) => void;
    deleteSchedule: (id: string) => void;
    addMemo: (m: Memo) => void;
    updateMemo: (m: Memo) => void;
    deleteMemo: (id: string) => void;
    addChatMessage: (msg: ChatMessage) => void;
    completeTutorial: () => void;
    refreshData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<AppData>(() => loadData());
    const [todayRewards, setTodayRewards] = useState(0);

    const refreshData = useCallback(() => {
        const fresh = loadData();
        setData(fresh);
        setTodayRewards(getTodayRewards());
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const addSession = useCallback(
        (s: FocusSession) => {
            _addSession(s);
            refreshData();
        },
        [refreshData]
    );

    const addSchedule = useCallback(
        (s: ScheduleItem) => {
            _addSchedule(s);
            refreshData();
        },
        [refreshData]
    );

    const deleteSchedule = useCallback(
        (id: string) => {
            _deleteSchedule(id);
            refreshData();
        },
        [refreshData]
    );

    const addMemo = useCallback(
        (m: Memo) => {
            _addMemo(m);
            refreshData();
        },
        [refreshData]
    );

    const updateMemo = useCallback(
        (m: Memo) => {
            _updateMemo(m);
            refreshData();
        },
        [refreshData]
    );

    const deleteMemo = useCallback(
        (id: string) => {
            _deleteMemo(id);
            refreshData();
        },
        [refreshData]
    );

    const addChatMessage = useCallback(
        (msg: ChatMessage) => {
            _addChatMessage(msg);
            refreshData();
        },
        [refreshData]
    );

    const completeTutorial = useCallback(() => {
        markTutorialDone();
        refreshData();
    }, [refreshData]);

    return (
        <AppContext.Provider
            value={{
                data,
                todayRewards,
                addSession,
                addSchedule,
                deleteSchedule,
                addMemo,
                updateMemo,
                deleteMemo,
                addChatMessage,
                completeTutorial,
                refreshData,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used within AppProvider");
    return ctx;
}
