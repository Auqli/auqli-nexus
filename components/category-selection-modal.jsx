"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronLeft, ChevronRight, X, AlertTriangle, ChevronDown, Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { forceMatchWithAI, batchProcessCategories } from "@/lib/deep-ai-matcher"
import { Progress } from "@/components/ui/progress"

export function CategorySelectionModal({ isOpen, onClose, onSave, unmatchedProducts, auqliCategories }) {
  const [selectedCategories, setSelectedCategories] = useState({})
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("categories") // 'categories' or 'preview'
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [isAIMatching, setIsAIMatching] = useState(false)
  const [aiMatchedProducts, setAIMatchedProducts] = useState({})
  const [aiMatchProgress, setAIMatchProgress] = useState({ processed: 0, total: 0 })
  const [isSingleProductMatching, setIsSingleProductMatching] = useState(false)
  const [aiError, setAiError] = useState(null)

  // New state for category pagination
  const [categoryPage, setCategoryPage] = useState(1)
  const categoriesPerPage = 8

  const currentProduct = unmatchedProducts[currentProductIndex] || {
    id: "",
    name: "",
    mainCategory: "",
    subCategory: "",
  }

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return unmatchedProducts

    return unmatchedProducts.filter((product) => product.name.toLowerCase().includes(productSearchQuery.toLowerCase()))
  }, [unmatchedProducts, productSearchQuery])

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return auqliCategories

    return auqliCategories.filter((category) => category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [auqliCategories, searchQuery])

  // Paginate categories
  const totalCategoryPages = Math.ceil(filteredCategories.length / categoriesPerPage)
  const displayedCategories = filteredCategories.slice(
    (categoryPage - 1) * categoriesPerPage,
    categoryPage * categoriesPerPage,
  )

  // Reset state when modal opens or products change
  useEffect(() => {
    if (isOpen && unmatchedProducts.length > 0) {
      console.log("Category selection modal opened with", unmatchedProducts.length, "unmatched products")
      setCurrentProductIndex(0)
      setActiveTab("categories")
      setExpandedCategory(null)
      setCategoryPage(1)
      setSearchQuery("")
      setProductSearchQuery("")
      setIsAIMatching(false)
      setAIMatchedProducts({})
      setAIMatchProgress({ processed: 0, total: 0 })
      setAiError(null)
    }
  }, [isOpen, unmatchedProducts])

  const handleMainCategoryChange = (productId, mainCategory) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [productId]: {
        mainCategory,
        subCategory: "", // Reset subcategory when main category changes
      },
    }))
  }

  const handleSubCategoryChange = (productId, subCategory) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        subCategory,
      },
    }))
  }

  const handleNextProduct = () => {
    if (currentProductIndex < unmatchedProducts.length - 1) {
      setCurrentProductIndex(currentProductIndex + 1)
      setExpandedCategory(null) // Close any expanded category when moving to next product
    }
  }

  // Category pagination handlers
  const handlePrevCategoryPage = () => {
    if (categoryPage > 1) {
      setCategoryPage(categoryPage - 1)
    }
  }

  const handleNextCategoryPage = () => {
    if (categoryPage < totalCategoryPages) {
      setCategoryPage(categoryPage + 1)
    }
  }

  const handleSaveAll = () => {
    // Combine manually selected categories with AI matched ones
    const combinedCategories = {
      ...selectedCategories,
      ...aiMatchedProducts,
    }

    onSave(combinedCategories)
  }

  const toggleCategory = (categoryName) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null)
    } else {
      setExpandedCategory(categoryName)
    }
  }

  const getProductCategoryStatus = (product) => {
    const selected = selectedCategories[product.id] || aiMatchedProducts[product.id]

    if (!selected) {
      if (product.mainCategory?.includes("Uncategorized") || !product.mainCategory) {
        return { mainMissing: true, subMissing: true }
      }
      return { mainMissing: false, subMissing: product.subCategory?.includes("Uncategorized") || !product.subCategory }
    }

    return {
      mainMissing: !selected.mainCategory || selected.mainCategory.includes("Uncategorized"),
      subMissing: !selected.subCategory || selected.subCategory.includes("Uncategorized"),
    }
  }

  // Handle AI matching for all unmatched products
  const handleForceAIMatch = async () => {
    setIsAIMatching(true)
    setAIMatchProgress({ processed: 0, total: unmatchedProducts.length })
    setAiError(null)

    try {
      // Filter out products that already have manual selections
      const productsToMatch = unmatchedProducts.filter((product) => !selectedCategories[product.id])

      if (productsToMatch.length === 0) {
        setIsAIMatching(false)
        return
      }

      // Prepare products for batch processing
      const productsForAI = productsToMatch.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description || "",
      }))

      // Process in smaller batches to show progress
      const batchSize = 5
      const batches = Math.ceil(productsForAI.length / batchSize)
      const allMatches = {}

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize
        const end = Math.min(start + batchSize, productsForAI.length)
        const batch = productsForAI.slice(start, end)

        try {
          // Process this batch
          const batchMatches = await batchProcessCategories(batch, auqliCategories)

          // Add to all matches
          Object.assign(allMatches, batchMatches)
        } catch (error) {
          console.error("Error processing batch:", error)
          // Continue with next batch even if this one failed
        }

        // Update progress
        setAIMatchProgress({
          processed: end,
          total: productsForAI.length,
        })

        // Small delay to allow UI to update
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Update state with all matches
      setAIMatchedProducts(allMatches)

      // Show a message if no matches were found
      if (Object.keys(allMatches).length === 0) {
        setAiError("No categories could be matched automatically. Please select categories manually.")
      }
    } catch (error) {
      console.error("Error during AI matching:", error)
      setAiError("An error occurred during category matching. Using local matching only.")
    } finally {
      setIsAIMatching(false)
    }
  }

  // Handle AI matching for a single product
  const handleSingleProductAIMatch = async () => {
    if (!currentProduct || !currentProduct.id) return

    setIsSingleProductMatching(true)
    setAiError(null)

    try {
      const match = await forceMatchWithAI(
        currentProduct.id,
        currentProduct.name,
        currentProduct.description || "",
        auqliCategories,
      )

      // Only update if we got a valid match
      if (match.mainCategory && !match.mainCategory.includes("Uncategorized")) {
        setAIMatchedProducts((prev) => ({
          ...prev,
          [currentProduct.id]: match,
        }))
      } else {
        setAiError("Could not find a matching category. Please select manually.")
      }
    } catch (error) {
      console.error(`Error matching product ${currentProduct.id}:`, error)
      setAiError("An error occurred during category matching. Please select manually.")
    } finally {
      setIsSingleProductMatching(false)
    }
  }

  // Calculate progress
  const categorizedCount = Object.keys(selectedCategories).length + Object.keys(aiMatchedProducts).length

  // Force the modal to be visible if isOpen is true
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-[90vw] max-w-4xl max-h-[90vh] bg-[#0c1322] rounded-lg overflow-hidden text-white">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-xl font-bold">Category Selection Required</h2>
          <p className="text-gray-400 mt-1">
            We couldn't automatically match categories for {unmatchedProducts.length} products. Please select the
            appropriate Auqli categories.
          </p>

          {/* Progress bar */}
          <div className="mt-4 mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>
                Progress: {categorizedCount} of {unmatchedProducts.length} products categorized
              </span>
            </div>
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#16783a]"
                style={{ width: `${(categorizedCount / unmatchedProducts.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* AI Match button */}
          <div className="mt-3">
            <Button
              onClick={handleForceAIMatch}
              disabled={isAIMatching}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {isAIMatching ? (
                <>
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
                  AI Matching... {aiMatchProgress.processed} of {aiMatchProgress.total}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Force Match All With AI
                </>
              )}
            </Button>

            {Object.keys(aiMatchedProducts).length > 0 && (
              <span className="ml-3 text-sm text-purple-300">
                <Sparkles className="inline-block h-3 w-3 mr-1" />
                {Object.keys(aiMatchedProducts).length} products matched by AI
              </span>
            )}
          </div>

          {/* AI matching progress bar */}
          {isAIMatching && aiMatchProgress.total > 0 && (
            <div className="mt-3">
              <Progress value={(aiMatchProgress.processed / aiMatchProgress.total) * 100} className="h-2" />
            </div>
          )}

          {/* Error message */}
          {aiError && (
            <div className="mt-3 p-2 bg-amber-900/20 border border-amber-800/30 rounded-md text-amber-300 text-sm flex items-start">
              <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{aiError}</span>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
          {/* Left column - Products list with search and scrollable area */}
          <div className="bg-[#0a0f1a] rounded-lg overflow-hidden flex flex-col">
            <div className="p-3 bg-[#111827] border-b border-gray-700">
              <h3 className="font-medium mb-2">Products</h3>

              {/* Add search input for products */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-[#1a2235] border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#16783a] focus:border-[#16783a]"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Scrollable products list */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: "calc(90vh - 340px)" }}>
              {filteredProducts.map((product) => {
                const status = getProductCategoryStatus(product)
                const isSelected = currentProduct.id === product.id
                const mainCategory =
                  selectedCategories[product.id]?.mainCategory ||
                  aiMatchedProducts[product.id]?.mainCategory ||
                  product.mainCategory
                const subCategory =
                  selectedCategories[product.id]?.subCategory ||
                  aiMatchedProducts[product.id]?.subCategory ||
                  product.subCategory
                const isAIMatched = aiMatchedProducts[product.id] && !selectedCategories[product.id]

                return (
                  <div
                    key={product.id}
                    className={`p-3 border-b border-gray-700 cursor-pointer ${
                      isSelected ? "bg-[#16783a]" : "hover:bg-[#1a2235]"
                    }`}
                    onClick={() => setCurrentProductIndex(unmatchedProducts.findIndex((p) => p.id === product.id))}
                  >
                    <div className={`font-medium ${isSelected ? "text-white" : ""}`}>
                      {product.name}
                      {isAIMatched && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                          <Sparkles className="mr-1 h-3 w-3" />
                          AI
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {mainCategory && !mainCategory.includes("Uncategorized") ? mainCategory : "Uncategorized"} &gt;{" "}
                      {subCategory && !subCategory.includes("Uncategorized") ? subCategory : "Uncategorized"}
                    </div>
                    {(status.mainMissing || status.subMissing) && (
                      <div className="flex items-center mt-1 text-amber-500 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {status.mainMissing && status.subMissing
                          ? "Main category & subcategory missing"
                          : status.mainMissing
                            ? "Main category missing"
                            : "Subcategory missing"}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right column - Category selection or Preview */}
          <div className="bg-[#0a0f1a] rounded-lg overflow-hidden">
            <div className="bg-[#111827] border-b border-gray-700">
              <div className="flex">
                <button
                  className={`px-4 py-3 ${activeTab === "categories" ? "bg-[#0a0f1a]" : "bg-[#111827]"}`}
                  onClick={() => setActiveTab("categories")}
                >
                  Categories
                </button>
                <button
                  className={`px-4 py-3 ${activeTab === "preview" ? "bg-[#0a0f1a]" : "bg-[#111827]"}`}
                  onClick={() => setActiveTab("preview")}
                >
                  Preview
                </button>
              </div>
            </div>

            {activeTab === "categories" ? (
              <div className="flex flex-col h-[calc(90vh-340px)]">
                <div className="p-4">
                  <h3 className="font-medium mb-4">{currentProduct.name}</h3>

                  {/* Single product AI match button */}
                  <Button
                    onClick={handleSingleProductAIMatch}
                    disabled={isSingleProductMatching}
                    className="mb-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    {isSingleProductMatching ? (
                      <>
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
                        Matching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Force Match This Product
                      </>
                    )}
                  </Button>

                  <div className="mb-4">
                    <h4 className="text-sm text-gray-400 mb-2">Instructions:</h4>
                    <p className="text-sm mb-1">
                      First, select a main category from the list below (not "Uncategorized")
                    </p>
                    <p className="text-sm mb-2">Then, select a specific subcategory (not "Uncategorized")</p>
                    <div className="flex items-center text-amber-500 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span>Note: Both main category and subcategory must be properly selected</span>
                    </div>
                  </div>

                  {/* Search input */}
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search categories..."
                      className="w-full pl-10 pr-4 py-2 bg-[#1a2235] border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#16783a] focus:border-[#16783a]"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setCategoryPage(1) // Reset to first page when searching
                      }}
                    />
                  </div>
                </div>

                {/* Categories list with pagination */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  <div className="space-y-2">
                    {displayedCategories.map((category) => {
                      // Check if this category is selected for the current product
                      const isSelected =
                        selectedCategories[currentProduct.id]?.mainCategory === category.name ||
                        aiMatchedProducts[currentProduct.id]?.mainCategory === category.name

                      return (
                        <div key={category.id}>
                          <button
                            className={`w-full text-left p-3 rounded-md flex items-center justify-between ${
                              isSelected ? "bg-[#16783a] text-white" : "bg-[#1a2235] hover:bg-[#222d42]"
                            }`}
                            onClick={() => {
                              toggleCategory(category.name)
                              handleMainCategoryChange(currentProduct.id, category.name)
                            }}
                          >
                            <span>{category.name}</span>
                            <ChevronDown className="h-5 w-5" />
                          </button>

                          {expandedCategory === category.name && (
                            <div className="mt-2 space-y-1 pl-4">
                              {category.subcategories?.map((subcategory) => {
                                const isSubcategorySelected =
                                  selectedCategories[currentProduct.id]?.subCategory === subcategory.name ||
                                  aiMatchedProducts[currentProduct.id]?.subCategory === subcategory.name

                                return (
                                  <button
                                    key={subcategory.id}
                                    className={`w-full text-left p-2 rounded-md ${
                                      isSubcategorySelected
                                        ? "bg-[#16783a] text-white"
                                        : "bg-[#111827] hover:bg-[#1a2235]"
                                    }`}
                                    onClick={() => handleSubCategoryChange(currentProduct.id, subcategory.name)}
                                  >
                                    {subcategory.name}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Category pagination */}
                <div className="flex items-center justify-center p-4 border-t border-gray-700">
                  <button
                    onClick={handlePrevCategoryPage}
                    disabled={categoryPage === 1}
                    className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="mx-4 text-sm">
                    Page {categoryPage} of {totalCategoryPages || 1}
                  </span>
                  <button
                    onClick={handleNextCategoryPage}
                    disabled={categoryPage === totalCategoryPages || totalCategoryPages === 0}
                    className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              // Preview Tab Content
              <div className="p-4 h-[calc(90vh-340px)] overflow-y-auto">
                <h3 className="font-medium mb-6">{currentProduct.name}</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Selected Category</h4>
                    <div className="p-3 bg-[#1a2235] rounded-md">
                      {selectedCategories[currentProduct.id]?.mainCategory ||
                        aiMatchedProducts[currentProduct.id]?.mainCategory ||
                        (currentProduct.mainCategory && !currentProduct.mainCategory.includes("Uncategorized")
                          ? currentProduct.mainCategory
                          : "Uncategorized")}

                      {aiMatchedProducts[currentProduct.id] && !selectedCategories[currentProduct.id] && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                          <Sparkles className="mr-1 h-3 w-3" />
                          AI Matched
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Selected Subcategory</h4>
                    <div className="p-3 bg-[#1a2235] rounded-md">
                      {selectedCategories[currentProduct.id]?.subCategory ||
                        aiMatchedProducts[currentProduct.id]?.subCategory ||
                        (currentProduct.subCategory && !currentProduct.subCategory.includes("Uncategorized")
                          ? currentProduct.subCategory
                          : "Uncategorized")}

                      {(!selectedCategories[currentProduct.id]?.subCategory &&
                        !aiMatchedProducts[currentProduct.id]?.subCategory) ||
                        (selectedCategories[currentProduct.id]?.subCategory?.includes("Uncategorized") &&
                          !aiMatchedProducts[currentProduct.id]?.subCategory && (
                            <div className="flex items-center mt-2 text-amber-500 text-sm">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Please select a proper subcategory
                            </div>
                          ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-[#0a0f1a] flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Product {currentProductIndex + 1} of {unmatchedProducts.length}
          </div>
          <div className="flex space-x-3">
            <button onClick={onClose} className="px-6 py-2 bg-[#1a2235] hover:bg-[#222d42] rounded-md text-white">
              Cancel
            </button>
            <button
              onClick={handleNextProduct}
              className="px-6 py-2 bg-[#16783a] hover:bg-[#225b35] rounded-md text-white"
            >
              Next Product
            </button>
            <button onClick={handleSaveAll} className="px-6 py-2 bg-[#16783a] hover:bg-[#225b35] rounded-md text-white">
              Save All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
