import type { ReactNode } from "react"
import { SiteFooter } from "./site-footer"

interface PageLayoutProps {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      {/* Remove the SiteHeader from here if it exists */}
      {children}
      <SiteFooter />
    </>
  )
}
