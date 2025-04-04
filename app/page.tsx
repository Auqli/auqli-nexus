"use client"

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
    </div>
  )
}

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

