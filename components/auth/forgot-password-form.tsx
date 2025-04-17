"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClientComponentClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setIsSuccess(true)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Password reset error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-gray-800 bg-[#1A1D24] shadow-saas">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-white">Forgot password</CardTitle>
        <CardDescription>Enter your email to receive a password reset link</CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="space-y-4">
            <div className="mx-auto bg-emerald-500/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-emerald-500" />
            </div>
            <Alert className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400">
              <AlertDescription>
                Password reset link sent! Check your email and follow the instructions to reset your password.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-gray-400 mt-4">
              If you don&apos;t see the email, check your spam folder. The link will expire after 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
        <Link
          href="/auth/login"
          className="text-emerald-500 hover:text-emerald-400 transition-colors flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>
      </CardFooter>
    </Card>
  )
}
