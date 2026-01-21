import { FileText, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function SectionAMenu() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Writing - Section A</h1>
      <p className="text-slate-400 mb-8">Choose your practice mode</p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Learn Expressions - Active */}
        <Link
          href="/learn-expressions"
          className="rounded-xl bg-slate-900 border border-slate-800 p-6 text-left hover:border-blue-500/50 transition"
        >
          <FileText className="w-8 h-8 text-blue-400 mb-3" />
          <div className="text-lg font-semibold text-white mb-2">Learn Expressions</div>
          <div className="text-sm text-slate-400">Master key phrases with fill-in-the-blanks</div>
        </Link>

        {/* AI Guided Builder - Coming Soon */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 text-left opacity-60">
          <MessageSquare className="w-8 h-8 text-purple-400 mb-3" />
          <div className="text-lg font-semibold text-white mb-2">AI Guided Builder</div>
          <div className="text-sm text-slate-400">Step-by-step story creation</div>
          <div className="mt-3 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded inline-block">
            Coming Soon
          </div>
        </div>

        {/* Free Writing - Coming Soon */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 text-left opacity-60">
          <FileText className="w-8 h-8 text-slate-400 mb-3" />
          <div className="text-lg font-semibold text-white mb-2">Free Writing</div>
          <div className="text-sm text-slate-400">Write complete stories with AI feedback</div>
          <div className="mt-3 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded inline-block">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  )
}
