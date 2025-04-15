"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ImageIcon } from "lucide-react"

export default function ImageGenPage() {
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
      >
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-[#14B85F]/10 flex items-center justify-center mr-3">
            <ImageIcon className="h-5 w-5 text-[#14B85F]" />
          </div>
          <h1 className="text-2xl font-bold">ImageGen AI</h1>
        </div>

        {/* Main content will go here */}
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">Coming Soon</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            The Image Generator tool is currently under development. Check back soon for updates!
          </p>
        </div>
      </motion.div>
    </div>
  )
}
