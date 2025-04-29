"use client"

import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import PropTypes from "prop-types"

export function InvalidCSVModal({ isOpen, onClose, platform = "shopify" }) {
  if (!isOpen) return null

  const isShopify = platform === "shopify"
  const themeColor = isShopify ? "#45c133" : "#8696ee"
  const buttonColor = isShopify ? "bg-[#16783a] hover:bg-[#225b35]" : "bg-[#5466b5] hover:bg-[#3a4a8c]"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-[90vw] max-w-lg bg-[#0c1322] rounded-lg overflow-hidden text-white">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-amber-500 mr-3" />
            <h2 className="text-xl font-bold">Invalid CSV Format</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="mb-4">
            The uploaded file does not match the expected {isShopify ? "Shopify" : "WooCommerce"} CSV format. Please
            ensure you are uploading a valid {isShopify ? "Shopify" : "WooCommerce"} product export file.
          </p>

          <div className="bg-[#1a2235] p-4 rounded-md mb-4">
            <h3 className="font-medium mb-2" style={{ color: themeColor }}>
              Required {isShopify ? "Shopify" : "WooCommerce"} CSV Headers:
            </h3>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
              {isShopify ? (
                <>
                  <li>Handle</li>
                  <li>Title</li>
                  <li>Body (HTML)</li>
                  <li>Vendor</li>
                  <li>Product Category</li>
                  <li>Type</li>
                  <li>Tags</li>
                  <li>Published</li>
                  <li>Image Src</li>
                </>
              ) : (
                <>
                  <li>Name</li>
                  <li>Description</li>
                  <li>Regular Price</li>
                  <li>Sale Price</li>
                  <li>Stock Quantity</li>
                  <li>Categories</li>
                  <li>Images</li>
                </>
              )}
            </ul>
          </div>

          <p className="text-sm text-gray-400">
            Need help?{" "}
            <a href="#" className="hover:underline" style={{ color: themeColor }}>
              View our guide
            </a>{" "}
            on exporting products from {isShopify ? "Shopify" : "WooCommerce"} or{" "}
            <a href="#" className="hover:underline" style={{ color: themeColor }}>
              contact support
            </a>
            .
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end">
          <Button onClick={onClose} className={`text-white ${buttonColor}`}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

InvalidCSVModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  platform: PropTypes.string,
}
