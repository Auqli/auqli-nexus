"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Wand2, Check, Copy, Info, AlertTriangle, Lightbulb, Palette } from "lucide-react"
import { ImageGenerationConfig } from "@/config/image-generation-config"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface UnifiedPromptAssistantProps {
  initialPrompt: string
  onPromptGenerated: (prompt: string) => void
  useCase: string
}

export function UnifiedPromptAssistant({ initialPrompt, onPromptGenerated, useCase }: UnifiedPromptAssistantProps) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState(initialPrompt)
  const [expandedPrompt, setExpandedPrompt] = useState("")
  const [productCategory, setProductCategory] = useState("none")
  const [subject, setSubject] = useState("")
  const [context, setContext] = useState("")
  const [style, setStyle] = useState("")
  const [activeTab, setActiveTab] = useState("examples")
  const [copied, setCopied] = useState(false)
  const [promptQuality, setPromptQuality] = useState<"minimal" | "basic" | "good" | "excellent">("minimal")

  // Product categories from config
  const productCategories = ["clothing", "electronics", "beauty", "furniture", "food"]

  // Brand examples
  const brandExamples = {
    "Clothing & Apparel": [
      {
        title: "Casual Jacket",
        prompt: "Person wearing a casual jacket in an urban setting, holding coffee, natural daylight",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        title: "Athletic Wear",
        prompt: "Person in athletic wear during workout, dynamic pose, studio lighting",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
    "Beauty & Skincare": [
      {
        title: "Skincare Product",
        prompt: "Skincare bottle on marble surface, soft lighting, minimalist style, clean background",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        title: "Makeup Application",
        prompt: "Close-up of makeup application, soft focus, beauty lighting, professional look",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
    "Electronics & Tech": [
      {
        title: "Headphones",
        prompt: "Person wearing headphones in coffee shop, lifestyle photography, soft bokeh background",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        title: "Smartphone",
        prompt: "Smartphone on desk with workspace accessories, overhead view, natural lighting",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  }

  // Update prompt quality based on length and content
  useEffect(() => {
    if (!prompt) {
      setPromptQuality("minimal")
      return
    }

    const wordCount = prompt.split(/\s+/).length

    if (wordCount < 5) {
      setPromptQuality("minimal")
    } else if (wordCount < 15) {
      setPromptQuality("basic")
    } else if (wordCount < 30) {
      setPromptQuality("good")
    } else {
      setPromptQuality("excellent")
    }
  }, [prompt])

  // Update initial prompt when prop changes
  useEffect(() => {
    setPrompt(initialPrompt)
  }, [initialPrompt])

  // Generate expanded prompt
  const generateExpandedPrompt = () => {
    let newPrompt = prompt

    // If in guided mode, build the prompt from components
    if (activeTab === "guided" && subject) {
      newPrompt = `${subject}`

      if (context) {
        newPrompt += ` in ${context}`
      }

      if (style) {
        newPrompt += `. ${style} style`
      }
    }

    // Expand the prompt based on product category and use case
    let expanded = newPrompt

    // Add product-specific details
    if (productCategory && productCategory !== "none") {
      const categoryDetails = {
        clothing:
          "with visible fabric texture, stitching details, and proper fit. Natural lighting to show true colors.",
        electronics: "with clean design, visible features, and proper scale. Studio lighting to highlight details.",
        beauty:
          "with clear packaging, visible texture, and proper color representation. Soft lighting for appealing look.",
        furniture: "showing material quality, craftsmanship, and in a styled setting. Warm lighting for inviting feel.",
        food: "with appetizing presentation, vibrant colors, and proper styling. Professional food photography lighting.",
      }

      if (categoryDetails[productCategory as keyof typeof categoryDetails]) {
        expanded += `. ${categoryDetails[productCategory as keyof typeof categoryDetails]}`
      }
    }

    // Add use case specific enhancements
    const useCaseConfig = ImageGenerationConfig.useCases.find((uc) => uc.id === useCase)
    if (useCaseConfig) {
      // Extract the template without the "Create a" part
      const template = useCaseConfig.promptTemplate.replace(/^Create an? /i, "").replace(/showing/i, "with")

      // Only add if not already in the prompt
      if (!expanded.toLowerCase().includes(template.toLowerCase())) {
        expanded += `. ${template}`
      }
    }

    // Add photography style enhancements if not already detailed
    if (expanded.split(/\s+/).length < 20) {
      expanded += ". Professional photography, high resolution, detailed textures, masterful composition."
    }

    return expanded
  }

  // Apply the expanded prompt
  const applyExpandedPrompt = () => {
    onPromptGenerated(expandedPrompt || prompt)
    setOpen(false)
  }

  // Apply example prompt directly
  const applyExamplePrompt = (examplePrompt: string) => {
    onPromptGenerated(examplePrompt)
    setOpen(false)
  }

  // Copy prompt to clipboard
  const copyPrompt = () => {
    navigator.clipboard.writeText(expandedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Get quality indicator color
  const getQualityColor = () => {
    switch (promptQuality) {
      case "minimal":
        return "bg-red-500"
      case "basic":
        return "bg-amber-500"
      case "good":
        return "bg-green-500"
      case "excellent":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get quality description
  const getQualityDescription = () => {
    switch (promptQuality) {
      case "minimal":
        return "Your prompt is very short. The AI will need to make many assumptions."
      case "basic":
        return "Your prompt provides basic information. Consider adding more details."
      case "good":
        return "Your prompt has good detail. The AI should generate a decent image."
      case "excellent":
        return "Your prompt is detailed and specific. The AI should generate an excellent image."
      default:
        return ""
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10 flex items-center"
      >
        <Wand2 className="h-4 w-4 mr-1.5" />
        Prompt Assistant
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#1a2235] border-gray-700 text-white max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
              AI Prompt Assistant
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose from examples or build a detailed prompt to get the best possible image
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="examples" className="flex-1 overflow-hidden flex flex-col" onValueChange={setActiveTab}>
            <TabsList className="bg-[#111827]/80 border border-gray-800/50 mb-4">
              <TabsTrigger
                value="examples"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600"
              >
                Ready-Made Examples
              </TabsTrigger>
              <TabsTrigger
                value="guided"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600"
              >
                Guided Builder
              </TabsTrigger>
              <TabsTrigger
                value="enhance"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600"
              >
                Enhance My Prompt
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Examples Tab */}
              <TabsContent value="examples" className="flex-1 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(brandExamples).map(([category, examples]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-lg font-medium text-white">{category}</h3>
                      <div className="space-y-3">
                        {examples.map((example, i) => (
                          <Card
                            key={i}
                            className="bg-[#111827] border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer"
                            onClick={() => applyExamplePrompt(example.prompt)}
                          >
                            <CardContent className="p-4 flex items-start space-x-3">
                              <img
                                src={example.image || "/placeholder.svg"}
                                alt={example.title}
                                className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                              />
                              <div>
                                <h4 className="font-medium text-white mb-1">{example.title}</h4>
                                <p className="text-sm text-gray-400">{example.prompt}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-4">Quick Prompts by Use Case</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ImageGenerationConfig.examplePrompts.slice(0, 6).map((example, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="justify-start text-left h-auto py-3 border-gray-700 hover:bg-[#111827] hover:border-purple-500/50"
                        onClick={() => applyExamplePrompt(example)}
                      >
                        <Lightbulb className="h-4 w-4 mr-2 text-purple-400 flex-shrink-0" />
                        <span className="text-sm text-gray-300 line-clamp-2">{example}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Guided Builder Tab */}
              <TabsContent value="guided" className="flex-1 overflow-auto">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white">
                      What's the main subject?
                    </Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., a person wearing a leather jacket, a skincare product, etc."
                      className="bg-[#111827] border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="context" className="text-white">
                      Where or in what context?
                    </Label>
                    <Input
                      id="context"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="e.g., urban street, natural setting, studio environment, etc."
                      className="bg-[#111827] border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style" className="text-white">
                      Visual style or mood
                    </Label>
                    <Input
                      id="style"
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      placeholder="e.g., professional, casual, elegant, vibrant, etc."
                      className="bg-[#111827] border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-category-guided" className="text-white">
                      Product Category
                    </Label>
                    <Select value={productCategory} onValueChange={setProductCategory}>
                      <SelectTrigger className="bg-[#111827] border-gray-700 text-white">
                        <SelectValue placeholder="Select product category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2235] border-gray-700 text-white">
                        <SelectItem value="none">None / Not applicable</SelectItem>
                        {productCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-[#111827] p-4 rounded-md border border-gray-700">
                    <h4 className="font-medium text-white mb-2 flex items-center">
                      <Palette className="h-4 w-4 mr-2 text-purple-400" />
                      Preview
                    </h4>
                    <p className="text-gray-300">
                      {subject ? subject : "..."}
                      {context ? ` in ${context}` : ""}
                      {style ? `, ${style} style` : ""}
                      {productCategory && productCategory !== "none" ? ` (${productCategory} product)` : ""}
                    </p>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    onClick={generateExpandedPrompt}
                    disabled={!subject}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Build Detailed Prompt
                  </Button>
                </div>
              </TabsContent>

              {/* Enhance Tab */}
              <TabsContent value="enhance" className="flex-1 overflow-auto">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="prompt" className="text-white">
                        Your Prompt
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getQualityColor()} text-white`}>
                          {promptQuality.charAt(0).toUpperCase() + promptQuality.slice(1)}
                        </Badge>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" title={getQualityDescription()} />
                      </div>
                    </div>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe what you want to see in the image..."
                      className="min-h-[100px] bg-[#111827] border-gray-700 text-white"
                    />
                    <p className="text-xs text-gray-400">{getQualityDescription()}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-category" className="text-white">
                      Product Category
                    </Label>
                    <Select value={productCategory} onValueChange={setProductCategory}>
                      <SelectTrigger className="bg-[#111827] border-gray-700 text-white">
                        <SelectValue placeholder="Select product category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2235] border-gray-700 text-white">
                        <SelectItem value="none">None / Not applicable</SelectItem>
                        {productCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">
                      Selecting a category will add industry-specific details to your prompt
                    </p>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    onClick={generateExpandedPrompt}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Enhance My Prompt
                  </Button>
                </div>
              </TabsContent>
            </div>

            {expandedPrompt && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white flex items-center">
                    <Sparkles className="h-4 w-4 mr-1.5 text-purple-400" />
                    Enhanced Prompt
                  </Label>
                  <Button variant="ghost" size="sm" onClick={copyPrompt} className="text-gray-400 hover:text-white">
                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <div className="bg-[#111827] p-4 rounded-md border border-gray-700 max-h-[200px] overflow-y-auto">
                  <p className="text-gray-300 whitespace-pre-wrap">{expandedPrompt}</p>
                </div>
                <div className="flex items-center text-amber-400 text-sm">
                  <AlertTriangle className="h-4 w-4 mr-1.5" />
                  <span>This prompt is {expandedPrompt.length} characters. Maximum is 1500.</span>
                </div>
              </div>
            )}
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-700 text-gray-300">
              Cancel
            </Button>
            {expandedPrompt && (
              <Button
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                onClick={applyExpandedPrompt}
              >
                Use Enhanced Prompt
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
