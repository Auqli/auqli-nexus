import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ShopifySampleCSV } from "@/components/sample-csv"
import { WooCommerceSampleCSV } from "@/components/woocommerce-sample-csv"

interface InvalidCSVModalProps {
  isOpen: boolean
  onClose: () => void
  platform: string
}

export function InvalidCSVModal({ isOpen, onClose, platform }: InvalidCSVModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invalid CSV Format</DialogTitle>
          <DialogDescription>
            {platform === "shopify" ? (
              <>
                Your CSV file doesn't match the expected Shopify format. Please make sure you're uploading a CSV file
                exported from Shopify. Here's an example of the expected format:
              </>
            ) : (
              <>
                Your CSV file doesn't match the expected WooCommerce format. Please make sure you're uploading a CSV
                file exported from WooCommerce. Here's an example of the expected format:
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 border rounded-md overflow-hidden">
          {platform === "shopify" ? <ShopifySampleCSV /> : <WooCommerceSampleCSV />}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>
            {platform === "shopify" ? (
              <>
                To export your products from Shopify, go to Products &gt; All Products, click "Export", and select "CSV
                for all products" or "CSV for current page".
              </>
            ) : (
              <>
                To export your products from WooCommerce, go to Products &gt; All Products, click "Export", and select
                the CSV format.
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
