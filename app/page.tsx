"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { ArrowRight, Sparkles, PenTool, Download, Share2, Send, ImageIcon, FileText, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageLayout } from "@/components/layout/page-layout"
import { ToolCard } from "@/components/tool-card"

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

  // Tool data
  const tools = [
    {
      id: "imagegen",
      name: "ImageGen AI",
      description:
        "Instantly generate high-quality product photos, banners, and visuals with AI. Perfect for new drops or seasonal promotions.",
      icon: ImageIcon,
      iconBg: "bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa]",
      cardBg: "bg-gradient-to-br from-[#f9f7ff] to-[#f3efff]",
      borderColor: "border-purple-200",
      ctaText: "Try Now",
      ctaLink: "/imagegen",
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
        </div>
      ),
    },
    {
      id: "copygen",
      name: "CopyGen AI",
      description:
        "Create powerful product titles, descriptions, and headlines that sell. Skip the writer's block and launch faster.",
      icon: PenTool,
      iconBg: "bg-gradient-to-br from-[#5466b5] to-[#8696ee]",
      cardBg: "bg-gradient-to-br from-[#f8faff] to-[#f0f0ff]",
      borderColor: "border-[#5466b5]/20",
      ctaText: "Try Now",
      ctaLink: "/copygen",
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
                Product Titles
              </motion.span>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      id: "bloggen",
      name: "BlogGen AI",
      description: "Generate SEO-optimized blog articles to drive organic traffic and improve store visibility.",
      icon: FileText,
      iconBg: "bg-gradient-to-br from-[#f59e0b] to-[#fbbf24]",
      cardBg: "bg-gradient-to-br from-[#fffbeb] to-[#fef3c7]",
      borderColor: "border-amber-200",
      ctaText: "Try Now",
      ctaLink: "/bloggen",
      isAvailable: true,
      animation: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/4 right-1/4 w-8 h-8 rounded-md bg-amber-400/10 rotate-12"
            animate={{
              y: [0, -10, 0],
              rotate: [12, 20, 12],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        </div>
      ),
    },
    {
      id: "csv-converter",
      name: "CSV Converter",
      description:
        "Easily convert and prepare product CSVs for bulk uploads to your store. No manual formatting needed.",
      icon: Download,
      iconBg: "bg-gradient-to-br from-[#16783a] to-[#45c133]",
      cardBg: "bg-gradient-to-br from-[#f8fdf9] to-[#f0f9f1]",
      borderColor: "border-green-200",
      ctaText: "Try Now",
      ctaLink: "/converter",
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
      id: "seo-booster",
      name: "SEO Booster",
      description: "Automatically generate meta titles, descriptions, and ALT text for better search rankings.",
      icon: BarChart2,
      iconBg: "bg-gradient-to-br from-[#3b82f6] to-[#60a5fa]",
      cardBg: "bg-gradient-to-br from-[#f8faff] to-[#eef5ff]",
      borderColor: "border-blue-200",
      ctaText: "Coming Soon",
      ctaLink: "#",
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
        </div>
      ),
    },
    {
      id: "ad-copy-generator",
      name: "Ad Copy Generator",
      description: "Create high-converting ad copy for Facebook, Instagram, and Google Ads in seconds.",
      icon: Share2,
      iconBg: "bg-gradient-to-br from-[#ec4899] to-[#f472b6]",
      cardBg: "bg-gradient-to-br from-[#fdf8fd] to-[#fdf0f9]",
      borderColor: "border-pink-200",
      ctaText: "Coming Soon",
      ctaLink: "#",
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
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </motion.div>
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
          {/* Hero Section */}
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
                  y: [0, -10, 0],
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
                  Nexus Is Your AI Toolkit
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                  Supercharge your content with AI tools. Generate product images, write descriptions, boost SEO, and
                  automate your content — all in one place.
                </p>

                <div className="flex justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={(e) => scrollToSection(e, "tools")}
                      className="bg-gradient-to-r from-[#16783a] to-[#45c133] hover:from-[#16783a]/90 hover:to-[#45c133]/90 text-white px-8 py-6 h-auto text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                      <span className="flex items-center">
                        Explore AI Tools <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Subtle divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#16783a]/30 to-transparent"></div>
          </section>

          {/* Tools Section */}
          <section id="tools" className="py-12 md:py-16 bg-[#0a0f1a]" ref={toolsRef}>
            <div className="container mx-auto px-4 sm:px-6">
              <motion.div
                className="text-center mb-8 md:mb-10"
                initial="hidden"
                animate={toolsInView ? "visible" : "hidden"}
                variants={fadeIn}
              >
                <div className="inline-block mb-3 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                  <span className="text-white font-medium">Popular Tools</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight">
                  AI-powered growth tools
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                  Designed to save time and grow your audience
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
                initial="hidden"
                animate={toolsInView ? "visible" : "hidden"}
                variants={staggerContainer}
              >
                {tools.slice(0, 6).map((tool, index) => (
                  <ToolCard
                    key={tool.id}
                    id={tool.id}
                    name={tool.name}
                    description={tool.description}
                    icon={<tool.icon />}
                    iconBg={tool.iconBg}
                    cardBg={tool.cardBg}
                    borderColor={tool.borderColor}
                    ctaText={tool.ctaText}
                    ctaLink={tool.ctaLink}
                    isAvailable={tool.isAvailable}
                    animation={tool.animation}
                  />
                ))}
              </motion.div>
            </div>
          </section>

          {/* Subtle divider */}
          <div className="container mx-auto px-4 sm:px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-[#16783a]/30 to-transparent w-full"></div>
          </div>

          {/* Newsletter Section */}
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
