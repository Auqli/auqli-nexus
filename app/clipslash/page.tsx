"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Scissors, Sparkles } from "lucide-react"

export default function ClipSlashPage() {
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
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5 opacity-60"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-rose-500 flex items-center justify-center mx-auto mb-6 shadow-md">
              <Scissors className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">ClipSlash AI</h1>

            <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Coming Soon</span>
            </div>

            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Cut your long videos into viral clips — automatically. AI detects emotional hooks, punchlines, and
              high-impact moments ready for TikTok, Shorts, and Reels.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-white mb-2">Emotion Detection</h3>
                <p className="text-gray-400 text-sm">
                  AI identifies emotional peaks, laughter, and key moments in your videos.
                </p>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-white mb-2">Auto-Clip Generation</h3>
                <p className="text-gray-400 text-sm">
                  Create multiple short clips from a single long video with one click.
                </p>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-white mb-2">Platform Optimization</h3>
                <p className="text-gray-400 text-sm">
                  Clips are optimized for TikTok, Instagram Reels, and YouTube Shorts.
                </p>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-white mb-2">Caption Generation</h3>
                <p className="text-gray-400 text-sm">
                  Automatically adds engaging captions to each clip for higher engagement.
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
