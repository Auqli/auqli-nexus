import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="py-12 bg-gray-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{title}</h1>
          {description && <p className="text-xl text-gray-600 mb-6">{description}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}
