"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import {
  Sparkles,
  Wand2,
  Check,
  Copy,
  Info,
  AlertTriangle,
  Lightbulb,
  Palette,
  Camera,
  ImageIcon,
  Layers,
  Star,
  Bookmark,
  BookmarkPlus,
  Trash2,
  RefreshCw,
  Shuffle,
  Plus,
  Minus,
  ArrowRight,
  MessageSquare,
  Clock,
} from "lucide-react"
import { ImageGenerationConfig } from "@/config/image-generation-config"

interface EnhancedPromptAssistantProps {
  initialPrompt: string
  onPromptGenerated: (prompt: string) => void
  useCase: string
}

// Define the structure for saved prompts
interface SavedPrompt {
  id: string
  prompt: string
  category: string
  timestamp: Date
  favorite: boolean
}

// Define the structure for prompt elements
interface PromptElement {
  id: string
  type: "subject" | "setting" | "lighting" | "style" | "composition" | "custom"
  text: string
}

// Define the structure for prompt templates
interface PromptTemplate {
  id: string
  name: string
  description: string
  elements: PromptElement[]
  category: string
  icon: React.ReactNode
}

export function EnhancedPromptAssistant({ initialPrompt, onPromptGenerated, useCase }: EnhancedPromptAssistantProps) {
  // Main state
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState(initialPrompt)
  const [expandedPrompt, setExpandedPrompt] = useState("")
  const [activeTab, setActiveTab] = useState("examples")
  const [copied, setCopied] = useState(false)
  const [promptQuality, setPromptQuality] = useState<"minimal" | "basic" | "good" | "excellent">("minimal")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [aiEnhancementLevel, setAiEnhancementLevel] = useState([50])
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([])
  const [promptHistory, setPromptHistory] = useState<SavedPrompt[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Guided builder state
  const [promptElements, setPromptElements] = useState<PromptElement[]>([
    { id: "1", type: "subject", text: "" },
    { id: "2", type: "setting", text: "" },
    { id: "3", type: "lighting", text: "" },
    { id: "4", type: "style", text: "" },
  ])
  const [productCategory, setProductCategory] = useState("none")

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Product categories from config with expanded options
  const productCategories = [
    "clothing",
    "electronics",
    "beauty",
    "furniture",
    "food",
    "jewelry",
    "toys",
    "sports",
    "automotive",
    "home decor",
  ]

  // Expanded brand examples with preview images
  const brandExamples = {
    "Clothing & Apparel": [
      {
        title: "Casual Jacket",
        prompt:
          "Person wearing a casual leather jacket in an urban setting, holding coffee, natural daylight, street photography style",
        image: "/placeholder.svg?height=100&width=100",
        tags: ["fashion", "urban", "lifestyle"],
      },
      {
        title: "Athletic Wear",
        prompt:
          "Person in athletic wear during workout, dynamic pose, studio lighting, fitness photography, high energy",
        image: "/placeholder.svg?height=100&width=100",
        tags: ["fitness", "action", "studio"],
      },
      {
        title: "Summer Dress",
        prompt:
          "Woman wearing a floral summer dress in a garden setting, soft natural lighting, fashion editorial style",
        image: "/placeholder.svg?height=100&width=100",
        tags: ["fashion", "outdoor", "summer"],
      },
    ],
    "Beauty & Skincare": [
      {
        title: "Skincare Product",
        prompt:
          "Skincare bottle on marble surface, soft lighting, minimalist style, clean background, product photography",
        image: "/placeholder.svg?height=100&width=100",
        tags: ["product", "minimal", "luxury"],
      },
      {
        title: "Makeup Application",
        prompt: "Close-up of makeup application, soft focus, beauty lighting, professional look, cosmetics photography",
        image: "/placeholder.svg?height=100&width=100",
        tags: ["beauty", "closeup", "professional"],
      },
      {
        title: "Natural Beauty",
        prompt: "Portrait of person with natural makeup, glowing skin, soft window lighting, beauty photography",
        image: "/placeholder.svg?height=100&width=100",
        tags: ["portrait", "natural", "soft"],
      },
    ],
    "Electronics & Tech": [
      {
        title: "Headphones",
        prompt:
          "Person wearing wireless headphones in coffee shop, lifestyle photography, soft bokeh background, tech lifestyle",
        image: "/placeholder.svg?height=100&width=100",
        tags: ["lifestyle", "tech", "casual"],
      },
      {
        title: "Smartphone",
        prompt:
          "Smartphone on desk with workspace accessories, overhead view, natural lighting, tech flatlay photography",
        image: "/placeholder.svg?height=100&width=100",
        tags: ["flatlay", "workspace", "minimal"],
      },
      {
        title: "Gaming Setup",
        prompt: "Gaming setup with RGB lighting, dark room, dramatic lighting, tech photography, vibrant colors",
        image: "/placeholder.svg?height=100&width=100",
        tags: ["gaming", "dramatic", "colorful"],
      },
    ],
    "Food & Beverages": [
      {
        title: "Coffee Art",
        prompt: "Latte art in coffee cup on wooden table, morning light, food photography, cozy atmosphere",
        image: "/placeholder.svg?height=100&width=100",
        tags: ["beverage", "cozy", "detail"],
      },
      {
        title: "Gourmet Dish",
        prompt:
          "Gourmet plated dish with garnish, restaurant setting, professional food photography, shallow depth of field",
        image: "/placeholder.svg?height=100&width=100",
        tags: ["food", "gourmet", "professional"],
      },
      {
        title: "Dessert Close-up",
        prompt: "Close-up of chocolate dessert with berries, dramatic lighting, food photography, rich colors",
        image: "/placeholder.svg?height=100&width=100",
        tags: ["food", "closeup", "dramatic"],
      },
    ],
  }

  // Prompt templates for different use cases
  const promptTemplates: PromptTemplate[] = [
    {
      id: "product-basic",
      name: "Basic Product Shot",
      description: "Clean product photography on simple background",
      category: "product",
      icon: <ImageIcon className="h-4 w-4" />,
      elements: [
        { id: "1", type: "subject", text: "{product}" },
        { id: "2", type: "setting", text: "on a clean white background" },
        { id: "3", type: "lighting", text: "with professional studio lighting" },
        { id: "4", type: "style", text: "product photography style" },
      ],
    },
    {
      id: "product-lifestyle",
      name: "Lifestyle Product",
      description: "Product in use in a natural setting",
      category: "product",
      icon: <Layers className="h-4 w-4" />,
      elements: [
        { id: "1", type: "subject", text: "Person using {product}" },
        { id: "2", type: "setting", text: "in a natural environment" },
        { id: "3", type: "lighting", text: "with soft natural lighting" },
        { id: "4", type: "style", text: "lifestyle photography style" },
      ],
    },
    {
      id: "fashion-editorial",
      name: "Fashion Editorial",
      description: "High-end fashion photography",
      category: "fashion",
      icon: <Camera className="h-4 w-4" />,
      elements: [
        { id: "1", type: "subject", text: "Model wearing {clothing item}" },
        { id: "2", type: "setting", text: "in an urban environment" },
        { id: "3", type: "lighting", text: "with dramatic lighting" },
        { id: "4", type: "style", text: "high-fashion editorial style" },
      ],
    },
    {
      id: "food-photography",
      name: "Food Photography",
      description: "Appetizing food presentation",
      category: "food",
      icon: <Palette className="h-4 w-4" />,
      elements: [
        { id: "1", type: "subject", text: "{food item}" },
        { id: "2", type: "setting", text: "on a styled table setting" },
        { id: "3", type: "lighting", text: "with soft directional lighting" },
        { id: "4", type: "style", text: "professional food photography style" },
      ],
    },
  ]

  // Photography styles for dropdown
  const photographyStyles = [
    { value: "product", label: "Product Photography", description: "Clean, detailed shots focusing on the product" },
    { value: "lifestyle", label: "Lifestyle Photography", description: "Products in real-world contexts" },
    { value: "editorial", label: "Editorial Style", description: "Artistic, magazine-quality imagery" },
    { value: "minimalist", label: "Minimalist", description: "Clean, simple compositions with negative space" },
    { value: "vintage", label: "Vintage/Retro", description: "Classic, nostalgic aesthetic" },
    { value: "dramatic", label: "Dramatic", description: "High contrast, moody lighting" },
    { value: "bright", label: "Bright & Airy", description: "Light, cheerful aesthetic with soft colors" },
  ]

  // Lighting options for dropdown
  const lightingOptions = [
    { value: "natural", label: "Natural Light", description: "Soft, window-like lighting" },
    { value: "studio", label: "Studio Lighting", description: "Professional, controlled lighting setup" },
    { value: "dramatic", label: "Dramatic Lighting", description: "High contrast with shadows" },
    { value: "soft", label: "Soft Diffused", description: "Gentle, flattering light with minimal shadows" },
    { value: "golden", label: "Golden Hour", description: "Warm, sunset-like glow" },
    { value: "backlit", label: "Backlit", description: "Light coming from behind the subject" },
  ]

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

  // Load saved prompts from localStorage on component mount
  useEffect(() => {
    const loadSavedPrompts = () => {
      const savedPromptsJson = localStorage.getItem("savedPrompts")
      if (savedPromptsJson) {
        try {
          const parsed = JSON.parse(savedPromptsJson)
          // Convert string timestamps back to Date objects
          const processed = parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
          setSavedPrompts(processed)
        } catch (e) {
          console.error("Error loading saved prompts:", e)
        }
      }

      const promptHistoryJson = localStorage.getItem("promptHistory")
      if (promptHistoryJson) {
        try {
          const parsed = JSON.parse(promptHistoryJson)
          // Convert string timestamps back to Date objects
          const processed = parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
          setPromptHistory(processed)
        } catch (e) {
          console.error("Error loading prompt history:", e)
        }
      }
    }

    loadSavedPrompts()
  }, [])

  // Generate expanded prompt with AI enhancement
  const generateExpandedPrompt = () => {
    setIsGenerating(true)

    // Start with the base prompt
    let basePrompt = prompt

    // If in guided mode, build the prompt from elements
    if (activeTab === "guided") {
      basePrompt = promptElements
        .filter((el) => el.text.trim() !== "")
        .map((el) => el.text)
        .join(", ")

      // Replace placeholders if needed
      basePrompt = basePrompt.replace(/{product}/g, "product")
      basePrompt = basePrompt.replace(/{clothing item}/g, "clothing item")
      basePrompt = basePrompt.replace(/{food item}/g, "food item")
    }

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
        jewelry: "with sparkling details, luxurious setting, and precise lighting to highlight gemstones and metals.",
        toys: "with vibrant colors, playful arrangement, and clear details showing features and functions.",
        sports: "with dynamic composition, action-oriented setup, and lighting that highlights performance features.",
        automotive: "with dramatic lighting, polished surfaces, and composition that emphasizes design and features.",
        "home decor": "in a styled interior setting, with ambient lighting and complementary surroundings.",
      }

      if (categoryDetails[productCategory as keyof typeof categoryDetails]) {
        basePrompt += `. ${categoryDetails[productCategory as keyof typeof categoryDetails]}`
      }
    }

    // Add use case specific enhancements
    const useCaseConfig = ImageGenerationConfig.useCases.find((uc) => uc.id === useCase)
    if (useCaseConfig) {
      // Extract the template without the "Create a" part
      const template = useCaseConfig.promptTemplate.replace(/^Create an? /i, "").replace(/showing/i, "with")

      // Only add if not already in the prompt
      if (!basePrompt.toLowerCase().includes(template.toLowerCase())) {
        basePrompt += `. ${template}`
      }
    }

    // Add photography style enhancements if not already detailed
    if (basePrompt.split(/\s+/).length < 20) {
      basePrompt += ". Professional photography, high resolution, detailed textures, masterful composition."
    }

    // Simulate AI enhancement based on the enhancement level
    const enhancementLevel = aiEnhancementLevel[0]

    // Add more details based on enhancement level
    if (enhancementLevel > 30) {
      basePrompt += ". 8K resolution, ultra-detailed, photorealistic quality."
    }

    if (enhancementLevel > 60) {
      basePrompt += " Perfect lighting, realistic reflections, accurate perspective, precise proportions."
    }

    if (enhancementLevel > 80) {
      basePrompt += " Award-winning photography, magazine quality, professional color grading."
    }

    // Simulate AI processing time
    setTimeout(() => {
      setExpandedPrompt(basePrompt)
      setIsGenerating(false)

      // Add to history
      const historyItem: SavedPrompt = {
        id: Date.now().toString(),
        prompt: basePrompt,
        category: productCategory !== "none" ? productCategory : "general",
        timestamp: new Date(),
        favorite: false,
      }

      const updatedHistory = [historyItem, ...promptHistory.slice(0, 9)]
      setPromptHistory(updatedHistory)

      // Save to localStorage
      localStorage.setItem("promptHistory", JSON.stringify(updatedHistory))
    }, 1500)
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

  // Apply template to guided builder
  const applyTemplate = (template: PromptTemplate) => {
    setPromptElements(template.elements.map((el) => ({ ...el })))
    setActiveTab("guided")
  }

  // Save current prompt
  const saveCurrentPrompt = () => {
    const promptToSave = expandedPrompt || prompt

    if (!promptToSave.trim()) {
      toast({
        title: "Cannot save empty prompt",
        description: "Please enter or generate a prompt first",
        variant: "destructive",
      })
      return
    }

    const newSavedPrompt: SavedPrompt = {
      id: Date.now().toString(),
      prompt: promptToSave,
      category: productCategory !== "none" ? productCategory : "general",
      timestamp: new Date(),
      favorite: false,
    }

    const updatedSavedPrompts = [newSavedPrompt, ...savedPrompts]
    setSavedPrompts(updatedSavedPrompts)

    // Save to localStorage
    localStorage.setItem("savedPrompts", JSON.stringify(updatedSavedPrompts))

    toast({
      title: "Prompt saved",
      description: "Your prompt has been saved to your collection",
    })
  }

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    const updatedPrompts = savedPrompts.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p))
    setSavedPrompts(updatedPrompts)
    localStorage.setItem("savedPrompts", JSON.stringify(updatedPrompts))
  }

  // Delete saved prompt
  const deleteSavedPrompt = (id: string) => {
    const updatedPrompts = savedPrompts.filter((p) => p.id !== id)
    setSavedPrompts(updatedPrompts)
    localStorage.setItem("savedPrompts", JSON.stringify(updatedPrompts))

    toast({
      title: "Prompt deleted",
      description: "The prompt has been removed from your collection",
    })
  }

  // Add new prompt element
  const addPromptElement = () => {
    const newElement: PromptElement = {
      id: Date.now().toString(),
      type: "custom",
      text: "",
    }
    setPromptElements([...promptElements, newElement])
  }

  // Remove prompt element
  const removePromptElement = (id: string) => {
    if (promptElements.length <= 1) return
    setPromptElements(promptElements.filter((el) => el.id !== id))
  }

  // Update prompt element
  const updatePromptElement = (id: string, text: string) => {
    setPromptElements(promptElements.map((el) => (el.id === id ? { ...el, text } : el)))
  }

  // Copy prompt to clipboard
  const copyPrompt = () => {
    navigator.clipboard.writeText(expandedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Copied to clipboard",
      description: "The enhanced prompt has been copied to your clipboard",
    })
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

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Filter saved prompts based on search and category
  const filteredSavedPrompts = savedPrompts.filter((p) => {
    const matchesSearch = searchTerm === "" || p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
        <DialogContent className="bg-[#1a2235] border-gray-700 text-white max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
              AI Prompt Assistant
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create perfect prompts for AI image generation with templates, examples, and AI enhancement
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="examples" className="flex-1 overflow-hidden flex flex-col" onValueChange={setActiveTab}>
            <TabsList className="bg-[#111827]/80 border border-gray-800/50 mb-4">
              <TabsTrigger
                value="examples"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600"
              >
                Examples Gallery
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
                AI Enhancement
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600"
              >
                My Prompts
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Examples Tab */}
              <TabsContent value="examples" className="flex-1 overflow-auto">
                <ScrollArea className="h-[60vh]">
                  <div className="px-1">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-white mb-4">Templates</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {promptTemplates.map((template) => (
                          <Card
                            key={template.id}
                            className="bg-[#111827] border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer"
                            onClick={() => applyTemplate(template)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center mb-2">
                                <div className="bg-purple-600/20 p-2 rounded-md mr-3">{template.icon}</div>
                                <div>
                                  <h4 className="font-medium text-white">{template.name}</h4>
                                  <p className="text-xs text-gray-400">{template.description}</p>
                                </div>
                              </div>
                              <div className="mt-3 text-xs text-gray-300 line-clamp-2">
                                {template.elements.map((el) => el.text).join(", ")}
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 border-t border-gray-800 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-600/10"
                              >
                                <Layers className="h-3.5 w-3.5 mr-1.5" />
                                Use Template
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {Object.entries(brandExamples).map(([category, examples]) => (
                        <div key={category} className="space-y-4">
                          <h3 className="text-lg font-medium text-white">{category}</h3>
                          <div className="space-y-3">
                            {examples.map((example, i) => (
                              <Card
                                key={i}
                                className="bg-[#111827] border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer group"
                                onClick={() => applyExamplePrompt(example.prompt)}
                              >
                                <CardContent className="p-4 flex items-start space-x-3">
                                  <img
                                    src={example.image || "/placeholder.svg"}
                                    alt={example.title}
                                    className="w-16 h-16 rounded-md object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                                  />
                                  <div>
                                    <h4 className="font-medium text-white mb-1 flex items-center">
                                      {example.title}
                                      <ArrowRight className="h-3.5 w-3.5 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-sm text-gray-400">{example.prompt}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {example.tags?.map((tag, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/30"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-white mb-4">Quick Prompts by Use Case</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {ImageGenerationConfig.examplePrompts.map((example, i) => (
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
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Guided Builder Tab */}
              <TabsContent value="guided" className="flex-1 overflow-auto">
                <ScrollArea className="h-[60vh]">
                  <div className="px-1 space-y-6">
                    <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Lightbulb className="h-5 w-5 text-purple-400 mr-2" />
                        <h3 className="text-lg font-medium text-white">Prompt Builder</h3>
                      </div>
                      <p className="text-sm text-gray-300">
                        Build your prompt by filling in the elements below. Each element adds important details to help
                        the AI generate exactly what you want.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {promptElements.map((element, index) => (
                        <div key={element.id} className="flex items-center space-x-3">
                          <div className="flex-grow">
                            <div className="flex justify-between items-center mb-1">
                              <Label className="text-white capitalize">{element.type}</Label>
                              {index > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                  onClick={() => removePromptElement(element.id)}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                            <Input
                              value={element.text}
                              onChange={(e) => updatePromptElement(element.id, e.target.value)}
                              placeholder={getPlaceholderForType(element.type)}
                              className="bg-[#111827] border-gray-700 text-white"
                            />
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
                        onClick={addPromptElement}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add Element
                      </Button>
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

                    <div className="bg-[#111827] p-4 rounded-md border border-gray-700">
                      <h4 className="font-medium text-white mb-2 flex items-center">
                        <Palette className="h-4 w-4 mr-2 text-purple-400" />
                        Preview
                      </h4>
                      <p className="text-gray-300">
                        {promptElements
                          .filter((el) => el.text.trim() !== "")
                          .map((el) => el.text)
                          .join(", ")}
                        {productCategory && productCategory !== "none" ? ` (${productCategory} product)` : ""}
                      </p>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      onClick={generateExpandedPrompt}
                      disabled={promptElements.every((el) => !el.text.trim())}
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Enhanced Prompt
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Enhance Tab */}
              <TabsContent value="enhance" className="flex-1 overflow-auto">
                <ScrollArea className="h-[60vh]">
                  <div className="px-1 space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="prompt" className="text-white">
                          Your Prompt
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getQualityColor()} text-white`}>
                            {promptQuality.charAt(0).toUpperCase() + promptQuality.slice(1)}
                          </Badge>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getQualityDescription()}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Textarea
                        id="prompt"
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe what you want to see in the image..."
                        className="min-h-[120px] bg-[#111827] border-gray-700 text-white"
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

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="ai-enhancement" className="text-white">
                          AI Enhancement Level
                        </Label>
                        <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600">
                          {getEnhancementLabel(aiEnhancementLevel[0])}
                        </Badge>
                      </div>
                      <Slider
                        id="ai-enhancement"
                        value={aiEnhancementLevel}
                        onValueChange={setAiEnhancementLevel}
                        max={100}
                        step={10}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>Basic</span>
                        <span>Standard</span>
                        <span>Advanced</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Higher enhancement adds more professional details to your prompt
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={showAdvancedOptions}
                        onCheckedChange={setShowAdvancedOptions}
                        className="data-[state=checked]:bg-purple-600"
                      />
                      <Label className="text-white">Show Advanced Options</Label>
                    </div>

                    {showAdvancedOptions && (
                      <div className="space-y-4 border border-gray-700 rounded-lg p-4 bg-[#111827]/50">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="photography-style" className="border-gray-700">
                            <AccordionTrigger className="text-white hover:text-purple-400">
                              Photography Style
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                <Select>
                                  <SelectTrigger className="bg-[#111827] border-gray-700 text-white">
                                    <SelectValue placeholder="Select photography style" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#1a2235] border-gray-700 text-white">
                                    {photographyStyles.map((style) => (
                                      <SelectItem key={style.value} value={style.value}>
                                        <div>
                                          <span>{style.label}</span>
                                          <p className="text-xs text-gray-400">{style.description}</p>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="lighting" className="border-gray-700">
                            <AccordionTrigger className="text-white hover:text-purple-400">
                              Lighting Options
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                <Select>
                                  <SelectTrigger className="bg-[#111827] border-gray-700 text-white">
                                    <SelectValue placeholder="Select lighting style" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#1a2235] border-gray-700 text-white">
                                    {lightingOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        <div>
                                          <span>{option.label}</span>
                                          <p className="text-xs text-gray-400">{option.description}</p>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="composition" className="border-gray-700">
                            <AccordionTrigger className="text-white hover:text-purple-400">
                              Composition Settings
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                <Label className="text-white">Focal Length</Label>
                                <Select>
                                  <SelectTrigger className="bg-[#111827] border-gray-700 text-white">
                                    <SelectValue placeholder="Select focal length" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#1a2235] border-gray-700 text-white">
                                    <SelectItem value="wide">Wide Angle</SelectItem>
                                    <SelectItem value="normal">Normal/Standard</SelectItem>
                                    <SelectItem value="portrait">Portrait</SelectItem>
                                    <SelectItem value="telephoto">Telephoto</SelectItem>
                                    <SelectItem value="macro">Macro</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}

                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      onClick={generateExpandedPrompt}
                      disabled={!prompt.trim() || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Enhancing Prompt...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Enhance With AI
                        </>
                      )}
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Saved Prompts Tab */}
              <TabsContent value="saved" className="flex-1 overflow-auto">
                <ScrollArea className="h-[60vh]">
                  <div className="px-1 space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Input
                        placeholder="Search saved prompts..."
                        className="bg-[#111827] border-gray-700 text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="bg-[#111827] border-gray-700 text-white w-40">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2235] border-gray-700 text-white">
                          <SelectItem value="all">All Categories</SelectItem>
                          {productCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Tabs defaultValue="saved" className="w-full">
                      <TabsList className="bg-[#111827]/80 border border-gray-800/50 mb-4 w-full grid grid-cols-2">
                        <TabsTrigger
                          value="saved"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600"
                        >
                          Saved Prompts
                        </TabsTrigger>
                        <TabsTrigger
                          value="history"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600"
                        >
                          History
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="saved">
                        {filteredSavedPrompts.length > 0 ? (
                          <div className="space-y-3">
                            {filteredSavedPrompts.map((savedPrompt) => (
                              <Card
                                key={savedPrompt.id}
                                className="bg-[#111827] border-gray-700 hover:border-purple-500/50 transition-colors"
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <Badge className="bg-[#1a2235] text-gray-300 border-gray-700">
                                      {savedPrompt.category.charAt(0).toUpperCase() + savedPrompt.category.slice(1)}
                                    </Badge>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                                        onClick={() => toggleFavorite(savedPrompt.id)}
                                      >
                                        {savedPrompt.favorite ? (
                                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ) : (
                                          <Star className="h-4 w-4" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-400"
                                        onClick={() => deleteSavedPrompt(savedPrompt.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-gray-300 text-sm line-clamp-2 mb-2">{savedPrompt.prompt}</p>
                                  <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>{formatDate(savedPrompt.timestamp)}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-purple-400 hover:text-purple-300 hover:bg-purple-600/10"
                                      onClick={() => applyExamplePrompt(savedPrompt.prompt)}
                                    >
                                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                      Use Prompt
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Bookmark className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-white mb-2">No saved prompts</h3>
                            <p className="text-gray-400 max-w-md mx-auto">
                              {searchTerm || selectedCategory !== "all"
                                ? "No prompts match your search criteria"
                                : "Save your favorite prompts for quick access later"}
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="history">
                        {promptHistory.length > 0 ? (
                          <div className="space-y-3">
                            {promptHistory.map((historyItem) => (
                              <Card
                                key={historyItem.id}
                                className="bg-[#111827] border-gray-700 hover:border-purple-500/50 transition-colors"
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <Badge className="bg-[#1a2235] text-gray-300 border-gray-700">
                                      {historyItem.category.charAt(0).toUpperCase() + historyItem.category.slice(1)}
                                    </Badge>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-gray-400 hover:text-yellow-400"
                                        onClick={() => {
                                          // Add to saved prompts
                                          const newSavedPrompt: SavedPrompt = {
                                            ...historyItem,
                                            id: Date.now().toString(),
                                            favorite: false,
                                          }
                                          const updatedSavedPrompts = [newSavedPrompt, ...savedPrompts]
                                          setSavedPrompts(updatedSavedPrompts)
                                          localStorage.setItem("savedPrompts", JSON.stringify(updatedSavedPrompts))
                                          toast({
                                            title: "Prompt saved",
                                            description: "Added to your saved prompts",
                                          })
                                        }}
                                      >
                                        <BookmarkPlus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-gray-300 text-sm line-clamp-2 mb-2">{historyItem.prompt}</p>
                                  <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>{formatDate(historyItem.timestamp)}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-purple-400 hover:text-purple-300 hover:bg-purple-600/10"
                                      onClick={() => applyExamplePrompt(historyItem.prompt)}
                                    >
                                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                      Use Prompt
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Clock className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-white mb-2">No prompt history</h3>
                            <p className="text-gray-400 max-w-md mx-auto">
                              Your recently generated prompts will appear here
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>

            {expandedPrompt && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white flex items-center">
                    <Sparkles className="h-4 w-4 mr-1.5 text-purple-400" />
                    Enhanced Prompt
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveCurrentPrompt}
                      className="text-gray-400 hover:text-white"
                    >
                      <BookmarkPlus className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={copyPrompt} className="text-gray-400 hover:text-white">
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
                <div className="bg-[#111827] p-4 rounded-md border border-gray-700 max-h-[200px] overflow-y-auto">
                  <p className="text-gray-300 whitespace-pre-wrap">{expandedPrompt}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-400 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1.5" />
                    <span>This prompt is {expandedPrompt.length} characters. Maximum is 1500.</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    onClick={() => {
                      // Generate a slightly different variation
                      setIsGenerating(true)
                      setTimeout(() => {
                        const words = expandedPrompt.split(" ")
                        // Replace a few random words with synonyms or alternatives
                        const newPrompt = words
                          .map((word) => {
                            if (Math.random() > 0.9 && word.length > 4) {
                              // This is a simplified example - in a real app you'd use a thesaurus API
                              return word + (word.endsWith("ing") ? "" : "ing")
                            }
                            return word
                          })
                          .join(" ")
                        setExpandedPrompt(newPrompt)
                        setIsGenerating(false)
                      }, 1000)
                    }}
                  >
                    <Shuffle className="h-4 w-4 mr-1" />
                    Variation
                  </Button>
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

// Helper function to get placeholder text based on element type
function getPlaceholderForType(type: string): string {
  switch (type) {
    case "subject":
      return "What is the main subject? (e.g., person, product, scene)"
    case "setting":
      return "Where is it? (e.g., urban street, studio, nature)"
    case "lighting":
      return "What lighting? (e.g., natural daylight, studio lighting)"
    case "style":
      return "What style? (e.g., minimalist, vintage, dramatic)"
    case "composition":
      return "Composition details? (e.g., close-up, wide angle)"
    case "custom":
      return "Add custom details"
    default:
      return "Add details"
  }
}

// Helper function to get enhancement level label
function getEnhancementLabel(level: number): string {
  if (level <= 30) return "Basic"
  if (level <= 60) return "Standard"
  if (level <= 80) return "Advanced"
  return "Professional"
}
