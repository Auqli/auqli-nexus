"use client"

import { useSearchParams } from "next/navigation"
import { VerificationMessage } from "@/components/auth/verification-message"
import { SimpleFooter } from "@/components/simple-footer"

export default function VerificationPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || undefined

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1a]">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mb-8">
          <VerificationMessage email={email} />
        </div>
      </div>
      <SimpleFooter />
    </div>
  )
}
