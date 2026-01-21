"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <Sidebar isOpen={sidebarOpen} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
