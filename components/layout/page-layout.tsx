import type { ReactNode } from "react"
import { SiteHeader } from "./site-header"
import { SiteFooter } from "./site-footer"

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className={`flex-grow ${className}`}>{children}</main>
      <SiteFooter />
    </div>
  )
}
