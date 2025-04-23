"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, Download, Edit, Trash2, CheckCircle } from "lucide-react"
import { fetchRecentMappings, searchMappings } from "@/app/actions"

export default function MappingsPage() {
  const [mappings, setMappings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMapping, setSelectedMapping] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    loadMappings()
  }, [])

  const loadMappings = async () => {
    setIsLoading(true)
    try {
      const data = await fetchRecentMappings(50)
      setMappings(data)
    } catch (error) {
      console.error("Error loading mappings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      await loadMappings()
      return
    }

    setIsLoading(true)
    try {
      const results = await searchMappings(searchQuery)
      setMappings(results)
    } catch (error) {
      console.error("Error searching mappings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (mapping) => {
    setSelectedMapping(mapping)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id) => {
    // Implement delete functionality
    console.log("Delete mapping with ID:", id)
  }

  const handleExportCSV = () => {
    // Implement CSV export functionality
    console.log("Exporting mappings to CSV")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Category Mappings</h1>
        <Button onClick={loadMappings} disabled={isLoading} className="bg-[#16783a] hover:bg-[#225b35]">
          Refresh
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Category Mappings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Main Category</TableHead>
                <TableHead>Subcategory</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.length > 0 ? (
                mappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell className="font-medium max-w-[200px] truncate" title={mapping.product_name}>
                      {mapping.product_name}
                    </TableCell>
                    <TableCell>{mapping.main_category}</TableCell>
                    <TableCell>{mapping.sub_category}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className="bg-[#16783a] h-2.5 rounded-full"
                            style={{ width: `${(mapping.confidence_score || 0) * 100}%` }}
                          ></div>
                        </div>
                        <span>{((mapping.confidence_score || 0) * 100).toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {mapping.user_verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(mapping.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(mapping)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(mapping.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                    {isLoading ? "Loading data..." : "No category mappings found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category Mapping</DialogTitle>
          </DialogHeader>
          {selectedMapping && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input id="product-name" defaultValue={selectedMapping.product_name} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="main-category">Main Category</Label>
                <Select defaultValue={selectedMapping.main_category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select main category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Home & Living">Home & Living</SelectItem>
                    <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
                    <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-category">Subcategory</Label>
                <Select defaultValue={selectedMapping.sub_category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T-Shirts">T-Shirts</SelectItem>
                    <SelectItem value="Jeans">Jeans</SelectItem>
                    <SelectItem value="Dresses">Dresses</SelectItem>
                    <SelectItem value="Smartphones">Smartphones</SelectItem>
                    <SelectItem value="Laptops">Laptops</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="verified" defaultChecked={selectedMapping.user_verified} />
                <Label htmlFor="verified">Mark as verified</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#16783a] hover:bg-[#225b35]">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
