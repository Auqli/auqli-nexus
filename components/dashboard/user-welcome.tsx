"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function UserWelcome() {
  const [userName, setUserName] = useState("there")
  const [memberSince, setMemberSince] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    setIsLoaded(true)

    const fetchUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Try to get the user's full name from user metadata
        const fullName = user.user_metadata?.full_name

        if (fullName) {
          // Just use the first name for the greeting
          const firstName = fullName.split(" ")[0]
          setUserName(firstName)
        } else {
          // Fallback to email if no name is available
          setUserName(user.email?.split("@")[0] || "there")
        }

        // Set the memberSince date from the auth.users table
        setMemberSince(user.created_at)
      }
    }

    fetchUserProfile()
  }, [supabase])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-r from-[#1e2128] to-[#1e2128]/70 rounded-xl p-6 md:p-8 border border-gray-800 shadow-saas relative overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-60"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-2">Welcome back, {userName}!</h1>
            <p className="text-gray-400 mb-4">Your AI-powered toolkit is ready to help you succeed.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>AI-Powered Tools</span>
            </div>
            <p>Member since {memberSince}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
