import type { ReactNode } from "react"
import { PageLayout } from "@/components/layout/page-layout"

export default function ConverterLayout({
  children,
}: {
  children: ReactNode
}) {
  return <PageLayout>{children}</PageLayout>
}
