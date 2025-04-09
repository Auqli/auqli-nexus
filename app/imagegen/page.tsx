"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ImageIcon,
  Sparkles,
  Zap,
  RotateCcw,
  Download,
  Lightbulb,
  Wand2,
  Info,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { PageLayout } from "@/components/layout/page-layout"
import { ImageGenerationConfig } from "@/config/image-generation-config"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EnhancedPromptAssistant } from "@/components/enhanced-prompt-assistant"

export default function ImageGenPage() {
  // State for user inputs - Text to Image mode
  const [prompt, setPrompt] = useState("")
  const [useCase, setUseCase] = useState("hero-banner") // Pre-selected option
  const [creativity, setCreativity] = useState([50])
  const [isQualityMode, setIsQualityMode] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [tone, setTone] = useState("none")
  const [imageSize, setImageSize] = useState("square")
  const [loadingMessage, setLoadingMessage] = useState("")
  const [useCaseCategory, setUseCaseCategory] = useState("Website / Landing Page") // Pre-selected category
  const [generationProgress, setGenerationProgress] = useState(0)
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null)
  const [showPromptDialog, setShowPromptDialog] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [imageHistory, setImageHistory] = useState<
    Array<{ id: string; images: string[]; prompt: string; timestamp: Date }>
  >([])
  const [isQualityModelAvailable, setIsQualityModelAvailable] = useState(true)
  const [numImages, setNumImages] = useState(4) // Default to 4 images

  // Refs
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Update the loading message at intervals during generation
  useEffect(() => {
    if (isGenerating) {
      // Start progress animation
      setGenerationProgress(0)
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + (isQualityMode ? 2 : 5) // Faster progress for speed mode
        })
      }, 300)

      // Update loading messages
      const messageInterval = setInterval(() => {
        const messages = ImageGenerationConfig.loadingMessages
        setLoadingMessage(messages[Math.floor(Math.random() * ImageGenerationConfig.loadingMessages.length)])
      }, 3000)

      return () => {
        clearInterval(messageInterval)
        clearInterval(progressInterval)
      }
    } else {
      // Reset or complete progress when not generating
      if (generationProgress > 0) {
        setGenerationProgress(100) // Complete the progress
        const timer = setTimeout(() => setGenerationProgress(0), 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [isGenerating, isQualityMode])

  // Copy enhanced prompt to clipboard
  const copyPromptToClipboard = () => {
    if (enhancedPrompt) {
      navigator.clipboard.writeText(enhancedPrompt)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)

      toast({
        title: "Prompt copied",
        description: "Enhanced prompt copied to clipboard",
      })
    }
  }

  // Generate images for Text to Image mode
  const generateImages = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description of the image you want to generate",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setError(null)
    setEnhancedPrompt(null)
    setLoadingMessage(
      ImageGenerationConfig.loadingMessages[Math.floor(Math.random() * ImageGenerationConfig.loadingMessages.length)],
    )

    try {
      // Get image dimensions based on selected size
      const sizeConfig =
        ImageGenerationConfig.imageSizes.find((s) => s.id === imageSize) || ImageGenerationConfig.imageSizes[0]

      // Determine which model to use based on quality mode
      const modelId = isQualityMode ? ImageGenerationConfig.models.quality.id : ImageGenerationConfig.models.speed.id

      console.log(`Generating with model: ${modelId}`)
      console.log(`Image size: ${sizeConfig.width}x${sizeConfig.height}`)

      // Call the API
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          modelId,
          numImages: numImages, // Use the state variable instead of hardcoded value
          width: sizeConfig.width,
          height: sizeConfig.height,
          creativity: creativity[0] / 100, // Convert to 0-1 range
          useCase: useCase,
          tone: tone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate images")
      }

      const data = await response.json()

      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images)

        // Save to history
        const historyEntry = {
          id: Date.now().toString(),
          images: data.images,
          prompt: prompt,
          timestamp: new Date(),
        }
        setImageHistory((prev) => [historyEntry, ...prev.slice(0, 9)]) // Keep last 10 entries

        // Save enhanced prompt if available
        if (data.enhancedPrompt) {
          setEnhancedPrompt(data.enhancedPrompt)
        }

        // Show success toast
        toast({
          title: "Images generated",
          description: `Successfully generated ${data.images.length} images`,
        })
      } else {
        throw new Error("No images were generated")
      }
    } catch (err) {
      console.error("Error generating images:", err)
      setError(err instanceof Error ? err.message : "Failed to generate images. Please try again.")

      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Failed to generate images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setGenerationProgress(100) // Complete the progress
    }
  }

  // Load example prompt for Text to Image
  const loadExamplePrompt = () => {
    const examples = ImageGenerationConfig.examplePrompts
    const randomExample = examples[Math.floor(Math.random() * examples.length)]
    setPrompt(randomExample)

    // Focus the textarea
    if (promptRef.current) {
      promptRef.current.focus()
    }
  }

  // Get creativity label based on slider value
  const getCreativityLabel = (value: number): string => {
    if (value <= 30) return "Conservative"
    if (value <= 50) return "Balanced"
    if (value <= 70) return "Creative"
    return "Artistic"
  }

  const filteredUseCases =
    useCaseCategory === "all"
      ? ImageGenerationConfig.useCases
      : ImageGenerationConfig.useCases.filter((uc) => uc.category === useCaseCategory)

  // Get unique categories from use cases
  const categories = ["all", ...Array.from(new Set(ImageGenerationConfig.useCases.map((uc) => uc.category)))]

  // Set a default use case when category changes
  useEffect(() => {
    const casesInCategory = ImageGenerationConfig.useCases.filter(
      (uc) => useCaseCategory === "all" || uc.category === useCaseCategory,
    )

    if (casesInCategory.length > 0 && (!useCase || !casesInCategory.some((uc) => uc.id === useCase))) {
      setUseCase(casesInCategory[0].id)
    }
  }, [useCaseCategory, useCase])

  // Format timestamp for history items
  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  }

  // Add this useEffect to check model availability
  useEffect(() => {
    const checkModelAvailability = async () => {
      try {
        // Simple check to see if the quality model is available
        const modelId = ImageGenerationConfig.models.quality.id
        const response = await fetch(`/api/check-model?modelId=${encodeURIComponent(modelId)}`)
        const data = await response.json()
        setIsQualityModelAvailable(data.available)
      } catch (error) {
        console.error("Error checking model availability:", error)
        // Assume it's not available if we can't check
        setIsQualityModelAvailable(false)
      }
    }

    checkModelAvailability()
  }, [])

  const downloadImage = async (url: string, index: number) => {
    try {
      // Show loading toast
      toast({
        title: "Downloading image...",
        description: "Please wait while we prepare your image",
      })

      const response = await fetch(url, { method: "GET" })

      if (!response.ok) {
        throw new Error("Failed to download image")
      }

      const blob = await response.blob()
      const urlCreator = window.URL || window.webkitURL
      const imageUrl = urlCreator.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = imageUrl
      link.download = `generated-image-${index + 1}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Cleanup the object URL
      setTimeout(() => URL.revokeObjectURL(imageUrl), 100)

      // Show success toast
      toast({
        title: "Download complete",
        description: "Image has been saved to your device",
      })
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({
        title: "Download failed",
        description: "There was a problem downloading your image",
        variant: "destructive",
      })
    }
  }

  const regenerateImage = (index: number) => {
    setSelectedImageIndex(index)
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Left Panel - Scrollable Controls */}
          <div className="lg:col-span-4 h-full overflow-hidden flex flex-col">
            <div className="overflow-y-auto pr-2 flex-grow">
              {/* Main Input Card */}
              <Card className="border-gray-800/50 bg-[#111827]/80 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden mb-6">
                <CardHeader className="bg-gradient-to-r from-[#0c1322]/95 to-[#111827]/95 border-b border-gray-800/50 p-5">
                  <CardTitle className="text-white flex items-center">
                    <Wand2 className="h-5 w-5 mr-2 text-purple-400" />
                    Image Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Generation Mode Tabs */}
                  <div className="space-y-3">
                    <h3 className="text-white font-medium text-sm uppercase tracking-wider border-b border-gray-800/50 pb-2">
                      GENERATION MODE
                    </h3>
                    <Tabs
                      defaultValue="text-to-image"
                      value="text-to-image"
                      onValueChange={() => {}}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-1 w-full bg-[#1a2235]/80 p-1 rounded-xl">
                        <TabsTrigger
                          value="text-to-image"
                          className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                        >
                          Text to Image
                        </TabsTrigger>
                      </TabsList>

                      {/* Content for Text to Image Tab */}
                      <TabsContent value="text-to-image" className="mt-4 space-y-6">
                        {/* Quality Settings */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-white font-medium">Quality Settings</Label>
                            <Badge className={isQualityMode ? "bg-purple-600" : "bg-blue-600"}>
                              {isQualityMode ? "Quality" : "Speed"}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between bg-[#1a2235]/80 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Zap className={`h-5 w-5 ${isQualityMode ? "text-gray-500" : "text-blue-400"}`} />
                              <span className={`text-sm font-medium ${isQualityMode ? "text-gray-500" : "text-white"}`}>
                                Fast Mode
                              </span>
                            </div>

                            <Switch
                              checked={isQualityMode}
                              onCheckedChange={setIsQualityMode}
                              className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-blue-600"
                            />

                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${isQualityMode ? "text-white" : "text-gray-500"}`}>
                                Quality Mode
                              </span>
                              <Sparkles className={`h-5 w-5 ${isQualityMode ? "text-purple-400" : "text-gray-500"}`} />
                              {!isQualityModelAvailable && isQualityMode && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <AlertTriangle className="h-4 w-4 text-amber-400 ml-1" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">
                                        Quality model may not be available. Will use fallback if needed.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>

                          <div className="text-xs text-gray-400 italic">
                            {isQualityMode
                              ? "Quality mode creates highly detailed images but takes longer (10-15 seconds)"
                              : "Fast mode generates images quickly (3-5 seconds) but with less detail"}
                          </div>
                        </div>

                        {/* Content Purpose Section */}
                        <div className="space-y-3">
                          <h3 className="text-white font-medium text-sm uppercase tracking-wider border-b border-gray-800/50 pb-2">
                            CONTENT PURPOSE
                          </h3>
                          <Label htmlFor="use-case" className="text-white font-medium">
                            Use Case
                          </Label>

                          {/* Category dropdown */}
                          <Select value={useCaseCategory} onValueChange={setUseCaseCategory}>
                            <SelectTrigger className="bg-[#1a2235]/80 border-gray-700/50 text-white rounded-lg h-11 mb-3">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a2235] border-gray-700 text-white">
                              {categories
                                .filter((cat) => cat !== "all")
                                .map((category) => (
                                  <SelectItem
                                    key={category}
                                    value={category}
                                    className="focus:bg-purple-600/20 focus:text-white"
                                  >
                                    {category}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          {/* Use case dropdown with pre-selected option */}
                          <Select value={useCase} onValueChange={setUseCase} defaultValue="hero-banner">
                            <SelectTrigger className="bg-[#1a2235]/80 border-gray-700/50 text-white rounded-lg h-11">
                              <SelectValue placeholder="Select use case" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a2235] border-gray-700 text-white max-h-[300px]">
                              {filteredUseCases.map((useCase) => (
                                <SelectItem
                                  key={useCase.id}
                                  value={useCase.id}
                                  className="focus:bg-purple-600/20 focus:text-white"
                                >
                                  <div className="flex items-center">
                                    <span className="mr-2 text-purple-400">{useCase.icon}</span>
                                    {useCase.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-gray-400 italic">
                            {ImageGenerationConfig.useCases.find((uc) => uc.id === useCase)?.description}
                          </div>
                        </div>

                        {/* Image Content Section */}
                        <div className="space-y-3">
                          <h3 className="text-white font-medium text-sm uppercase tracking-wider border-b border-gray-800/50 pb-2">
                            IMAGE CONTENT
                          </h3>
                          <div className="flex justify-between items-center">
                            <Label htmlFor="prompt" className="text-white font-medium">
                              Image Description
                            </Label>
                            <EnhancedPromptAssistant
                              initialPrompt={prompt}
                              onPromptGenerated={(newPrompt) => setPrompt(newPrompt)}
                              useCase={useCase}
                            />
                          </div>
                          <Textarea
                            id="prompt"
                            ref={promptRef}
                            placeholder="Describe the image you want to generate..."
                            className="min-h-[120px] bg-[#1a2235]/80 border-gray-700/50 text-white placeholder:text-gray-500 resize-none rounded-lg focus:border-purple-500/50 focus:ring-purple-500/20"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                          />

                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-400 italic">
                              Be specific about style, colors, mood, and composition
                            </div>
                            <div className="text-xs text-gray-400">{prompt.length} chars</div>
                          </div>
                        </div>

                        {/* Style & Appearance Section */}
                        <div className="space-y-4">
                          <h3 className="text-white font-medium text-sm uppercase tracking-wider border-b border-gray-800/50 pb-2">
                            STYLE & APPEARANCE
                          </h3>
                          <div className="flex justify-between items-center">
                            <Label htmlFor="creativity" className="text-white font-medium">
                              Creativity Level
                            </Label>
                            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                              {getCreativityLabel(creativity[0])}
                            </Badge>
                          </div>

                          <Slider
                            id="creativity"
                            value={creativity}
                            onValueChange={setCreativity}
                            max={100}
                            step={10}
                            className="mt-2"
                          />

                          <div className="flex justify-between text-xs text-gray-500 px-1">
                            <span>Conservative</span>
                            <span>Balanced</span>
                            <span>Artistic</span>
                          </div>
                        </div>

                        {/* Tone Selector */}
                        <div className="space-y-3">
                          <Label htmlFor="tone" className="text-white font-medium">
                            Tone (Optional)
                          </Label>
                          <Select value={tone} onValueChange={setTone}>
                            <SelectTrigger className="bg-[#1a2235]/80 border-gray-700/50 text-white rounded-lg h-11">
                              <SelectValue placeholder="Select tone (optional)" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a2235] border-gray-700 text-white">
                              <SelectItem value="none" className="focus:bg-purple-600/20 focus:text-white">
                                No specific tone
                              </SelectItem>
                              {ImageGenerationConfig.toneOptions.map((toneOption) => (
                                <SelectItem
                                  key={toneOption.value}
                                  value={toneOption.value}
                                  className="focus:bg-purple-600/20 focus:text-white"
                                >
                                  {toneOption.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-gray-400 italic">
                            Select a tone to influence the style of your generated image
                          </div>
                        </div>

                        {/* Image Size Selector */}
                        <div className="space-y-3">
                          <h3 className="text-white font-medium text-sm uppercase tracking-wider border-b border-gray-800/50 pb-2">
                            OUTPUT SETTINGS
                          </h3>
                          <Label className="text-white font-medium">Image Size</Label>
                          <RadioGroup value={imageSize} onValueChange={setImageSize} className="grid grid-cols-2 gap-2">
                            {ImageGenerationConfig.imageSizes.map((size) => (
                              <div key={size.id} className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value={size.id}
                                  id={`size-${size.id}`}
                                  className="text-purple-600 border-gray-600"
                                />
                                <Label htmlFor={`size-${size.id}`} className="text-sm text-gray-300 cursor-pointer">
                                  {size.name}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                          <div className="text-xs text-gray-400 italic">
                            {ImageGenerationConfig.imageSizes.find((s) => s.id === imageSize)?.description}
                          </div>
                        </div>

                        {/* Number of Images Selector */}
                        <div className="space-y-3">
                          <Label className="text-white font-medium">Number of Images</Label>
                          <RadioGroup
                            value={numImages.toString()}
                            onValueChange={(value) => setNumImages(Number.parseInt(value))}
                            className="grid grid-cols-2 gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="2" id="num-images-2" className="text-purple-600 border-gray-600" />
                              <Label htmlFor="num-images-2" className="text-sm text-gray-300 cursor-pointer">
                                2 Images
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="4" id="num-images-4" className="text-purple-600 border-gray-600" />
                              <Label htmlFor="num-images-4" className="text-sm text-gray-300 cursor-pointer">
                                4 Images
                              </Label>
                            </div>
                          </RadioGroup>
                          <div className="text-xs text-gray-400 italic">Choose how many images to generate at once</div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="border-gray-800/50 bg-[#111827]/80 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                    <h3 className="text-white font-medium">Tips for Better Results</h3>
                  </div>

                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Be specific about style, lighting, and composition</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Mention colors, mood, and camera angle for better results</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Use "Quality Mode" for final assets, "Fast Mode" for drafts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Try different creativity levels to find your perfect style</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Generate Button - Fixed at bottom of left panel */}
            <div className="mt-auto pt-4">
              <Button
                onClick={generateImages}
                disabled={isGenerating || !prompt.trim()}
                className={cn(
                  "w-full relative overflow-hidden rounded-lg py-3 h-auto",
                  isGenerating
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white",
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Generating Images...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Images
                  </>
                )}
                {!isGenerating && prompt.trim() && (
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 0.1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                    }}
                  />
                )}
              </Button>

              {/* Show enhanced prompt button if available */}
              {enhancedPrompt && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
                  onClick={() => setShowPromptDialog(true)}
                >
                  <Info className="h-4 w-4 mr-1.5" />
                  View Enhanced Prompt
                </Button>
              )}
            </div>
          </div>

          {/* Right Panel - Fixed Output Gallery */}
          <div className="lg:col-span-8 h-full overflow-hidden">
            <Card className="border-gray-800/50 bg-[#111827]/80 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <Tabs defaultValue="gallery" className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <TabsList className="bg-[#1a2235]/80 backdrop-blur-sm border border-gray-800/50 p-1 rounded-xl">
                      <TabsTrigger
                        value="gallery"
                        className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white px-6"
                      >
                        Gallery
                      </TabsTrigger>
                      <TabsTrigger
                        value="history"
                        className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white px-6"
                      >
                        History
                      </TabsTrigger>
                    </TabsList>

                    <div className="text-sm text-gray-400">
                      {isGenerating ? (
                        <div className="flex items-center">
                          <Loader2 className="animate-spin mr-2 h-4 w-4 text-purple-500" />
                          {isQualityMode ? "Generating high-quality images..." : "Generating images quickly..."}
                        </div>
                      ) : (
                        generatedImages.length > 0 && <span>{generatedImages.length} images generated</span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for generation */}
                  <AnimatePresence>
                    {generationProgress > 0 && (
                      <motion.div
                        className="w-full bg-gray-700 rounded-full h-1.5 mb-4 overflow-hidden"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 h-1.5 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${generationProgress}%` }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <TabsContent value="gallery" className="flex-1 overflow-auto pr-1">
                    {error && (
                      <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-800/50 text-red-300">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Generation Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {generatedImages.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
                        {generatedImages.map((imageUrl, index) => (
                          <motion.div
                            key={index}
                            className="relative group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-700/50">
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`Generated image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-10 w-10 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                                        onClick={() => downloadImage(imageUrl, index)}
                                      >
                                        <Download className="h-5 w-5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p>Download image</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-10 w-10 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                                        onClick={() => regenerateImage(index)}
                                      >
                                        <RotateCcw className="h-5 w-5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p>Regenerate image</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        {isGenerating ? (
                          <div className="space-y-4">
                            <div className="relative">
                              <div className="h-20 w-20 rounded-full border-4 border-t-purple-600 border-r-purple-600/40 border-b-purple-600/10 border-l-purple-600/30 animate-spin"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-purple-500" />
                              </div>
                            </div>
                            <div>
                              <p className="text-white text-lg font-medium">
                                {loadingMessage || "Creating your images..."}
                              </p>
                              <p className="text-gray-400 mt-1">
                                {isQualityMode
                                  ? "Quality mode takes 10-15 seconds for detailed results"
                                  : "Fast mode generates images in 3-5 seconds"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-[#1a2235]/80 p-6 rounded-full">
                              <ImageIcon className="h-12 w-12 text-purple-500" />
                            </div>
                            <div>
                              <p className="text-white text-lg font-medium">Your generated images will appear here</p>
                              <p className="text-gray-400 mt-1 max-w-md">
                                Fill out the form on the left and click "Generate Images" to create AI-powered visuals
                              </p>
                            </div>
                            <div className="pt-4">
                              <Button
                                variant="outline"
                                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                                onClick={loadExamplePrompt}
                              >
                                <Lightbulb className="mr-2 h-4 w-4" />
                                Try an example prompt
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="history" className="flex-1 overflow-auto pr-1">
                    {imageHistory.length > 0 ? (
                      <div className="space-y-6 pb-4">
                        {imageHistory.map((item) => (
                          <div
                            key={item.id}
                            className="bg-[#1a2235]/80 rounded-lg border border-gray-700/50 overflow-hidden"
                          >
                            <div className="p-4 border-b border-gray-700/50">
                              <div className="flex justify-between items-center">
                                <p className="text-white font-medium truncate max-w-[80%]">{item.prompt}</p>
                                <span className="text-xs text-gray-400">{formatTimestamp(item.timestamp)}</span>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="grid grid-cols-2 gap-2">
                                {item.images.slice(0, 4).map((img, idx) => (
                                  <div key={idx} className="aspect-square relative overflow-hidden rounded-md">
                                    <img
                                      src={img || "/placeholder.svg"}
                                      alt={`History image ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                                        onClick={() => downloadImage(img, idx)}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="bg-[#1a2235]/80 p-6 rounded-full">
                          <ImageIcon className="h-12 w-12 text-purple-500 opacity-50" />
                        </div>
                        <div className="mt-4">
                          <p className="text-white text-lg font-medium">No generation history yet</p>
                          <p className="text-gray-400 mt-1 max-w-md">
                            Your generated images will appear here for easy reference
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Prompt Dialog */}
      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
        <DialogContent className="bg-[#1a2235] border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Enhanced AI Prompt</DialogTitle>
            <DialogDescription className="text-gray-400">
              This is the enhanced prompt used by the AI to generate your images
            </DialogDescription>
          </DialogHeader>
          <div className="bg-[#111827] p-4 rounded-md border border-gray-700 max-h-[300px] overflow-y-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{enhancedPrompt}</pre>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              onClick={copyPromptToClipboard}
            >
              {copiedPrompt ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Prompt
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
