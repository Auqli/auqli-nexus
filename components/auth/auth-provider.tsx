"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const isMounted = useRef(false) // Track if the component has mounted

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  useEffect(() => {
    // Ensure useEffect only runs on the client-side
    if (!isMounted.current) {
      isMounted.current = true
    }

    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        }

        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Unexpected error getting session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isMounted.current) {
      getSession()
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event)

      // Prevent setting state on unmounted component
      if (!isMounted.current) return

      if (session) {
        setSession(session)
        setUser(session?.user ?? null)
      } else {
        setSession(null)
        setUser(null)
      }

      setIsLoading(false)

      // Handle "refresh_token_revoked" error
      if (event === "token_refreshed" && session) {
        // Successfully refreshed token
        console.log("Token refreshed successfully")
      } else if (event === "signed_out") {
        // Handle sign-out event
        console.log("User signed out")
      } else if (event === "user_updated") {
        // Handle user updated event
        console.log("User updated")
      } else if (event === "password_recovery") {
        // Handle password recovery event
        console.log("Password recovery")
      } else if (event === "refresh_token_revoked") {
        console.warn("Refresh token revoked, signing out")
        // Sign out the user to prevent further errors
        await signOut()
      }
    })

    return () => {
      subscription.unsubscribe()
      isMounted.current = false // Set isMounted to false when unmounting
    }
  }, [supabase])

  return <AuthContext.Provider value={{ user, session, isLoading, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
