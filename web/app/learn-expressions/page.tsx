import ArticleList from "@/components/ArticleList"

interface ApiArticle {
  id: string
  title: string
  prompt: string
  published: boolean
}

async function getArticles(): Promise<{ id: string; title: string; prompt: string }[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

  try {
    const res = await fetch(`${apiUrl}/articles`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch articles: ${res.status}`)
    }

    const articles: ApiArticle[] = await res.json()

    return articles.map((article) => ({
      id: article.id,
      title: article.title || `Article`,
      prompt: article.prompt,
    }))
  } catch (error) {
    console.error("Error fetching articles:", error)
    return []
  }
}

export default async function LearnExpressionsPage() {
  const articles = await getArticles()

  return <ArticleList articles={articles} />
}
