"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface ProgressAnimationProps {
  progress: number
}

export function ProgressAnimation({ progress }: ProgressAnimationProps) {
  const [showRunner, setShowRunner] = useState(true)

  // Calculate runner position based on progress
  const runnerPosition = `${Math.min(progress, 100)}%`

  // Hide runner when progress is complete
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setShowRunner(false), 500)
      return () => clearTimeout(timer)
    } else {
      setShowRunner(true)
    }
  }, [progress])

  return (
    <div className="relative h-10 mb-2">
      {showRunner && (
        <motion.div
          className="absolute bottom-0"
          style={{ left: runnerPosition }}
          initial={{ x: "-50%" }}
          animate={{
            x: "-50%",
            y: [0, -5, 0],
          }}
          transition={{
            y: {
              repeat: Number.POSITIVE_INFINITY,
              duration: 0.5,
              ease: "easeInOut",
            },
          }}
        >
          <div className="flex flex-col items-center">
            <motion.div
              className="relative"
              animate={{
                rotateY: [0, 180, 360],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              {/* Runner with Nigerian flag */}
              <div className="relative h-6 w-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M13 4C13 2.34315 11.6569 1 10 1C8.34315 1 7 2.34315 7 4C7 5.65685 8.34315 7 10 7C11.6569 7 13 5.65685 13 4Z"
                      fill="#16783a"
                    />
                    <path
                      d="M15.5 15.5L12.5 10.5L7.5 10.5L4.5 15.5"
                      stroke="#16783a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17.5 20.5L14.5 15.5L9.5 15.5L6.5 20.5"
                      stroke="#16783a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 7L16 9.5"
                      stroke="#16783a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 7L4 9.5"
                      stroke="#16783a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {/* Nigerian flag */}
                <div className="absolute -top-6 -right-1 h-4 w-6 overflow-hidden">
                  <div className="absolute inset-0 flex">
                    <div className="h-full w-1/3 bg-green-600"></div>
                    <div className="h-full w-1/3 bg-white"></div>
                    <div className="h-full w-1/3 bg-green-600"></div>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="text-xs text-[#45c133] font-medium mt-1">{Math.round(progress)}%</div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

