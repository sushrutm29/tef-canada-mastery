"use client"

import { PanelLeft } from "lucide-react"

interface HeaderProps {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="px-6 py-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-slate-800 rounded-lg transition"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
