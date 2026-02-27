import TimerComponent from "@/components/Timer/TimerComponent";

export default function HomePage() {
  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 items-center justify-center w-full max-w-3xl">
      <div className="text-center mt-2">
        <h1 className="text-3xl font-black gradient-text">Focus Timer ⏱</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          集中して頑張ろう！完了すると報酬がもらえるよ✨
        </p>
      </div>
      <TimerComponent />
    </div>
  );
}
