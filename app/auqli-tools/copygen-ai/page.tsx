"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, Sparkles } from "lucide-react"

export default function CopyGenPage() {
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
        <div className="bg-gradient-to-r from-[#1A1D24] to-[#1A1D24]/70 rounded-xl p-8 border border-gray-800 shadow-lg w-full max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8 text-emerald-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">CopyGen AI</h1>

          <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Coming Soon</span>
          </div>

          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Our AI-powered copywriting tool is currently in development. CopyGen AI will help you create compelling
            product descriptions, collection copy, and marketing content that converts visitors into customers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium text-white mb-2">Product Descriptions</h3>
              <p className="text-gray-400 text-sm">
                Generate SEO-friendly product descriptions that highlight key features and benefits.
              </p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium text-white mb-2">Collection Copy</h3>
              <p className="text-gray-400 text-sm">
                Create engaging collection descriptions that showcase your product categories.
              </p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium text-white mb-2">Marketing Headlines</h3>
              <p className="text-gray-400 text-sm">
                Craft attention-grabbing headlines for your marketing campaigns and promotions.
              </p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium text-white mb-2">SEO Optimization</h3>
              <p className="text-gray-400 text-sm">
                Optimize your content for search engines to improve visibility and rankings.
              </p>
            </div>
          </div>

          <p className="text-gray-500 text-sm">
            We're working hard to bring you this powerful tool. Check back soon for updates!
          </p>
        </div>
      </motion.div>
    </div>
  )
}
