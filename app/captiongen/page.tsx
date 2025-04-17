"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MessageSquare, Sparkles } from "lucide-react"

export default function CaptionGenPage() {
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
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-60"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-md">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">CaptionGen AI</h1>

            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Coming Soon</span>
            </div>

            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Auto-generate subtitles for your videos in multiple languages. Upload any video and let AI transcribe,
              subtitle, and translate into Tagalog, Yoruba, French, and more — perfect for TikTok, Reels, and
              livestreams.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-white mb-2">Multi-language Support</h3>
                <p className="text-gray-400 text-sm">
                  Generate subtitles in over 30 languages with accurate translations.
                </p>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-white mb-2">Video Platform Ready</h3>
                <p className="text-gray-400 text-sm">
                  Export in formats compatible with all major social media platforms.
                </p>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-white mb-2">Accurate Transcription</h3>
                <p className="text-gray-400 text-sm">
                  AI-powered speech recognition with high accuracy even in noisy environments.
                </p>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-white mb-2">Style Custom</h3>
                <p className="text-gray-400 text-sm">
                  Customize subtitle styles, fonts, and animations to match your brand.
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
