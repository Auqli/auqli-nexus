"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, ImageIcon, FileText, BookOpen, ArrowRight } from "lucide-react"

export default function Dashboard() {
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
      href: "/imagegen",
      buttonText: "Open ImageGen",
      color: "from-purple-500/20 to-indigo-500/20",
      borderColor: "border-purple-500/30",
      gradientClass: "bg-gradient-to-r from-purple-600 to-indigo-600",
    },
    {
      id: "copygen",
      name: "CopyGen AI",
      description: "AI-powered product descriptions and collection copy",
      icon: FileText,
      href: "/copygen",
      buttonText: "Open CopyGen",
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/30",
      gradientClass: "bg-gradient-to-r from-emerald-600 to-teal-600",
    },
    {
      id: "bloggen",
      name: "BlogGen AI",
      description: "Create SEO blog posts for your store",
      icon: BookOpen,
      href: "/bloggen",
      buttonText: "Open BlogGen",
      color: "from-orange-500/20 to-amber-500/20",
      borderColor: "border-orange-500/30",
      gradientClass: "bg-gradient-to-r from-orange-600 to-amber-600",
      isAvailable: true,
    },
  ]

  // Mock usage data
  const [usage, setUsage] = useState({
    copyGen: 12,
    imageGen: 8,
    blogGen: 5,
    total: 25,
  })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-[#1A1D24] to-[#1A1D24]/70 rounded-xl p-6 md:p-8 border border-gray-800 shadow-saas relative overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-60"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to Auqli Nexus</h1>
              <p className="text-gray-400 mb-4">Your AI-powered toolkit for success.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
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
              whileHover={!tool.isFuture ? { y: -8, scale: 1.02 } : {}}
              className="group"
            >
              <div
                className={`bg-[#1A1D24] rounded-xl overflow-hidden border ${
                  tool.borderColor
                } shadow-saas hover:shadow-hover transition-all duration-300 h-full ${tool.isFuture ? "opacity-70" : ""}`}
              >
                <div className={`bg-gradient-to-r ${tool.color} p-6 relative overflow-hidden`}>
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>

                  <div className="flex items-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${tool.gradientClass} flex items-center justify-center mr-3 shadow-md`}
                    >
                      <tool.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                      <div className="flex items-center">
                        <span className="bg-black/30 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Powered
                        </span>
                        {tool.isFuture && (
                          <span className="ml-2 text-xs bg-gray-800 text-gray-300 font-medium px-2 py-0.5 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-6 text-sm">{tool.description}</p>

                  {tool.isAvailable ? (
                    <Link href={tool.href}>
                      <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all duration-300">
                        {tool.buttonText}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-800/50 text-gray-400 px-4 py-2 rounded-lg flex items-center justify-center cursor-not-allowed"
                    >
                      {tool.buttonText}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Usage metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Usage Metrics</h2>
        <div className="bg-[#1A1D24] rounded-xl p-6 border border-gray-800 shadow-saas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg p-4 border border-emerald-500/20">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-emerald-400 mr-2" />
                <h3 className="text-white font-medium">CopyGen AI</h3>
              </div>
              <p className="text-2xl font-bold text-white">{usage.copyGen}</p>
              <p className="text-gray-400 text-sm">Copies generated this week</p>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center mb-2">
                <ImageIcon className="h-5 w-5 text-purple-400 mr-2" />
                <h3 className="text-white font-medium">ImageGen AI</h3>
              </div>
              <p className="text-2xl font-bold text-white">{usage.imageGen}</p>
              <p className="text-gray-400 text-sm">Images generated this week</p>
            </div>

            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-lg p-4 border border-orange-500/20">
              <div className="flex items-center mb-2">
                <BookOpen className="h-5 w-5 text-orange-400 mr-2" />
                <h3 className="text-white font-medium">BlogGen AI</h3>
              </div>
              <p className="text-2xl font-bold text-white">{usage.blogGen}</p>
              <p className="text-gray-400 text-sm">Blog posts generated this week</p>
            </div>

            <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center mb-2">
                <Sparkles className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-white font-medium">Total Usage</h3>
              </div>
              <p className="text-2xl font-bold text-white">{usage.total}</p>
              <p className="text-gray-400 text-sm">Total generations this month</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
