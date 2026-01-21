import { ChevronRight, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Breadcrumb from "@/components/ui/Breadcrumb"

interface Article {
  id: string
  title: string
  prompt: string
}

function titleToSlug(title: string): string {
  return title.toLowerCase().replace(/\s+/g, "-")
}

interface ArticleListProps {
  articles: Article[]
}

export default function ArticleList({ articles }: ArticleListProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Section A", href: "/" },
          { label: "Learn Expressions" },
        ]}
      />

      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="p-2 hover:bg-slate-800 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Learn Expressions</h1>
          <p className="text-slate-400 text-sm">Choose an article to practice</p>
        </div>
      </div>

      <div className="space-y-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/learn-expressions/${titleToSlug(article.title)}`}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 p-5 text-left transition hover:border-blue-500/50 block"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {article.title || ""}
                  </h3>
                </div>
                <p className="text-blue-100 text-sm">{article.prompt}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 mt-1" />
            </div>
          </Link>
        ))}

        {articles.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No articles available yet.
          </div>
        )}
      </div>
    </div>
  )
}
