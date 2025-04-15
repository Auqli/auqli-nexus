import type { ReactNode } from "react"

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return <main className={`container mx-auto px-4 py-16 ${className}`}>{children}</main>
}
