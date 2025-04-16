"use client"

import { motion } from "framer-motion"
import PropTypes from "prop-types"

/**
 * Progress animation component
 * @param {Object} props - Component props
 * @param {number} props.progress - Progress percentage
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.processedItems - Number of processed items
 */
export function ProgressAnimation({ progress, totalItems, processedItems }) {
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

// Add PropTypes validation
ProgressAnimation.propTypes = {
  progress: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  processedItems: PropTypes.number.isRequired,
}
