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
import { Sparkles, Wand2, Check, Copy, Info, AlertTriangle } from "lucide-react"
import { ImageGenerationConfig, expandMinimalPrompt } from "@/config/image-generation-config"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface PromptBuilderAssistantProps {
  initialPrompt: string
  onPromptGenerated: (prompt: string) => void
  useCase: string
}

export function PromptBuilderAssistant({ initialPrompt, onPromptGenerated, useCase }: PromptBuilderAssistantProps) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState(initialPrompt)
  const [expandedPrompt, setExpandedPrompt] = useState("")
  const [productCategory, setProductCategory] = useState("")
  const [subject, setSubject] = useState("")
  const [context, setContext] = useState("")
  const [style, setStyle] = useState("")
  const [activeTab, setActiveTab] = useState("quick")
  const [copied, setCopied] = useState(false)
  const [promptQuality, setPromptQuality] = useState<"minimal" | "basic" | "good" | "excellent">("minimal")

  // Product categories from config
  const productCategories = Object.keys(ImageGenerationConfig.productDefaults || {})

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

    // Expand the prompt
    const expanded = expandMinimalPrompt(newPrompt, useCase, productCategory)
    setExpandedPrompt(expanded)
  }

  // Apply the expanded prompt
  const applyExpandedPrompt = () => {
    onPromptGenerated(expandedPrompt)
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
        className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
      >
        <Wand2 className="h-4 w-4 mr-1.5" />
        Prompt Assistant
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#1a2235] border-gray-700 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
              AI Prompt Builder Assistant
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Let's build a detailed prompt to get the best possible image
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="quick" className="mt-4" onValueChange={setActiveTab}>
            <TabsList className="bg-[#111827]/80 border border-gray-800/50">
              <TabsTrigger
                value="quick"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600"
              >
                Quick Enhance
              </TabsTrigger>
              <TabsTrigger
                value="guided"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600"
              >
                Guided Builder
              </TabsTrigger>
              <TabsTrigger
                value="examples"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600"
              >
                Examples
              </TabsTrigger>
            </TabsList>

            {/* Quick Enhance Tab */}
            <TabsContent value="quick" className="mt-4 space-y-4">
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
                  Product Category (Optional)
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
            </TabsContent>

            {/* Guided Builder Tab */}
            <TabsContent value="guided" className="mt-4 space-y-4">
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
                  Product Category (Optional)
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

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                onClick={generateExpandedPrompt}
                disabled={!subject}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Build Detailed Prompt
              </Button>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="mt-4 space-y-4">
              <p className="text-gray-300">Click an example to use it as a starting point:</p>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-gray-700">
                  <AccordionTrigger className="text-white hover:text-purple-400">
                    Product Photography Examples
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {[
                        "Clean product photo of a skincare bottle on white background",
                        "Lifestyle product photo of headphones being used in a coffee shop",
                        "Detailed closeup of a watch showing craftsmanship and materials",
                      ].map((example, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="w-full justify-start text-left border-gray-700 hover:bg-[#111827] hover:text-white"
                          onClick={() => {
                            setPrompt(example)
                            setActiveTab("quick")
                          }}
                        >
                          {example}
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-gray-700">
                  <AccordionTrigger className="text-white hover:text-purple-400">
                    Lifestyle/UGC Examples
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {[
                        "Person wearing a jacket walking down a city street",
                        "Woman using a laptop at a modern desk with a coffee cup",
                        "Man showing off new sneakers in an urban setting",
                      ].map((example, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="w-full justify-start text-left border-gray-700 hover:bg-[#111827] hover:text-white"
                          onClick={() => {
                            setPrompt(example)
                            setActiveTab("quick")
                          }}
                        >
                          {example}
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border-gray-700">
                  <AccordionTrigger className="text-white hover:text-purple-400">
                    Advertisement Examples
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {[
                        "Facebook ad for a fitness app showing results",
                        "Email header for a summer sale with beach theme",
                        "Website banner for a tech product with modern aesthetic",
                      ].map((example, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="w-full justify-start text-left border-gray-700 hover:bg-[#111827] hover:text-white"
                          onClick={() => {
                            setPrompt(example)
                            setActiveTab("quick")
                          }}
                        >
                          {example}
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>

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
