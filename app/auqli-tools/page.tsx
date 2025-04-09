"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, ImageIcon, FileText, BookOpen, ArrowRight } from "lucide-react"
import { StoreInfoCard } from "./components/store-info-card"

export default function AuqliToolsDashboard() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const tools = [
    {
      id: "imagegen",
      name: "ImageGen AI",
      description: "Generate high-quality product images with AI",
      icon: ImageIcon,
      href: "/auqli-tools/imagegen",
      buttonText: "Open ImageGen",
      color: "from-purple-500/20 to-blue-500/20",
      borderColor: "border-purple-500/30",
    },
    {
      id: "copygen",
      name: "CopyGen AI",
      description: "AI-powered product descriptions and collection copy",
      icon: FileText,
      href: "/auqli-tools/copygen-ai",
      buttonText: "Open CopyGen",
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/30",
    },
    {
      id: "bloggen",
      name: "BlogGen AI",
      description: "Create SEO blog posts for your store",
      icon: BookOpen,
      href: "/auqli-tools/bloggen-ai",
      buttonText: "Open BlogGen",
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500/30",
      isFuture: true,
    },
  ]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-[#1A1D24] to-[#1A1D24]/70 rounded-xl p-6 md:p-8 border border-gray-800 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to Auqli Nexus</h1>
              <p className="text-gray-400 mb-4">Your AI-powered toolkit for Shopify success.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#14B85F]/10 border border-[#14B85F]/20 text-[#14B85F] text-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>AI-Powered Tools</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tool cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Access Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div
                className={`bg-[#1A1D24] rounded-xl overflow-hidden border ${
                  tool.borderColor
                } shadow-lg hover:shadow-xl transition-all duration-300 h-full ${tool.isFuture ? "opacity-70" : ""}`}
              >
                <div className={`bg-gradient-to-r ${tool.color} p-6`}>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center mr-3">
                      <tool.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                      <div className="flex items-center">
                        <span className="bg-black/30 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Powered
                        </span>
                        {tool.isFuture && (
                          <span className="ml-2 bg-gray-800 text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-6 text-sm">{tool.description}</p>

                  {tool.isFuture ? (
                    <button
                      disabled
                      className="w-full bg-gray-800/50 text-gray-400 px-4 py-2 rounded-lg flex items-center justify-center cursor-not-allowed"
                    >
                      {tool.buttonText}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  ) : (
                    <Link href={tool.href}>
                      <button className="w-full bg-[#14B85F] hover:bg-[#16A34A] text-white px-4 py-2 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all duration-300">
                        {tool.buttonText}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Account summary - Now using the StoreInfoCard component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Account Summary</h2>
        <StoreInfoCard />
      </motion.div>
    </div>
  )
}
