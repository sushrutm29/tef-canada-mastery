"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "./Sidebar"
import Header from "./Header"

interface AppShellProps {
  children: React.ReactNode
}

// Content pages where sidebar should always close (on desktop)
const CONTENT_ROUTES = ["/learn-expressions/"]

// Pages where clicking from sidebar should close it (like home)
const CLOSE_ON_NAVIGATE = ["/"]

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const isContentPage = CONTENT_ROUTES.some((route) => pathname.startsWith(route) && pathname !== route)
    const shouldCloseOnNavigate = CLOSE_ON_NAVIGATE.includes(pathname)

    // Close on mobile for any navigation, on desktop for content pages or home
    if (isMobile || isContentPage || shouldCloseOnNavigate) {
      setSidebarOpen(false)
    }
  }, [pathname])

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
