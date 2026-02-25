"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Timer, CalendarDays, Star, FileText, Bot } from "lucide-react";

const navItems = [
    { href: "/", icon: Timer, label: "タイマー" },
    { href: "/calendar", icon: CalendarDays, label: "カレンダー" },
    { href: "/character", icon: Star, label: "キャラ" },
    { href: "/memo", icon: FileText, label: "メモ" },
    { href: "/ai", icon: Bot, label: "AI" },
];

export default function Navigation() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop: sidebar */}
            <nav
                className="hidden md:flex flex-col items-center py-6 gap-2 fixed left-0 top-0 h-full z-50"
                style={{
                    width: "5rem",
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(20px)",
                    borderRight: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                <div
                    className="mb-4 text-2xl font-black gradient-text"
                    style={{ letterSpacing: "-1px" }}
                >
                    FQ
                </div>
                {navItems.map(({ href, icon: Icon, label }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`nav-item w-16 ${pathname === href ? "active" : ""}`}
                    >
                        <Icon size={22} />
                        <span>{label}</span>
                    </Link>
                ))}
            </nav>

            {/* Mobile: bottom bar */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 py-2"
                style={{
                    background: "rgba(20,8,40,0.92)",
                    backdropFilter: "blur(20px)",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                {navItems.map(({ href, icon: Icon, label }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`nav-item flex-1 ${pathname === href ? "active" : ""}`}
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </Link>
                ))}
            </nav>
        </>
    );
}
