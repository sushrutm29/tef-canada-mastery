"use client"

import { useState } from "react"
import { Check, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Breadcrumb from "@/components/ui/Breadcrumb"
import CorrectSolutionModal from "@/components/CorrectSolutionModal"

interface Expression {
  french: string
  english: string
}

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
  articleId: string
  articleTitle: string
  expressions: Expression[]
  articlePrompt: string
  articleSegments: ArticleSegment[]
  shuffledBlanks: Blank[]
}

export default function LearnExpressionsExercise({
  articleTitle,
  expressions,
  articlePrompt,
  articleSegments,
  shuffledBlanks,
}: Props) {
  const [selections, setSelections] = useState<{ [key: number]: string }>({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<{ [key: number]: boolean }>({})
  const [showModal, setShowModal] = useState(false)

  // Create lookup map for O(1) access
  const blanksMap = new Map<number, Blank>()
  shuffledBlanks.forEach((blank) => blanksMap.set(blank.id, blank))

  const totalBlanks = shuffledBlanks.length
  const completedBlanks = Object.keys(selections).length
  const score = Object.values(results).filter(Boolean).length

  const handleSelect = (blankId: number, value: string) => {
    setSelections((prev) => ({ ...prev, [blankId]: value }))
  }

  const handleSubmit = () => {
    const newResults: { [key: number]: boolean } = {}
    shuffledBlanks.forEach((blank) => {
      const selectedOption = blank.options.find((opt) => opt.text === selections[blank.id])
      newResults[blank.id] = selectedOption?.correct || false
    })
    setResults(newResults)
    setSubmitted(true)
  }

  const handleReset = () => {
    setSelections({})
    setSubmitted(false)
    setResults({})
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Section A", href: "/" },
          { label: "Learn Expressions", href: "/learn-expressions" },
          { label: articleTitle || "Article" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/learn-expressions" className="p-2 hover:bg-slate-800 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{articleTitle || "Article"}</h1>
          <p className="text-slate-400 text-sm">Fill in the blanks with the correct expressions</p>
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 mb-4">
        <h2 className="text-sm font-medium text-blue-400 mb-2">Question</h2>
        <p className="text-blue-100">{articlePrompt}</p>
      </div>

      {/* Key Expressions Card */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 mb-4">
        <h2 className="text-sm font-medium text-blue-400 mb-3">Key Expressions</h2>
        <div className="grid gap-2">
          {expressions.map((expr, i) => (
            <div key={i} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-blue-100 font-medium">{expr.french}</div>
              <div className="text-orange-300 text-sm mt-1">{expr.english}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Build Response Card */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-blue-400">Build the Response</h2>
          {!submitted ? (
            <span className="text-sm text-blue-400">
              {completedBlanks}/{totalBlanks} completed
            </span>
          ) : (
            <span className="text-sm font-bold text-white">
              Score: {score}/{totalBlanks}
            </span>
          )}
        </div>

        {/* Article with Blanks */}
        <div className="text-slate-200 leading-loose mb-6 whitespace-pre-wrap">
          {articleSegments.map((segment, index) => {
            if (segment.text) {
              return <span key={index}>{segment.text}</span>
            }

            if (segment.blank) {
              const blank = blanksMap.get(segment.blank.id)!
              const isCorrect = results[blank.id]
              const selectedOption = blank.options.find((opt) => opt.text === selections[blank.id])

              return (
                <span key={index} className="inline-block align-middle">
                  <select
                    value={selections[blank.id] || ""}
                    onChange={(e) => handleSelect(blank.id, e.target.value)}
                    disabled={submitted}
                    style={{ width: "140px" }}
                    className={`mx-1 px-1 py-1 rounded border-2 text-xs font-medium transition-colors cursor-pointer ${
                      submitted
                        ? isCorrect
                          ? "border-green-400 bg-green-500/20 text-green-200"
                          : "border-red-400 bg-red-500/20 text-red-200"
                        : selections[blank.id]
                          ? "border-blue-400 bg-slate-800 text-white"
                          : "border-slate-500 bg-slate-800 text-slate-300"
                    }`}
                  >
                    <option value="">Choisir...</option>
                    {blank.options.map((option, i) => (
                      <option key={i} value={option.text}>
                        {option.text}
                      </option>
                    ))}
                  </select>

                  {/* Error feedback with tooltip */}
                  {submitted && !isCorrect && (
                    <span className="group relative inline-flex items-center ml-1">
                      <span className="p-1 bg-red-500/20 rounded">
                        <X className="w-4 h-4 text-red-400" />
                      </span>
                      <span className="invisible group-hover:visible absolute z-20 left-0 top-full mt-2 w-72 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl text-sm">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                          <X className="w-4 h-4" />
                          <span className="line-through">{selectedOption?.text}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-400 mb-2">
                          <Check className="w-4 h-4" />
                          <span>{blank.options.find((o) => o.correct)?.text}</span>
                        </div>
                        {selectedOption?.error && (
                          <div className="pt-2 border-t border-slate-700 text-slate-400 text-xs italic">
                            {selectedOption.error}
                          </div>
                        )}
                      </span>
                    </span>
                  )}

                  {/* Correct feedback */}
                  {submitted && isCorrect && (
                    <span className="inline-flex items-center ml-1 p-1 bg-green-500/20 rounded">
                      <Check className="w-4 h-4 text-green-400" />
                    </span>
                  )}
                </span>
              )
            }

            return null
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={completedBlanks < totalBlanks}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition"
            >
              Submit
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
              >
                View Correct Solution
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
              >
                Restart
              </button>
            </>
          )}
        </div>
      </div>

      <CorrectSolutionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        articlePrompt={articlePrompt}
        articleSegments={articleSegments}
      />
    </div>
  )
}
