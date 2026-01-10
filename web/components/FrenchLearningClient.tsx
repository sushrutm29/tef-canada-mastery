"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import PerfectResponseModal from "@/components/CorrectSolutionModal"

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
  expressions: Expression[]
  articlePrompt: string
  articleSegments: ArticleSegment[]
  shuffledBlanks: Blank[]
}

export default function FrenchLearningClient({
  expressions,
  articlePrompt,
  articleSegments,
  shuffledBlanks,
}: Props) {
  const [selections, setSelections] = useState<{ [key: number]: string }>({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<{ [key: number]: boolean }>({})
  const [showPerfectResponse, setShowPerfectResponse] = useState(false)
  const exerciseRef = useRef<HTMLDivElement>(null)

  // Create lookup map for O(1) access
  const blanksMap = new Map<number, Blank>()
  shuffledBlanks.forEach((blank) => blanksMap.set(blank.id, blank))

  const totalBlanks = shuffledBlanks.length
  const completedBlanks = Object.keys(selections).length

  const handleSelect = (blankId: number, value: string) => {
    setSelections((prev) => ({ ...prev, [blankId]: value }))
  }

  const scrollToExercise = () => {
    exerciseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
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

  const score = Object.values(results).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Section 1: Expression Reference Guide */}
        <section className="mb-4">
          <div className="mb-6 text-center">
            <h1 className="mb-1 text-4xl font-bold text-blue-900">TEF Canada Writing - Section A</h1>
            <p className="text-lg text-blue-700">Maîtrisez les expressions clés pour réussir l'examen</p>
          </div>

          {/* Article Prompt at the top */}
          <Card className="mb-4 bg-white p-5 shadow-lg">
            <h2 className="mb-2 text-2xl font-semibold text-blue-900">Question</h2>
            <div className="rounded-lg bg-blue-100 p-3">
              <p className="text-base leading-relaxed text-blue-900">{articlePrompt}</p>
            </div>
          </Card>

          {/* Expressions below the prompt */}
          <Card className="mb-4 bg-white p-5 shadow-lg">
            <h2 className="mb-2 text-2xl font-semibold text-blue-900">Key expressions to remember</h2>
            <div className="space-y-2">
              {expressions.map((expr, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-blue-100 bg-blue-50 p-3 transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className="font-semibold text-blue-900">{expr.french}</div>
                  <div className="mt-1 text-sm text-blue-600">{expr.english}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Section 2: Article Reconstruction Exercise */}
        <section ref={exerciseRef} className="scroll-mt-4">
          <Card className="bg-white p-5 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-blue-900">Let's build the perfect response...</h2>
              {!submitted && (
                <div className="text-sm font-medium text-blue-600">
                  {completedBlanks}/{totalBlanks} completed
                </div>
              )}
              {submitted && (
                <div className="text-lg font-bold text-blue-900">
                  Score: {score}/{totalBlanks}
                </div>
              )}
            </div>

            {/* Article with Blanks */}
            <div className="space-y-1 text-lg leading-relaxed text-gray-800">
              {articleSegments.map((segment, index) => {
                if (segment.text) {
                  return (
                    <span key={index} className="whitespace-pre-wrap">
                      {segment.text}
                    </span>
                  )
                }

                if (segment.blank) {
                  // Use shuffled blank from map (O(1) lookup)
                  const blank = blanksMap.get(segment.blank.id)!
                  const isCorrect = results[blank.id]
                  const selectedOption = blank.options.find((opt) => opt.text === selections[blank.id])

                  return (
                    <span key={index} className="inline-block">
                      <select
                        value={selections[blank.id] || ""}
                        onChange={(e) => handleSelect(blank.id, e.target.value)}
                        disabled={submitted}
                        className={`mx-1 inline-block min-w-[200px] rounded-md border-2 px-3 py-1 text-base transition-colors ${
                          submitted
                            ? isCorrect
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                            : "border-blue-300 bg-white hover:border-blue-400 focus:border-blue-500"
                        }`}
                      >
                        <option value="">Choisir...</option>
                        {blank.options.map((option, optIndex) => (
                          <option key={optIndex} value={option.text}>
                            {option.text}
                          </option>
                        ))}
                      </select>

                      {/* Feedback Display */}
                      {submitted && !isCorrect && (
                        <span className="group relative ml-2 inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 cursor-help">
                          <X className="h-4 w-4 text-red-600" />
                          {/* Hover tooltip */}
                          <span className="invisible group-hover:visible absolute z-10 left-0 top-full mt-2 w-80 rounded-md bg-gray-900 px-4 py-3 text-sm text-white shadow-xl">
                            <div className="mb-2 flex items-center gap-2 text-red-300">
                              <X className="h-4 w-4" />
                              <span className="line-through">{selectedOption?.text}</span>
                            </div>
                            <div className="mb-2 flex items-center gap-2 text-green-300">
                              <Check className="h-4 w-4" />
                              <span>{blank.options.find((o) => o.correct)?.text}</span>
                            </div>
                            {selectedOption?.error && (
                              <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-300 italic">
                                {selectedOption.error}
                              </div>
                            )}
                          </span>
                        </span>
                      )}
                      {submitted && isCorrect && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-1">
                          <Check className="h-4 w-4 text-green-600" />
                        </span>
                      )}
                    </span>
                  )
                }

                return null
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-center gap-4">
              {!submitted ? (
                <Button
                  onClick={handleSubmit}
                  disabled={completedBlanks < totalBlanks}
                  size="lg"
                  className="bg-blue-600 px-8 py-6 text-lg font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => setShowPerfectResponse(true)}
                    size="lg"
                    className="bg-green-600 px-8 py-6 text-lg font-semibold text-white hover:bg-green-700"
                  >
                    View Correct Solution
                  </Button>
                  <Button
                    onClick={handleReset}
                    size="lg"
                    className="bg-blue-600 px-8 py-6 text-lg font-semibold text-white hover:bg-blue-700"
                  >
                    Restart
                  </Button>
                </>
              )}
            </div>
          </Card>
        </section>
      </div>

      <PerfectResponseModal
        isOpen={showPerfectResponse}
        onClose={() => setShowPerfectResponse(false)}
        articlePrompt={articlePrompt}
        articleSegments={articleSegments}
      />
    </div>
  )
}
