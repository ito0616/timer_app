import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import Navigation from "@/components/Navigation";
import TutorialOverlay from "@/components/Tutorial/TutorialOverlay";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FocusQuest - 集中タイマー & 学習記録",
  description: "楽しく続ける学習サポートアプリ。タイマー・カレンダー・AIアシスタント完備。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={nunito.className}>
        <AppProvider>
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 ml-0 md:ml-20 pb-20 md:pb-0 flex flex-col items-center">
              {children}
            </main>
          </div>
          <TutorialOverlay />
        </AppProvider>
      </body>
    </html>
  );
}
