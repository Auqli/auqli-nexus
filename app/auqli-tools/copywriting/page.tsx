"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText } from "lucide-react"

export default function CopywritingPage() {
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
            <FileText className="h-5 w-5 text-[#14B85F]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Copywriting Nexus</h1>
        </div>

        <div className="bg-[#1A1D24] rounded-xl p-6 border border-gray-800 shadow-lg">
          <p className="text-gray-300">
            This is the Copywriting tool page. Your existing copywriting interface will be integrated here.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
