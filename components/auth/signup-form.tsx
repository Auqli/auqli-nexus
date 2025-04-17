"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, UserPlus } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptTerms) {
      setError("You must accept the terms and conditions to create an account.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Sign up the user
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // Create user profile in the database
      if (data.user) {
        try {
          // First, check if the user_profiles table exists and get its structure
          const { data: tableInfo, error: tableError } = await supabase.from("user_profiles").select("*").limit(1)

          // If we can't query the table, it might not exist yet
          if (tableError) {
            console.warn("Could not query user_profiles table:", tableError.message)
            // Continue with auth signup anyway
          } else {
            // Create the profile with only the fields we know exist
            const profileData: Record<string, any> = {
              user_id: data.user.id,
              full_name: fullName,
              // Only include email if we confirmed it exists in the schema
              ...(tableInfo && tableInfo[0] && "email" in tableInfo[0] ? { email } : {}),
            }

            const { error: profileError } = await supabase.from("user_profiles").insert([profileData])

            if (profileError) {
              console.error("Error creating user profile:", profileError)
              // Continue anyway as the auth user was created
            }
          }

          // Try to create a subscription if that table exists
          try {
            const { error: subscriptionError } = await supabase.from("user_subscriptions").insert([
              {
                user_id: data.user.id,
                plan_id: 1, // Free plan ID
                status: "active",
                start_date: new Date().toISOString(),
              },
            ])

            if (subscriptionError) {
              console.error("Error creating user subscription:", subscriptionError)
              // Continue anyway as the auth user was created
            }
          } catch (subErr) {
            console.warn("Could not create subscription, table might not exist:", subErr)
            // Continue with auth signup anyway
          }
        } catch (dbErr) {
          console.error("Database operation failed:", dbErr)
          // Continue with auth signup anyway
        }
      }

      // Redirect to verification page or dashboard
      router.push("/auth/verification")
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Signup error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-gray-800 bg-[#1A1D24] shadow-saas">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
        <CardDescription>Enter your details to create your Auqli account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-gray-800/50 border-gray-700"
            />
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-gray-800/50 border-gray-700 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Password must be at least 8 characters long</p>
          </div>
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-sm font-normal leading-tight">
              I agree to the{" "}
              <a
                href="https://auqli.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="https://auqli.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Privacy Policy
              </a>
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isLoading || !acceptTerms}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating account...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </span>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-emerald-500 hover:text-emerald-400 transition-colors">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
