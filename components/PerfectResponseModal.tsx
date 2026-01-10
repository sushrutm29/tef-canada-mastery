import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
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

export default function PerfectResponseModal({ isOpen, onClose, articlePrompt, articleSegments }: Props) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-blue-900">Correct Solution</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 text-xl font-semibold text-blue-900">Question:</h3>
          <p className="text-base text-blue-800">{articlePrompt}</p>
        </div>

        <div className="rounded-lg bg-green-50 p-4">
          <h3 className="mb-3 text-xl font-semibold text-green-900">Perfect Answer:</h3>
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
                const blank = segment.blank
                const correctOption = blank.options.find((opt) => opt.correct)

                return (
                  <span key={index} className="font-semibold text-green-700">
                    {correctOption?.text}
                  </span>
                )
              }

              return null
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} className="bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
