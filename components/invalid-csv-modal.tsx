"use client"

import { AlertTriangle, X, Download, FileText, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShopifySampleCSV } from "@/components/sample-csv"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface InvalidCSVModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InvalidCSVModal({ isOpen, onClose }: InvalidCSVModalProps) {
  // List of required Shopify CSV headers
  const requiredHeaders = [
    "Handle",
    "Title",
    "Body (HTML)",
    "Vendor",
    "Product Category",
    "Type",
    "Tags",
    "Published",
    "Variant Grams",
    "Variant Inventory Qty",
    "Variant Price",
    "Image Src",
  ]

  const downloadShopifyTemplate = () => {
    // URL to the Shopify template
    const templateUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20Shopify-lIDm0HEwOr7C1CmzCBqEbbElQzexMs.csv"

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = templateUrl
    link.download = "shopify_template.csv"

    // Append to the document, click it, and remove it
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-[85vw] md:max-w-2xl lg:max-w-3xl p-0 overflow-hidden bg-[#0f172a] text-white border border-gray-800 rounded-lg shadow-xl">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-gray-800 bg-[#0c1322]">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-lg sm:text-xl font-bold text-white">
              <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              Invalid CSV Format
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-8rem)]">
          <div className="px-4 sm:px-6 py-5 space-y-5">
            {/* Error message */}
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <h3 className="text-base sm:text-lg font-bold text-red-400 mb-2">FILE IS NOT A SHOPIFY CSV</h3>
              <p className="text-red-300 text-sm sm:text-base">
                The file you uploaded does not match the expected Shopify CSV format. Please ensure you're uploading a
                CSV file exported from Shopify.
              </p>
            </div>

            {/* Tabs for better organization */}
            <Tabs defaultValue="requirements" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4 bg-gray-800/50">
                <TabsTrigger value="requirements" className="text-sm">
                  Requirements
                </TabsTrigger>
                <TabsTrigger value="headers" className="text-sm">
                  Required Headers
                </TabsTrigger>
                <TabsTrigger value="sample" className="text-sm">
                  Sample Format
                </TabsTrigger>
              </TabsList>

              <TabsContent value="requirements" className="mt-0">
                <div className="bg-gray-800/30 rounded-lg p-5 border border-gray-700">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center text-blue-300">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900/30 mr-2">
                      <span className="text-blue-400 text-sm font-bold">?</span>
                    </span>
                    What is a valid Shopify CSV?
                  </h3>
                  <p className="text-gray-300 mb-4 text-sm sm:text-base">
                    A valid Shopify CSV file must meet the following requirements:
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Have a .csv file extension",
                      "Contain the required Shopify headers",
                      "Be exported from your Shopify admin panel",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start bg-gray-800/40 p-3 rounded-md border border-gray-700">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-900/30 flex items-center justify-center mr-3 mt-0.5">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                        </div>
                        <span className="text-gray-200 text-sm sm:text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="headers" className="mt-0">
                <div className="bg-gray-800/30 rounded-lg p-5 border border-gray-700">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center text-purple-300">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-900/30 mr-2">
                      <FileText className="h-3 w-3 text-purple-400" />
                    </span>
                    Required Headers
                  </h3>
                  <p className="text-gray-300 mb-4 text-sm">Your CSV file must include these headers (column names):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {requiredHeaders.map((header, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-800/70 px-3 py-2.5 rounded-md border border-gray-700 hover:border-gray-600 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5 mr-2 text-[#45c133] flex-shrink-0" />
                        <span className="text-sm font-mono text-gray-200">{header}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sample" className="mt-0">
                <div className="bg-gray-800/30 rounded-lg p-5 border border-gray-700">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center text-amber-300">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-900/30 mr-2">
                      <FileText className="h-3 w-3 text-amber-400" />
                    </span>
                    Sample Format
                  </h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    Here's an example of a properly formatted Shopify CSV file:
                  </p>
                  <div className="border border-gray-700 rounded-lg overflow-hidden max-w-full">
                    <ShopifySampleCSV />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mt-3 italic">
                    This is what your CSV should look like when exported from Shopify.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <DialogFooter className="px-4 sm:px-6 py-4 border-t border-gray-800 bg-[#0c1322] flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            className="sm:order-1 order-2 border-gray-700 hover:bg-gray-800 hover:text-white text-gray-300"
          >
            Close
          </Button>
          <Button
            onClick={downloadShopifyTemplate}
            className="bg-[#16783a] hover:bg-[#225b35] text-white sm:order-2 order-1 flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Shopify Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
