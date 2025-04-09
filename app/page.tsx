"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { ArrowRight, Sparkles, PenTool, Search, Download, Share2, MessageSquare, Send, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageLayout } from "@/components/layout/page-layout"

export default function Home() {
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [email, setEmail] = useState("")

  // Refs for scroll animations
  const heroRef = useRef(null)
  const toolsRef = useRef(null)
  const newsletterRef = useRef(null)

  // InView hooks for animations
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const toolsInView = useInView(toolsRef, { once: true, margin: "-100px" })
  const newsletterInView = useInView(newsletterRef, { once: true, margin: "-100px" })

  // Scroll animations
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50])

  // Smooth scroll function for anchor links
  const scrollToSection = (e, id) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemFadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.03,
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
  }

  // Tool data
  const tools = [
    {
      id: "ai-copygen",
      name: "AI CopyGen",
      headline: "Generate Copy That Sells",
      description:
        "Craft product titles, descriptions, social captions, ads, emails, and full blog articles in seconds. Skip writer's block and produce high-quality, persuasive copy with AI assistance — perfect for sellers, marketers, and creators alike.",
      icon: <PenTool className="h-6 w-6" />,
      iconBg: "bg-gradient-to-br from-[#5466b5] to-[#8696ee]",
      cardBg: "bg-gradient-to-br from-[#f8faff] to-[#f0f0ff]",
      borderColor: "border-[#5466b5]/20",
      ctaText: "Start Writing AI Copy",
      ctaLink: "/copywriting",
      isAIPowered: true,
      isAvailable: true,
      animation: (
        <div className="absolute bottom-4 right-4 opacity-30">
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <div className="text-xs font-mono text-[#5466b5] whitespace-nowrap">
              <motion.span
                animate={{
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  times: [0, 0.5, 1],
                }}
              >
                Blog Posts
              </motion.span>
              <motion.span
                animate={{
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  times: [0, 0.5, 1],
                  delay: 1.3,
                }}
                className="absolute top-0 left-0"
              >
                Ad Copy
              </motion.span>
              <motion.span
                animate={{
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  times: [0, 0.5, 1],
                  delay: 2.6,
                }}
                className="absolute top-0 left-0"
              >
                Product Titles
              </motion.span>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      id: "ai-product-search",
      name: "AI Product Search",
      headline: "Find Winning Products Fast",
      description:
        "Discover trending and high-demand products before they go mainstream. Our AI scans data across global marketplaces to uncover fresh ideas and in-demand categories for your store.",
      icon: <Search className="h-6 w-6" />,
      iconBg: "bg-gradient-to-br from-[#3b82f6] to-[#60a5fa]",
      cardBg: "bg-gradient-to-br from-[#f8faff] to-[#eef5ff]",
      borderColor: "border-blue-200",
      ctaText: "Coming Soon",
      ctaLink: "#",
      isAIPowered: true,
      isAvailable: false,
      animation: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full border border-blue-200 -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full border border-blue-200 -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.05, 0.2, 0.05],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>
      ),
    },
    {
      id: "ai-imagegen",
      name: "AI ImageGen",
      headline: "Bring Your Products to Life",
      description:
        "Easily create stunning product visuals and UGC-style images for your ads and social posts. With fast generation and high-quality modes, AI ImageGen helps you produce eye-catching creatives in seconds.",
      icon: <ImageIcon className="h-6 w-6" />,
      iconBg: "bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa]",
      cardBg: "bg-gradient-to-br from-[#f9f7ff] to-[#f3efff]",
      borderColor: "border-purple-200",
      ctaText: "Start Generating Images",
      ctaLink: "/imagegen",
      isAIPowered: true,
      isAvailable: true,
      animation: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/3 right-1/4 w-10 h-10 rounded-lg bg-purple-400/10"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/4 w-8 h-8 rounded-lg bg-purple-400/10"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -5, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/3 w-6 h-6 rounded-full bg-purple-400/10"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>
      ),
    },
    {
      id: "csv-converter",
      name: "CSV Converter",
      headline: "Format Your Data Instantly",
      description:
        "Transform messy CSV files into clean, ready-to-use formats. Upload your product data and let Nexus handle the heavy lifting — making your files compatible and organized in seconds.",
      icon: <Download className="h-6 w-6" />,
      iconBg: "bg-gradient-to-br from-[#16783a] to-[#45c133]",
      cardBg: "bg-gradient-to-br from-[#f8fdf9] to-[#f0f9f1]",
      borderColor: "border-green-200",
      ctaText: "Use the Converter",
      ctaLink: "/converter",
      isAIPowered: true,
      isAvailable: true,
      animation: (
        <div className="absolute bottom-12 right-8 opacity-40 pointer-events-none">
          <motion.div
            className="w-8 h-10 border border-dashed border-green-400 rounded-md relative"
            animate={{
              y: [0, -15],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
              times: [0, 1],
              delay: 0.2,
            }}
          >
            <div className="absolute top-1 left-1 right-1 h-1 bg-green-400 rounded-sm"></div>
          </motion.div>
          <div className="w-8 h-10 border border-green-400 rounded-md relative mt-1">
            <div className="absolute top-1 left-1 right-1 h-1 bg-green-400 rounded-sm"></div>
            <div className="absolute top-3 left-1 right-1 h-1 bg-green-400 rounded-sm"></div>
            <div className="absolute top-5 left-1 right-1 h-1 bg-green-400 rounded-sm"></div>
            <div className="absolute top-7 left-1 right-1 h-1 bg-green-400 rounded-sm"></div>
          </div>
        </div>
      ),
    },
    {
      id: "ai-social-gen",
      name: "AI SocialGen",
      headline: "Create Scroll-Stopping Social Content",
      description:
        "Effortlessly create high-converting social media posts for your products. From captions to image creatives, our AI helps you stay ahead with ready-to-post content that captures attention.",
      icon: <Share2 className="h-6 w-6" />,
      iconBg: "bg-gradient-to-br from-[#ec4899] to-[#f472b6]",
      cardBg: "bg-gradient-to-br from-[#fdf8fd] to-[#fdf0f9]",
      borderColor: "border-pink-200",
      ctaText: "Coming Soon",
      ctaLink: "#",
      isAIPowered: true,
      isAvailable: false,
      animation: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/4 right-1/4 text-pink-400 opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </motion.div>
          <motion.div
            className="absolute top-2/3 left-1/3 text-pink-400 opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
            </svg>
          </motion.div>
          <motion.div
            className="absolute top-1/3 right-1/3 text-pink-400 opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
          </motion.div>
        </div>
      ),
    },
    {
      id: "ai-nexchat",
      name: "Auqli NexChat",
      headline: "Your AI Chat Assistant for Instant Support",
      description:
        "Engage customers, answer questions, and provide instant assistance with NexChat — your always-on AI chat tool, built to handle inquiries 24/7 and help you close more sales.",
      icon: <MessageSquare className="h-6 w-6" />,
      iconBg: "bg-gradient-to-br from-[#6366f1] to-[#a5b4fc]",
      cardBg: "bg-gradient-to-br from-[#f8f9ff] to-[#f0f1ff]",
      borderColor: "border-indigo-200",
      ctaText: "Coming Soon",
      ctaLink: "#",
      isAIPowered: true,
      isAvailable: false,
      animation: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-10 right-10">
            <motion.div
              className="relative w-12 h-10 bg-indigo-100 rounded-xl rounded-bl-none"
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                ease: "easeInOut",
              }}
            >
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                <motion.div
                  className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      ),
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Subscribing email:", email)
    // Reset form
    setEmail("")
    // Show success message or toast
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#0a0f1a]">
        <main>
          {/* Hero Section - Optimized spacing and removed extra button */}
          <section className="py-14 md:py-20 relative overflow-hidden" ref={heroRef}>
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0c1322] to-[#0a0f1a]"></div>

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-gradient-to-r from-[#16783a]/10 to-[#45c133]/10 blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                className="absolute bottom-10 right-[15%] w-80 h-80 rounded-full bg-gradient-to-r from-[#5466b5]/10 to-[#8696ee]/10 blur-3xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 10,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: 1,
                }}
              />

              {/* Floating shapes */}
              <motion.div
                className="absolute top-1/4 left-1/5 w-8 h-8 rounded-md bg-[#16783a]/10 rotate-12"
                animate={{
                  y: [0, -15, 0],
                  rotate: [12, 20, 12],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                className="absolute bottom-1/4 right-1/5 w-12 h-12 rounded-full bg-[#5466b5]/10"
                animate={{
                  y: [0, 20, 0],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 7,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: 1,
                }}
              />
              <motion.div
                className="absolute top-2/3 left-1/3 w-6 h-6 rounded-full bg-[#f472b6]/10"
                animate={{
                  y: [0, -10, 0],
                  x: [0, 10, 0],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: 2,
                }}
              />
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <motion.div
                className="max-w-4xl mx-auto text-center"
                initial="hidden"
                animate={heroInView ? "visible" : "hidden"}
                variants={fadeIn}
                style={{ opacity: heroOpacity, y: heroY }}
              >
                <motion.div
                  className="inline-flex items-center mb-5 bg-gradient-to-r from-[#16783a]/20 to-[#45c133]/20 px-4 py-2 rounded-full backdrop-blur-sm border border-[#16783a]/20"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Sparkles className="h-4 w-4 mr-2 text-[#45c133]" />
                  <span className="text-[#45c133] font-medium">AI-Powered Tools</span>
                </motion.div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-5 text-white leading-tight tracking-tight">
                  Smarter AI Tools for Modern Businesses
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                  Create faster, sell smarter, and grow effortlessly with Auqli Nexus — your all-in-one AI toolkit for
                  content generation, product sourcing, data conversion, and beyond.
                </p>

                <div className="flex justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={(e) => scrollToSection(e, "tools")}
                      className="bg-gradient-to-r from-[#16783a] to-[#45c133] hover:from-[#16783a]/90 hover:to-[#45c133]/90 text-white px-8 py-6 h-auto text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                      <span className="flex items-center">
                        Start Using Nexus <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Subtle divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#16783a]/30 to-transparent"></div>
          </section>

          {/* Tools Section - Improved spacing and layout */}
          <section id="tools" className="py-12 md:py-16 bg-[#0a0f1a]" ref={toolsRef}>
            <div className="container mx-auto px-4 sm:px-6">
              <motion.div
                className="text-center mb-8 md:mb-10"
                initial="hidden"
                animate={toolsInView ? "visible" : "hidden"}
                variants={fadeIn}
              >
                <div className="inline-block mb-3 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                  <span className="text-white font-medium">Supercharge Your Business</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight">
                  Our Suite of Tools
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                  A comprehensive toolkit designed to help businesses succeed in today's competitive marketplace.
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
                initial="hidden"
                animate={toolsInView ? "visible" : "hidden"}
                variants={staggerContainer}
              >
                {tools.map((tool) => (
                  <motion.div
                    key={tool.id}
                    variants={itemFadeIn}
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                    variants={cardHover}
                    className="h-full"
                  >
                    <Card className={`border-0 overflow-hidden shadow-lg rounded-2xl ${tool.cardBg} h-full relative`}>
                      {tool.animation}
                      <CardHeader className={`border-b ${tool.borderColor} p-4 sm:p-5`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`${tool.iconBg} text-white p-3 rounded-xl mr-3 shadow-md`}>{tool.icon}</div>
                            <div>
                              <CardTitle className="text-lg sm:text-xl text-gray-800">{tool.name}</CardTitle>
                              {tool.isAIPowered && (
                                <Badge className="mt-1 bg-gradient-to-r from-[#16783a] to-[#45c133] text-white border-0">
                                  <Sparkles className="mr-1 h-3 w-3" /> AI Powered
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-5">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{tool.headline}</h3>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{tool.description}</p>
                      </CardContent>
                      <CardFooter className="bg-transparent p-4 sm:p-5 pt-0 mt-auto">
                        {tool.isAvailable ? (
                          <Button
                            asChild
                            className={`${
                              tool.id === "ai-copygen"
                                ? "bg-gradient-to-r from-[#5466b5] to-[#8696ee] hover:from-[#4355a4] hover:to-[#7585dd]"
                                : "bg-gradient-to-r from-[#16783a] to-[#45c133] hover:from-[#16783a]/90 hover:to-[#45c133]/90"
                            } text-white rounded-lg w-full md:w-auto`}
                          >
                            <Link href={tool.ctaLink} className="flex items-center justify-center">
                              {tool.ctaText} <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            disabled
                            className="w-full bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed rounded-lg py-3 hover:bg-gray-100"
                          >
                            {tool.ctaText}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Subtle divider */}
          <div className="container mx-auto px-4 sm:px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-[#16783a]/30 to-transparent w-full"></div>
          </div>

          {/* Newsletter Section - Refined spacing */}
          <section className="py-12 md:py-16 bg-gradient-to-b from-[#0a0f1a] to-[#0c1322]" ref={newsletterRef}>
            <div className="container mx-auto px-4 sm:px-6">
              <motion.div
                className="max-w-3xl mx-auto text-center"
                initial="hidden"
                animate={newsletterInView ? "visible" : "hidden"}
                variants={fadeIn}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">Stay Ahead of the Curve</h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                  Be the first to know about new tools, feature updates, and exclusive launches from Auqli Nexus.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                  <div className="flex-grow">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 rounded-lg focus:border-[#45c133] focus:ring-[#45c133]/20"
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-[#16783a] to-[#45c133] hover:from-[#16783a]/90 hover:to-[#45c133]/90 text-white h-12 rounded-lg px-6"
                    >
                      <span>Subscribe</span>
                      <motion.div
                        animate={{
                          x: [0, 5, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                          ease: "easeInOut",
                        }}
                        className="ml-2"
                      >
                        <Send className="h-4 w-4" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            </div>
          </section>
        </main>
      </div>
    </PageLayout>
  )
}
