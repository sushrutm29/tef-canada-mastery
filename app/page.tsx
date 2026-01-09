"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, X } from "lucide-react"

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

const expressions: Expression[] = [
  { french: "Tout a basculé lorsque...", english: "Everything changed when..." },
  { french: "... ont eu la frayeur de leur vie", english: "... got the fright of their lives" },
  { french: "Ils ont alors... mais sans résultat", english: "They then... but without result" },
  { french: "Aussitôt alertées, ... se sont rendues sur les lieux", english: "As soon as alerted, ... went to the scene" },
  { french: "C'est alors qu'un détail a attiré l'attention des enquêteurs:", english: "That's when a detail caught the investigators' attention:" },
  { french: "Mais malgré..., ... a fini par échouer", english: "But despite..., ... ended up failing" },
  { french: "Aux alentours de..., ... a entendu leurs cris à l'aide", english: "Around..., ... heard their cries for help" },
  { french: "N'écoutant que son courage, ...", english: "Listening only to his courage, ..." },
  { french: "En l'espace de minutes chargées d'émotions, ...", english: "In the space of emotion-filled minutes, ..." },
]

const articlePrompt =
  "Un groupe de 20 couples escaladait une montagne pour se marier ensemble dans le cadre d'une quête."

const articleSegments: ArticleSegment[] = [
  { text: "Tout a basculé lorsque " },
  {
    blank: {
      id: 1,
      options: [
        { text: "un des couples s'est perdu sans trace", correct: true },
        {
          text: "un des couples se sont perdus sans trace",
          correct: false,
          error: "'un des couples' is singular, so use 's'est perdu'",
        },
        {
          text: "un des couples s'est perdue sans trace",
          correct: false,
          error: "'couples' is masculine, so 'perdu' not 'perdue'",
        },
        {
          text: "un des couples est perdu sans trace",
          correct: false,
          error: "'se perdre' uses 'être' → 's'est perdu'",
        },
      ],
    },
  },
  { text: ". La situation, jusque-là sous contrôle, a subitement dégénéré. " },
  {
    blank: {
      id: 2,
      options: [
        { text: "Leurs camarades", correct: true },
        {
          text: "Leur camarades",
          correct: false,
          error: "'camarades' is plural, so use 'Leurs' not 'Leur'",
        },
        {
          text: "Leurs camarade",
          correct: false,
          error: "'Leurs' is plural, so 'camarades' needs an 's'",
        },
        {
          text: "Son camarades",
          correct: false,
          error: "'camarades' is plural, so use 'Leurs' not 'Son'",
        },
      ],
    },
  },
  { text: " ont eu la frayeur de leur vie. Ils ont alors " },
  {
    blank: {
      id: 3,
      options: [
        { text: "commencé leurs recherches", correct: true },
        {
          text: "commencés leurs recherches",
          correct: false,
          error: "Past participle with 'avoir' doesn't agree with subject here",
        },
        {
          text: "commencé leur recherches",
          correct: false,
          error: "'recherches' is plural, so use 'leurs' not 'leur'",
        },
        {
          text: "commencer leurs recherches",
          correct: false,
          error: "After 'ont', use past participle 'commencé' not infinitive",
        },
      ],
    },
  },
  { text: " mais sans résultat.\n\n" },
  { text: "Aussitôt alertées, " },
  {
    blank: {
      id: 4,
      options: [
        { text: "les forces de la police et des sapeurs-pompiers", correct: true },
        {
          text: "les forces de la police et des sapeurs-pompier",
          correct: false,
          error: "'sapeurs-pompiers' needs plural 's' on both words",
        },
        {
          text: "la forces de la police et des sapeurs-pompiers",
          correct: false,
          error: "'forces' is plural, so use 'les' not 'la'",
        },
        {
          text: "les force de la police et des sapeurs-pompiers",
          correct: false,
          error: "'les' is plural, so 'forces' needs an 's'",
        },
      ],
    },
  },
  { text: " se sont rendues sur les lieux. C'est alors qu'un détail a attiré l'attention des enquêteurs: " },
  {
    blank: {
      id: 5,
      options: [
        { text: "une pièce de leurs vêtements", correct: true },
        {
          text: "une pièce de leur vêtements",
          correct: false,
          error: "'vêtements' is plural, so use 'leurs' not 'leur'",
        },
        {
          text: "un pièce de leurs vêtements",
          correct: false,
          error: "'pièce' is feminine, so use 'une' not 'un'",
        },
        {
          text: "une pièce de leurs vêtement",
          correct: false,
          error: "'leurs' is plural, so 'vêtements' needs an 's'",
        },
      ],
    },
  },
  { text: ". Mais malgré " },
  {
    blank: {
      id: 6,
      options: [
        { text: "des heures de recherches", correct: true },
        {
          text: "des heures de recherche",
          correct: false,
          error: "'heures' is plural, so 'recherches' should also be plural",
        },
        {
          text: "de heures de recherches",
          correct: false,
          error: "Use 'des' not 'de' before plural noun starting with consonant",
        },
        {
          text: "des heure de recherches",
          correct: false,
          error: "'des' is plural, so 'heures' needs an 's'",
        },
      ],
    },
  },
  { text: ", " },
  {
    blank: {
      id: 7,
      options: [
        { text: "l'enquête", correct: true },
        {
          text: "l'enquêtes",
          correct: false,
          error: "Elision 'l'' is for singular, so 'enquête' not plural",
        },
        {
          text: "le enquête",
          correct: false,
          error: "'enquête' is feminine, use 'l'' not 'le' before vowel",
        },
        {
          text: "la enquête",
          correct: false,
          error: "Use elision 'l'' before vowel, not 'la'",
        },
      ],
    },
  },
  { text: " a fini par échouer.\n\n" },
  { text: "Aux alentours de " },
  {
    blank: {
      id: 8,
      options: [
        { text: "16 heures", correct: true },
        {
          text: "16 heure",
          correct: false,
          error: "Time expression uses plural: '16 heures'",
        },
        {
          text: "seize heure",
          correct: false,
          error: "'heure' should be plural after number greater than 1",
        },
        {
          text: "16 l'heures",
          correct: false,
          error: "No article needed with time expressions like '16 heures'",
        },
      ],
    },
  },
  { text: ", " },
  {
    blank: {
      id: 9,
      options: [
        { text: "un jeune homme du groupe, Pablo Escobar,", correct: true },
        {
          text: "une jeune homme du groupe, Pablo Escobar,",
          correct: false,
          error: "'homme' is masculine, so use 'un' not 'une'",
        },
        {
          text: "un jeune hommes du groupe, Pablo Escobar,",
          correct: false,
          error: "'un' is singular, so 'homme' not 'hommes'",
        },
        {
          text: "un jeune homme de groupe, Pablo Escobar,",
          correct: false,
          error: "Use 'du groupe' (de + le) not 'de groupe'",
        },
      ],
    },
  },
  { text: " a entendu leurs cris à l'aide. N'écoutant que son courage, " },
  {
    blank: {
      id: 10,
      options: [
        { text: "il a suivi la source du son", correct: true },
        {
          text: "il a suivie la source du son",
          correct: false,
          error: "Past participle with 'avoir': 'suivi' stays invariable here",
        },
        {
          text: "il a suivi le source du son",
          correct: false,
          error: "'source' is feminine, so use 'la' not 'le'",
        },
        {
          text: "il a suivi la source de son",
          correct: false,
          error: "Use 'du son' (de + le) not 'de son'",
        },
      ],
    },
  },
  { text: ". En l'espace de minutes chargées d'émotions, " },
  {
    blank: {
      id: 11,
      options: [
        { text: "Pablo a retrouvé le couple perdu", correct: true },
        {
          text: "Pablo a retrouvée le couple perdu",
          correct: false,
          error: "Past participle with 'avoir': 'retrouvé' doesn't agree with subject",
        },
        {
          text: "Pablo a retrouvé la couple perdu",
          correct: false,
          error: "'couple' is masculine, so use 'le' not 'la'",
        },
        {
          text: "Pablo a retrouvé le couple perdue",
          correct: false,
          error: "'couple' is masculine, so 'perdu' not 'perdue'",
        },
      ],
    },
  },
  { text: ".\n\n" },
  {
    text: "Les couples, finalement rassurés, ont continué leur randonnée et ont réussi leur objectif. « Je croyais qu'on allait mourir », dit Maria, heureuse nouvelle mariée.",
  },
]

export default function FrenchLearningApp() {
  const [selections, setSelections] = useState<{ [key: number]: string }>({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<{ [key: number]: boolean }>({})
  const exerciseRef = useRef<HTMLDivElement>(null)

  const blanks = articleSegments.filter((seg) => seg.blank).map((seg) => seg.blank!)
  const totalBlanks = blanks.length
  const completedBlanks = Object.keys(selections).length

  const handleSelect = (blankId: number, value: string) => {
    setSelections((prev) => ({ ...prev, [blankId]: value }))
  }

  const scrollToExercise = () => {
    exerciseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleSubmit = () => {
    const newResults: { [key: number]: boolean } = {}
    blanks.forEach((blank) => {
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
        <section className="mb-12">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-4xl font-bold text-blue-900">TEF Canada Writing - Section A</h1>
            <p className="text-lg text-blue-700">Pratique de reconstruction d'article</p>
          </div>

          {/* Article Prompt at the top */}
          <Card className="mb-6 bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold text-blue-900">Votre mission</h2>
            <div className="rounded-lg bg-blue-100 p-4">
              <p className="text-base leading-relaxed text-blue-900">{articlePrompt}</p>
            </div>
          </Card>

          {/* Expressions below the prompt */}
          <Card className="bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-2xl font-semibold text-blue-900">Expressions à pratiquer</h2>
            <div className="space-y-4">
              {expressions.map((expr, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-blue-100 bg-blue-50 p-4 transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className="font-semibold text-blue-900">{expr.french}</div>
                  <div className="mt-1 text-sm text-blue-600">{expr.english}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Section 2: Article Reconstruction Exercise */}
        <section ref={exerciseRef} className="scroll-mt-8">
          <Card className="bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-blue-900">Complétez l'article</h2>
              {!submitted && (
                <div className="text-sm font-medium text-blue-600">
                  {completedBlanks}/{totalBlanks} complétés
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
                  const blank = segment.blank
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
            <div className="mt-8 flex justify-center gap-4">
              {!submitted ? (
                <Button
                  onClick={handleSubmit}
                  disabled={completedBlanks < totalBlanks}
                  size="lg"
                  className="bg-blue-600 px-8 py-6 text-lg font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Soumettre ma réponse
                </Button>
              ) : (
                <Button
                  onClick={handleReset}
                  size="lg"
                  className="bg-blue-600 px-8 py-6 text-lg font-semibold text-white hover:bg-blue-700"
                >
                  Recommencer
                </Button>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}