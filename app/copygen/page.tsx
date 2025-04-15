"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, Sparkles, Settings, RotateCcw, ShoppingBag, Tag, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CopyGenPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [copyType, setCopyType] = useState("product")

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center mr-3 shadow-md">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">CopyGen AI</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card className="border-gray-800 bg-[#1A1D24] shadow-saas mb-6">
              <CardHeader className="border-b border-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Generate Copy</CardTitle>
                    <CardDescription>Create compelling copy for your store</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant={copyType === "product" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCopyType("product")}
                      className={
                        copyType === "product" ? "bg-emerald-500 hover:bg-emerald-600" : "border-gray-700 text-gray-400"
                      }
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Product
                    </Button>
                    <Button
                      variant={copyType === "collection" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCopyType("collection")}
                      className={
                        copyType === "collection"
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : "border-gray-700 text-gray-400"
                      }
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Collection
                    </Button>
                    <Button
                      variant={copyType === "meta" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCopyType("meta")}
                      className={
                        copyType === "meta" ? "bg-emerald-500 hover:bg-emerald-600" : "border-gray-700 text-gray-400"
                      }
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Meta
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">
                      {copyType === "product"
                        ? "Product Information"
                        : copyType === "collection"
                          ? "Collection Information"
                          : "Page Information"}
                    </label>
                    <textarea
                      className="w-full h-32 bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white"
                      placeholder={
                        copyType === "product"
                          ? "Describe your product, including key features, materials, and benefits..."
                          : copyType === "collection"
                            ? "Describe this collection, what products it contains, and who it's for..."
                            : "Describe the page content for SEO meta description generation..."
                      }
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Tone</label>
                      <select className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2.5 text-white">
                        <option>Professional</option>
                        <option>Casual</option>
                        <option>Enthusiastic</option>
                        <option>Luxury</option>
                        <option>Minimalist</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Length</label>
                      <select className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2.5 text-white">
                        <option>Short (50-100 words)</option>
                        <option>Medium (100-200 words)</option>
                        <option>Long (200-300 words)</option>
                        <option>Extra Long (300+ words)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <Button variant="outline" className="border-gray-700 text-gray-400">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Area - Coming Soon */}
            <Card className="border-gray-800 bg-[#1A1D24] shadow-saas">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white">Generated Copy</CardTitle>
                <CardDescription>Your AI-generated copy will appear here</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-medium mb-2">No Copy Generated Yet</h3>
                  <p className="text-gray-400 max-w-md">
                    Fill out the form above and click "Generate Copy" to create your first AI-powered product
                    description.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="border-gray-800 bg-[#1A1D24] shadow-saas mb-6">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white text-lg">Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">Target Audience</label>
                    <select className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2.5 text-white">
                      <option>General</option>
                      <option>Luxury Shoppers</option>
                      <option>Budget Conscious</option>
                      <option>Professionals</option>
                      <option>Young Adults</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">SEO Optimization</label>
                    <select className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2.5 text-white">
                      <option>Balanced</option>
                      <option>High (Keyword Focused)</option>
                      <option>Low (Readability Focused)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">Include</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="features" className="mr-2" />
                        <label htmlFor="features" className="text-gray-300 text-sm">
                          Key Features
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="benefits" className="mr-2" />
                        <label htmlFor="benefits" className="text-gray-300 text-sm">
                          Benefits
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="cta" className="mr-2" />
                        <label htmlFor="cta" className="text-gray-300 text-sm">
                          Call to Action
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-800 pt-4">
                <Button variant="outline" className="w-full border-gray-700 text-gray-400">
                  <Settings className="h-4 w-4 mr-2" />
                  Reset Settings
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
