import type { ReactNode } from "react"
import { PageLayout } from "@/components/layout/page-layout"

export default function AlternativeLayout({
  children,
}: {
  children: ReactNode
}) {
  return <PageLayout>{children}</PageLayout>
}
