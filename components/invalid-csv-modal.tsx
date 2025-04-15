"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface InvalidCSVModalProps {
  isOpen?: boolean
  onClose?: () => void
}

export function InvalidCSVModal({ isOpen = false, onClose }: InvalidCSVModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#1a2235] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Invalid CSV Format</DialogTitle>
          <DialogDescription>
            The uploaded CSV file does not match the expected format. Please use the Shopify CSV template.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
