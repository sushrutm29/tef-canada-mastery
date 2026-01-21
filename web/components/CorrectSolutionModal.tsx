"use client"

import { useEffect } from "react"

interface Option {
  text: string
  correct: boolean
  error?: string
}

interface Blank {
  id: number
  options: Option[]
}

interface ArticleSegment {
  text?: string
  blank?: Blank
}

interface Props {
  isOpen: boolean
  onClose: () => void
  articlePrompt: string
  articleSegments: ArticleSegment[]
}

export default function CorrectSolutionModal({
  isOpen,
  onClose,
  articlePrompt,
  articleSegments,
}: Props) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 shrink-0">
          <h2 className="text-xl font-bold text-white">Correct Solution</h2>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {/* Question */}
          <div className="mb-4 p-4 bg-slate-800 rounded-lg">
            <p className="text-slate-300 text-sm">{articlePrompt}</p>
          </div>

          {/* Perfect Answer */}
          <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
            {articleSegments.map((segment, index) => (
              <span key={index}>
                {segment.text && <span>{segment.text}</span>}
                {segment.blank && (
                  <span className="text-green-400 font-medium">
                    {segment.blank.options.find((o) => o.correct)?.text}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
