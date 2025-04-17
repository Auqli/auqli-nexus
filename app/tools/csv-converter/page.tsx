"use client"

import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CSVConverterPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">CSV Converter</h1>
        <p className="text-gray-500 mt-1">Convert and prepare product CSVs for bulk uploads</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV Converter Tool</CardTitle>
          <CardDescription>Upload your CSV file to convert and prepare it for product categorization</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Your existing CSV Converter component would go here */}
          <p className="text-gray-500">
            This is a placeholder for your existing CSV Converter functionality. You would integrate your current
            converter component here.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
