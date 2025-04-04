"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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

  const handleCategorySelect = (categoryName: string) => {
    if (!activeProduct) return

    setSelectedMainCategory(categoryName)
    setSelectedSubCategory("")

    setSelectedCategories((prev) => ({
      ...prev,
      [activeProduct]: {
        ...prev[activeProduct],
        mainCategory: categoryName,
        subCategory: "",
      },
    }))
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

  const moveToNextProduct = () => {
    const currentIndex = unmatchedProducts.findIndex((p) => p.id === activeProduct)
    if (currentIndex < unmatchedProducts.length - 1) {
      setActiveProduct(unmatchedProducts[currentIndex + 1].id)
    } else {
      handleSave()
    }
  }

  const getCompletedCount = () => {
    return Object.values(selectedCategories).filter((cat) => cat.mainCategory && cat.subCategory).length
  }

  if (!isOpen || unmatchedProducts.length === 0) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                {unmatchedProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`p-2 rounded-md mb-2 cursor-pointer ${
                      activeProduct === product.id
                        ? "bg-primary text-primary-foreground"
                        : selectedCategories[product.id]?.mainCategory && selectedCategories[product.id]?.subCategory
                          ? "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900"
                          : "hover:bg-muted"
                    }`}
                    onClick={() => setActiveProduct(product.id)}
                  >
                    <div className="font-medium truncate">{product.name}</div>
                    {selectedCategories[product.id]?.mainCategory && (
                      <div className="text-xs mt-1 opacity-80">
                        {selectedCategories[product.id].mainCategory}
                        {selectedCategories[product.id].subCategory &&
                          ` › ${selectedCategories[product.id].subCategory}`}
                      </div>
                    )}
                  </div>
                ))}
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
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <Accordion type="single" collapsible className="w-full">
                      {auqliCategories.map((category) => (
                        <AccordionItem key={category.id} value={category.id}>
                          <AccordionTrigger
                            className={`${selectedMainCategory === category.name ? "text-primary font-medium" : ""}`}
                            onClick={() => handleCategorySelect(category.name)}
                          >
                            {category.name}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-4 space-y-2">
                              {category.subcategories.map((subcategory) => (
                                <div
                                  key={subcategory.id}
                                  className={`p-2 rounded-md cursor-pointer ${
                                    selectedMainCategory === category.name && selectedSubCategory === subcategory.name
                                      ? "bg-primary/10 text-primary font-medium"
                                      : "hover:bg-muted"
                                  }`}
                                  onClick={() => handleSubcategorySelect(subcategory.name)}
                                >
                                  {subcategory.name}
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
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
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium">Selected Subcategory</h3>
                        <p className="text-lg">
                          {selectedSubCategory || <span className="text-muted-foreground italic">None selected</span>}
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
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {activeProduct &&
            unmatchedProducts.findIndex((p) => p.id === activeProduct) < unmatchedProducts.length - 1 ? (
              <Button onClick={moveToNextProduct} disabled={!selectedMainCategory || !selectedSubCategory}>
                Next Product
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={getCompletedCount() < unmatchedProducts.length}>
                Save All
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

