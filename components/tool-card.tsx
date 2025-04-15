"use client"

import type React from "react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface ToolCardProps {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  iconBg: string
  cardBg: string
  borderColor: string
  ctaText: string
  ctaLink: string
  isAvailable: boolean
  animation?: React.ReactNode
}

export function ToolCard({
  id,
  name,
  description,
  icon,
  iconBg,
  cardBg,
  borderColor,
  ctaText,
  ctaLink,
  isAvailable,
  animation,
}: ToolCardProps) {
  return (
    <motion.div
      whileHover={isAvailable ? { scale: 1.03, y: -8 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="h-full"
    >
      <Card
        className={`border-0 overflow-hidden shadow-saas hover:shadow-hover rounded-2xl ${cardBg} h-full relative ${
          !isAvailable ? "opacity-80" : ""
        }`}
      >
        {animation}
        <CardHeader className={`border-b ${borderColor} p-4 sm:p-5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`${iconBg} text-white p-3 rounded-xl mr-3 shadow-md`}>{icon}</div>
              <div>
                <CardTitle className="text-lg sm:text-xl text-gray-800">{name}</CardTitle>
                <Badge
                  className={`mt-1 ${
                    isAvailable
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white relative overflow-hidden group"
                      : "bg-gray-200 text-gray-600"
                  } border-0`}
                >
                  {isAvailable ? (
                    <>
                      {/* Glow effect */}
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-500/0 via-white/30 to-teal-500/0 group-hover:via-white/40 transform -translate-x-full group-hover:translate-x-full transition-all duration-1500 ease-in-out"></span>
                      {/* Sparkle icon */}
                      <span className="mr-1 relative">
                        <Sparkles className="h-3 w-3 inline-block animate-pulse" />
                      </span>
                      AI Powered
                    </>
                  ) : (
                    <>
                      <span className="mr-1">🚀</span> Coming Soon
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{description}</p>
        </CardContent>
        <CardFooter className="bg-transparent p-4 sm:p-5 pt-0 mt-auto">
          {isAvailable ? (
            <Button
              asChild
              className={`${
                iconBg.includes("from-purple-600")
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  : iconBg.includes("from-orange-600")
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              } text-white rounded-lg w-full md:w-auto`}
            >
              <Link href={ctaLink} className="flex items-center justify-center">
                {ctaText} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button
              disabled
              className="w-full bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed rounded-lg py-3 hover:bg-gray-100"
            >
              {ctaText}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
