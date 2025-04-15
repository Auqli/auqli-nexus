// Replace the entire content with a proper layout component that doesn't change functionality

import type { ReactNode } from "react"

export default function HomeLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
