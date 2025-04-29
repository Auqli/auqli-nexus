"use client"

import { useState, useEffect, useCallback } from "react"
import { Upload, AlertTriangle, X, RefreshCw, CheckCircle, Download, ChevronUp, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ShopifySampleCSV } from "@/components/sample-csv"
import { WooCommerceSampleCSV } from "@/components/woocommerce-sample-csv"
import { Progress } from "@/components/ui/progress"
import { ProgressAnimation } from "@/components/progress-animation"
import { EnhancedPageHeader } from "@/components/layout/enhanced-page-header"
import { InvalidCSVModal } from "@/components/invalid-csv-modal"
import { CategorySelectionModal } from "@/components/category-selection-modal"

// Add these imports at the top of the file
import { DatabaseInsights } from "@/components/database-insights"
import { CategorySuggestions } from "@/components/category-suggestions"
import { LearningProgress } from "@/components/learning-progress"
import { matchProductCategory, saveUserFeedback } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { RealtimeNotifications } from "@/components/realtime-notifications"

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

// Expected WooCommerce CSV headers
const EXPECTED_WOOCOMMERCE_HEADERS = [
  "name",
  "description",
  "regular price",
  "sale price",
  "stock quantity",
  "categories",
  "images",
]

export default function ConverterPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [platform, setPlatform] = useState("shopify")
  const [showSample, setShowSample] = useState(false)
  const [showInvalidCSVModal, setShowInvalidCSVModal] = useState(false)

  // Animation for page load
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  // Add these state variables inside the Home component
  const [auqliCategories, setAuqliCategories] = useState([])
  const [unmatchedProducts, setUnmatchedProducts] = useState([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  // Add these state variables inside the Home component
  const [processingProgress, setProcessingProgress] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [matchedCategories, setMatchedCategories] = useState(0)

  // Add a state to track if there are uncategorized products after closing the modal
  // Add this state variable with the other state variables
  const [hasUncategorizedProducts, setHasUncategorizedProducts] = useState(false)

  // Add this state variable to the Home component
  const [isAuqliFormatted, setIsAuqliFormatted] = useState(false)
  const [auqliFormatMessage, setAuqliFormatMessage] = useState(null)

  // Add a state to track if all categories have been successfully matched
  const [allCategoriesMatched, setAllCategoriesMatched] = useState(false)

  // Add these state variables inside the component
  const [totalItems, setTotalItems] = useState(0)
  const [processedItems, setProcessedItems] = useState(0)

  const [activeTab, setActiveTab] = useState("categories")

  // Add a state variable to track database save progress
  // Add this with the other state variables at the top of the component

  const [databaseSaveProgress, setDatabaseSaveProgress] = useState(0)
  const [isSavingToDatabase, setIsSavingToDatabase] = useState(false)

  // Add this inside the ConverterPage component, near the other state variables
  const [dbRefreshTrigger, setDbRefreshTrigger] = useState(0)

  const { toast } = useToast()

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  // Add this useEffect to fetch Auqli categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Change this URL from auqliserver-8xr8zvib.b4a.run to api.auqli.live
        const response = await fetch("https://api.auqli.live/api/public/categories")
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

  // Add a simulated progress function
  // Function to validate if a CSV file matches the Shopify template format
  const validateShopifyCSV = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        const content = event.target?.result
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

  // Function to validate if a CSV file matches the WooCommerce template format
  const validateWooCommerceCSV = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        const content = event.target?.result
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

        // Check if the required WooCommerce headers are present
        // These match the headers in the provided sample CSV
        const matchedHeaders = EXPECTED_WOOCOMMERCE_HEADERS.filter((header) =>
          headers.some((h) => h.trim().replace(/"/g, "") === header),
        )

        // If at least 4 of the expected headers are present, consider it valid
        resolve(matchedHeaders.length >= 4)
      }

      reader.onerror = () => {
        resolve(false)
      }

      reader.readAsText(file)
    })
  }

  // Helper function to check if a product is properly categorized
  const isProductCategorized = useCallback((product) => {
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

  // Add these components to the page layout, after the main converter card
  // For example, before the closing </motion.div> tag at the end of the page
  // Inside the ConverterPage component, add this function
  const handleSmartMatch = async (productName, productDescription) => {
    setIsLoading(true)
    try {
      const result = await matchProductCategory(productName, productDescription, auqliCategories)

      if (result.success) {
        // Update the product with the matched category
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.name === productName
              ? {
                  ...product,
                  mainCategory: result.mainCategory,
                  subCategory: result.subCategory,
                  matchSource: result.source,
                  confidence: result.confidence,
                  isCategorized: true,
                }
              : product,
          ),
        )

        // Update categorization stats
        updateCategorizationStatus()
      }
    } catch (error) {
      console.error("Error in smart matching:", error)
      setError("Failed to match category. Please try again or select manually.")
    } finally {
      setIsLoading(false)
    }
  }

  // Add this  Please try again or select manually.")
  // Add this function to handle user feedback on category matches
  const handleCategoryFeedback = async (productName, mainCategory, subCategory, wasCorrect) => {
    try {
      await saveUserFeedback(
        productName,
        products.find((p) => p.name === productName)?.description || "",
        mainCategory,
        subCategory,
        wasCorrect,
      )

      // Show feedback confirmation to user
      toast({
        title: "Thank you for your feedback",
        description: "Your input helps our system learn and improve.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error saving feedback:", error)
    }
  }

  // Update the handleFileUpload function to validate the CSV format
  // Update the handleFileUpload function to count actual items
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    if (window.addNotification) {
      window.addNotification(`Processing file: ${file.name}`)
    }
    setIsLoading(true)
    setError(null)
    setAllCategoriesMatched(false)
    setHasUncategorizedProducts(false)
    setTotalItems(0)
    setProcessedItems(0)

    // Validate if the file matches the selected platform's CSV template
    let isValidCSV = false
    if (platform === "shopify") {
      isValidCSV = await validateShopifyCSV(file)
    } else if (platform === "woocommerce") {
      isValidCSV = await validateWooCommerceCSV(file)
    }

    if (!isValidCSV) {
      setIsLoading(false)
      setShowInvalidCSVModal(true)
      if (window.addNotification) {
        window.addNotification(
          `Invalid CSV format. Please use a ${platform === "shopify" ? "Shopify" : "WooCommerce"} CSV template.`,
          "error",
        )
      }
      return
    }

    if (window.addNotification) {
      window.addNotification(`Starting conversion of ${file.name}`)
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

          // Dispatch a notification
          if (window.addNotification) {
            window.addNotification(`Processing item ${newValue} of ${itemCount}`)
          }

          return newValue
        })
      }, 100)

      const result = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      }).then((res) => res.json())

      // Clear the progress tracker
      clearInterval(progressTracker)

      if (window.addNotification) {
        window.addNotification(`Completed processing ${itemCount} items`)
      }

      if (result.error) {
        setError(result.error)
        setProducts([])
        if (window.addNotification) {
          window.addNotification(`Error processing CSV: ${result.error}`, "error")
        }
      } else if (result.products) {
        // Complete the progress to 100%
        setProcessedItems(itemCount)
        setProcessingProgress(100)

        // Check if the file is already in Auqli format
        if (result.isAuqliFormatted) {
          setIsAuqliFormatted(true)
          setAuqliFormatMessage(result.message || "This file appears to be already formatted for Auqli.")
          if (window.addNotification) {
            window.addNotification("File is already in Auqli format", "success")
          }

          // Add IDs to products for better tracking
          const productsWithIds = result.products.map((product, index) => ({
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
          const productsWithIds = result.products.map((product, index) => {
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
          const matched = productsWithIds.filter((product) => product.isCategorized).length

          setMatchedCategories(matched)
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
            if (window.addNotification) {
              window.addNotification(`${unmatched.length} products require category selection`)
            }
          }

          setProducts(productsWithIds)
        }
      }
    } catch (err) {
      console.error("Error during upload:", err)
      setError("Failed to process the CSV file. Please check the format and try again.")
      setProducts([])
      if (window.addNotification) {
        window.addNotification(`Error processing CSV: ${err.message}`, "error")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Add a function to count the actual number of items in the CSV file
  const countCSVItems = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        const content = event.target?.result
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
  const handleCategorySelection = (selectedCategories) => {
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
  const handleUploadSuccess = (products, isAuqliFormatted = false) => {
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
      if (window.addNotification) {
        window.addNotification(`${unmatched.length} products require category selection`)
      }
    }
  }

  // Effect to update categorization status whenever products change
  useEffect(() => {
    updateCategorizationStatus()
  }, [products, updateCategorizationStatus])

  // Find the line where currentProduct is defined and update it with a proper default value
  // Replace:
  // const currentProduct = unmatchedProducts[currentProductIndex] || {
  //   id: "",
  //   name: "",
  //   mainCategory: "",
  //   subCategory: "",
  // }

  // With:
  const [currentProduct, setCurrentProduct] = useState(null)
  const [currentProductIndex, setCurrentProductIndex] = useState(0)

  // Then add this useEffect to update currentProduct safely when unmatchedProducts or currentProductIndex changes
  useEffect(() => {
    if (unmatchedProducts && unmatchedProducts.length > 0 && currentProductIndex < unmatchedProducts.length) {
      setCurrentProduct(unmatchedProducts[currentProductIndex])
    } else {
      setCurrentProduct({
        id: "",
        name: "",
        mainCategory: "",
        subCategory: "",
      })
    }
  }, [unmatchedProducts, currentProductIndex])

  const handleMainCategoryChange = (productId, newMainCategory) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, mainCategory: newMainCategory } : product,
      ),
    )
  }

  const handleSubCategoryChange = (productId, newSubCategory) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => (product.id === productId ? { ...product, subCategory: newSubCategory } : product)),
    )
  }

  // Add this function inside the ConverterPage component
  const handleDbUpdate = () => {
    // Increment the refresh trigger to cause the database components to refresh
    setDbRefreshTrigger((prev) => prev + 1)
  }

  // Add this function to filter out already matched products
  const filterMatchedProducts = (products, selectedCategories) => {
    return products.filter((product) => {
      const selected = selectedCategories[product.id]

      // Keep products that don't have categories selected yet
      if (!selected) return true

      // Keep products that have "noMatch" flag
      if (selected.noMatch) return true

      // Filter out products that have both main category and subcategory properly selected
      const hasMainCategory = selected.mainCategory && !selected.mainCategory.includes("Uncategorized")
      const hasSubCategory = selected.subCategory && !selected.subCategory.includes("Uncategorized")

      // Keep only products that are missing either main category or subcategory
      return !(hasMainCategory && hasSubCategory)
    })
  }

  return (
    <>
      <RealtimeNotifications />
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

              <CardContent className="bg-[#111827] text-white">
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
                      platform === "woocommerce" ? "bg-[#5466b5]" : "bg-[#111827] hover:bg-[#1a2235]"
                    }`}
                  >
                    <span className="font-medium">WooCommerce</span>
                    <Badge className="ml-2 bg-[#8696ee] text-white">Available</Badge>
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
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
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
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[#d7f4db]">
                          Upload your WooCommerce product export CSV file to convert it to Auqli format.
                        </p>
                        <button
                          onClick={toggleSampleVisibility}
                          className="text-sm text-[#8696ee] hover:text-[#a6b3f5] transition-colors flex items-center"
                        >
                          {showSample ? "Hide Sample" : "Show Sample"}
                          {showSample ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )}
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
                              <p className="text-xs font-medium mb-2 text-[#8696ee]">Sample WooCommerce CSV Format:</p>
                              <WooCommerceSampleCSV />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </CardContent>

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
                    whileHover={{ boxShadow: "0 0 15px rgba(134, 150, 238, 0.3)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="mb-4 rounded-full bg-[#5466b5] p-3"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Upload className="h-6 w-6 text-white" />
                    </motion.div>
                    <h3 className="mb-2 text-lg font-semibold text-white">Upload your CSV file</h3>
                    <p className="mb-4 text-sm text-gray-400 max-w-xs">
                      Select your WooCommerce product export file to convert to Auqli format
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
                            <Button className="flex-1 bg-[#5466b5] hover:bg-[#3a4a8c] text-white" asChild>
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
                          className="w-full bg-[#5466b5] hover:bg-[#3a4a8c] text-white"
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
                )}

                {isLoading && (
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing CSV file...</span>
                          <span>{Math.round(processingProgress)}%</span>
                        </div>
                        {/* Update the ProgressAnimation component with item counts */}
                        <ProgressAnimation
                          progress={processingProgress}
                          totalItems={totalItems}
                          processedItems={processedItems}
                        />
                        <Progress value={processingProgress} className="h-2" />

                        {/* Add database save progress indicator */}
                        {isSavingToDatabase && (
                          <div className="mt-4">
                            <div className="flex justify-between text-sm">
                              <span>Saving to database...</span>
                              <span>{Math.round(databaseSaveProgress)}%</span>
                            </div>
                            <Progress value={databaseSaveProgress} className="h-2 bg-blue-900/20">
                              <div className="h-full bg-blue-600" style={{ width: `${databaseSaveProgress}%` }} />
                            </Progress>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {totalProducts > 0 && !isLoading && (
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Products processed</span>
                            <span>{totalProducts}</span>
                          </div>
                          <Progress value={100} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Categories matched</span>
                            <span>
                              {matchedCategories} of {totalProducts}
                            </span>
                          </div>
                          <Progress value={(matchedCategories / totalProducts) * 100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {isAuqliFormatted && auqliFormatMessage && (
                  <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-800 dark:text-green-300">Already in Auqli Format</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-400">
                      <p className="mb-2">{auqliFormatMessage}</p>
                      <p className="text-sm">
                        This file is already in the correct format for Auqli. You can download it directly or upload it
                        to Auqli. If you need assistance, please{" "}
                        <a href="mailto:support@auqli.com" className="underline">
                          contact Auqli support
                        </a>
                        .
                      </p>
                    </AlertDescription>
                  </Alert>
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

              <CardFooter className="flex justify-end bg-[#111827] p-6 pt-0">
                <AnimatePresence>
                  {products.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: hasUncategorizedProducts ? 1 : 1.05 }}
                      whileTap={{ scale: hasUncategorizedProducts ? 1 : 0.95 }}
                    >
                      {hasUncategorizedProducts ? (
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-amber-500 text-sm flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Please match all categories before downloading
                          </p>
                          <Button
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Match Categories First
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={downloadFormattedCSV}
                          className={`bg-${platform === "shopify" ? "[#16783a]" : "[#5466b5]"} hover:bg-${
                            platform === "shopify" ? "[#225b35]" : "[#3a4a8c]"
                          } text-white transition-colors`}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Auqli Formatted CSV
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <DatabaseInsights refreshTrigger={dbRefreshTrigger} />
              <LearningProgress refreshTrigger={dbRefreshTrigger} />
            </div>

            {currentProduct && currentProduct.name && (
              <div className="mt-6">
                <CategorySuggestions
                  productName={currentProduct.name}
                  onSelectCategory={(main, sub) => {
                    handleCategorySelection({
                      [currentProduct.id]: {
                        mainCategory: main,
                        subCategory: sub,
                      },
                    })
                    handleCategoryFeedback(currentProduct.name, main, sub, true)
                  }}
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Invalid CSV Modal */}
      <InvalidCSVModal isOpen={showInvalidCSVModal} onClose={() => setShowInvalidCSVModal(false)} platform={platform} />

      <CategorySelectionModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false)
          updateCategorizationStatus()
          // Refresh database insights when modal is closed
          handleDbUpdate()
        }}
        onSave={(selectedCategories) => {
          handleCategorySelection(selectedCategories)
          // Refresh database insights when categories are saved
          handleDbUpdate()
        }}
        unmatchedProducts={unmatchedProducts}
        auqliCategories={auqliCategories}
        // Add this prop to filter out already matched products when reopening the modal
        filterMatchedProducts={true}
        // Add this prop to trigger database updates
        onDbUpdate={handleDbUpdate}
      />
    </>
  )
}
