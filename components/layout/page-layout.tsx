import type { ReactNode } from "react"
import { SiteFooter } from "./site-footer"

interface PageLayoutProps {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  )
}
