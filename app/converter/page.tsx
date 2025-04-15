"use client"

import { useState, useEffect, useRef } from "react"
import { Upload, ChevronLeft, X, RefreshCw, Download, AlertTriangle, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShopifySampleCSV } from "@/components/sample-csv"
import { EnhancedPageHeader } from "@/components/layout/enhanced-page-header"
import { AuqliFormatAlert } from "@/components/auqli-format-alert"
import { ProgressAnimation } from "@/components/progress-animation"
import { CategorySelectionModal } from "@/components/category-selection-modal"
import { InvalidCSVModal } from "@/components/invalid-csv-modal"

export default function ConverterPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [platform, setPlatform] = useState("shopify")
  const [showSample, setShowSample] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [isAuqliFormatted, setIsAuqliFormatted] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [processedItems, setProcessedItems] = useState(0)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [unmatchedProducts, setUnmatchedProducts] = useState([])
  const [auqliCategories, setAuqliCategories] = useState([])
  const [showInvalidCSVModal, setShowInvalidCSVModal] = useState(false)
  const [isAIMatching, setIsAIMatching] = useState(false)
  const [aiMatchedCount, setAIMatchedCount] = useState(0)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setIsPageLoaded(true)
    fetchAuqliCategories()
  }, [])

  const fetchAuqliCategories = async () => {
    try {
      const response = await fetch("https://auqliserver-8xr8zvib.b4a.run/api/public/categories", {
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setAuqliCategories(data)
        }
      }
    } catch (error) {
      console.error("Error fetching Auqli categories:", error)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsLoading(true)
    setError(null)
    setIsAuqliFormatted(false)
    setProcessingProgress(0)
    setTotalItems(0)
    setProcessedItems(0)
    setProducts([])
    setUnmatchedProducts([])
    setIsAIMatching(false)
    setAIMatchedCount(0)
    setShowCategoryModal(false) // Reset modal state

    // Create form data
    const formData = new FormData()
    formData.append("file", file)
    formData.append("platform", platform)

    try {
      // Start progress animation immediately
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 300)

      // Send the file to the server
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process CSV file")
      }

      const data = await response.json()
      console.log("CSV processing response:", data)

      // Check if the file is already in Auqli format
      if (data.isAuqliFormatted) {
        setIsAuqliFormatted(true)
        setProducts(data.products)
        setTotalItems(data.products.length)
        setProcessedItems(data.products.length)
      } else if (data.products && data.products.length > 0) {
        setProducts(data.products)
        setTotalItems(data.products.length)
        setProcessedItems(data.products.length)

        // Find products with uncategorized categories
        const uncategorized = data.products.filter(
          (product) =>
            product.mainCategory?.includes("Uncategorized") ||
            !product.mainCategory ||
            product.subCategory?.includes("Uncategorized") ||
            !product.subCategory,
        )

        console.log(`Found ${uncategorized.length} uncategorized products`)

        if (uncategorized.length > 0) {
          setUnmatchedProducts(uncategorized)
          // Force show the category modal after a short delay
          setTimeout(() => {
            setShowCategoryModal(true)
            console.log("Category modal should be visible now")
          }, 1000)
        }
      } else {
        throw new Error("No products found in the CSV file")
      }
    } catch (error) {
      console.error("Error processing CSV:", error)
      setError(error.message)

      // Show invalid CSV modal if appropriate
      if (error.message.includes("invalid") || error.message.includes("format")) {
        setShowInvalidCSVModal(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetFile = () => {
    setFileName(null)
    setProducts([])
    setError(null)
    setIsAuqliFormatted(false)
    setProcessingProgress(0)
    setTotalItems(0)
    setProcessedItems(0)
    setUnmatchedProducts([])
    setIsAIMatching(false)
    setAIMatchedCount(0)
    setShowCategoryModal(false)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const toggleSampleVisibility = () => {
    setShowSample(!showSample)
  }

  const handleCategorySelection = (selectedCategories) => {
    // Update products with selected categories
    const updatedProducts = products.map((product) => {
      if (selectedCategories[product.id]) {
        return {
          ...product,
          mainCategory: selectedCategories[product.id].mainCategory,
          subCategory: selectedCategories[product.id].subCategory,
        }
      }
      return product
    })

    setProducts(updatedProducts)
    setShowCategoryModal(false)
  }

  const downloadAuqliCSV = () => {
    if (!products.length) return

    // Convert products to Auqli CSV format
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
      "other image1",
      "other image2",
      "other image3",
      "other image4",
    ]

    const csvRows = [headers.join(",")]

    products.forEach((product) => {
      const row = [
        `"${(product.name || "").replace(/"/g, '""')}"`,
        product.price || "",
        product.image || "",
        `"${(product.description || "").replace(/"/g, '""')}"`,
        product.weight || "",
        product.inventory || "",
        product.condition || "New",
        product.mainCategory || "Uncategorized",
        product.subCategory || "Uncategorized",
      ]

      // Add additional images if available
      if (product.additionalImages && product.additionalImages.length) {
        for (let i = 0; i < 4; i++) {
          row.push(product.additionalImages[i] || "")
        }
      } else {
        // Add empty cells for additional images
        row.push("", "", "", "")
      }

      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "auqli_products.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
                          <ChevronIcon className="ml-1 h-4 w-4" />
                        </button>
                      </div>

                      {/* Sample CSV visibility toggle */}
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
                    <div className="flex flex-col items-center justify-center py-10">
                      <h3 className="text-xl font-bold text-white mb-3">WooCommerce Integration Coming Soon</h3>
                      <p className="text-gray-400 text-center max-w-md mb-6">
                        We're working hard to bring WooCommerce support to the Auqli CSV Product Formatter.
                      </p>
                      <Button
                        onClick={() => setPlatform("shopify")}
                        className="bg-[#8696ee] hover:bg-[#5466b5] text-white"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Switch to Shopify
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="bg-[#111827] p-6">
                {platform === "shopify" ? (
                  <div className="space-y-6">
                    {/* Auqli Format Alert */}
                    {isAuqliFormatted && (
                      <AuqliFormatAlert message="This file is already in Auqli format and ready to use." />
                    )}

                    {/* Error Alert */}
                    {error && (
                      <div className="flex items-start p-4 mb-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800 dark:text-red-300">Error Processing CSV</h4>
                          <p className="text-red-700 dark:text-red-400 text-sm mt-1">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* Processing Progress - IMPORTANT: This is the progress bar section */}
                    {isLoading && (
                      <div className="mb-4 bg-[#1a2235] p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Processing CSV File</h3>
                        <ProgressAnimation
                          progress={processingProgress}
                          totalItems={totalItems}
                          processedItems={processedItems}
                          isAIMatching={isAIMatching}
                          aiMatchedCount={aiMatchedCount}
                        />
                      </div>
                    )}

                    {/* Success Message */}
                    {products.length > 0 && !isLoading && (
                      <div className="flex items-start p-4 mb-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-300">CSV Processed Successfully</h4>
                          <p className="text-green-700 dark:text-green-400 text-sm mt-1">
                            {products.length} products have been processed and are ready for download.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* File Upload Area */}
                    <div className="flex flex-col items-center justify-center bg-[#0c1322] border border-gray-700 rounded-lg p-8 text-center">
                      <div className="mb-4 rounded-full bg-[#16783a] p-3">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
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
                                    ref={fileInputRef}
                                  />
                                </label>
                              </Button>
                              {products.length > 0 && (
                                <Button
                                  className="flex-1 bg-[#0a0f1a] hover:bg-[#161f35] text-white"
                                  onClick={downloadAuqliCSV}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </Button>
                              )}
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
                                ref={fileInputRef}
                              />
                            </label>
                          </Button>
                        )}

                        {!fileName && !isLoading && <p className="mt-2 text-sm text-gray-400">No file chosen</p>}
                      </div>
                    </div>

                    {/* Products Preview */}
                    {products.length > 0 && !isLoading && (
                      <div className="mt-6 bg-[#0c1322] border border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-3">Processed Products</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs uppercase bg-[#1a2235] text-gray-400">
                              <tr>
                                <th scope="col" className="px-4 py-3">
                                  Product Name
                                </th>
                                <th scope="col" className="px-4 py-3">
                                  Price
                                </th>
                                <th scope="col" className="px-4 py-3">
                                  Category
                                </th>
                                <th scope="col" className="px-4 py-3">
                                  Subcategory
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {products.slice(0, 5).map((product, index) => (
                                <tr key={index} className="border-b border-gray-700 hover:bg-[#1a2235]">
                                  <td className="px-4 py-3 font-medium text-white">{product.name}</td>
                                  <td className="px-4 py-3">{product.price}</td>
                                  <td className="px-4 py-3">{product.mainCategory}</td>
                                  <td className="px-4 py-3">{product.subCategory}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {products.length > 5 && (
                          <p className="text-xs text-gray-400 mt-2 text-center">
                            Showing 5 of {products.length} products
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center bg-[#0c1322] border border-gray-700 rounded-lg p-8 text-center">
                    <h3 className="text-xl font-bold text-white mb-4">WooCommerce Integration Coming Soon</h3>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Field Mapping Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isPageLoaded ? 1 : 0, y: isPageLoaded ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="mt-8 border shadow-md overflow-hidden rounded-md">
                <CardHeader className="bg-[#16783a] text-white p-6">
                  <h2 className="text-xl font-bold">Field Mapping</h2>
                  <p className="text-white/90 mt-1">
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
        </div>
      </div>

      {/* Category Selection Modal - IMPORTANT: This is the category matching modal */}
      <CategorySelectionModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={handleCategorySelection}
        unmatchedProducts={unmatchedProducts}
        auqliCategories={auqliCategories}
      />

      {/* Invalid CSV Modal */}
      <InvalidCSVModal isOpen={showInvalidCSVModal} onClose={() => setShowInvalidCSVModal(false)} />
    </>
  )
}

// Helper component for the chevron icon
function ChevronIcon({ className }) {
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
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
