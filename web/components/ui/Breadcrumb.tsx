import { ChevronRight } from "lucide-react"
import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mb-4">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2 whitespace-nowrap">
          {item.href ? (
            <Link href={item.href} className="hover:text-white transition">
              {item.label}
            </Link>
          ) : (
            <span className="text-white">{item.label}</span>
          )}
          {index < items.length - 1 && <ChevronRight className="w-4 h-4" />}
        </span>
      ))}
    </div>
  )
}
