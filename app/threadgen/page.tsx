"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Share2, Sparkles } from "lucide-react"

export default function ThreadGenPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center"
      >
        <div className="bg-gradient-to-r from-[#1A1D24] to-[#1A1D24]/70 rounded-xl p-8 border border-gray-800 shadow-saas w-full max-w-3xl mx-auto text-center relative overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-60"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-md">
              <Share2 className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">ThreadGen AI</h1>

            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Coming Soon</span>
            </div>

            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Convert any blog post or video into a high-engagement Twitter/X thread. AI summarizes and rewrites
              long-form content into threads with hooks, bullets, and call-to-actions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-white mb-2">Content Repurposing</h3>
                <p className="text-gray-400 text-sm">
                  Turn blogs, videos, and podcasts into engaging Twitter/X threads.
                </p>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-white mb-2">Hook Generation</h3>
                <p className="text-gray-400 text-sm">Create attention-grabbing first tweets that drive engagement.</p>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-white mb-2">Thread Structure</h3>
                <p className="text-gray-400 text-sm">
                  Perfectly structured threads with logical flow and engagement points.
                </p>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-white mb-2">Call-to-Action</h3>
                <p className="text-gray-400 text-sm">
                  Effective closing tweets that drive follows, likes, and website visits.
                </p>
              </div>
            </div>

            <p className="text-gray-500 text-sm">
              We're putting the finishing touches on this powerful tool. Check back soon for updates!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
