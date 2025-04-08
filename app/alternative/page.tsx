"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CSVUploader } from "@/components/csv-uploader"

interface Product {
  name: string
  price: string
  image: string
  description: string
  weight: string
  inventory: string
  condition: string
  mainCategory: string
  subCategory: string
}

export default function AlternativePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleUploadSuccess = (products: Product[]) => {
    setProducts(products)
    setError(null)
  }

  const handleUploadError = (error: string) => {
    setError(error)
    setProducts([])
  }

  const downloadFormattedCSV = () => {
    if (products.length === 0) return

    const headers = [
      "Product Name",
      "Product Main Price",
      "Product Main Image",
      "Product Description",
      "Product Weight",
      "Product Inventory",
      "Product Condition",
      "Product Main Category",
      "Product Subcategory",
    ]

    const csvContent = [
      headers.join(","),
      ...products.map((product) =>
        [
          `"${product.name.replace(/"/g, '""')}"`,
          `"${product.price.replace(/"/g, '""')}"`,
          `"${product.image.replace(/"/g, '""')}"`,
          `"${product.description.replace(/"/g, '""')}"`,
          `"${product.weight.replace(/"/g, '""')}"`,
          `"${product.inventory.replace(/"/g, '""')}"`,
          `"${product.condition.replace(/"/g, '""')}"`,
          `"${product.mainCategory.replace(/"/g, '""')}"`,
          `"${product.subCategory.replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `formatted_products.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">CSV Product Formatter</h1>

      <div className="grid gap-8 max-w-4xl mx-auto">
        <CSVUploader onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {products.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Formatted Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Inventory</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Main Category</TableHead>
                      <TableHead>Subcategory</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.slice(0, 5).map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell className="max-w-[100px] truncate">{product.image}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{product.description}</TableCell>
                        <TableCell>{product.weight}</TableCell>
                        <TableCell>{product.inventory}</TableCell>
                        <TableCell>{product.condition}</TableCell>
                        <TableCell>{product.mainCategory}</TableCell>
                        <TableCell>{product.subCategory}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {products.length > 5 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing 5 of {products.length} products. Download to see all.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={downloadFormattedCSV}>
                <Download className="mr-2 h-4 w-4" />
                Download Formatted CSV
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  )
}
