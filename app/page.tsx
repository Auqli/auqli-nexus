"use client"

<<<<<<< HEAD
import type React from "react"

import { useState, useEffect } from "react"
import { Upload, Download, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ShopifySampleCSV } from "@/components/sample-csv"
import { AuqliLogo, AuqliSymbol } from "@/components/logo"
import { processCSV } from "./actions"
import { motion, AnimatePresence } from "framer-motion"

// Add these imports at the top
import { CategorySelectionModal } from "@/components/category-selection-modal"

// Update the Product interface to include additional image fields
interface Product {
  name: string
  price: string
  image: string
  description: string
  weight: string
  inventory: string
  condition: string
  mainCategory: string
  subCategory: string
  uploadStatus: string
  additionalImages: string[] // Store additional images
}

// Add these interfaces
interface AuqliCategory {
  id: string
  name: string
  subcategories: AuqliSubcategory[]
}

interface AuqliSubcategory {
  id: string
  name: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [platform, setPlatform] = useState<string>("shopify")
  const [showSample, setShowSample] = useState(true)

  // Animation for page load
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  // Add these state variables inside the Home component
  const [auqliCategories, setAuqliCategories] = useState<AuqliCategory[]>([])
  const [unmatchedProducts, setUnmatchedProducts] = useState<
    Array<{ id: string; name: string; mainCategory: string; subCategory: string }>
  >([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
=======
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { ArrowRight, Menu, X, Check, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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

// Benefits data
const benefits = [
  {
    title: "Save Hours of Work",
    description: "What used to take hours of manual formatting now happens in seconds with our automation.",
  },
  {
    title: "Reduce Errors",
    description: "Intelligent validation ensures your product data is Auqli-ready.",
  },
  {
    title: "Streamline Your Workflow",
    description: "Simplify your operations and focus on growing your business.",
  },
  {
    title: "Focus on Growth",
    description: "Spend less time on technical details, more time scaling your store.",
  },
]

// Stats data
const stats = [
  { value: "10,000+", endValue: 10000, label: "Products Processed" },
  { value: "500+", endValue: 500, label: "Active Sellers" },
  { value: "98%", endValue: 98, label: "Success Rate" },
  { value: "24/7", label: "Support" },
]

// Coming soon tools
const comingSoonTools = [
  {
    title: "AI Product Search",
    description: "Discover trending products with AI-powered insights.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 21L16.65 16.65"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "AI Import Connect",
    description: "Get matched with verified suppliers worldwide based on your needs.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 16L12 12L8 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 12V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M20.39 18.39C21.3653 17.8583 22.1358 17.0169 22.5799 15.9986C23.024 14.9804 23.1162 13.8432 22.8422 12.7667C22.5682 11.6901 21.9435 10.7355 21.0667 10.0534C20.1899 9.37138 19.1109 9.00073 18 9.00001H16.74C16.4373 7.82926 15.8731 6.74235 15.0899 5.82099C14.3067 4.89963 13.3248 4.16785 12.2181 3.68061C11.1114 3.19336 9.90856 2.96639 8.70012 3.01434C7.49169 3.06229 6.31379 3.38344 5.24911 3.95371C4.18444 4.52397 3.26105 5.32473 2.54978 6.29888C1.83851 7.27303 1.36021 8.39347 1.15142 9.57606C0.942631 10.7586 1.00824 11.9693 1.34393 13.1248C1.67961 14.2803 2.27932 15.3484 3.09999 16.24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "AI Copywriting Assistant",
    description: "Generate high-impact product descriptions and titles.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 19L19 12L22 15L15 22L12 19Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M2 2L9.586 9.586" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M11 13C12.1046 13 13 12.1046 13 11C13 9.89543 12.1046 9 11 9C9.89543 9 9 9.89543 9 11C9 12.1046 9.89543 13 11 13Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "AI Social Post Creative",
    description: "Turn your products into engaging, ready-to-share social content.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 15L16 10L5 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  // Refs for scroll animations
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const benefitsRef = useRef(null)
  const testimonialsRef = useRef(null)
  const toolsRef = useRef(null)
  const ctaRef = useRef(null)

  // InView hooks for animations
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const benefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" })
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" })
  const toolsInView = useInView(toolsRef, { once: true, margin: "-100px" })
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" })

  // Scroll animations
  const { scrollYProgress } = useScroll()
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0.98])
>>>>>>> master

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

<<<<<<< HEAD
  // Add this useEffect to fetch Auqli categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://auqliserver-8xr8zvib.b4a.run/api/public/categories")
        if (response.ok) {
          const data = await response.json()
          setAuqliCategories(data)
        }
      } catch (error) {
        console.error("Failed to fetch Auqli categories:", error)
      }
    }

    fetchCategories()
  }, [])

  // Update the handleFileUpload function to check for unmatched products
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("platform", platform)

      console.log("Uploading file:", file.name, "Size:", file.size, "Platform:", platform)

      const result = await processCSV(formData)

      if (result.error) {
        setError(result.error)
        setProducts([])
      } else if (result.products) {
        // Check for products with missing or default categories
        const unmatched = result.products
          .map((product, index) => ({
            id: `product-${index}`,
            name: product.name,
            mainCategory: product.mainCategory,
            subCategory: product.subCategory,
          }))
          .filter(
            (product) =>
              !product.mainCategory ||
              !product.subCategory ||
              product.mainCategory.includes("Uncategorized") ||
              product.subCategory.includes("Uncategorized"),
          )

        if (unmatched.length > 0) {
          setUnmatchedProducts(unmatched)
          setIsCategoryModalOpen(true)
        }

        setProducts(result.products)
      }
    } catch (err) {
      console.error("Error during upload:", err)
      setError("Failed to process the CSV file. Please check the format and try again.")
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Add this function to handle category selection from the modal
  const handleCategorySelection = (selectedCategories: {
    [productId: string]: { mainCategory: string; subCategory: string }
  }) => {
    // Update products with the selected categories
    setProducts((prevProducts) =>
      prevProducts.map((product, index) => {
        const productId = `product-${index}`
        if (selectedCategories[productId]) {
          return {
            ...product,
            mainCategory: selectedCategories[productId].mainCategory,
            subCategory: selectedCategories[productId].subCategory,
          }
        }
        return product
      }),
    )

    setIsCategoryModalOpen(false)
  }

  // Update the downloadFormattedCSV function to properly handle additional images in separate columns
  const downloadFormattedCSV = () => {
    if (products.length === 0) return

    // Find the maximum number of additional images across all products
    const maxAdditionalImages = products.reduce(
      (max, product) => Math.max(max, product.additionalImages?.length || 0),
      0,
    )

    // Create headers with exact names as required by Auqli
    const headers = [
      "product name",
      "product main price",
      "product main image",
      "product description",
      "product weight",
      "product inventory",
      "product condition",
      "product main category",
      "product subcategory",
      "upload status",
    ]

    // Add headers for additional images if any exist
    for (let i = 0; i < maxAdditionalImages; i++) {
      headers.push(`other image${i + 1}`)
    }

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...products.map((product) => {
        // Start with the main fields
        const row = [
          `"${(product.name || "").replace(/"/g, '""')}"`,
          `"${(product.price || "").replace(/"/g, '""')}"`,
          `"${(product.image || "").replace(/"/g, '""')}"`,
          `"${(product.description || "").replace(/"/g, '""')}"`,
          `"${(product.weight || "").replace(/"/g, '""')}"`,
          `"${(product.inventory || "").replace(/"/g, '""')}"`,
          `"${(product.condition || "").replace(/"/g, '""')}"`,
          `"${(product.mainCategory || "").replace(/"/g, '""')}"`,
          `"${(product.subCategory || "").replace(/"/g, '""')}"`,
          `"${(product.uploadStatus || "").replace(/"/g, '""')}"`,
        ]

        // Add additional images in separate columns
        for (let i = 0; i < maxAdditionalImages; i++) {
          const additionalImage =
            product.additionalImages && i < product.additionalImages.length ? product.additionalImages[i] : ""
          row.push(`"${additionalImage.replace(/"/g, '""')}"`)
        }

        return row.join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `auqli_formatted_${fileName || "products"}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleSampleVisibility = () => {
    setShowSample(!showSample)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d7f4db] to-[#e8f9ea]">
      {/* Remove the duplicate header and keep only the card header */}
      <main className="container mx-auto py-10 px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isPageLoaded ? 1 : 0, y: isPageLoaded ? 0 : 20 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden rounded-xl">
            <CardHeader className="bg-[#16783a] text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Auqli CSV Product Formatter</h2>
                  <p className="text-[#d7f4db] mt-1">Convert your e-commerce platform product data to Auqli format</p>
                </div>
                <AuqliSymbol />
              </div>
            </CardHeader>

            <div className="bg-[#111827] text-white">
              {/* Platform Tabs */}
              <div className="grid grid-cols-2 border-b border-gray-700">
                <button
                  onClick={() => setPlatform("shopify")}
                  className={`py-3 px-4 flex justify-center items-center transition-all duration-300 ${
                    platform === "shopify" ? "bg-[#16783a]" : "bg-[#111827] hover:bg-[#1a2235]"
                  }`}
                >
                  <span className="font-medium">Shopify</span>
                  <Badge className="ml-2 bg-[#45c133] text-white">Available</Badge>
                </button>
                <button
                  onClick={() => setPlatform("woocommerce")}
                  className={`py-3 px-4 flex justify-center items-center transition-all duration-300 ${
                    platform === "woocommerce" ? "bg-[#16783a]" : "bg-[#111827] hover:bg-[#1a2235]"
                  }`}
                >
                  <span className="font-medium">WooCommerce</span>
                  <Badge className="ml-2 bg-[#8696ee] text-white">Coming Soon</Badge>
                </button>
              </div>

              {/* Sample CSV */}
              <div className="p-6">
                {platform === "shopify" ? (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[#d7f4db]">
                        Upload your Shopify product export CSV file to convert it to Auqli format.
                      </p>
                      <button
                        onClick={toggleSampleVisibility}
                        className="text-sm text-[#45c133] hover:text-[#7fea89] transition-colors flex items-center"
                      >
                        {showSample ? "Hide Sample" : "Show Sample"}
                        {showSample ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showSample && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mb-4">
                            <p className="text-xs font-medium mb-2 text-[#45c133]">Sample Shopify CSV Format:</p>
                            <ShopifySampleCSV />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center py-10"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{
                        duration: 0.5,
                        type: "spring",
                        stiffness: 100,
                      }}
                    >
                      <div className="relative w-24 h-24 mb-6">
                        <motion.div
                          className="absolute inset-0 bg-[#8696ee] rounded-full opacity-20"
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            width="48"
                            height="48"
=======
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.header
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100"
        style={{ opacity: headerOpacity }}
      >
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#16783a] flex items-center">
            <div className="relative mr-2 w-8 h-8 bg-gradient-to-br from-[#16783a] to-[#45c133] rounded-lg flex items-center justify-center overflow-hidden">
              <Sparkles className="h-5 w-5 text-white absolute" />
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg"></div>
              <div className="relative z-10 text-white font-bold text-xl">N</div>
            </div>
            <span>Auqli Nexus</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-700 hover:text-[#16783a] transition-colors font-medium">
              Features
            </Link>
            <Link href="#testimonials" className="text-gray-700 hover:text-[#16783a] transition-colors font-medium">
              Testimonials
            </Link>
            <Link
              href="https://auqli.live"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-[#16783a] transition-colors font-medium"
            >
              Sell on Auqli
            </Link>
            <Link href="#" className="text-gray-700 hover:text-[#16783a] transition-colors font-medium">
              Contact
            </Link>
            <Button asChild className="bg-[#16783a] hover:bg-[#225b35] rounded-full px-6 py-2">
              <Link href="/converter">Use Converter</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-[#16783a] transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-b border-gray-100"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <Link
                href="#features"
                className="text-gray-700 hover:text-[#16783a] transition-colors py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-700 hover:text-[#16783a] transition-colors py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link
                href="https://auqli.live"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-[#16783a] transition-colors py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Sell on Auqli
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-[#16783a] transition-colors py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Button asChild className="bg-[#16783a] hover:bg-[#225b35] w-full rounded-full py-2">
                <Link href="/converter" onClick={() => setIsMenuOpen(false)}>
                  Use Converter
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </motion.header>

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
                The Auqli CSV Converter transforms your e-commerce product data into Auqli-ready format in seconds. Say
                goodbye to manual formatting and hello to seamless imports from Shopify and WooCommerce. Save hours of
                work with our intelligent mapping system that preserves all your product details.
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
                    required format. No more manual field mapping, formatting headaches, or lost product data — get your
                    entire catalog ready for Auqli in minutes, not hours.
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
                  <Button asChild className="bg-[#16783a] hover:bg-[#225b35] text-white rounded-full w-full md:w-auto">
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
                            t-shirt,Premium T-Shirt,&lt;p&gt;High-quality cotton
                            t-shirt&lt;/p&gt;,Auqli,T-Shirts,cotton,TRUE,https://example.com/tshirt.jpg
                          </div>
                          <div className="mb-1">
                            hoodie,Zip Hoodie,&lt;p&gt;Warm zip-up
                            hoodie&lt;/p&gt;,Auqli,Hoodies,cotton,TRUE,https://example.com/hoodie.jpg
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
                            Premium T-Shirt,29.99,https://example.com/tshirt.jpg,High-quality cotton t-shirt,0.25,100
                          </div>
                          <div className="mb-1">
                            Zip Hoodie,49.99,https://example.com/hoodie.jpg,Warm zip-up hoodie,0.5,75
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

        {/* Benefits Section */}
        <section className="py-24 bg-gray-50" ref={benefitsRef}>
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              animate={benefitsInView ? "visible" : "hidden"}
              variants={fadeIn}
            >
              <div className="inline-block mb-4 bg-[#16783a]/10 px-4 py-2 rounded-full">
                <span className="text-[#16783a] font-medium">Why Choose Auqli Nexus</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 tracking-tight">
                Benefits That Drive Your Business Forward
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our tools are designed to solve real problems for Auqli sellers, saving you time and helping you grow.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
              initial="hidden"
              animate={benefitsInView ? "visible" : "hidden"}
              variants={staggerContainer}
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-md border border-gray-100"
                  variants={itemFadeIn}
                >
                  <h3 className="text-xl font-semibold mb-3 text-[#16783a]">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              ))}
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
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 tracking-tight">What Our Sellers Say</h2>
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

                  {/* Testimonial 2 */}
                  <div className="flex-shrink-0 w-80 md:w-96 bg-white rounded-xl shadow-md p-6 border border-green-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4">
                      "The Auqli converter saved my business! I fit upload all my products for just 30 minutes instead
                      of 3 days wey e dey take me before."
                    </p>
                    <div className="flex items-center mt-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        C
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">Chioma Okafor</p>
                        <p className="text-sm text-gray-500">Beauty Supplier, Abuja</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 3 */}
                  <div className="flex-shrink-0 w-80 md:w-96 bg-white rounded-xl shadow-md p-6 border border-green-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4">
                      "Mo ti lo Auqli CSV converter fun osu meta, o ti gba mi la lopolopo. Ise to maa gba wakati meta,
                      mo ti le se ni iṣẹju marun-un."
                    </p>
                    <div className="flex items-center mt-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        T
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">Tunde Adebayo</p>
                        <p className="text-sm text-gray-500">Electronics Dealer, Ibadan</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 4 */}
                  <div className="flex-shrink-0 w-80 md:w-96 bg-white rounded-xl shadow-md p-6 border border-green-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4">
                      "The category mapping feature saved me so much time! I no longer need to manually assign
                      categories to each product."
                    </p>
                    <div className="flex items-center mt-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                        F
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">Folake Adeyemi</p>
                        <p className="text-sm text-gray-500">Home Goods, Port Harcourt</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 5 */}
                  <div className="flex-shrink-0 w-80 md:w-96 bg-white rounded-xl shadow-md p-6 border border-green-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < 4 ? "fill-current" : ""}`} />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4">
                      "E be like magic! I don dey sell pass 200 items for Auqli, and dis converter don save me like 10
                      hours every week. Na correct investment!"
                    </p>
                    <div className="flex items-center mt-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-bold">
                        K
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">Kunle Adebayo</p>
                        <p className="text-sm text-gray-500">Phone Accessories, Kano</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 6 */}
                  <div className="flex-shrink-0 w-80 md:w-96 bg-white rounded-xl shadow-md p-6 border border-green-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4">
                      "Mo ti lo ọpọlọpọ awọn ohun elo lori ayeluara, sugbon Auqli CSV converter ni o dara julọ. O ti gba
                      mi lati dagbasoke ile-ise mi."
                    </p>
                    <div className="flex items-center mt-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-bold">
                        A
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">Adebola Johnson</p>
                        <p className="text-sm text-gray-500">Fashion Designer, Lagos</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 7 */}
                  <div className="flex-shrink-0 w-80 md:w-96 bg-white rounded-xl shadow-md p-6 border border-green-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4">
                      "Since I start to use Auqli converter, my business don grow 3x. E dey very easy to upload all my
                      products for Auqli platform now."
                    </p>
                    <div className="flex items-center mt-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        B
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">Blessing Nwachukwu</p>
                        <p className="text-sm text-gray-500">Jewelry Seller, Enugu</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 8 */}
                  <div className="flex-shrink-0 w-80 md:w-96 bg-white rounded-xl shadow-md p-6 border border-green-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < 5 ? "fill-current" : ""}`} />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4">
                      "The automatic category mapping saved me days of manual work. This tool is essential for any
                      serious Auqli seller."
                    </p>
                    <div className="flex items-center mt-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                        D
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">David Okonkwo</p>
                        <p className="text-sm text-gray-500">Tech Retailer, Lagos</p>
                      </div>
                    </div>
                  </div>

                  {/* Duplicate first 4 testimonials to create seamless loop */}
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

                  {/* Duplicate testimonial 2 */}
                  <div className="flex-shrink-0 w-80 md:w-96 bg-white rounded-xl shadow-md p-6 border border-green-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4">
                      "The Auqli converter saved my business! I fit upload all my products for just 30 minutes instead
                      of 3 days wey e dey take me before."
                    </p>
                    <div className="flex items-center mt-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        C
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">Chioma Okafor</p>
                        <p className="text-sm text-gray-500">Beauty Supplier, Abuja</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Manual navigation controls */}
              <div className="flex justify-center mt-4 space-x-2">
                <button className="w-3 h-3 rounded-full bg-green-500 opacity-100"></button>
                <button className="w-3 h-3 rounded-full bg-gray-300 hover:bg-green-500 transition-colors"></button>
                <button className="w-3 h-3 rounded-full bg-gray-300 hover:bg-green-500 transition-colors"></button>
                <button className="w-3 h-3 rounded-full bg-gray-300 hover:bg-green-500 transition-colors"></button>
              </div>

              {/* No testimonial stats or CTA button here */}
            </motion.div>
          </div>
        </section>

        {/* Tools Section - Enhanced for better readability and visual appeal */}
        <section className="py-24 bg-gradient-to-b from-white to-gray-50" ref={toolsRef}>
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              animate={toolsInView ? "visible" : "hidden"}
              variants={fadeIn}
            >
              <div className="inline-block mb-4 bg-[#16783a]/10 px-4 py-2 rounded-full">
                <span className="text-[#16783a] font-medium">Our Roadmap</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 tracking-tight">
                Tools for Auqli Sellers — and Growing
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're just getting started. Here's what's available now and what's coming soon.
              </p>
            </motion.div>

            {/* Available Now - Enhanced with better contrast and visual appeal */}
            <motion.div
              className="mb-20"
              initial="hidden"
              animate={toolsInView ? "visible" : "hidden"}
              variants={fadeIn}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center mb-8">
                <div className="h-px bg-[#16783a]/20 w-16 mr-4"></div>
                <h3 className="text-xl font-semibold text-[#16783a]">Available Now</h3>
                <div className="h-px bg-[#16783a]/20 w-16 ml-4"></div>
              </div>

              <div className="max-w-4xl mx-auto">
                <motion.div
                  className="group"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Card className="border-0 overflow-hidden shadow-lg rounded-2xl bg-white">
                    <CardHeader className="bg-gradient-to-r from-[#16783a]/10 to-white border-b border-[#16783a]/10 p-8">
                      <div className="flex items-center">
                        <div className="bg-[#16783a] text-white p-4 rounded-xl mr-5 shadow-md">
                          <svg
                            width="24"
                            height="24"
>>>>>>> master
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
<<<<<<< HEAD
                              d="M12 2L2 7L12 12L22 7L12 2Z"
                              stroke="#8696ee"
=======
                              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                              stroke="currentColor"
>>>>>>> master
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
<<<<<<< HEAD
                              d="M2 17L12 22L22 17"
                              stroke="#8696ee"
=======
                              d="M7 10L12 15L17 10"
                              stroke="currentColor"
>>>>>>> master
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
<<<<<<< HEAD
                              d="M2 12L12 17L22 12"
                              stroke="#8696ee"
=======
                              d="M12 15V3"
                              stroke="currentColor"
>>>>>>> master
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
<<<<<<< HEAD
                      </div>
                    </motion.div>

                    <motion.h3
                      className="text-2xl font-bold text-white mb-3"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      WooCommerce Integration Coming Soon
                    </motion.h3>

                    <motion.p
                      className="text-gray-400 text-center max-w-md mb-6"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      We're working hard to bring WooCommerce support to the Auqli CSV Product Formatter. Stay tuned for
                      updates!
                    </motion.p>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <Button
                        onClick={() => setPlatform("shopify")}
                        className="bg-[#8696ee] hover:bg-[#5466b5] text-white transition-all duration-300"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Switch to Shopify
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>

            <CardContent className="bg-[#111827] p-6">
              {platform === "shopify" ? (
                <motion.div
                  className="flex flex-col items-center justify-center bg-[#0c1322] border border-gray-700 rounded-lg p-8 text-center"
                  whileHover={{ boxShadow: "0 0 15px rgba(22, 120, 58, 0.3)" }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="mb-4 rounded-full bg-[#16783a] p-3"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Upload className="h-6 w-6 text-white" />
                  </motion.div>
                  <h3 className="mb-2 text-lg font-semibold text-white">Upload your CSV file</h3>
                  <p className="mb-4 text-sm text-gray-400 max-w-xs">
                    Select your Shopify product export file to convert to Auqli format
                  </p>
                  <div className="w-full max-w-xs">
                    <Button
                      className="w-full bg-[#16783a] hover:bg-[#225b35] text-white transition-all duration-300 transform hover:scale-105"
                      disabled={isLoading}
                      asChild
                    >
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          "Choose File"
                        )}
                        <input
                          id="file-upload"
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={isLoading}
                        />
                      </label>
                    </Button>

                    {fileName && !isLoading && (
                      <motion.p
                        className="mt-2 text-sm text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        Selected: <span className="text-white">{fileName}</span>
                      </motion.p>
                    )}
                    {!fileName && !isLoading && <p className="mt-2 text-sm text-gray-400">No file chosen</p>}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="flex flex-col items-center justify-center bg-[#0c1322] border border-gray-700 rounded-lg p-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="mb-6"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="relative">
                      <div className="absolute -top-6 -right-6">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, 0, -5, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8696ee] text-[10px] font-bold text-white">
                            SOON
                          </span>
                        </motion.div>
                      </div>
                      <div className="rounded-full bg-[#1a2235] p-5">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M21 16V8.00002C20.9996 7.6493 20.9071 7.30483 20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L13 2.27002C12.696 2.09449 12.3511 2.00208 12 2.00208C11.6489 2.00208 11.304 2.09449 11 2.27002L4 6.27002C3.69626 6.44539 3.44398 6.69754 3.26846 7.00119C3.09294 7.30483 3.00036 7.6493 3 8.00002V16C3.00036 16.3508 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5547 4 17.73L11 21.73C11.304 21.9056 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9056 13 21.73L20 17.73C20.3037 17.5547 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3508 21 16Z"
                            stroke="#8696ee"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3.27002 6.96002L12 12L20.73 6.96002"
                            stroke="#8696ee"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 22.08V12"
                            stroke="#8696ee"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  <h3 className="text-xl font-bold text-white mb-4">WooCommerce Integration Coming Soon</h3>

                  <p className="text-gray-400 text-center max-w-md mb-8">
                    We're currently developing WooCommerce support for the Auqli CSV Product Formatter. Check back soon
                    for this exciting new feature!
                  </p>

                  <div className="flex space-x-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => setPlatform("shopify")}
                        className="bg-[#8696ee] hover:bg-[#5466b5] text-white"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Shopify
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a href="https://auqli.com/contact" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="border-[#8696ee] text-[#8696ee] hover:bg-[#8696ee]/10">
                          Get Notified
                        </Button>
                      </a>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="mt-6">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            <AnimatePresence>
              {products.length > 0 && (
                <motion.div
                  className="bg-[#111827] px-6 pb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="overflow-x-auto bg-[#0c1322] rounded-lg border border-gray-700">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="text-lg font-semibold text-white">Formatted Products for Auqli</h3>
                      <p className="text-sm text-gray-400">Preview of your converted product data</p>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            <TableHead className="text-[#d7f4db]">product name</TableHead>
                            <TableHead className="text-[#d7f4db]">product main price</TableHead>
                            <TableHead className="text-[#d7f4db]">product main image</TableHead>
                            <TableHead className="text-[#d7f4db]">product description</TableHead>
                            <TableHead className="text-[#d7f4db]">product weight</TableHead>
                            <TableHead className="text-[#d7f4db]">product inventory</TableHead>
                            <TableHead className="text-[#d7f4db]">product condition</TableHead>
                            <TableHead className="text-[#d7f4db]">product main category</TableHead>
                            <TableHead className="text-[#d7f4db]">product subcategory</TableHead>
                            <TableHead className="text-[#d7f4db]">upload status</TableHead>
                            <TableHead className="text-[#d7f4db]">other image1</TableHead>
                            <TableHead className="text-[#d7f4db]">other image2</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.slice(0, 5).map((product, index) => (
                            <TableRow key={index} className="border-gray-700 hover:bg-[#1a2235] transition-colors">
                              <TableCell className="font-medium text-white">{product.name}</TableCell>
                              <TableCell className="text-gray-300">{product.price}</TableCell>
                              <TableCell className="max-w-[100px] truncate text-gray-300">{product.image}</TableCell>
                              <TableCell className="max-w-[150px] truncate text-gray-300">
                                {product.description}
                              </TableCell>
                              <TableCell className="text-gray-300">{product.weight}</TableCell>
                              <TableCell className="text-gray-300">{product.inventory}</TableCell>
                              <TableCell className="text-gray-300">{product.condition}</TableCell>
                              <TableCell className="text-gray-300">{product.mainCategory}</TableCell>
                              <TableCell className="text-gray-300">{product.subCategory}</TableCell>
                              <TableCell className="text-gray-300">{product.uploadStatus}</TableCell>
                              <TableCell className="max-w-[100px] truncate text-gray-300">
                                {product.additionalImages && product.additionalImages.length > 0
                                  ? product.additionalImages[0]
                                  : ""}
                              </TableCell>
                              <TableCell className="max-w-[100px] truncate text-gray-300">
                                {product.additionalImages && product.additionalImages.length > 1
                                  ? product.additionalImages[1]
                                  : ""}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {products.length > 5 && (
                        <p className="text-sm text-gray-400 mt-4 p-2">
                          Showing 5 of {products.length} products. Download to see all.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {products.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <CardFooter className="flex justify-end bg-[#111827] p-6 pt-0">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={downloadFormattedCSV}
                        className="bg-[#16783a] hover:bg-[#225b35] text-white transition-colors"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Auqli Formatted CSV
                      </Button>
                    </motion.div>
                  </CardFooter>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isPageLoaded ? 1 : 0, y: isPageLoaded ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="mt-8 border-0 shadow-xl overflow-hidden rounded-xl">
              <CardHeader className="bg-[#16783a] text-white p-6">
                <h2 className="text-xl font-bold">Field Mapping</h2>
                <p className="text-[#d7f4db] mt-1">
                  {platform === "shopify"
                    ? "How Shopify fields are mapped to Auqli format"
                    : "WooCommerce field mapping coming soon"}
                </p>
              </CardHeader>
              <CardContent className="bg-[#111827] p-6">
                {platform === "shopify" ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-[#d7f4db] w-1/2">Auqli Field</TableHead>
                          <TableHead className="text-[#d7f4db] w-1/2">Shopify Field</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-gray-700 hover:bg-[#1a2235] transition-colors">
                          <TableCell className="font-medium text-white">product name</TableCell>
                          <TableCell className="text-gray-300">Title</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700 hover:bg-[#1a2235] transition-colors">
                          <TableCell className="font-medium text-white">product main price</TableCell>
                          <TableCell className="text-gray-300">Variant Price</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700 hover:bg-[#1a2235] transition-colors">
                          <TableCell className="font-medium text-white">product main image</TableCell>
                          <TableCell className="text-gray-300">Image Src (first image)</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700 hover:bg-[#1a2235] transition-colors">
                          <TableCell className="font-medium text-white">other image1, other image2, etc.</TableCell>
                          <TableCell className="text-gray-300">Additional Image Src entries</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700 hover:bg-[#1a2235] transition-colors">
                          <TableCell className="font-medium text-white">product description</TableCell>
                          <TableCell className="text-gray-300">Body (HTML)</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700 hover:bg-[#1a2235] transition-colors">
                          <TableCell className="font-medium text-white">product weight</TableCell>
                          <TableCell className="text-gray-300">Variant Grams (converted to kg)</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700 hover:bg-[#1a2235] transition-colors">
                          <TableCell className="font-medium text-white">product inventory</TableCell>
                          <TableCell className="text-gray-300">Variant Inventory Qty</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700 hover:bg-[#1a2235] transition-colors">
                          <TableCell className="font-medium text-white">product condition</TableCell>
                          <TableCell className="text-gray-300">
                            Google Shopping / Condition (mapped to "New" or "Fairly Used")
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700 hover:bg-[#1a2235] transition-colors">
                          <TableCell className="font-medium text-white">product main category</TableCell>
                          <TableCell className="text-gray-300">
                            Smart matching based on product name and description (fallback to Product Category)
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700 hover:bg-[#1a2235] transition-colors">
                          <TableCell className="font-medium text-white">product subcategory</TableCell>
                          <TableCell className="text-gray-300">
                            Smart matching based on product name and description (fallback to Type)
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700 hover:bg-[#1a2235] transition-colors">
                          <TableCell className="font-medium text-white">upload status</TableCell>
                          <TableCell className="text-gray-300">Status</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                      className="mb-6"
                    >
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                          stroke="#8696ee"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
                          stroke="#8696ee"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18.5 7.5H18.51"
                          stroke="#8696ee"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>

                    <h3 className="text-xl font-bold text-white mb-4">WooCommerce Field Mapping Coming Soon</h3>

                    <p className="text-gray-400 text-center max-w-md">
                      We're working on comprehensive field mapping for WooCommerce products. This will ensure seamless
                      conversion from WooCommerce to Auqli format.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      <footer className="bg-[#111827] text-white py-6 mt-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <AuqliLogo />
              <p className="text-sm text-gray-400 mt-2">Convert your e-commerce product data to Auqli format</p>
            </div>
            <div className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Auqli. All rights reserved.</div>
          </div>
        </div>
      </footer>
      <CategorySelectionModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleCategorySelection}
        unmatchedProducts={unmatchedProducts}
        auqliCategories={auqliCategories}
      />
=======
                        <CardTitle className="text-2xl text-gray-800">Shopify to Auqli Converter</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <p className="text-gray-700 text-lg leading-relaxed">
                        Upload your Shopify CSV and instantly convert it to Auqli's format. No more formatting headaches
                        — get your products ready for Auqli in minutes.
                      </p>
                    </CardContent>
                    <CardFooter className="bg-white p-8 pt-0">
                      <Button
                        asChild
                        className="bg-[#16783a] hover:bg-[#225b35] text-white rounded-full w-full md:w-auto"
                      >
                        {" "}
                        <Link href="/converter" className="flex items-center justify-center">
                          Use Now <ArrowRight className="ml-2 h-5 w-5" />
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
                <div className="h-px bg-gray-300 w-16 mr-4"></div>
                <h3 className="text-xl font-semibold text-gray-700">Coming Soon</h3>
                <div className="h-px bg-gray-300 w-16 ml-4"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* AI Product Search */}
                <motion.div variants={itemFadeIn} className="group">
                  <Card className="border border-gray-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl h-full bg-white">
                    <CardHeader className="p-6 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl mr-4 shadow-sm">
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
                          >
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                          </svg>
                        </div>
                        <CardTitle className="text-xl text-gray-800">AI Product Search</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-700 leading-relaxed">
                        Discover trending products with AI-powered insights.
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
                <motion.div variants={itemFadeIn} className="group">
                  <Card className="border border-gray-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl h-full bg-white">
                    <CardHeader className="p-6 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="bg-amber-50 text-amber-600 p-3 rounded-xl mr-4 shadow-sm">
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
                          >
                            <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4.01 13.61a5.4 5.4 0 0 0 7.65 0l.77-.78.77.78a5.4 5.4 0 0 0 7.65 0c2.12-2.12 2.24-5.7 0-7.83z"></path>
                          </svg>
                        </div>
                        <CardTitle className="text-xl text-gray-800">AI Import Connect</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-700 leading-relaxed">
                        Get matched with verified suppliers worldwide based on your needs.
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

                {/* AI Copywriting Assistant */}
                <motion.div variants={itemFadeIn} className="group">
                  <Card className="border border-gray-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl h-full bg-white">
                    <CardHeader className="p-6 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="bg-violet-50 text-violet-600 p-3 rounded-xl mr-4 shadow-sm">
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
                          >
                            <path d="M12 19l7-7-3-3-4 4-4-4-3 3 7 7z"></path>
                            <path d="M18 13L16.5 5.5 2 2l3.5 14.5L13 18l5-5z"></path>
                            <circle cx="11" cy="11" r="2"></circle>
                          </svg>
                        </div>
                        <CardTitle className="text-xl text-gray-800">AI Copywriting Assistant</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-700 leading-relaxed">
                        Generate high-impact product descriptions and titles.
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

                {/* AI Social Post Creative */}
                <motion.div variants={itemFadeIn} className="group">
                  <Card className="border border-gray-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl h-full bg-white">
                    <CardHeader className="p-6 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="bg-pink-50 text-pink-600 p-3 rounded-xl mr-4 shadow-sm">
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
                          >
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="10" r="1.5"></circle>
                            <path d="m21 15-5-5L5 21"></path>
                          </svg>
                        </div>
                        <CardTitle className="text-xl text-gray-800">AI Social Post Creative</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-700 leading-relaxed">
                        Turn your products into engaging, ready-to-share social content.
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

        {/* Call to Action Section */}
        <section className="py-32 bg-[#16783a]" ref={ctaRef}>
          <div className="container mx-auto px-6 text-center">
            <motion.div initial="hidden" animate={ctaInView ? "visible" : "hidden"} variants={fadeIn}>
              <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">
                Ready to Experience More Sales with Live Selling?
              </h2>
              <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
                Join the future of e-commerce with Auqli's live selling platform. Connect with customers in real-time
                and boost your conversion rates.
              </p>
              <Button
                asChild
                className="bg-white text-[#16783a] hover:bg-gray-100 px-8 py-6 h-auto text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <a href="https://www.auqli.live/sell" target="_blank" rel="noopener noreferrer">
                  Apply to Sell on Auqli
                </a>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div className="col-span-1 md:col-span-1">
                <Link href="/" className="text-2xl font-bold text-white flex items-center mb-6">
                  <div className="relative mr-2 w-8 h-8 bg-gradient-to-br from-[#16783a] to-[#45c133] rounded-lg flex items-center justify-center overflow-hidden">
                    <Sparkles className="h-5 w-5 text-white absolute" />
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg"></div>
                    <div className="relative z-10 text-white font-bold text-xl">N</div>
                  </div>
                  <span>Auqli Nexus</span>
                </Link>
                <p className="text-gray-400 mb-6">
                  Tools and resources to help Auqli sellers succeed with live commerce.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://twitter.com/auqli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
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
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/auqli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
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
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/auqli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
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
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Tools</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/converter" className="text-gray-400 hover:text-white transition-colors">
                      CSV Converter
                    </Link>
                  </li>
                  <li>
                    <span className="text-gray-500 flex items-center">
                      AI Product Search
                      <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">Soon</span>
                    </span>
                  </li>
                  <li>
                    <span className="text-gray-500 flex items-center">
                      AI Copywriting
                      <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">Soon</span>
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://www.auqli.live/blog"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.auqli.live/help"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.auqli.live/sell"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Become a Seller
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://www.auqli.live/about"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.auqli.live/contact"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.auqli.live/careers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Careers
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} Auqli Nexus. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-4 md:space-x-6">
                <a
                  href="https://www.auqli.live/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white text-sm transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="https://www.auqli.live/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white text-sm transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="https://www.auqli.live/cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white text-sm transition-colors"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
>>>>>>> master
    </div>
  )
}

<<<<<<< HEAD
// Missing components
function ChevronUp(props: any) {
  return (
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
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

function ChevronDown(props: any) {
  return (
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

=======
>>>>>>> master
