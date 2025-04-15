"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Upload, ChevronLeft, X, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShopifySampleCSV } from "@/components/sample-csv"
import { CategorySelectionModal } from "@/components/category-selection-modal"
import { InvalidCSVModal } from "@/components/invalid-csv-modal"
import { EnhancedPageHeader } from "@/components/layout/enhanced-page-header"

// Define interfaces
interface Product {
  id: string
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
  additionalImages: string[]
  isCategorized?: boolean
}

interface AuqliSubcategory {
  id: string
  name: string
}

interface AuqliCategory {
  id: string
  name: string
  subcategories: AuqliSubcategory[]
}

interface UnmatchedProduct {
  id: string
  name: string
  mainCategory: string
  subCategory: string
}

// Expected Shopify CSV headers
const EXPECTED_SHOPIFY_HEADERS = [
  "handle",
  "title",
  "body (html)",
  "vendor",
  "product category",
  "type",
  "tags",
  "published",
  "image src",
]

export default function ConverterPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [platform, setPlatform] = useState("shopify")
  const [showSample, setShowSample] = useState(false)
  const [showInvalidCSVModal, setShowInvalidCSVModal] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [auqliCategories, setAuqliCategories] = useState<AuqliCategory[]>([])
  const [unmatchedProducts, setUnmatchedProducts] = useState<UnmatchedProduct[]>([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [matchedCategories, setMatchedCategories] = useState(0)
  const [hasUncategorizedProducts, setHasUncategorizedProducts] = useState(false)
  const [isAuqliFormatted, setIsAuqliFormatted] = useState(false)
  const [auqliFormatMessage, setAuqliFormatMessage] = useState<string | null>(null)
  const [allCategoriesMatched, setAllCategoriesMatched] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [processedItems, setProcessedItems] = useState(0)

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  // Add this useEffect to fetch Auqli categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://auqliserver-8xr8zvib.b4a.run/api/public/categories")
        if (response.ok) {
          const data = await response.json()

          // Validate the data structure before setting state
          if (Array.isArray(data)) {
            // Transform the API response to match our expected structure
            const validatedCategories = data.map((category) => {
              // Check if the category has subcategories or subCategories (handle both formats)
              const subCats = category.subcategories || category.subCategories || []

              return {
                id: category.id || `cat-${Math.random().toString(36).substr(2, 9)}`,
                name: category.name || "Unnamed Category",
                subcategories: Array.isArray(subCats)
                  ? subCats.map((sub) => ({
                      id: sub.id || `subcat-${Math.random().toString(36).substr(2, 9)}`,
                      name: sub.name || "Unnamed Subcategory",
                    }))
                  : [],
              }
            })

            console.log("Processed categories:", validatedCategories)
            setAuqliCategories(validatedCategories)
          } else {
            console.error("Invalid categories data format:", data)
            setAuqliCategories([])
          }
        }
      } catch (error) {
        console.error("Failed to fetch Auqli categories:", error)
        setAuqliCategories([])
      }
    }

    fetchCategories()
  }, [])

  // Function to validate if a CSV file matches the Shopify template format
  const validateShopifyCSV = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        const content = event.target?.result as string
        if (!content) {
          resolve(false)
          return
        }

        // Get the first line (headers) and convert to lowercase for case-insensitive comparison
        const lines = content.split("\n")
        if (lines.length === 0) {
          resolve(false)
          return
        }

        const headers = lines[0].toLowerCase().split(",")

        // Check if the required Shopify headers are present
        const hasRequiredHeaders = EXPECTED_SHOPIFY_HEADERS.some((header) =>
          headers.some((h) => h.trim().replace(/"/g, "") === header),
        )

        resolve(hasRequiredHeaders)
      }

      reader.onerror = () => {
        resolve(false)
      }

      reader.readAsText(file)
    })
  }

  // Helper function to check if a product is properly categorized
  const isProductCategorized = useCallback((product: Product): boolean => {
    return (
      !!product.mainCategory &&
      !!product.subCategory &&
      !product.mainCategory.includes("Uncategorized") &&
      !product.subCategory.includes("Uncategorized")
    )
  }, [])

  // Helper function to update the categorization status of all products
  const updateCategorizationStatus = useCallback(() => {
    if (products.length === 0) {
      setMatchedCategories(0)
      setTotalProducts(0)
      setHasUncategorizedProducts(false)
      setAllCategoriesMatched(false)
      return
    }

    const categorizedProducts = products.filter(isProductCategorized)
    setMatchedCategories(categorizedProducts.length)
    setTotalProducts(products.length)

    const uncategorized = products.length - categorizedProducts.length
    setHasUncategorizedProducts(uncategorized > 0)
    setAllCategoriesMatched(uncategorized === 0)

    console.log(`Categorization status updated: ${categorizedProducts.length}/${products.length} categorized`)
  }, [products, isProductCategorized])

  // Update the handleFileUpload function to validate the CSV format
  // Update the handleFileUpload function to count actual items
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsLoading(true)
    setError(null)
    setAllCategoriesMatched(false)
    setHasUncategorizedProducts(false)
    setTotalItems(0)
    setProcessedItems(0)

    // Validate if the file is a Shopify CSV template
    const isValidShopifyCSV = await validateShopifyCSV(file)

    if (!isValidShopifyCSV) {
      setIsLoading(false)
      setShowInvalidCSVModal(true)
      return
    }

    try {
      // First, count the number of items in the CSV file
      const itemCount = await countCSVItems(file)
      setTotalItems(itemCount)
      console.log(`Found ${itemCount} items in CSV file`)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("platform", platform)

      console.log("Uploading file:", file.name, "Size:", file.size, "Platform:", platform)

      // Start with 0 processed items
      setProcessedItems(0)
      setProcessingProgress(0)

      // Set up a progress tracker
      const progressTracker = setInterval(() => {
        setProcessedItems((prev) => {
          // Increment processed items, but don't exceed total
          const newValue = Math.min(prev + Math.floor(Math.random() * 5) + 1, itemCount)
          // Update progress percentage based on actual processed items
          setProcessingProgress((newValue / itemCount) * 100)
          return newValue
        })
      }, 100)

      const result = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      }).then((res) => res.json())

      // Clear the progress tracker
      clearInterval(progressTracker)

      if (result.error) {
        setError(result.error)
        setProducts([])
      } else if (result.products) {
        // Complete the progress to 100%
        setProcessedItems(itemCount)
        setProcessingProgress(100)

        // Check if the file is already in Auqli format
        if (result.isAuqliFormatted) {
          setIsAuqliFormatted(true)
          setAuqliFormatMessage(result.message || "This file appears to be already formatted for Auqli.")

          // Add IDs to products for better tracking
          const productsWithIds = result.products.map((product: any, index: number) => ({
            ...product,
            id: `product-${index}`,
            isCategorized: true, // Auqli formatted products are already categorized
          }))

          // Handle Auqli-formatted file
          setProducts(productsWithIds)
          setTotalProducts(productsWithIds.length)
          setMatchedCategories(productsWithIds.length) // All products are considered categorized
          setHasUncategorizedProducts(false)
          setAllCategoriesMatched(true)

          // Display a success message
          setError(null)
        } else {
          setIsAuqliFormatted(false)
          setAuqliFormatMessage(null)

          // Add IDs and categorization status to products
          const productsWithIds = result.products.map((product: any, index: number) => {
            const isCategorized =
              !!product.mainCategory &&
              !!product.subCategory &&
              !product.mainCategory.includes("Uncategorized") &&
              !product.subCategory.includes("Uncategorized")

            return {
              ...product,
              id: `product-${index}`,
              isCategorized,
            }
          })

          // Handle regular file conversion
          setTotalProducts(productsWithIds.length)

          // Count products with matched categories (not Uncategorized)
          const matched = productsWithIds.filter((product: Product) => product.isCategorized).length

          setMatchedCategories(matched)
          setAllCategoriesMatched(matched === productsWithIds.length)
          setHasUncategorizedProducts(matched < productsWithIds.length)

          // Check for products with missing or default categories
          const unmatched = productsWithIds
            .filter((product: Product) => !product.isCategorized)
            .map((product: Product) => ({
              id: product.id,
              name: product.name,
              mainCategory: product.mainCategory,
              subCategory: product.subCategory,
            }))

          if (unmatched.length > 0) {
            setUnmatchedProducts(unmatched)
            setIsCategoryModalOpen(true)
          }

          setProducts(productsWithIds)
        }
      }
    } catch (err) {
      console.error("Error during upload:", err)
      setError("Failed to process the CSV file. Please check the format and try again.")
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Add a function to count the actual number of items in the CSV file
  const countCSVItems = async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        const content = event.target?.result as string
        if (!content) {
          resolve(0)
          return
        }

        // Split by newlines and count rows (excluding header)
        const lines = content.split("\n").filter((line) => line.trim().length > 0)

        // Subtract 1 for the header row, but ensure we don't return a negative number
        const itemCount = Math.max(0, lines.length - 1)
        resolve(itemCount)
      }

      reader.onerror = () => {
        resolve(0)
      }

      reader.readAsText(file)
    })
  }

  // Add function to reset the file
  const resetFile = () => {
    setFileName(null)
    setProducts([])
    setProcessingProgress(0)
    setTotalProducts(0)
    setMatchedCategories(0)
    setHasUncategorizedProducts(false)
    setAllCategoriesMatched(false)
    setError(null)
    setTotalItems(0)
    setProcessedItems(0)
  }

  // Add this function to handle category selection from the modal
  const handleCategorySelection = (selectedCategories: {
    [productId: string]: { mainCategory: string; subCategory: string }
  }) => {
    // Update products with the selected categories
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (selectedCategories[product.id]) {
          const mainCategory = selectedCategories[product.id].mainCategory
          const subCategory = selectedCategories[product.id].subCategory

          const isCategorized =
            !!mainCategory &&
            !!subCategory &&
            !mainCategory.includes("Uncategorized") &&
            !subCategory.includes("Uncategorized")

          return {
            ...product,
            mainCategory,
            subCategory,
            isCategorized,
          }
        }
        return product
      }),
    )

    // Use a callback to ensure we're working with the updated products
    setProducts((currentProducts) => {
      // Count properly categorized products
      const categorizedCount = currentProducts.filter(
        (product) =>
          !!product.mainCategory &&
          !!product.subCategory &&
          !product.mainCategory.includes("Uncategorized") &&
          !product.subCategory.includes("Uncategorized"),
      ).length

      // Update matched categories count
      setMatchedCategories(categorizedCount)

      // Check if all products are now categorized
      const allCategorized = categorizedCount === currentProducts.length
      setHasUncategorizedProducts(!allCategorized)
      setAllCategoriesMatched(allCategorized)

      console.log(
        `After category selection: ${categorizedCount}/${currentProducts.length} categorized, allMatched: ${allCategorized}`,
      )

      return currentProducts
    })

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

  // Add this to the existing handleUploadSuccess function in app/page.tsx
  const handleUploadSuccess = (products: Product[], isAuqliFormatted = false) => {
    // Add IDs to products for better tracking
    const productsWithIds = products.map((product, index) => {
      const isCategorized =
        !!product.mainCategory &&
        !!product.subCategory &&
        !product.mainCategory.includes("Uncategorized") &&
        !product.subCategory.includes("Uncategorized")

      return {
        ...product,
        id: `product-${index}`,
        isCategorized,
      }
    })

    setProducts(productsWithIds)
    setError(null)

    // If the file is already in Auqli format, we don't need to check for categories
    if (isAuqliFormatted) {
      setTotalProducts(productsWithIds.length)
      setMatchedCategories(productsWithIds.length) // All products are considered categorized
      setHasUncategorizedProducts(false)
      setAllCategoriesMatched(true)
      return
    }

    // Count products with matched categories (not Uncategorized)
    const matched = productsWithIds.filter((product) => product.isCategorized).length

    setMatchedCategories(matched)
    setTotalProducts(productsWithIds.length)
    setAllCategoriesMatched(matched === productsWithIds.length)
    setHasUncategorizedProducts(matched < productsWithIds.length)

    // Check for products with missing or default categories
    const unmatched = productsWithIds
      .filter((product) => !product.isCategorized)
      .map((product) => ({
        id: product.id,
        name: product.name,
        mainCategory: product.mainCategory,
        subCategory: product.subCategory,
      }))

    if (unmatched.length > 0) {
      setUnmatchedProducts(unmatched)
      setIsCategoryModalOpen(true)
    }
  }

  // Effect to update categorization status whenever products change
  useEffect(() => {
    updateCategorizationStatus()
  }, [products, updateCategorizationStatus])

  return (
    <>
      <EnhancedPageHeader
        title="CSV Product Formatter"
        description="Transform your Shopify product data into Auqli-ready format with just a few clicks."
      >
        <div className="inline-block mb-4 bg-[#16783a]/10 px-4 py-2 rounded-full">
          <span className="text-[#16783a] font-medium">Save hours of manual formatting work</span>
        </div>
      </EnhancedPageHeader>

      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isPageLoaded ? 1 : 0, y: isPageLoaded ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border shadow-md overflow-hidden rounded-md">
              <CardHeader className="bg-[#16783a] text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Auqli CSV Product Formatter</h2>
                    <p className="text-white/90 mt-1">Convert your e-commerce platform product data to Auqli format</p>
                  </div>
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
                          {showSample ? (
                            <ChevronUpIcon className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="ml-1 h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Set showSample to false by default */}
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
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 2L2 7L12 12L22 7L12 2Z"
                                stroke="#8696ee"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2 17L12 22L22 17"
                                stroke="#8696ee"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2 12L12 17L22 12"
                                stroke="#8696ee"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
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
                        We're working hard to bring WooCommerce support to the Auqli CSV Product Formatter. Stay tuned
                        for updates!
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
                      {fileName && !isLoading ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-[#1a2235] px-3 py-2 rounded-md">
                            <span className="text-sm text-white truncate max-w-[180px]">{fileName}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2a3245]"
                              onClick={resetFile}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex space-x-2">
                            <Button className="flex-1 bg-[#16783a] hover:bg-[#225b35] text-white" asChild>
                              <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex items-center justify-center py-2"
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                <span>Upload Another CSV</span>
                                <input
                                  id="file-upload"
                                  type="file"
                                  accept=".csv"
                                  className="hidden"
                                  onChange={handleFileUpload}
                                />
                              </label>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          className="w-full bg-[#16783a] hover:bg-[#225b35] text-white"
                          disabled={isLoading}
                          asChild
                        >
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex items-center justify-center py-2.5"
                          >
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
                              <span className="flex items-center">
                                <Upload className="mr-2 h-4 w-4" />
                                Choose File
                              </span>
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
                    {/* WooCommerce content */}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Invalid CSV Modal */}
      <InvalidCSVModal isOpen={showInvalidCSVModal} onClose={() => setShowInvalidCSVModal(false)} />

      <CategorySelectionModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false)
          updateCategorizationStatus()
        }}
        onSave={handleCategorySelection}
        unmatchedProducts={unmatchedProducts}
        auqliCategories={auqliCategories}
      />
    </>
  )
}

// Helper components
function ChevronUpIcon(props: any) {
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

function ChevronDownIcon(props: any) {
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
