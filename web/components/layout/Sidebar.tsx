"use client"

import { BookOpen, FileText, Headphones, Mic, Lock, ChevronRight } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  isOpen: boolean
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [writingExpanded, setWritingExpanded] = useState(true)
  const pathname = usePathname()

  const isWritingActive = pathname === "/" || pathname.startsWith("/learn-expressions")

  return (
    <aside
      className={`${
        isOpen ? "w-72" : "w-0"
      } transition-all duration-300 border-r border-slate-800 bg-slate-900 overflow-hidden flex flex-col`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">TEF Canada</h1>
            <p className="text-xs text-slate-400">Expert</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Writing Section */}
        <div className="space-y-1 mb-4">
          <button
            onClick={() => setWritingExpanded(!writingExpanded)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              <span>Writing</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${writingExpanded ? "rotate-90" : ""}`}
            />
          </button>

          {writingExpanded && (
            <div className="ml-4 pl-4 border-l-2 border-slate-800 space-y-1">
              <Link
                href="/"
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition block ${
                  isWritingActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Section A
              </Link>
              <button className="w-full text-left px-4 py-2 rounded-lg text-sm text-slate-500 flex items-center justify-between cursor-not-allowed">
                <div>
                  <div>Section B</div>
                  <div className="text-xs">Coming Soon</div>
                </div>
                <Lock className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Reading - Coming Soon */}
        <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-slate-500 cursor-not-allowed mb-1">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <div className="text-left">
              <div>Reading</div>
              <div className="text-xs">Coming Soon</div>
            </div>
          </div>
          <Lock className="w-4 h-4" />
        </button>

        {/* Listening - Coming Soon */}
        <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-slate-500 cursor-not-allowed mb-1">
          <div className="flex items-center gap-3">
            <Headphones className="w-5 h-5" />
            <div className="text-left">
              <div>Listening</div>
              <div className="text-xs">Coming Soon</div>
            </div>
          </div>
          <Lock className="w-4 h-4" />
        </button>

        {/* Speaking - Coming Soon */}
        <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-slate-500 cursor-not-allowed">
          <div className="flex items-center gap-3">
            <Mic className="w-5 h-5" />
            <div className="text-left">
              <div>Speaking</div>
              <div className="text-xs">Coming Soon</div>
            </div>
          </div>
          <Lock className="w-4 h-4" />
        </button>
      </nav>
    </aside>
  )
}
