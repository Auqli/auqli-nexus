"use client"

import { AlertTriangle, X, Download, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShopifySampleCSV } from "@/components/sample-csv"

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-destructive text-xl">
              <AlertTriangle className="h-6 w-6 mr-2 text-destructive" />
              Invalid CSV Format
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4">
            <h3 className="text-lg font-bold text-destructive mb-2">FILE IS NOT A SHOPIFY CSV</h3>
            <p className="text-destructive/90">
              The file you uploaded does not match the expected Shopify CSV format. Please ensure you're uploading a CSV
              file exported from Shopify.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">What is a valid Shopify CSV?</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">A valid Shopify CSV file must:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Have a .csv file extension</li>
              <li>Contain the required Shopify headers</li>
              <li>Be exported from your Shopify admin panel</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Required Headers</h3>
            <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
              <ul className="grid grid-cols-2 gap-2">
                {requiredHeaders.map((header, index) => (
                  <li key={index} className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm font-mono">{header}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Sample Format</h3>
            <div className="max-h-60 overflow-y-auto">
              <ShopifySampleCSV />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={downloadShopifyTemplate} className="bg-primary hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Download Shopify Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
