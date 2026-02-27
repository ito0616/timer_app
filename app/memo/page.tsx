import MemoView from "@/components/Memo/MemoView";

export default function MemoPage() {
    return (
        <div className="min-h-screen p-6 max-w-3xl mx-auto w-full flex flex-col items-center justify-center">
            <div className="w-full">
                <MemoView />
            </div>
        </div>
    );
}
