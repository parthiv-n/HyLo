"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, ArrowUpRight, ArrowDownLeft, History } from "lucide-react"

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/send", icon: ArrowUpRight, label: "Send" },
  { href: "/receive", icon: ArrowDownLeft, label: "Receive" },
  { href: "/history", icon: History, label: "History" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-lg border-t border-white/5 safe-bottom">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors touch-feedback",
                isActive
                  ? "text-emerald-400"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "animate-pulse-ring")} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
