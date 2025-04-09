"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { ArrowRight, Check, Star, Sparkles, Search, Download, PenTool, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLayout } from "@/components/layout/page-layout"
import { Badge } from "@/components/ui/badge"

// CountUp component for animated statistics
const CountUp = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0)
  const countRef = useRef(null)
  const inView = useInView(countRef, { once: true })

  useEffect(() => {
    if (inView) {
      let startTime
      let animationFrame

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp
        const progress = timestamp - startTime
        const percentage = Math.min(progress / duration, 1)

        // Easing function for smoother animation
        const easeOutQuad = (percentage) => percentage * (2 - percentage)
        const currentCount = Math.floor(easeOutQuad(percentage) * end)

        setCount(currentCount)

        if (progress < duration) {
          animationFrame = requestAnimationFrame(animate)
        }
      }

      animationFrame = requestAnimationFrame(animate)

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame)
        }
      }
    }
  }, [inView, end, duration])

  return (
    <span ref={countRef}>
      {count}
      {suffix}
    </span>
  )
}

// Testimonial data
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "E-commerce Manager",
    company: "TechGear",
    avatar: "/placeholder.svg?height=80&width=80",
    content:
      "Auqli Nexus transformed our product management workflow. The CSV converter alone saved us hours of manual formatting work.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Online Store Owner",
    company: "FashionHub",
    avatar: "/placeholder.svg?height=80&width=80",
    content:
      "I was struggling with importing my Shopify products to Auqli until I found this tool. Now it's just a matter of seconds!",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Digital Marketer",
    company: "HomeEssentials",
    avatar: "/placeholder.svg?height=80&width=80",
    content:
      "The interface is intuitive and the converter works flawlessly. Can't wait for the AI copywriting tools to launch.",
    rating: 4,
  },
]

// Client logos
const clients = [
  { name: "TechGear", logo: "/placeholder.svg?height=40&width=120" },
  { name: "FashionHub", logo: "/placeholder.svg?height=40&width=120" },
  { name: "HomeEssentials", logo: "/placeholder.svg?height=40&width=120" },
  { name: "GadgetWorld", logo: "/placeholder.svg?height=40&width=120" },
  { name: "StyleBoutique", logo: "/placeholder.svg?height=40&width=120" },
]

// Features data with enhanced icons and descriptions
const features = [
  {
    title: "CSV Conversion",
    description: "Transform your Shopify and WooCommerce product data into Auqli-ready format with just one click",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M8 13h2" />
        <path d="M8 17h2" />
        <path d="M14 13h2" />
        <path d="M14 17h2" />
      </svg>
    ),
    bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
    iconBgColor: "bg-gradient-to-br from-emerald-500 to-teal-600",
    borderColor: "border-emerald-200",
  },
  {
    title: "Category Mapping",
    description: "Our intelligent system automatically maps your product categories to Auqli's marketplace structure",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M21 6H3" />
        <path d="M10 12H3" />
        <path d="M10 18H3" />
        <path d="M18 12h-4" />
        <path d="M14 16l4-4-4-4" />
      </svg>
    ),
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
    iconBgColor: "bg-gradient-to-br from-blue-500 to-indigo-600",
    borderColor: "border-blue-200",
  },
  {
    title: "Bulk Processing",
    description: "Convert your entire product catalog at once — thousands of items processed in seconds",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M16 3h5v5" />
        <path d="M4 20 21 3" />
        <path d="M21 16v5h-5" />
        <path d="M15 15l6 6" />
        <path d="M4 4l5 5" />
      </svg>
    ),
    bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
    iconBgColor: "bg-gradient-to-br from-amber-500 to-yellow-600",
    borderColor: "border-amber-200",
  },
  {
    title: "Error Handling",
    description: "Smart validation catches formatting issues and ensures your product data meets Auqli's requirements",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
      </svg>
    ),
    bgColor: "bg-gradient-to-br from-rose-50 to-pink-50",
    iconBgColor: "bg-gradient-to-br from-rose-500 to-pink-600",
    borderColor: "border-rose-200",
  },
]

// Stats data
const stats = [
  { value: "10,000+", endValue: 10000, label: "Products Processed" },
  { value: "500+", endValue: 500, label: "Active Sellers" },
  { value: "98%", endValue: 98, label: "Success Rate" },
  { value: "24/7", label: "Support" },
]

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  // Refs for scroll animations
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const testimonialsRef = useRef(null)
  const toolsRef = useRef(null)
  const ctaRef = useRef(null)

  // InView hooks for animations
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" })
  const toolsInView = useInView(toolsRef, { once: true, margin: "-100px" })
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" })

  // Scroll animations
  const { scrollYProgress } = useScroll()
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0.98])

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

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

  const featureHover = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -5, transition: { duration: 0.3, ease: "easeOut" } },
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-white">
        <main>
          {/* Hero Section */}
          <section className="py-24 md:py-32 relative overflow-hidden" ref={heroRef}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#f8fdf9] to-white pointer-events-none"></div>

            {/* Background Elements */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#16783a]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#16783a]/5 rounded-full blur-3xl"></div>

            {/* Decorative Elements */}
            <div className="absolute top-40 right-[10%] w-20 h-20 bg-[#16783a]/10 rounded-full"></div>
            <div className="absolute bottom-40 left-[15%] w-12 h-12 bg-[#16783a]/20 rounded-full"></div>

            <div className="container mx-auto px-6 relative z-10">
              <motion.div
                className="max-w-4xl mx-auto text-center"
                initial="hidden"
                animate={heroInView ? "visible" : "hidden"}
                variants={fadeIn}
              >
                <div className="inline-block mb-6 bg-[#16783a]/10 px-4 py-2 rounded-full">
                  <span className="text-[#16783a] font-medium">Simplify Your Auqli Selling Experience</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-gray-900 leading-tight tracking-tight">
                  Smarter Tools. Faster Selling. Built for Auqli Sellers.
                </h1>

                <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
                  Auqli Nexus is your AI-powered suite for growing your shop, discovering products, writing better copy,
                  and creating social content in seconds. Everything you need to move faster and sell smarter — designed
                  for sellers on Auqli.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-5">
                  <Button
                    asChild
                    className="bg-[#16783a] hover:bg-[#225b35] text-white px-8 py-6 h-auto text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    <a href="https://www.auqli.live/sell" target="_blank" rel="noopener noreferrer">
                      Sell On Auqli Live
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="bg-[#0a0f1a] text-white hover:bg-[#161f35] border-0 px-8 py-6 h-auto text-lg rounded-full transition-all flex items-center"
                  >
                    <Link href="/converter" className="flex items-center">
                      Try The CSV Converter <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Marquee Section */}
          <section className="py-6 bg-gradient-to-r from-[#f0f9f1] via-[#e8f9ea] to-[#f0f9f1] overflow-hidden border-y border-[#16783a]/10 relative">
            {/* Soft decorative lines */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-px bg-[#16783a]"></div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-[#16783a]"></div>
              <div className="absolute top-1/4 left-0 w-full h-px bg-[#16783a]/30"></div>
              <div className="absolute top-3/4 left-0 w-full h-px bg-[#16783a]/30"></div>
            </div>

            <div className="marquee-container group">
              <div className="marquee-content">
                <div className="animate-marquee">
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    🚀 AI-Powered Tools for Sellers
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • Find Winning Products Fast
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • Connect with Trusted Suppliers
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • Instant CSV Conversion
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • High-Converting Copywriting
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • Automated Social Creatives
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • Boost Your Sales Workflow
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • Powered by Auqli Nexus 🚀
                  </span>
                </div>
                <div className="animate-marquee2">
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    🚀 AI-Powered Tools for Sellers
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • Find Winning Products Fast
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • Connect with Trusted Suppliers
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • Instant CSV Conversion
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • High-Converting Copywriting
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • Automated Social Creatives
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • Boost Your Sales Workflow
                  </span>
                  <span className="text-lg font-medium text-[#16783a] whitespace-nowrap px-4">
                    • Powered by Auqli Nexus 🚀
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section - Enhanced for better readability and visual appeal */}
          <section id="features" className="py-24 bg-white" ref={featuresRef}>
            <div className="container mx-auto px-6">
              <motion.div
                className="text-center mb-16"
                initial="hidden"
                animate={featuresInView ? "visible" : "hidden"}
                variants={fadeIn}
              >
                <div className="inline-block mb-4 bg-[#16783a]/10 px-4 py-2 rounded-full">
                  <span className="text-[#16783a] font-medium">Our Featured Tool</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 tracking-tight">
                  Your Seller Toolkit, Supercharged with AI
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  The Auqli CSV Converter transforms your e-commerce product data into Auqli-ready format in seconds.
                  Say goodbye to manual formatting and hello to seamless imports from Shopify and WooCommerce. Save
                  hours of work with our intelligent mapping system that preserves all your product details.
                </p>
              </motion.div>

              {/* Enhanced Feature Cards with better contrast and visual appeal */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                initial="hidden"
                animate={featuresInView ? "visible" : "hidden"}
                variants={staggerContainer}
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className={`rounded-xl p-6 shadow-md border ${feature.borderColor} ${feature.bgColor} overflow-hidden`}
                    variants={itemFadeIn}
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                    variants={featureHover}
                  >
                    <div className="relative mb-6">
                      <div
                        className={`w-14 h-14 ${feature.iconBgColor} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}
                      >
                        {feature.icon({ className: "h-7 w-7" })}
                      </div>
                      <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-white/10 rounded-full blur-xl opacity-50"></div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                    <p className="text-gray-700">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Feature Showcase */}
              <motion.div
                className="mt-20 bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                initial="hidden"
                animate={featuresInView ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ delay: 0.4 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="inline-block mb-4 bg-[#16783a]/10 px-4 py-2 rounded-full">
                      <span className="text-[#16783a] font-medium">Shopify to Auqli Converter</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
                      Convert Your Products in Seconds
                    </h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Upload your Shopify CSV export and watch as our converter instantly transforms it into Auqli's
                      required format. No more manual field mapping, formatting headaches, or lost product data — get
                      your entire catalog ready for Auqli in minutes, not hours.
                    </p>
                    <ul className="space-y-4 mb-8">
                      {[
                        "Smart category matching with Auqli's marketplace structure",
                        "Automatic field validation and error correction",
                        "Bulk processing for thousands of products at once",
                        "Complete data preservation including images and variants",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#16783a]/10 flex items-center justify-center mr-3 mt-0.5">
                            <Check className="h-4 w-4 text-[#16783a]" />
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="bg-[#16783a] hover:bg-[#225b35] text-white rounded-full w-full md:w-auto"
                    >
                      <Link href="/converter" className="flex items-center justify-center">
                        Try It Now <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                  <div className="bg-gradient-to-br from-[#f8fdf9] to-[#e8f9ea] p-8 md:p-12 flex items-center justify-center">
                    <div className="relative w-full max-w-md">
                      <div className="bg-white rounded-lg shadow-xl p-6 transform rotate-1 border border-gray-100">
                        <div className="flex items-center mb-4">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="ml-auto text-xs text-gray-500">shopify_products.csv</div>
                        </div>
                        <div className="h-40 overflow-hidden bg-gray-50 rounded-md p-2 border border-gray-100">
                          <div className="text-xs font-mono text-gray-700">
                            <div className="mb-1 font-semibold text-gray-800">
                              Handle,Title,Body (HTML),Vendor,Type,Tags,Published,Image Src
                            </div>
                            <div className="mb-1">
                              {
                                "t-shirt,Premium T-Shirt,<p>High-quality cotton t-shirt</p>,Auqli,T-Shirts,cotton,TRUE,https://example.com/tshirt.jpg"
                              }
                            </div>
                            <div className="mb-1">
                              {
                                "hoodie,Zip Hoodie,<p>Warm zip-up hoodie</p>,Auqli,Hoodies,cotton,TRUE,https://example.com/hoodie.jpg"
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="bg-[#16783a] text-white rounded-full p-3 shadow-lg">
                          <ArrowRight className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="bg-white rounded-lg shadow-xl p-6 transform -rotate-1 mt-4 border border-gray-100">
                        <div className="flex items-center mb-4">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="ml-auto text-xs text-gray-500">auqli_formatted.csv</div>
                        </div>
                        <div className="h-40 overflow-hidden bg-gray-50 rounded-md p-2 border border-gray-100">
                          <div className="text-xs font-mono text-gray-700">
                            <div className="mb-1 font-semibold text-gray-800">
                              product name,product main price,product main image,product description,product
                              weight,product inventory
                            </div>
                            <div className="mb-1">
                              {
                                "Premium T-Shirt,29.99,https://example.com/tshirt.jpg,High-quality cotton t-shirt,0.25,100"
                              }
                            </div>
                            <div className="mb-1">
                              {"Zip Hoodie,49.99,https://example.com/hoodie.jpg,Warm zip-up hoodie,0.5,75"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="py-24 bg-gray-50" ref={testimonialsRef}>
            <div className="container mx-auto px-6">
              <motion.div
                className="text-center mb-16"
                initial="hidden"
                animate={testimonialsInView ? "visible" : "hidden"}
                variants={fadeIn}
              >
                <div className="inline-block mb-4 bg-[#16783a]/10 px-4 py-2 rounded-full">
                  <span className="text-[#16783a] font-medium">Testimonials</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 tracking-tight">
                  What Our Sellers Say
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Don't just take our word for it. Here's what sellers are saying about Auqli Nexus.
                </p>
              </motion.div>

              {/* Replace the testimonials grid with this new interactive testimonial carousel */}
              <motion.div
                initial="hidden"
                animate={testimonialsInView ? "visible" : "hidden"}
                variants={staggerContainer}
                className="relative overflow-hidden py-10 px-4 bg-gradient-to-r from-[#f0f9f1] to-[#e6f7ff] rounded-2xl shadow-lg border border-green-100"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/4 opacity-60 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-50 rounded-full translate-y-1/3 -translate-x-1/3 opacity-60 blur-3xl"></div>

                {/* Testimonial carousel */}
                <div className="relative overflow-hidden px-2 sm:px-4 py-6">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#f0f9f1]/80 via-transparent to-[#f0f9f1]/80 pointer-events-none z-10"></div>

                  <motion.div
                    className="flex space-x-4 sm:space-x-6 py-8"
                    animate={{
                      x: [0, -2400],
                    }}
                    transition={{
                      x: {
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                        duration: 60,
                        ease: "linear",
                      },
                    }}
                  >
                    {/* Testimonial 1 */}
                    <div className="flex-shrink-0 w-80 md:w-96 bg-white rounded-xl shadow-md p-6 border border-green-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                      <div className="flex text-yellow-400 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-700 italic mb-4">
                        "Auqli Nexus don change my business completely! The CSV converter don save me plenty time wey I
                        for dey use arrange my products one by one."
                      </p>
                      <div className="flex items-center mt-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                          O
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">Oluwaseun Adeyemi</p>
                          <p className="text-sm text-gray-500">Fashion Vendor, Lagos</p>
                        </div>
                      </div>
                    </div>

                    {/* More testimonials... */}
                  </motion.div>
                </div>

                {/* Manual navigation controls */}
                <div className="flex justify-center mt-4 space-x-2">
                  <button className="w-3 h-3 rounded-full bg-green-500 opacity-100"></button>
                  <button className="w-3 h-3 rounded-full bg-gray-300 hover:bg-green-500 transition-colors"></button>
                  <button className="w-3 h-3 rounded-full bg-gray-300 hover:bg-green-500 transition-colors"></button>
                  <button className="w-3 h-3 rounded-full bg-gray-300 hover:bg-green-500 transition-colors"></button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Tools Section - Redesigned with new title and enhanced visuals */}
          <section className="py-24 bg-gradient-to-b from-white to-gray-50" ref={toolsRef}>
            <div className="container mx-auto px-6">
              <motion.div
                className="text-center mb-16"
                initial="hidden"
                animate={toolsInView ? "visible" : "hidden"}
                variants={fadeIn}
              >
                <div className="inline-block mb-4 bg-[#16783a]/10 px-4 py-2 rounded-full">
                  <span className="text-[#16783a] font-medium">Supercharge Your Business</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 tracking-tight">
                  Auqli Nexus Suite Of Tools
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  A comprehensive toolkit designed to help Auqli sellers succeed in today's competitive marketplace.
                </p>
              </motion.div>

              {/* Available Now - Enhanced with better contrast and visual appeal */}
              <motion.div
                className="mb-20"
                initial="hidden"
                animate={toolsInView ? "visible" : "hidden"}
                variants={staggerContainer}
              >
                <div className="flex items-center justify-center mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-[#16783a]/20 to-transparent w-32 mr-4"></div>
                  <h3 className="text-xl font-semibold text-[#16783a]">Available Now</h3>
                  <div className="h-px bg-gradient-to-r from-transparent via-[#16783a]/20 to-transparent w-32 ml-4"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {/* Shopify to Auqli Converter */}
                  <motion.div
                    className="group"
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    variants={itemFadeIn}
                  >
                    <Card className="border-0 overflow-hidden shadow-lg rounded-2xl bg-gradient-to-br from-white to-[#f8fdf9] h-full">
                      <CardHeader className="bg-gradient-to-r from-[#16783a]/10 to-transparent border-b border-[#16783a]/10 p-6">
                        <div className="flex items-center">
                          <div className="bg-[#16783a] text-white p-3 rounded-xl mr-4 shadow-md">
                            <Download className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-xl text-gray-800">Shopify to Auqli Converter</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-gray-700 leading-relaxed">
                          Upload your Shopify CSV and instantly convert it to Auqli's format. No more formatting
                          headaches — get your products ready for Auqli in minutes.
                        </p>
                      </CardContent>
                      <CardFooter className="bg-transparent p-6 pt-0 mt-auto">
                        <Button
                          asChild
                          className="bg-[#16783a] hover:bg-[#225b35] text-white rounded-lg w-full md:w-auto"
                        >
                          <Link href="/converter" className="flex items-center justify-center">
                            Use Now <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>

                  {/* AI Copywriting Assistant - Now Available */}
                  <motion.div
                    className="group"
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    variants={itemFadeIn}
                  >
                    <Card className="border-0 overflow-hidden shadow-lg rounded-2xl bg-gradient-to-br from-white to-[#f0f0ff] h-full">
                      <CardHeader className="bg-gradient-to-r from-[#5466b5]/10 to-transparent border-b border-[#5466b5]/10 p-6">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-[#5466b5] to-[#8696ee] text-white p-3 rounded-xl mr-4 shadow-md">
                            <PenTool className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-gray-800">AI Copywriting Assistant</CardTitle>
                            <Badge className="mt-1 bg-gradient-to-r from-[#5466b5] to-[#8696ee] text-white border-0">
                              <Sparkles className="mr-1 h-3 w-3" /> AI Powered
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-gray-700 leading-relaxed">
                          Generate high-converting product descriptions, titles, and marketing copy in seconds with our
                          AI-powered copywriting assistant.
                        </p>
                      </CardContent>
                      <CardFooter className="bg-transparent p-6 pt-0 mt-auto">
                        <Button
                          asChild
                          className="bg-gradient-to-r from-[#5466b5] to-[#8696ee] hover:from-[#4355a4] hover:to-[#7585dd] text-white rounded-lg w-full md:w-auto"
                        >
                          <Link href="/copywriting" className="flex items-center justify-center">
                            Use AI CopyGen <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>

              {/* Coming Soon - Enhanced with better contrast and visual appeal */}
              <motion.div
                initial="hidden"
                animate={toolsInView ? "visible" : "hidden"}
                variants={staggerContainer}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-center mb-12">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-32 mr-4"></div>
                  <h3 className="text-xl font-semibold text-gray-700">Coming Soon</h3>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-32 ml-4"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {/* AI Product Search */}
                  <motion.div variants={itemFadeIn} className="group" whileHover={{ y: -5 }}>
                    <Card className="border border-gray-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl h-full bg-gradient-to-br from-white to-blue-50/30">
                      <CardHeader className="p-6 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl mr-4 shadow-sm">
                            <Search className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-gray-800">AI Product Search</CardTitle>
                            <Badge className="mt-1 bg-blue-500 text-white border-0">
                              <Sparkles className="mr-1 h-3 w-3" /> AI Powered
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-gray-700 leading-relaxed">
                          Discover trending products with AI-powered insights. Find the next bestsellers before your
                          competitors.
                        </p>
                      </CardContent>
                      <CardFooter className="p-6 pt-0 mt-auto">
                        <Button
                          disabled
                          className="w-full bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed rounded-xl py-4 hover:bg-gray-100"
                        >
                          Coming Soon
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>

                  {/* AI Import Connect */}
                  <motion.div variants={itemFadeIn} className="group" whileHover={{ y: -5 }}>
                    <Card className="border border-gray-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl h-full bg-gradient-to-br from-white to-amber-50/30">
                      <CardHeader className="p-6 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl mr-4 shadow-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4.01 13.61a5.4 5.4 0 0 0 7.65 0l.77-.78.77.78a5.4 5.4 0 0 0 7.65 0c2.12-2.12 2.24-5.7 0-7.83z"></path>
                            </svg>
                          </div>
                          <div>
                            <CardTitle className="text-xl text-gray-800">AI Import Connect</CardTitle>
                            <Badge className="mt-1 bg-amber-500 text-white border-0">
                              <Sparkles className="mr-1 h-3 w-3" /> AI Powered
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-gray-700 leading-relaxed">
                          Get matched with verified suppliers worldwide based on your specific product needs and
                          business requirements.
                        </p>
                      </CardContent>
                      <CardFooter className="p-6 pt-0 mt-auto">
                        <Button
                          disabled
                          className="w-full bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed rounded-xl py-4 hover:bg-gray-100"
                        >
                          Coming Soon
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>

                  {/* AI SocialGen (renamed from AI Social Post Creative) */}
                  <motion.div variants={itemFadeIn} className="group" whileHover={{ y: -5 }}>
                    <Card className="border border-gray-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl h-full bg-gradient-to-br from-white to-pink-50/30">
                      <CardHeader className="p-6 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="bg-pink-50 text-pink-600 p-3 rounded-xl mr-4 shadow-sm">
                            <Share2 className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-gray-800">AI SocialGen</CardTitle>
                            <Badge className="mt-1 bg-pink-500 text-white border-0">
                              <Sparkles className="mr-1 h-3 w-3" /> AI Powered
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-gray-700 leading-relaxed">
                          Turn your products into engaging, ready-to-share social content that drives engagement and
                          sales.
                        </p>
                      </CardContent>
                      <CardFooter className="p-6 pt-0 mt-auto">
                        <Button
                          disabled
                          className="w-full bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed rounded-xl py-4 hover:bg-gray-100"
                        >
                          Coming Soon
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 bg-gradient-to-r from-[#0a0f1a] to-[#16283a] text-white" ref={ctaRef}>
            <div className="container mx-auto px-6">
              <motion.div
                className="max-w-4xl mx-auto text-center"
                initial="hidden"
                animate={ctaInView ? "visible" : "hidden"}
                variants={fadeIn}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Supercharge Your Auqli Business?</h2>
                <p className="text-xl text-gray-300 mb-12 leading-relaxed">
                  Join thousands of sellers who are using Auqli Nexus to grow their businesses faster and smarter.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                  <Button
                    asChild
                    className="bg-[#16783a] hover:bg-[#225b35] text-white px-8 py-6 h-auto text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    <Link href="/converter" className="flex items-center">
                      Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        </main>
      </div>
    </PageLayout>
  )
}
