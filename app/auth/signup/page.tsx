"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            company_name: company || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) throw authError

      // 2. Show success message without trying to create a profile
      // The profile will be created by a database trigger or we'll create it on first login
      setSuccess(true)

      // 3. Redirect after a delay
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up")
      console.error("Sign up error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Sign up to start using Auqli AI for your product categorization needs</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>
                Account created successfully! Check your email to confirm your account. Redirecting you to login...
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSignUp}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="company">Company Name (Optional)</Label>
                  <Input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                </div>

                <Button type="submit" disabled={loading} className="mt-2">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <div className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault()
                router.push("/auth/login")
              }}
            >
              Log in
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
