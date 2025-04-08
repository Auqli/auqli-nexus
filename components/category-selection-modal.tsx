"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AuqliCategory {
  id: string
  name: string
  subcategories: AuqliSubcategory[]
}

interface AuqliSubcategory {
  id: string
  name: string
}

interface CategorySelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (selectedCategories: { [productId: string]: { mainCategory: string; subCategory: string } }) => void
  unmatchedProducts: Array<{ id: string; name: string; mainCategory: string; subCategory: string }>
  auqliCategories: AuqliCategory[]
}

function SelectionGuide({ step, targetRef, message, position = "right" }) {
  if (!targetRef?.current) return null

  return (
    <div
      className="absolute z-10 pointer-events-none animate-pulse"
      style={{
        top:
          position === "bottom"
            ? `${targetRef.current.offsetTop + targetRef.current.offsetHeight + 10}px`
            : `${targetRef.current.offsetTop + targetRef.current.offsetHeight / 2 - 10}px`,
        left:
          position === "bottom"
            ? `${targetRef.current.offsetLeft + targetRef.current.offsetWidth / 2 - 100}px`
            : `${targetRef.current.offsetLeft - 220}px`,
      }}
    >
      <div className="bg-primary text-white px-3 py-2 rounded-lg shadow-lg flex items-center max-w-[200px]">
        <span className="text-sm font-medium">{message}</span>
        <ArrowRight className="ml-2 h-4 w-4" />
      </div>
    </div>
  )
}

export function CategorySelectionModal({
  isOpen,
  onClose,
  onSave,
  unmatchedProducts,
  auqliCategories,
}: CategorySelectionModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<{
    [productId: string]: { mainCategory: string; subCategory: string }
  }>({})
  const [activeProduct, setActiveProduct] = useState<string | null>(null)
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("")
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("")
  const [showWarningDialog, setShowWarningDialog] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const categoriesPerPage = 5

  const [selectionStep, setSelectionStep] = useState(1) // 1 = select main category, 2 = select subcategory
  const mainCategoryRef = useRef(null)
  const subcategoryRef = useRef(null)

  // Calculate pagination
  const indexOfLastCategory = currentPage * categoriesPerPage
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage
  const currentCategories = auqliCategories.slice(indexOfFirstCategory, indexOfLastCategory)
  const totalPages = Math.ceil(auqliCategories.length / categoriesPerPage)

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Initialize selected categories with current values
  useEffect(() => {
    if (isOpen && unmatchedProducts.length > 0) {
      const initialSelections: { [productId: string]: { mainCategory: string; subCategory: string } } = {}

      unmatchedProducts.forEach((product) => {
        initialSelections[product.id] = {
          mainCategory: product.mainCategory || "",
          subCategory: product.subCategory || "",
        }
      })

      setSelectedCategories(initialSelections)
      setActiveProduct(unmatchedProducts[0].id)

      // Reset pagination to first page when opening modal
      setCurrentPage(1)
    }
  }, [isOpen, unmatchedProducts])

  // When active product changes, update the selected categories
  useEffect(() => {
    if (activeProduct && selectedCategories[activeProduct]) {
      setSelectedMainCategory(selectedCategories[activeProduct].mainCategory)
      setSelectedSubCategory(selectedCategories[activeProduct].subCategory)
    } else {
      setSelectedMainCategory("")
      setSelectedSubCategory("")
    }
  }, [activeProduct, selectedCategories])

  useEffect(() => {
    if (selectedMainCategory && !selectedSubCategory) {
      setSelectionStep(2) // Move to subcategory selection
    } else if (!selectedMainCategory) {
      setSelectionStep(1) // Back to main category selection
    } else if (selectedMainCategory && selectedSubCategory) {
      setSelectionStep(3) // Both selected, no guide needed
    }
  }, [selectedMainCategory, selectedSubCategory])

  const handleCategorySelect = (categoryName: string) => {
    if (!activeProduct) return

    // If clicking the same category, just toggle it
    if (selectedMainCategory === categoryName) {
      setSelectedMainCategory("")
      setSelectedSubCategory("")
      setSelectionStep(1)

      setSelectedCategories((prev) => ({
        ...prev,
        [activeProduct]: {
          ...prev[activeProduct],
          mainCategory: "",
          subCategory: "",
        },
      }))
    } else {
      setSelectedMainCategory(categoryName)
      setSelectedSubCategory("")
      setSelectionStep(2)

      setSelectedCategories((prev) => ({
        ...prev,
        [activeProduct]: {
          ...prev[activeProduct],
          mainCategory: categoryName,
          subCategory: "",
        },
      }))
    }
  }

  const handleSubcategorySelect = (subcategoryName: string) => {
    if (!activeProduct) return

    setSelectedSubCategory(subcategoryName)

    setSelectedCategories((prev) => ({
      ...prev,
      [activeProduct]: {
        ...prev[activeProduct],
        subCategory: subcategoryName,
      },
    }))
  }

  const handleSave = () => {
    onSave(selectedCategories)
  }

  const getCompletedCount = () => {
    return Object.values(selectedCategories).filter(
      (cat) =>
        cat.mainCategory &&
        cat.subCategory &&
        !cat.mainCategory.includes("Uncategorized") &&
        !cat.subCategory.includes("Uncategorized"),
    ).length
  }

  const moveToNextProduct = () => {
    const currentIndex = unmatchedProducts.findIndex((p) => p.id === activeProduct)
    if (currentIndex < unmatchedProducts.length - 1) {
      setActiveProduct(unmatchedProducts[currentIndex + 1].id)
    } else {
      handleSave()
    }
  }

  // Function to get specific categorization status message
  const getCategoryStatusMessage = (product: { mainCategory: string; subCategory: string }) => {
    const mainCategoryMissing = !product.mainCategory || product.mainCategory.includes("Uncategorized")
    const subCategoryMissing = !product.subCategory || product.subCategory.includes("Uncategorized")

    if (mainCategoryMissing && subCategoryMissing) {
      return "Main category & subcategory missing"
    } else if (mainCategoryMissing) {
      return "Main category missing"
    } else if (subCategoryMissing) {
      return "Subcategory missing"
    }
    return null
  }

  if (!isOpen || unmatchedProducts.length === 0) return null

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          // Check if all products have been categorized
          const uncategorizedCount = unmatchedProducts.filter(
            (product) => !selectedCategories[product.id]?.mainCategory || !selectedCategories[product.id]?.subCategory,
          ).length

          if (uncategorizedCount > 0) {
            setShowWarningDialog(true)
          } else {
            onClose()
          }
        }
      }}
    >
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>Category Selection Required</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            We couldn't automatically match categories for {unmatchedProducts.length} products. Please select the
            appropriate Auqli categories.
          </p>
          <div className="bg-muted p-2 rounded-md text-sm">
            <span className="font-medium">Progress:</span> {getCompletedCount()} of {unmatchedProducts.length} products
            categorized
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
          {/* Product List */}
          <div className="border rounded-md overflow-hidden">
            <div className="bg-muted p-2 font-medium">Products</div>
            <ScrollArea className="h-[calc(100%-2.5rem)]">
              <div className="p-2">
                {unmatchedProducts.map((product) => {
                  const statusMessage = getCategoryStatusMessage(selectedCategories[product.id] || {})
                  const isFullyCategorized = !statusMessage
                  const statusColor = isFullyCategorized
                    ? "text-green-600 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400"
                  const bgColor = isFullyCategorized
                    ? "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900"
                    : statusMessage
                      ? "bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900"
                      : "hover:bg-muted"

                  return (
                    <div
                      key={product.id}
                      className={`p-2 rounded-md mb-2 cursor-pointer ${
                        activeProduct === product.id ? "bg-primary text-primary-foreground" : bgColor
                      }`}
                      onClick={() => setActiveProduct(product.id)}
                    >
                      <div className="font-medium truncate">{product.name}</div>
                      {selectedCategories[product.id]?.mainCategory && (
                        <div className="text-xs mt-1 opacity-80">
                          {selectedCategories[product.id].mainCategory}
                          {selectedCategories[product.id].subCategory &&
                            ` › ${selectedCategories[product.id].subCategory}`}
                          {statusMessage && (
                            <span className={`ml-1 ${statusColor} flex items-center`}>
                              <AlertTriangle className="h-3 w-3 mr-1" /> {statusMessage}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Category Selection */}
          <div className="col-span-2 border rounded-md overflow-hidden flex flex-col">
            <div className="bg-muted p-2 font-medium">
              {activeProduct && unmatchedProducts.find((p) => p.id === activeProduct)?.name}
            </div>

            <Tabs defaultValue="categories" className="flex-1 flex flex-col">
              <div className="border-b px-2">
                <TabsList>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="categories" className="flex-1 overflow-hidden">
                <div className="bg-muted/50 p-2 text-sm border-b">
                  <p className="font-medium">Instructions:</p>
                  <ol className="ml-5 mt-1 space-y-1">
                    <li className={`flex items-center ${selectionStep === 1 ? "text-primary font-medium" : ""}`}>
                      {selectionStep === 1 && <ArrowRight className="mr-1 h-3 w-3 text-primary" />}
                      First, select a main category from the list below (not "Uncategorized")
                    </li>
                    <li className={`flex items-center ${selectionStep === 2 ? "text-primary font-medium" : ""}`}>
                      {selectionStep === 2 && <ArrowRight className="mr-1 h-3 w-3 text-primary" />}
                      Then, select a specific subcategory (not "Uncategorized")
                    </li>
                  </ol>
                  <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Note: Both main category and subcategory must be properly selected
                  </div>
                </div>
                <ScrollArea className="h-[calc(100%-4rem)]">
                  <div className="p-4">
                    {currentCategories.map((category) => (
                      <div
                        key={category.id}
                        className="mb-4 border rounded-md overflow-hidden"
                        ref={selectionStep === 1 ? mainCategoryRef : null}
                      >
                        <div
                          className={`p-3 cursor-pointer ${selectedMainCategory === category.name ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                          onClick={() => handleCategorySelect(category.name)}
                        >
                          <div className="font-medium flex items-center justify-between">
                            {category.name}
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${selectedMainCategory === category.name ? "rotate-180" : ""}`}
                            />
                          </div>
                        </div>

                        {selectedMainCategory === category.name &&
                          Array.isArray(category.subcategories) &&
                          category.subcategories.length > 0 && (
                            <div
                              className="p-2 bg-background border-t"
                              ref={selectionStep === 2 ? subcategoryRef : null}
                            >
                              <div className="pl-2 space-y-1 max-h-60 overflow-y-auto">
                                {category.subcategories.map((subcategory) =>
                                  subcategory && subcategory.name ? (
                                    <div
                                      key={subcategory.id || `subcategory-${subcategory.name}`}
                                      className={`p-2 rounded-md cursor-pointer ${
                                        selectedSubCategory === subcategory.name
                                          ? "bg-primary/10 text-primary font-medium"
                                          : "hover:bg-muted"
                                      }`}
                                      onClick={() => handleSubcategorySelect(subcategory.name)}
                                    >
                                      {subcategory.name}
                                    </div>
                                  ) : null,
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}

                    {selectionStep === 1 && mainCategoryRef.current && (
                      <SelectionGuide
                        step={1}
                        targetRef={mainCategoryRef}
                        message="First, select a main category"
                        position="right"
                      />
                    )}
                    {selectionStep === 2 && subcategoryRef.current && (
                      <SelectionGuide
                        step={2}
                        targetRef={subcategoryRef}
                        message="Now, select a subcategory"
                        position="right"
                      />
                    )}

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-2 mt-4">
                        <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 1}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === totalPages}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Selected Category</h3>
                        <p className="text-lg">
                          {selectedMainCategory || <span className="text-muted-foreground italic">None selected</span>}
                          {selectedMainCategory && selectedMainCategory.includes("Uncategorized") && (
                            <span className="ml-2 text-sm text-amber-600 dark:text-amber-400 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Please select a proper main category
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium">Selected Subcategory</h3>
                        <p className="text-lg">
                          {selectedSubCategory || <span className="text-muted-foreground italic">None selected</span>}
                          {selectedSubCategory && selectedSubCategory.includes("Uncategorized") && (
                            <span className="ml-2 text-sm text-amber-600 dark:text-amber-400 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Please select a proper subcategory
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {activeProduct && (
              <>
                Product {unmatchedProducts.findIndex((p) => p.id === activeProduct) + 1} of {unmatchedProducts.length}
              </>
            )}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                // Check if all products have been categorized
                const uncategorizedCount = unmatchedProducts.filter(
                  (product) =>
                    !selectedCategories[product.id]?.mainCategory || !selectedCategories[product.id]?.subCategory,
                ).length

                if (uncategorizedCount > 0) {
                  setShowWarningDialog(true)
                } else {
                  onClose()
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={moveToNextProduct}
              disabled={
                !selectedMainCategory ||
                !selectedSubCategory ||
                selectedMainCategory.includes("Uncategorized") ||
                selectedSubCategory.includes("Uncategorized")
              }
            >
              Next Product
            </Button>
            <Button onClick={handleSave} disabled={getCompletedCount() < unmatchedProducts.length}>
              Save All
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      {/* Warning Dialog */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Incomplete Category Mapping
            </AlertDialogTitle>
            <AlertDialogDescription>
              Not all products have been properly categorized. Uncategorized products will be skipped or use default
              categories in the final export.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowWarningDialog(false)}>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowWarningDialog(false)
                onClose()
              }}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Skip Uncategorized
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
