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

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Redirect to dashboard on successful login
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Log in to your Auqli AI account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin}>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <div className="text-sm text-right">
                  <a
                    href="/auth/forgot-password"
                    className="text-primary hover:underline"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push("/auth/forgot-password")
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <div className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/auth/signup"
              className="text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault()
                router.push("/auth/signup")
              }}
            >
              Sign up
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
