"use client"

import type React from "react"
<<<<<<< HEAD

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CSVUploaderProps {
  onUploadSuccess: (products: any[]) => void
=======
import { useState } from "react"
import { Upload, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CSVUploaderProps {
  onUploadSuccess: (products: any[], isAuqliFormatted?: boolean) => void
>>>>>>> master
  onUploadError: (error: string) => void
}

export function CSVUploader({ onUploadSuccess, onUploadError }: CSVUploaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
<<<<<<< HEAD
=======
  const [isAuqliFormatted, setIsAuqliFormatted] = useState(false)
  const [auqliFormatMessage, setAuqliFormatMessage] = useState<string | null>(null)
>>>>>>> master

  const uploadToAPI = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to upload file")
    }

    return await response.json()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsLoading(true)
<<<<<<< HEAD

    try {
      const result = await uploadToAPI(file)
      if (result.products) {
=======
    setIsAuqliFormatted(false)
    setAuqliFormatMessage(null)

    try {
      const result = await uploadToAPI(file)

      if (result.isAuqliFormatted) {
        setIsAuqliFormatted(true)
        setAuqliFormatMessage(result.message || "This file appears to be already formatted for Auqli.")
        onUploadSuccess(result.products, true)
      } else if (result.products) {
>>>>>>> master
        onUploadSuccess(result.products)
      } else if (result.error) {
        onUploadError(result.error)
      }
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Upload CSV File</CardTitle>
      </CardHeader>
      <CardContent>
<<<<<<< HEAD
=======
        {isAuqliFormatted && auqliFormatMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-800 dark:text-green-300">Already in Auqli Format</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              <p className="mb-2">{auqliFormatMessage}</p>
              <p className="text-sm">
                You can proceed with this file or contact{" "}
                <a href="mailto:support@auqli.com" className="underline">
                  Auqli support
                </a>{" "}
                if you need assistance.
              </p>
            </AlertDescription>
          </Alert>
        )}

>>>>>>> master
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Drop your file here</h3>
          <p className="mb-4 text-sm text-muted-foreground max-w-xs">Upload a CSV file with your product data</p>
          <div className="flex flex-col items-center">
            <label htmlFor="csv-file-upload">
              <Button variant="outline" disabled={isLoading}>
                {isLoading ? "Uploading..." : "Select CSV File"}
              </Button>
              <input
                id="csv-file-upload"
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </label>
            {fileName && <p className="mt-2 text-sm text-muted-foreground">Selected: {fileName}</p>}
            {isLoading && (
              <div className="mt-4 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                <span>Processing...</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

