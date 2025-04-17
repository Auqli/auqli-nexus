"use client"

import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CopyGenPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">CopyGen AI</h1>
        <p className="text-gray-500 mt-1">Create powerful product titles and descriptions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CopyGen AI Tool</CardTitle>
          <CardDescription>Generate compelling product titles and descriptions using AI</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            This is a placeholder for the CopyGen AI tool. You would integrate your CopyGen functionality here.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
