"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface ImageUploaderProps {
  onImagesUploaded: (images: string[]) => void
  maxImages?: number
  uploadedImages: string[]
  onRemoveImage: (index: number) => void
}

export function ImageUploader({ onImagesUploaded, maxImages = 3, uploadedImages, onRemoveImage }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    processFiles(Array.from(files))
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    processFiles(Array.from(files))
  }

  const processFiles = (files: File[]) => {
    // Check if adding these files would exceed the max
    if (uploadedImages.length + files.length > maxImages) {
      toast({
        title: `Maximum ${maxImages} images allowed`,
        description: `You can only upload up to ${maxImages} images for remixing`,
        variant: "destructive",
      })

      // Only process up to the max allowed
      files = files.slice(0, maxImages - uploadedImages.length)
    }

    // Filter for image files only
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    if (imageFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload image files only (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file sizes
    const validFiles = imageFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    // Convert files to data URLs
    const newImages: string[] = []
    let loadedCount = 0

    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string)
        }

        loadedCount++
        if (loadedCount === validFiles.length) {
          // All files have been processed
          onImagesUploaded([...uploadedImages, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? "border-purple-500 bg-purple-500/10" : "border-gray-700 hover:border-gray-600 bg-[#1a2235]/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={uploadedImages.length >= maxImages ? undefined : triggerFileInput}
        style={{ cursor: uploadedImages.length >= maxImages ? "default" : "pointer" }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={uploadedImages.length >= maxImages}
        />

        <div className="flex flex-col items-center justify-center">
          <div className={`p-3 rounded-full mb-3 ${isDragging ? "bg-purple-500/20" : "bg-[#111827]"}`}>
            <Upload className={`h-6 w-6 ${isDragging ? "text-purple-400" : "text-gray-400"}`} />
          </div>

          <h3 className="text-lg font-medium text-white mb-2">
            {uploadedImages.length >= maxImages ? "Maximum images reached" : "Drop images here or click to upload"}
          </h3>

          <p className="text-sm text-gray-400 mb-2">
            {uploadedImages.length >= maxImages
              ? `You've reached the maximum of ${maxImages} images`
              : `Upload 2-3 images to remix (${uploadedImages.length}/${maxImages})`}
          </p>

          <p className="text-xs text-gray-500">JPG, PNG • Max 5MB per image</p>
        </div>
      </div>

      {/* Display uploaded images */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <AnimatePresence>
            {uploadedImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative group"
              >
                <Card className="overflow-hidden border-gray-700 bg-[#111827] h-24 flex items-center justify-center">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Uploaded image ${index + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveImage(index)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
                <div className="absolute -top-2 -right-2 bg-[#111827] rounded-full p-1 shadow-md">
                  <div className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {uploadedImages.length > 0 && uploadedImages.length < 2 && (
        <div className="flex items-center p-3 bg-amber-900/20 border border-amber-800/30 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-amber-300">Please upload at least 2 images for best remix results</p>
        </div>
      )}
    </div>
  )
}
