"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowRight, RefreshCw } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function VerificationMessage({ email }: { email?: string }) {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleResendEmail = async () => {
    if (!email) return

    setIsResending(true)
    setError(null)
    setResendSuccess(false)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (error) {
        setError(error.message)
      } else {
        setResendSuccess(true)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Resend verification error:", err)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-gray-800 bg-[#1A1D24] shadow-saas">
      <CardHeader className="space-y-1">
        <div className="mx-auto bg-emerald-500/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-emerald-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-white text-center">Check your email</CardTitle>
        <CardDescription className="text-center">
          We&apos;ve sent a verification link to {email || "your email"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {resendSuccess && (
          <Alert className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400">
            <AlertDescription>Verification email resent successfully!</AlertDescription>
          </Alert>
        )}
        <div className="text-center text-gray-400 text-sm space-y-4">
          <p>
            Click the link in the email to verify your account and complete the signup process. If you don&apos;t see
            the email, check your spam folder.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={isResending}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              {isResending ? (
                <span className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </span>
              ) : (
                <span className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend verification email
                </span>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-3">Already verified your email?</p>
          <Link href="/auth/login">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <span className="flex items-center">
                Continue to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
