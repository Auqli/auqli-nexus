import type { ReactNode } from "react"
import { PageLayout } from "@/components/layout/page-layout"

export default function CopywritingLayout({
  children,
}: {
  children: ReactNode
}) {
  return <PageLayout>{children}</PageLayout>
}
