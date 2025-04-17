"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import {
  ArrowRight,
  Sparkles,
  PenTool,
  Download,
  Share2,
  Send,
  ImageIcon,
  FileText,
  Mic,
  Scissors,
  Lightbulb,
  FileTextIcon as FileText2,
  MessageSquare,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageLayout } from "@/components/layout/page-layout"
import Link from "next/link"

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

  // Tool data - Updated with all the new tools
  const tools = [
    {
      id: "imagegen",
      name: "ImageGen AI",
      description:
        "Instantly generate high-quality product photos, banners, and visuals with AI. Perfect for new drops, seasonal campaigns, or ad creatives — no designer needed.",
      icon: ImageIcon,
      iconBg: "bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa]",
      cardBg: "bg-gradient-to-br from-[#f9f7ff] to-[#f3efff]",
      borderColor: "border-purple-200",
      ctaText: "Try Now",
      ctaLink: "/imagegen",
      isAvailable: true,
      badgeColor: "bg-gradient-to-r from-purple-600 to-indigo-600",
    },
    {
      id: "copygen",
      name: "CopyGen AI",
      description:
        "Create powerful product titles, descriptions, and headlines that sell. Skip writer's block with high-converting copy optimized for e-commerce and social.",
      icon: PenTool,
      iconBg: "bg-gradient-to-br from-[#5466b5] to-[#8696ee]",
      cardBg: "bg-gradient-to-br from-[#f8faff] to-[#f0f0ff]",
      borderColor: "border-[#5466b5]/20",
      ctaText: "Try Now",
      ctaLink: "/copygen",
      isAvailable: true,
      badgeColor: "bg-gradient-to-r from-blue-600 to-indigo-600",
    },
    {
      id: "bloggen",
      name: "BlogGen AI",
      description:
        "Generate long-form, SEO-optimized blog articles to grow organic traffic. Perfect for boosting your store's visibility and thought leadership in any niche.",
      icon: FileText,
      iconBg: "bg-gradient-to-br from-[#f59e0b] to-[#fbbf24]",
      cardBg: "bg-gradient-to-br from-[#fffbeb] to-[#fef3c7]",
      borderColor: "border-amber-200",
      ctaText: "Try Now",
      ctaLink: "/bloggen",
      isAvailable: true,
      badgeColor: "bg-gradient-to-r from-yellow-500 to-amber-500",
    },
    {
      id: "csv-converter",
      name: "CSV Converter",
      description:
        "Easily clean, convert, and prepare product CSVs for bulk uploads to your store. No more manual formatting errors — just upload, convert, and launch.",
      icon: Download,
      iconBg: "bg-gradient-to-br from-[#16783a] to-[#45c133]",
      cardBg: "bg-gradient-to-br from-[#f8fdf9] to-[#f0f9f1]",
      borderColor: "border-green-200",
      ctaText: "Try Now",
      ctaLink: "/converter",
      isAvailable: true,
      badgeColor: "bg-gradient-to-r from-green-600 to-emerald-600",
    },
    {
      id: "captiongen",
      name: "CaptionGen AI",
      description:
        "Auto-generate subtitles for your videos in multiple languages. Upload any video and let AI transcribe, subtitle, and translate into Tagalog, Yoruba, French, and more.",
      icon: MessageSquare,
      iconBg: "bg-gradient-to-br from-[#f97316] to-[#fb923c]",
      cardBg: "bg-gradient-to-br from-[#fff7ed] to-[#ffedd5]",
      borderColor: "border-orange-200",
      ctaText: "Coming Soon",
      ctaLink: "/captiongen",
      isAvailable: false,
      badgeColor: "bg-gradient-to-r from-orange-500 to-amber-500",
    },
    {
      id: "voiceblog",
      name: "VoiceBlog AI",
      description:
        "Turn your voice notes into full blog posts with perfect structure and flow. Ideal for busy founders, creators, and coaches who want to publish without typing.",
      icon: Mic,
      iconBg: "bg-gradient-to-br from-[#7f1d1d] to-[#b91c1c]",
      cardBg: "bg-gradient-to-br from-[#fef2f2] to-[#fee2e2]",
      borderColor: "border-red-200",
      ctaText: "Coming Soon",
      ctaLink: "/voiceblog",
      isAvailable: false,
      badgeColor: "bg-gradient-to-r from-red-700 to-red-500",
    },
    {
      id: "clipslash",
      name: "ClipSlash AI",
      description:
        "Cut your long videos into viral clips — automatically. AI detects emotional hooks, punchlines, and high-impact moments ready for TikTok, Shorts, and Reels.",
      icon: Scissors,
      iconBg: "bg-gradient-to-br from-[#ef4444] to-[#f87171]",
      cardBg: "bg-gradient-to-br from-[#fef2f2] to-[#fee2e2]",
      borderColor: "border-red-200",
      ctaText: "Coming Soon",
      ctaLink: "/clipslash",
      isAvailable: false,
      badgeColor: "bg-gradient-to-r from-red-600 to-rose-500",
    },
    {
      id: "ideaspark",
      name: "IdeaSpark AI",
      description:
        "Generate scroll-stopping video ideas, hooks, and shot lists — instantly. Just tell us your product or niche and get viral-ready content ideas on demand.",
      icon: Lightbulb,
      iconBg: "bg-gradient-to-br from-[#eab308] to-[#facc15]",
      cardBg: "bg-gradient-to-br from-[#fefce8] to-[#fef9c3]",
      borderColor: "border-yellow-200",
      ctaText: "Coming Soon",
      ctaLink: "/ideaspark",
      isAvailable: false,
      badgeColor: "bg-gradient-to-r from-yellow-500 to-amber-500",
    },
    {
      id: "cvboost",
      name: "CVBoost AI",
      description:
        "Get a stronger CV and custom-tailored cover letter in seconds. Upload your resume and job link — AI will optimize your bullet points and write a professional cover letter.",
      icon: FileText2,
      iconBg: "bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa]",
      cardBg: "bg-gradient-to-br from-[#f9f7ff] to-[#f3efff]",
      borderColor: "border-purple-200",
      ctaText: "Coming Soon",
      ctaLink: "/cvboost",
      isAvailable: false,
      badgeColor: "bg-gradient-to-r from-purple-600 to-indigo-600",
    },
    {
      id: "threadgen",
      name: "ThreadGen AI",
      description:
        "Convert any blog post or video into a high-engagement Twitter/X thread. AI summarizes and rewrites long-form content into threads with hooks, bullets, and call-to-actions.",
      icon: Share2,
      iconBg: "bg-gradient-to-br from-[#3b82f6] to-[#60a5fa]",
      cardBg: "bg-gradient-to-br from-[#eff6ff] to-[#dbeafe]",
      borderColor: "border-blue-200",
      ctaText: "Coming Soon",
      ctaLink: "/threadgen",
      isAvailable: false,
      badgeColor: "bg-gradient-to-r from-blue-600 to-blue-500",
    },
    {
      id: "flexgen",
      name: "FlexGen AI",
      description:
        "Type a vibe → get a 🔥 WhatsApp bio and matching AI profile pic. Funny, bold, romantic, or boss mode — FlexGen is built to make you stand out on social.",
      icon: User,
      iconBg: "bg-gradient-to-br from-[#7f1d1d] to-[#b91c1c]",
      cardBg: "bg-gradient-to-br from-[#fef2f2] to-[#fee2e2]",
      borderColor: "border-red-200",
      ctaText: "Coming Soon",
      ctaLink: "/flexgen",
      isAvailable: false,
      badgeColor: "bg-gradient-to-r from-red-700 to-red-500",
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
                  Auqli Nexus – AI Tool Suite
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
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    className="group"
                    whileHover={tool.isAvailable ? { scale: 1.03, y: -8 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    variants={itemFadeIn}
                  >
                    <div
                      className={`border-0 overflow-hidden shadow-lg hover:shadow-xl rounded-2xl ${tool.cardBg} h-full relative ${!tool.isAvailable ? "opacity-80" : ""}`}
                    >
                      {/* Animated background elements for each card */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <motion.div
                          className={`absolute top-1/3 right-1/4 w-10 h-10 rounded-lg ${tool.iconBg}/10`}
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
                      </div>

                      <div className={`border-b ${tool.borderColor} p-4 sm:p-5`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`${tool.iconBg} text-white p-3 rounded-xl mr-3 shadow-md`}>
                              <tool.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-lg sm:text-xl text-gray-800">{tool.name}</h3>
                              <div
                                className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tool.isAvailable ? tool.badgeColor : "bg-gray-200 text-gray-600"} text-white border-0`}
                              >
                                {tool.isAvailable ? (
                                  <>
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    AI Powered
                                  </>
                                ) : (
                                  <>
                                    <span className="mr-1">🚀</span> Coming Soon
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 sm:p-5">
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{tool.description}</p>
                      </div>
                      <div className="bg-transparent p-4 sm:p-5 pt-0 mt-auto">
                        {tool.isAvailable ? (
                          <Button asChild className={`${tool.iconBg} text-white rounded-lg w-full md:w-auto`}>
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
                      </div>
                    </div>
                  </motion.div>
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
