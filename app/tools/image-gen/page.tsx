"use client"

import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ImageGenPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ImageGen AI</h1>
        <p className="text-gray-500 mt-1">Generate high-quality product photos and visuals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ImageGen AI Tool</CardTitle>
          <CardDescription>Create professional product images and visuals using AI</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            This is a placeholder for the ImageGen AI tool. You would integrate your ImageGen functionality here.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
