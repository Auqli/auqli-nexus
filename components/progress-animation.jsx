"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export function ProgressAnimation({ progress, totalItems, processedItems, isAIMatching = false, aiMatchedCount = 0 }) {
  return (
    <div className="space-y-2">
      {totalItems > 0 && (
        <div className="text-sm text-gray-300 space-y-1">
          <div className="flex justify-between">
            <span>{totalItems} items discovered</span>
            <span>
              Processing {processedItems}/{totalItems}
            </span>
          </div>

          {isAIMatching && aiMatchedCount > 0 && (
            <div className="flex items-center text-purple-300 text-xs">
              <Sparkles className="h-3 w-3 mr-1 text-purple-400" />
              <span>AI matched {aiMatchedCount} products</span>
            </div>
          )}
        </div>
      )}
      <div className="relative h-1 w-full bg-gray-800 rounded-full overflow-hidden mb-1">
        <motion.div
          className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-[#16783a]/20 via-[#45c133] to-[#16783a]/20"
          initial={{ x: "-100%" }}
          animate={{
            x: progress >= 100 ? "0%" : ["-100%", "100%"],
          }}
          transition={{
            repeat: progress >= 100 ? 0 : Number.POSITIVE_INFINITY,
            duration: 2,
            ease: "linear",
          }}
        />
      </div>
    </div>
  )
}
