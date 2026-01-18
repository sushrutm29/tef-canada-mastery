import FrenchLearningClient from "@/components/FrenchLearningClient"

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
  type: 'TEXT' | 'BLANK'
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
  prompt: string
  segments: ApiSegment[]
  expressions: ApiExpression[]
}

async function getArticleData(): Promise<{
  expressions: Expression[]
  articlePrompt: string
  articleSegments: ArticleSegment[]
}> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  
  try {
    const res = await fetch(`${apiUrl}/articles`, {
      // Revalidate every 60 seconds in production, or use cache: 'no-store' for always fresh data
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch articles: ${res.status}`)
    }

    const articles: ApiArticle[] = await res.json()
    
    if (!articles || articles.length === 0) {
      throw new Error('No articles found')
    }

    // Get the first published article
    const article = articles[0]

    // Transform expressions
    const expressions: Expression[] = article.expressions.map(({ expression }) => ({
      french: expression.french,
      english: expression.english,
    }))

    // Transform segments
    const articleSegments: ArticleSegment[] = article.segments.map((segment) => {
      if (segment.type === 'TEXT') {
        return { text: segment.content || '' }
      }

      if (segment.type === 'BLANK' && segment.blank) {
        return {
          blank: {
            id: parseInt(segment.blank.id, 36), // Convert string ID to number for frontend
            options: segment.blank.options.map((opt) => ({
              text: opt.text,
              correct: opt.correct,
              error: opt.error || undefined,
            })),
          },
        }
      }

      return { text: '' }
    })

    return {
      expressions,
      articlePrompt: article.prompt,
      articleSegments,
    }
  } catch (error) {
    console.error('Error fetching article data:', error)
    // Return empty data as fallback
    return {
      expressions: [],
      articlePrompt: '',
      articleSegments: [],
    }
  }
}

// Server Component - shuffles data once on server
export default async function FrenchLearningApp() {
  const { expressions, articlePrompt, articleSegments } = await getArticleData()

  // Shuffle options for each blank (happens on server only)
  const shuffledBlanks = articleSegments
    .filter((seg) => seg.blank)
    .map((seg) => {
      const blank = seg.blank!
      const shuffledOptions = [...blank.options].sort(() => Math.random() - 0.5)
      return { ...blank, options: shuffledOptions }
    })

  return (
    <FrenchLearningClient
      expressions={expressions}
      articlePrompt={articlePrompt}
      articleSegments={articleSegments}
      shuffledBlanks={shuffledBlanks}
    />
  )
}