"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/db"
import { AlertCircle, Check, Database } from "lucide-react"

export function DatabaseSetup() {
  const [isCreating, setIsCreating] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [seedingDemo, setSeedingDemo] = useState(false)
  const [seedStatus, setSeedStatus] = useState<"idle" | "success" | "error">("idle")
  const [seedMessage, setSeedMessage] = useState("")

  async function createTables() {
    setIsCreating(true)
    setStatus("idle")
    setMessage("")

    try {
      // Create category_mappings table
      const { error: mappingsError } = await supabase.rpc("execute_sql", {
        sql_query: `
          CREATE TABLE IF NOT EXISTS category_mappings (
            id SERIAL PRIMARY KEY,
            product_name TEXT NOT NULL,
            product_description TEXT,
            main_category TEXT NOT NULL,
            sub_category TEXT NOT NULL,
            confidence_score FLOAT,
            user_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (mappingsError) throw mappingsError

      // Create category_corrections table
      const { error: correctionsError } = await supabase.rpc("execute_sql", {
        sql_query: `
          CREATE TABLE IF NOT EXISTS category_corrections (
            id SERIAL PRIMARY KEY,
            product_title TEXT NOT NULL,
            original_main_category TEXT NOT NULL,
            original_subcategory TEXT NOT NULL,
            corrected_main_category TEXT NOT NULL,
            corrected_subcategory TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (correctionsError) throw correctionsError

      setStatus("success")
      setMessage("Tables created successfully!")
    } catch (error) {
      console.error("Error creating tables:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : String(error))
    } finally {
      setIsCreating(false)
    }
  }

  async function seedDemoData() {
    setSeedingDemo(true)
    setSeedStatus("idle")
    setSeedMessage("")

    try {
      // Seed category_mappings with demo data
      const { error: seedMappingsError } = await supabase.from("category_mappings").insert([
        {
          product_name: "Men's Cotton T-Shirt",
          product_description: "Comfortable cotton t-shirt for everyday wear",
          main_category: "Fashion",
          sub_category: "Men's T-Shirts",
          confidence_score: 0.92,
          user_verified: true,
        },
        {
          product_name: "Women's Denim Jeans",
          product_description: "Classic blue denim jeans with straight fit",
          main_category: "Fashion",
          sub_category: "Women's Jeans",
          confidence_score: 0.88,
          user_verified: true,
        },
        {
          product_name: "Wireless Bluetooth Headphones",
          product_description: "Noise-cancelling headphones with 20-hour battery life",
          main_category: "Electronics",
          sub_category: "Audio",
          confidence_score: 0.95,
          user_verified: true,
        },
        {
          product_name: "Smartphone Case",
          product_description: "Protective case for iPhone 13",
          main_category: "Accessories",
          sub_category: "Phone Accessories",
          confidence_score: 0.85,
          user_verified: false,
        },
        {
          product_name: "Leather Wallet",
          product_description: "Genuine leather wallet with multiple card slots",
          main_category: "Fashion",
          sub_category: "Accessories",
          confidence_score: 0.78,
          user_verified: true,
        },
      ])

      if (seedMappingsError) throw seedMappingsError

      // Seed category_corrections with demo data
      const { error: seedCorrectionsError } = await supabase.from("category_corrections").insert([
        {
          product_title: "Wireless Gaming Mouse",
          original_main_category: "Accessories",
          original_subcategory: "Computer Accessories",
          corrected_main_category: "Gaming",
          corrected_subcategory: "Gaming Accessories",
        },
        {
          product_title: "Kitchen Knife Set",
          original_main_category: "Home",
          original_subcategory: "Home Accessories",
          corrected_main_category: "Home & Living",
          corrected_subcategory: "Kitchen",
        },
      ])

      if (seedCorrectionsError) throw seedCorrectionsError

      setSeedStatus("success")
      setSeedMessage("Demo data added successfully!")
    } catch (error) {
      console.error("Error seeding demo data:", error)
      setSeedStatus("error")
      setSeedMessage(error instanceof Error ? error.message : String(error))
    } finally {
      setSeedingDemo(false)
    }
  }

  return (
    <Card className="border shadow-md overflow-hidden rounded-md">
      <CardHeader className="bg-[#16783a] text-white p-6">
        <CardTitle>Database Setup</CardTitle>
        <CardDescription className="text-white/80">Create required tables and seed demo data</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">1. Create Required Tables</h3>
          <p className="text-gray-600">
            This will create the necessary tables for category mappings and corrections if they don't exist.
          </p>

          <div className="flex items-center space-x-4">
            <Button onClick={createTables} disabled={isCreating} className="bg-[#16783a] hover:bg-[#225b35]">
              <Database className="mr-2 h-4 w-4" />
              {isCreating ? "Creating Tables..." : "Create Tables"}
            </Button>

            {status === "success" && (
              <div className="flex items-center text-green-600">
                <Check className="mr-1 h-4 w-4" />
                <span>{message}</span>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="mr-1 h-4 w-4" />
                <span>{message}</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-4">
          <h3 className="font-medium text-lg">2. Seed Demo Data</h3>
          <p className="text-gray-600">Add sample data to test the database components.</p>

          <div className="flex items-center space-x-4">
            <Button onClick={seedDemoData} disabled={seedingDemo} className="bg-[#5466b5] hover:bg-[#4355a4]">
              <Database className="mr-2 h-4 w-4" />
              {seedingDemo ? "Adding Demo Data..." : "Add Demo Data"}
            </Button>

            {seedStatus === "success" && (
              <div className="flex items-center text-green-600">
                <Check className="mr-1 h-4 w-4" />
                <span>{seedMessage}</span>
              </div>
            )}

            {seedStatus === "error" && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="mr-1 h-4 w-4" />
                <span>{seedMessage}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
