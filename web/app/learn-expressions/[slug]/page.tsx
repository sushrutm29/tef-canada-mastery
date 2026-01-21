import { notFound } from "next/navigation"
import LearnExpressionsExercise from "@/components/LearnExpressionsExercise"

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

// API response types
interface ApiOption {
  id: string
  text: string
  correct: boolean
  error: string | null
}

interface ApiBlank {
  id: string
  options: ApiOption[]
}

interface ApiSegment {
  id: string
  order: number
  type: "TEXT" | "BLANK"
  content: string | null
  blank: ApiBlank | null
}

interface ApiExpression {
  expression: {
    id: string
    french: string
    english: string
  }
}

interface ApiArticle {
  id: string
  title: string
  prompt: string
  segments: ApiSegment[]
  expressions: ApiExpression[]
}

async function getArticleData(slug: string): Promise<{
  articleId: string
  articleTitle: string
  expressions: Expression[]
  articlePrompt: string
  articleSegments: ArticleSegment[]
} | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

  try {
    const res = await fetch(`${apiUrl}/articles/slug/${slug}`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch article: ${res.status}`)
    }

    const article: ApiArticle = await res.json()

    if (!article) {
      return null
    }

    // Transform expressions
    const expressions: Expression[] = article.expressions.map(({ expression }) => ({
      french: expression.french,
      english: expression.english,
    }))

    // Transform segments
    const articleSegments: ArticleSegment[] = article.segments.map((segment) => {
      if (segment.type === "TEXT") {
        return { text: segment.content || "" }
      }

      if (segment.type === "BLANK" && segment.blank) {
        return {
          blank: {
            id: parseInt(segment.blank.id, 36),
            options: segment.blank.options.map((opt) => ({
              text: opt.text,
              correct: opt.correct,
              error: opt.error || undefined,
            })),
          },
        }
      }

      return { text: "" }
    })

    return {
      articleId: article.id,
      articleTitle: article.title,
      expressions,
      articlePrompt: article.prompt,
      articleSegments,
    }
  } catch (error) {
    console.error("Error fetching article data:", error)
    return null
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function LearnExpressionsExercisePage({ params }: PageProps) {
  const { slug } = await params
  const data = await getArticleData(slug)

  if (!data) {
    notFound()
  }

  const { articleId, articleTitle, expressions, articlePrompt, articleSegments } = data

  // Shuffle options for each blank (happens on server only)
  const shuffledBlanks = articleSegments
    .filter((seg) => seg.blank)
    .map((seg) => {
      const blank = seg.blank!
      const shuffledOptions = [...blank.options].sort(() => Math.random() - 0.5)
      return { ...blank, options: shuffledOptions }
    })

  return (
    <LearnExpressionsExercise
      articleId={articleId}
      articleTitle={articleTitle}
      expressions={expressions}
      articlePrompt={articlePrompt}
      articleSegments={articleSegments}
      shuffledBlanks={shuffledBlanks}
    />
  )
}
