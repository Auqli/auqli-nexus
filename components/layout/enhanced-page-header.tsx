import type { ReactNode } from "react"
import { Sparkles } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  showAiBadge?: boolean
  className?: string
}

export function EnhancedPageHeader({
  title,
  description,
  children,
  showAiBadge = false,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`py-12 bg-[#0f172a] border-b border-gray-800 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white relative inline-flex items-center">
            {title}
            {showAiBadge && (
              <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
                <Sparkles className="mr-1 h-3 w-3" />
                AI Powered
              </span>
            )}
          </h1>
          {description && <p className="text-xl text-gray-300 mb-6">{description}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}
