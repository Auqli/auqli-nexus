"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronLeft, ChevronRight, X, AlertTriangle, ChevronDown, Search } from "lucide-react"
import PropTypes from "prop-types"

// Add custom animation for the AI button glow effect
const glowKeyframes = `
@keyframes glow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-glow {
  animation: glow 3s infinite linear;
}
`

/**
 * Calls DeepInfra's Llama-4 model to match a product to a category
 * @param {string} productName - The name of the product to match
 * @param {Array} categories - Available Auqli categories
 * @returns {Promise<{mainCategory: string, subCategory: string}>}
 */
async function smartMatchWithAI(productName, categories) {
  // Prepare the category list for the prompt
  const categoryList = []

  for (const category of categories) {
    if (!category || !category.name) continue

    const subcategories = Array.isArray(category.subcategories) ? category.subcategories : []
    for (const subcategory of subcategories) {
      if (!subcategory || !subcategory.name) continue
      categoryList.push(`${category.name} > ${subcategory.name}`)
    }
  }

  // Build the prompt for the AI
  const prompt = buildAIPrompt(productName, categoryList)

  try {
    // Call DeepInfra API
    const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY || "xBOQQT8SaRfCCIgafgbqa9eDrpdobBgr"}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse the JSON response
    try {
      const result = JSON.parse(content)
      return {
        mainCategory: result.main_category,
        subCategory: result.subcategory,
      }
    } catch (e) {
      console.error("Failed to parse AI response:", content)
      return null
    }
  } catch (error) {
    console.error("Error calling DeepInfra API:", error)
    throw error
  }
}

/**
 * Builds a prompt for the AI to match a product to a category
 * @param {string} productName - The name of the product to match
 * @param {Array} categoryList - List of available categories
 * @returns {string} - The prompt for the AI
 */
function buildAIPrompt(productName, categoryList) {
  const categories = categoryList.map((cat) => `- ${cat}`).join("\n")

  return `
You are an AI product classifier for an e-commerce platform called Auqli.
Classify the product below into the best available category.

Title: ${productName}

Available Categories:
${categories}

Respond ONLY in this JSON format:
{
  "main_category": "...",
  "subcategory": "...",
  "confidence": 0.0
}
`
}

export function CategorySelectionModal({ isOpen, onClose, onSave, unmatchedProducts = [], auqliCategories = [] }) {
  // Convert to plain JavaScript without TypeScript annotations
  const [selectedCategories, setSelectedCategories] = useState({})
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("categories") // 'categories' or 'preview'
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [categoryPage, setCategoryPage] = useState(1)
  const categoriesPerPage = 8
  const [isGlowStyleCreated, setIsGlowStyleCreated] = useState(false)

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

    return auqliCategories.filter((category) => {
      // Check if category name matches search
      const categoryMatches = category.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Check if any subcategory matches search
      const hasMatchingSubcategory =
        Array.isArray(category.subcategories) &&
        category.subcategories.some((subcategory) => subcategory.name.toLowerCase().includes(searchQuery.toLowerCase()))

      // Return true if either category or any subcategory matches
      return categoryMatches || hasMatchingSubcategory
    })
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
      setCurrentProductIndex(0)
      setActiveTab("categories")
      setExpandedCategory(null)
      setCategoryPage(1)
      setSearchQuery("")
      setProductSearchQuery("")
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
    onSave(selectedCategories)
  }

  const toggleCategory = (categoryName) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null)
    } else {
      setExpandedCategory(categoryName)
    }
  }

  const getProductCategoryStatus = (product) => {
    const selected = selectedCategories[product.id]

    if (!selected) {
      if (product.mainCategory?.includes("Uncategorized") || !product.mainCategory) {
        return { mainMissing: true, subMissing: true }
      }
      return {
        mainMissing: false,
        subMissing: product.subCategory?.includes("Uncategorized") || !product.subCategory,
      }
    }

    return {
      mainMissing: !selected.mainCategory || selected.mainCategory.includes("Uncategorized"),
      subMissing: !selected.subCategory || selected.subCategory.includes("Uncategorized"),
    }
  }

  // Calculate progress
  const categorizedCount = Object.keys(selectedCategories).length

  // Add the useEffect for glow animation style here, before the conditional return
  useEffect(() => {
    // Create style element if it doesn't exist
    if (isOpen && !isGlowStyleCreated) {
      const styleEl = document.createElement("style")
      styleEl.id = "glow-animation-style"
      styleEl.innerHTML = glowKeyframes
      document.head.appendChild(styleEl)
      setIsGlowStyleCreated(true)
    }

    return () => {
      const existingStyle = document.getElementById("glow-animation-style")
      if (existingStyle) {
        document.head.removeChild(existingStyle)
      }
    }
  }, [isOpen, isGlowStyleCreated])

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
                const mainCategory = selectedCategories[product.id]?.mainCategory || product.mainCategory
                const subCategory = selectedCategories[product.id]?.subCategory || product.subCategory

                return (
                  <div
                    key={product.id}
                    className={`p-3 border-b border-gray-700 cursor-pointer ${
                      isSelected ? "bg-[#16783a]" : "hover:bg-[#1a2235]"
                    }`}
                    onClick={() => setCurrentProductIndex(unmatchedProducts.findIndex((p) => p.id === product.id))}
                  >
                    <div className={`font-medium ${isSelected ? "text-white" : ""}`}>{product.name}</div>
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
                      const isSelected = selectedCategories[currentProduct.id]?.mainCategory === category.name

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
                              {category.subcategories &&
                                category.subcategories.map((subcategory) => {
                                  const isSubcategorySelected =
                                    selectedCategories[currentProduct.id]?.subCategory === subcategory.name

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
                        (currentProduct.mainCategory && !currentProduct.mainCategory.includes("Uncategorized")
                          ? currentProduct.mainCategory
                          : "Uncategorized")}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Selected Subcategory</h4>
                    <div className="p-3 bg-[#1a2235] rounded-md">
                      {selectedCategories[currentProduct.id]?.subCategory ||
                        (currentProduct.subCategory && !currentProduct.subCategory.includes("Uncategorized")
                          ? currentProduct.subCategory
                          : "Uncategorized")}

                      {(!selectedCategories[currentProduct.id]?.subCategory ||
                        selectedCategories[currentProduct.id]?.subCategory.includes("Uncategorized")) && (
                        <div className="flex items-center mt-2 text-amber-500 text-sm">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Please select a proper subcategory
                        </div>
                      )}
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
              onClick={async () => {
                // Show loading state
                const productId = currentProduct.id
                const productName = currentProduct.name

                try {
                  // Call AI to get category match
                  const result = await smartMatchWithAI(productName, auqliCategories)

                  if (result?.mainCategory && result?.subCategory) {
                    // Update the selected categories with AI result
                    setSelectedCategories((prev) => ({
                      ...prev,
                      [productId]: {
                        mainCategory: result.mainCategory,
                        subCategory: result.subCategory,
                      },
                    }))

                    // Find and expand the matched category
                    setExpandedCategory(result.mainCategory)

                    // Show success message
                    console.log(`AI matched "${productName}" to ${result.mainCategory} > ${result.subCategory}`)
                  }
                } catch (error) {
                  console.error("Error during AI matching:", error)
                }
              }}
              className="relative px-6 py-2 bg-gradient-to-r from-[#5466b5] to-[#7b5dd6] hover:from-[#4355a4] hover:to-[#6a4ec5] rounded-md text-white overflow-hidden group transition-all duration-300"
            >
              {/* Glowing effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#5466b5]/0 via-[#8a7ce8]/30 to-[#5466b5]/0 opacity-0 group-hover:opacity-100 animate-glow transition-opacity duration-700"></div>

              {/* Subtle circuit pattern overlay */}
              <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC41Ij48cGF0aCBkPSJNMjAgMHYxME0zMCAwdjEwTTEwIDB2MTBNMCAxMGgxME0wIDIwaDEwTTAgMzBoMTBNMTAgNDBoMTBNMjAgNDBoMTBNMzAgNDBoMTBNNDAgMTBoLTEwTTQwIDIwaC0xME00MCAzMGgtMTBNMTAgMTB2MTBNMCA0MGg0ME00MCAwdjQwIi8+PC9nPjwvc3ZnPg==')]"></div>

              <div className="relative flex items-center justify-center">
                {/* Pulsing dot */}
                <span className="absolute left-0 w-2 h-2 rounded-full bg-blue-300 mr-2 animate-pulse"></span>

                <span className="ml-4">Smart Match With NexAI</span>

                {/* AI icon */}
                <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M8 9H16M8 12H16M8 15H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M16 16L19 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
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

// Add PropTypes validation
CategorySelectionModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  unmatchedProducts: PropTypes.array,
  auqliCategories: PropTypes.array,
}
