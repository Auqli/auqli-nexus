"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export function ProgressAnimation({ progress, totalItems, processedItems, isAIMatching = false, aiMatchedCount = 0 }) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-300 space-y-1">
        {totalItems > 0 ? (
          <div className="flex justify-between font-medium">
            <span>{totalItems} items discovered</span>
            <span>
              Processing {processedItems}/{totalItems}
            </span>
          </div>
        ) : (
          <div className="flex justify-between font-medium">
            <span>Processing CSV file...</span>
          </div>
        )}

        {isAIMatching && aiMatchedCount > 0 && (
          <div className="flex items-center text-purple-300 text-xs">
            <Sparkles className="h-3 w-3 mr-1 text-purple-400" />
            <span>AI matched {aiMatchedCount} products</span>
          </div>
        )}
      </div>

      {/* Visible progress bar */}
      <div className="relative h-3 w-full bg-gray-800 rounded-full overflow-hidden mb-1">
        {progress < 100 ? (
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#16783a]/80 via-[#45c133] to-[#16783a]/80"
            initial={{ x: "-100%" }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              ease: "linear",
            }}
          />
        ) : (
          <motion.div
            className="absolute top-0 left-0 h-full bg-[#45c133]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>
    </div>
  )
}
