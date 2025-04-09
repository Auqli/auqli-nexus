"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  Wand2,
  Lightbulb,
  Layers,
  Clock,
  X,
  Zap,
  FileText,
  MessageSquare,
  Star,
  Palette,
  AlertTriangle,
  Code,
  Package,
  Target,
  Instagram,
  Mail,
  Briefcase,
  Heart,
  Smile,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

// Import the react-markdown components
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// Import from config
import { CONTENT_TYPES, TONE_OPTIONS, LENGTH_OPTIONS, LOADING_MESSAGES } from "@/config/ai-config"

// Define interface for history items
interface HistoryItem {
  id: string
  type: string
  prompt: string
  content?: string
  date: string
}

const contentStyles = `
.generated-content {
  line-height: 1.6;
  font-size: 1.05rem;
}

.generated-content p {
  margin-bottom: 0.75rem;
}

.generated-content p:has(strong) {
  font-weight: 600;
  color: #f0f0f0;
}

.generated-content p:has(em) {
  font-style: italic;
  color: #d0d0d0;
}

.generated-content ul, .generated-content ol {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.generated-content ul li, .generated-content ol li {
  margin-bottom: 0.5rem;
}

.generated-content h1, .generated-content h2, .generated-content h3, 
.generated-content h4, .generated-content h5, .generated-content h6 {
  color: #8696ee;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.generated-content blockquote {
  border-left: 3px solid #45c133;
  padding-left: 1rem;
  font-style: italic;
  color: #a0a0a0;
  margin: 1rem 0;
}

.generated-content pre {
  background-color: #1a2235;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.generated-content code {
  background-color: #1a2235;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
}

.generated-content a {
  color: #45c133;
  text-decoration: underline;
  transition: color 0.2s;
}

.generated-content a:hover {
  color: #5466b5;
}

.generated-content hr {
  border: 0;
  height: 1px;
  background-color: #333;
  margin: 1.5rem 0;
}

.generated-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.generated-content table th,
.generated-content table td {
  border: 1px solid #333;
  padding: 0.5rem;
}

.generated-content table th {
  background-color: #1a2235;
}

/* Enhanced styles for social media content */
.generated-content .platform-header {
  background: linear-gradient(to right, rgba(69, 193, 51, 0.1), transparent);
  padding: 0.75rem 1rem;
  margin: 1.5rem 0 1rem;
  border-left: 4px solid #45c133;
  border-radius: 0.25rem;
  font-weight: 700;
  color: white;
}

.generated-content .hashtag {
  color: #8696ee;
  font-weight: 500;
}

.generated-content .emoji {
  display: inline-block;
  margin: 0 0.1rem;
}

.generated-content .caption-box {
  background-color: rgba(26, 34, 53, 0.5);
  border: 1px solid rgba(69, 193, 51, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 0.5rem 0 1.5rem;
}

.generated-content .feature-list {
  margin-left: 1rem;
}

.generated-content .feature-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.generated-content .feature-bullet {
  color: #45c133;
  margin-right: 0.5rem;
  font-weight: bold;
}

/* Mobile optimization */
@media (max-width: 640px) {
  .generated-content {
    font-size: 0.95rem;
  }
  
  .generated-content .platform-header {
    padding: 0.5rem 0.75rem;
  }
}
`

// Sample history items
const historyItems = [
  {
    id: "1",
    type: "product-descriptions",
    prompt: "Wireless earbuds with noise cancellation",
    date: "2 hours ago",
  },
  {
    id: "2",
    type: "ad-copy",
    prompt: "Fitness app for busy professionals",
    date: "Yesterday",
  },
  {
    id: "3",
    type: "social-captions",
    prompt: "New summer collection launch",
    date: "3 days ago",
  },
]

export default function CopywritingPage() {
  const [activeTab, setActiveTab] = useState("create")
  const [selectedContentType, setSelectedContentType] = useState(CONTENT_TYPES[0])
  const [prompt, setPrompt] = useState("")
  const [tone, setTone] = useState("professional")
  const [creativity, setCreativity] = useState([0.7])
  const [length, setLength] = useState("medium")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [copied, setCopied] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userHistory, setUserHistory] = useState<HistoryItem[]>(historyItems)
  const [loadingMessage, setLoadingMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Add debugging for environment variables
  useEffect(() => {
    console.log("Environment check: DEEPINFRA_API_KEY available:", !!process.env.NEXT_PUBLIC_DEEPINFRA_API_KEY_CHECK)
  }, [])

  // Generate content using the API
  const generateContent = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedContent("")
    setError(null)
    setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)])

    try {
      console.log("Generating content for:", selectedContentType.id, "with tone:", tone)

      const response = await fetch("/api/generate-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: selectedContentType.id,
          prompt,
          tone,
          creativity: creativity[0],
          length,
        }),
      })

      // First check if the response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error response:", response.status, errorText)
        throw new Error(`API error: ${response.status}. ${errorText.substring(0, 100)}...`)
      }

      // Now try to parse the JSON
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError)
        throw new Error("Failed to parse response from server. Please try again.")
      }

      console.log("API response:", data)

      if (data.status === "success" && data.content) {
        setGeneratedContent(data.content)

        // Add to history
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          type: selectedContentType.id,
          prompt,
          content: data.content,
          date: "Just now",
        }

        setUserHistory((prev) => [newHistoryItem, ...prev])
      } else if (data.error) {
        throw new Error(data.error)
      } else {
        throw new Error("No content generated")
      }
    } catch (err) {
      console.error("Error generating content:", err)
      setError(err instanceof Error ? err.message : "Failed to generate content. Please try again.")

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to generate content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setLoadingMessage("")
    }
  }

  // Update loading message at intervals during generation
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)])
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isGenerating])

  // Add these functions to handle different copy formats
  const copyAsPlainText = () => {
    if (!generatedContent) return

    // Create a clean version for clipboard that preserves basic formatting
    // but removes Markdown syntax
    let plainText = generatedContent
      .replace(/^## 📸 Instagram$/gm, "📸 INSTAGRAM:")
      .replace(/^## 🐦 Twitter$/gm, "🐦 TWITTER:")
      .replace(/^#{1,6} /gm, "") // Remove heading markers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markers
      .replace(/\*(.*?)\*/g, "$1") // Remove italic markers
      .replace(/\[(.*?)\]$$(.*?)$$/g, "$1 ($2)") // Convert links to text with URL

    // Ensure proper spacing
    plainText = plainText.replace(/\n{3,}/g, "\n\n")

    navigator.clipboard.writeText(plainText)
    setCopied(true)

    toast({
      title: "Copied as plain text",
      description: "Content has been copied to your clipboard as plain text",
    })

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const copyAsHTML = () => {
    if (!generatedContent) return

    // Convert Markdown to HTML
    // This is a simple conversion - for production, use a proper Markdown-to-HTML converter
    const html = generatedContent
      .replace(/^## 📸 Instagram$/gm, "<h2>📸 Instagram</h2>")
      .replace(/^## 🐦 Twitter$/gm, "<h2>🐦 Twitter</h2>")
      .replace(/^#{6} (.*?)$/gm, "<h6>$1</h6>")
      .replace(/^#{5} (.*?)$/gm, "<h5>$1</h5>")
      .replace(/^#{4} (.*?)$/gm, "<h4>$1</h4>")
      .replace(/^#{3} (.*?)$/gm, "<h3>$1</h3>")
      .replace(/^#{2} (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^#{1} (.*?)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\[(.*?)\]$$(.*?)$$/g, "<a href='$2'>$1</a>")
      .replace(/^- (.*?)$/gm, "<li>$1</li>")
      .replace(/<li>.*?<\/li>/gs, (match) => `<ul>${match}</ul>`)
      .replace(/\n\n/g, "<br><br>")

    navigator.clipboard.writeText(html)
    setCopied(true)

    toast({
      title: "Copied as HTML",
      description: "Content has been copied to your clipboard as HTML",
    })

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  // Update the copy to clipboard function to handle formatting better
  const copyToClipboard = () => {
    if (!generatedContent) return

    // Create a clean version for clipboard that preserves some formatting
    // but removes HTML/JSX elements
    let clipboardText = generatedContent

    // Format platform headers for readability in plain text
    clipboardText = clipboardText.replace(/^### 📸 Instagram$/gm, "📸 INSTAGRAM:")
    clipboardText = clipboardText.replace(/^### 🐦 Twitter$/gm, "🐦 TWITTER:")

    // Ensure proper spacing
    clipboardText = clipboardText.replace(/\n{3,}/g, "\n\n")

    navigator.clipboard.writeText(clipboardText)
    setCopied(true)

    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard with formatting preserved",
    })

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const handleContentTypeChange = (type) => {
    const selected = CONTENT_TYPES.find((ct) => ct.id === type)
    if (selected) {
      setSelectedContentType(selected)
    }
  }

  const handleExamplePrompt = () => {
    setPrompt(selectedContentType.examplePrompt)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleDeleteHistoryItem = (id: string) => {
    setUserHistory((prev) => prev.filter((item) => item.id !== id))

    toast({
      title: "Item deleted",
      description: "History item has been removed",
    })
  }

  const handleLoadHistoryItem = (item: HistoryItem) => {
    // Find the content type
    const contentType = CONTENT_TYPES.find((ct) => ct.id === item.type)
    if (contentType) {
      setSelectedContentType(contentType)
    }

    setPrompt(item.prompt)
    if (item.content) {
      setGeneratedContent(item.content)
    }

    setActiveTab("create")
  }

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  // Add custom styles for generated content
  useEffect(() => {
    // Add the styles to the document
    const styleElement = document.createElement("style")
    styleElement.innerHTML = contentStyles
    document.head.appendChild(styleElement)

    // Clean up on unmount
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // Get the current tone option
  const currentTone = TONE_OPTIONS.find((t) => t.value === tone) || TONE_OPTIONS[0]

  // Function to get icon component
  const getIconComponent = (iconName: string) => {
    const iconMap = {
      Sparkles: <Sparkles className="h-5 w-5" />,
      Package: <Package className="h-5 w-5" />,
      Target: <Target className="h-5 w-5" />,
      Instagram: <Instagram className="h-5 w-5" />,
      FileText: <FileText className="h-5 w-5" />,
      Mail: <Mail className="h-5 w-5" />,
      MessageSquare: <MessageSquare className="h-5 w-5" />,
      Layers: <Layers className="h-5 w-5" />,
      Briefcase: <Briefcase className="h-4 w-4" />,
      Heart: <Heart className="h-4 w-4" />,
      Smile: <Smile className="h-4 w-4" />,
      Award: <Award className="h-4 w-4" />,
      Zap: <Zap className="h-4 w-4" />,
      Star: <Star className="h-4 w-4" />,
      Lightbulb: <Lightbulb className="h-4 w-4" />,
      Wand2: <Wand2 className="h-4 w-4" />,
      Palette: <Palette className="h-4 w-4" />,
    }

    return iconMap[iconName] || <Sparkles className="h-5 w-5" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1a] via-[#0c1322] to-[#0a0f1a]">
      {/* Compact Title Bar */}
      <div className="bg-[#111827]/80 border-b border-gray-800/50 py-3 px-4 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-white flex items-center">
              AI CopyGen
              <div className="relative ml-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#16783a] text-white">
                  Beta
                </span>
                <span className="absolute inset-0 rounded-full animate-pulse bg-[#16783a]/30 blur-sm"></span>
              </div>
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#5466b5] to-[#8696ee] text-white">
              <Sparkles className="mr-1 h-3 w-3" />
              AI Powered
            </span>
          </div>
          <div className="text-sm text-gray-400">Generate high-converting copy in seconds</div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="container max-w-[1400px] mx-auto px-4 py-8 relative">
        <motion.div
          className="mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isPageLoaded ? 1 : 0, y: isPageLoaded ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Main Tabs */}
          <Tabs defaultValue="create" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-[#1a2235]/80 backdrop-blur-sm border border-gray-800/50 p-1 rounded-xl">
                <TabsTrigger
                  value="create"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#16783a] data-[state=active]:to-[#225b35] data-[state=active]:text-white px-6"
                >
                  Create
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#16783a] data-[state=active]:to-[#225b35] data-[state=active]:text-white px-6"
                >
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="templates"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#16783a] data-[state=active]:to-[#225b35] data-[state=active]:text-white px-6"
                >
                  Templates
                </TabsTrigger>
              </TabsList>

              <div className="hidden md:flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-300 hover:bg-[#1a2235] hover:text-white backdrop-blur-sm"
                  onClick={() => window.open("https://auqli.live/help/copywriting", "_blank")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 mr-1"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                  Help
                </Button>
              </div>
            </div>

            <TabsContent value="create" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column - Content Type & Settings - now 1/4 of the width */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Content Type Card */}
                  <Card className="border-gray-800/50 bg-[#111827]/80 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-[#0c1322]/95 to-[#111827]/95 border-b border-gray-800/50 p-5">
                      <CardTitle className="text-white flex items-center">
                        <Wand2 className="h-5 w-5 mr-2 text-[#45c133]" />
                        Content Type
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {CONTENT_TYPES.map((type) => (
                          <motion.div
                            key={type.id}
                            className={`p-3 rounded-xl cursor-pointer transition-all border ${
                              selectedContentType.id === type.id
                                ? `bg-gradient-to-br ${type.bgColor} border-${type.color.split(" ")[1].replace("to-", "")}/30`
                                : "bg-gradient-to-br from-[#1a2235]/80 to-[#111827]/80 border-gray-800/50 hover:border-gray-700/50"
                            }`}
                            onClick={() => handleContentTypeChange(type.id)}
                            whileHover={{ y: -3, transition: { duration: 0.2 } }}
                            animate={{
                              boxShadow:
                                selectedContentType.id === type.id
                                  ? "0 0 20px rgba(69, 193, 51, 0.2)"
                                  : "0 0 0 rgba(0, 0, 0, 0)",
                            }}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div
                                className={`p-2.5 rounded-full mb-2.5 ${
                                  selectedContentType.id === type.id
                                    ? `bg-gradient-to-br ${type.color} text-white shadow-lg`
                                    : "bg-[#111827]/80 text-gray-400"
                                }`}
                              >
                                {getIconComponent(type.icon)}
                              </div>
                              <span className="text-sm font-medium text-white">{type.name}</span>
                              <span className="text-xs text-gray-400 mt-1">{type.description}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Settings Card */}
                  <Card className="border-gray-800/50 bg-[#111827]/80 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-[#0c1322]/95 to-[#111827]/95 border-b border-gray-800/50 p-5">
                      <CardTitle className="text-white">Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-5">
                      <div className="space-y-4">
                        {/* Tone Selection */}
                        <div>
                          <Label htmlFor="tone" className="text-white mb-2 block">
                            Tone
                          </Label>
                          <Select value={tone} onValueChange={setTone}>
                            <SelectTrigger className="bg-[#1a2235]/80 border-gray-700/50 text-white rounded-lg h-11">
                              <div className="flex items-center">
                                {currentTone.icon && (
                                  <span className="mr-2 text-[#45c133]">{getIconComponent(currentTone.icon)}</span>
                                )}
                                <SelectValue placeholder="Select tone" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a2235] border-gray-700 text-white">
                              {TONE_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  className="focus:bg-[#16783a]/20 focus:text-white"
                                >
                                  <div className="flex items-center">
                                    <span className="mr-2 text-[#45c133]">{getIconComponent(option.icon)}</span>
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Creativity Slider */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label htmlFor="creativity" className="text-white">
                              Creativity
                            </Label>
                            <span className="text-[#45c133] text-sm font-medium">
                              {Math.round(creativity[0] * 100)}%
                            </span>
                          </div>
                          <div className="relative">
                            <Slider
                              id="creativity"
                              value={creativity}
                              onValueChange={setCreativity}
                              max={1}
                              step={0.1}
                              className="mt-2"
                            />
                            <div className="absolute -bottom-6 left-0 right-0">
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-500">Conservative</span>
                                <span className="text-xs text-gray-500">Creative</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Length Selection - Add more top margin for better spacing */}
                        <div className="mt-12">
                          <Label htmlFor="length" className="text-white mb-2 block">
                            Length
                          </Label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {LENGTH_OPTIONS.map((option) => (
                              <Button
                                key={option.value}
                                variant="outline"
                                size="sm"
                                className={`${
                                  length === option.value
                                    ? "bg-gradient-to-r from-[#16783a] to-[#225b35] text-white border-transparent"
                                    : "bg-[#1a2235]/80 text-gray-300 border-gray-700/50 hover:bg-[#1a2235]"
                                } rounded-lg h-10`}
                                onClick={() => setLength(option.value)}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Input and Output - now 3/4 of the width */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Brief Input Card */}
                  <Card className="border-gray-800/50 bg-[#111827]/80 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-[#0c1322]/95 to-[#111827]/95 border-b border-gray-800/50 p-5 flex flex-row items-center justify-between">
                      <CardTitle className="text-white">Your Brief</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-400 hover:text-white hover:bg-[#1a2235]/80 border-gray-700/50"
                              onClick={handleExamplePrompt}
                            >
                              <Lightbulb className="h-4 w-4 mr-1.5 text-[#45c133]" />
                              Example
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#1a2235] border-gray-700 text-white">
                            <p>Load an example prompt</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        <Textarea
                          ref={textareaRef}
                          placeholder={selectedContentType.placeholder}
                          className="min-h-[180px] bg-[#1a2235]/80 border-gray-700/50 text-white placeholder:text-gray-500 resize-none rounded-lg focus:border-[#45c133]/50 focus:ring-[#45c133]/20"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                        />

                        {error && (
                          <Alert variant="destructive" className="bg-red-900/20 border-red-800/50 text-red-300">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="flex justify-end">
                          <Button
                            onClick={generateContent}
                            disabled={!prompt.trim() || isGenerating}
                            className={`relative overflow-hidden rounded-lg ${
                              !prompt.trim() || isGenerating
                                ? "bg-gray-700 text-gray-400"
                                : "bg-gradient-to-r from-[#16783a] to-[#225b35] hover:from-[#225b35] hover:to-[#16783a] text-white"
                            }`}
                          >
                            {isGenerating ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                {loadingMessage || "Generating..."}
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Generated Content Card */}
                  <Card className="border-gray-800/50 bg-[#111827]/80 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-[#0c1322]/95 to-[#111827]/95 border-b border-gray-800/50 p-5 flex flex-row items-center justify-between">
                      <CardTitle className="text-white">Generated Content</CardTitle>
                      {generatedContent && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-400 hover:text-white hover:bg-[#1a2235]/80 border-gray-700/50"
                            >
                              {copied ? (
                                <>
                                  <Check className="h-4 w-4 mr-1.5 text-green-500" />
                                  <span className="text-green-500">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1.5" />
                                  Copy
                                </>
                              )}
                              <ChevronDown className="h-3 w-3 ml-1.5 opacity-70" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 bg-[#1a2235] border-gray-700/50 p-2">
                            <div className="space-y-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-white hover:bg-[#111827]/80 rounded-lg"
                                onClick={copyToClipboard}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy with Formatting
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-white hover:bg-[#111827]/80 rounded-lg"
                                onClick={copyAsPlainText}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Copy as Plain Text
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-white hover:bg-[#111827]/80 rounded-lg"
                                onClick={copyAsHTML}
                              >
                                <Code className="h-4 w-4 mr-2" />
                                Copy as HTML
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[400px]">
                        <div className="p-5 generated-content-container">
                          {isGenerating ? (
                            <div className="flex flex-col items-center justify-center h-full py-12">
                              <div className="relative">
                                <div className="h-16 w-16 rounded-full border-4 border-t-[#16783a] border-r-[#16783a]/40 border-b-[#16783a]/10 border-l-[#16783a]/30 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Sparkles className="h-6 w-6 text-[#45c133]" />
                                </div>
                                <div className="absolute -inset-4">
                                  <div className="w-24 h-24 rounded-full bg-[#16783a]/10 animate-pulse"></div>
                                </div>
                              </div>
                              <p className="mt-6 text-gray-300 text-center font-medium">
                                {loadingMessage || "Crafting your content with AI magic..."}
                              </p>
                              <div className="mt-2 text-gray-500 text-sm text-center max-w-md">
                                Our AI is analyzing your brief and generating high-quality content tailored to your
                                needs.
                              </div>
                              <div className="mt-4 flex space-x-1">
                                {[0, 1, 2].map((i) => (
                                  <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-[#16783a]"
                                    animate={{
                                      y: [0, -5, 0],
                                    }}
                                    transition={{
                                      duration: 0.6,
                                      repeat: Number.POSITIVE_INFINITY,
                                      repeatType: "loop",
                                      delay: i * 0.2,
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : generatedContent ? (
                            <div className="prose prose-invert max-w-none generated-content">
                              <div className="bg-gradient-to-r from-[#111827]/95 to-transparent p-3 -mx-3 mb-4 border-b border-gray-800/30 rounded-t-lg">
                                <div className="flex items-center">
                                  <div className="h-2 w-2 rounded-full bg-[#45c133] mr-2"></div>
                                  <span className="text-sm font-medium text-gray-400">AI-Generated Content</span>
                                </div>
                              </div>
                              {/* Use ReactMarkdown to render the generated content */}
                              <ReactMarkdown remarkPlugins={[remarkGfm]} className="markdown-body">
                                {generatedContent}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                              <div className="relative">
                                <div className="bg-gradient-to-br from-[#16783a]/20 to-[#16783a]/5 p-6 rounded-full mb-6">
                                  <div className="bg-gradient-to-br from-[#16783a] to-[#225b35] p-4 rounded-full">
                                    <Sparkles className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                                <motion.div
                                  className="absolute -inset-4 rounded-full border border-[#16783a]/20"
                                  animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.5, 0.8, 0.5],
                                  }}
                                  transition={{
                                    duration: 3,
                                    repeat: Number.POSITIVE_INFINITY,
                                    repeatType: "loop",
                                  }}
                                />
                              </div>
                              <p className="text-gray-300 font-medium text-lg">
                                Your generated content will appear here
                              </p>
                              <p className="mt-2 text-gray-500 text-sm max-w-md">
                                Fill out your brief and click "Generate" to create AI-powered content for your business
                              </p>
                              <motion.div
                                className="mt-6 border border-dashed border-[#16783a]/30 rounded-lg p-4 max-w-md"
                                animate={{
                                  borderColor: [
                                    "rgba(22, 120, 58, 0.2)",
                                    "rgba(22, 120, 58, 0.4)",
                                    "rgba(22, 120, 58, 0.2)",
                                  ],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Number.POSITIVE_INFINITY,
                                  repeatType: "loop",
                                }}
                              >
                                <p className="text-gray-500 text-sm italic">
                                  "Great copy doesn't just sell products—it tells stories that connect with your
                                  audience."
                                </p>
                              </motion.div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                    {generatedContent && (
                      <CardFooter className="bg-gradient-to-r from-[#0c1322]/95 to-[#111827]/95 border-t border-gray-800/50 p-5 flex justify-between">
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className="bg-gradient-to-r from-[#16783a]/10 to-[#45c133]/10 text-[#45c133] border-[#16783a]/20"
                          >
                            {selectedContentType.name}
                          </Badge>
                          <span className="mx-2 text-gray-500">•</span>
                          <span className="text-gray-400 text-sm capitalize flex items-center">
                            {currentTone.icon && (
                              <span className="mr-1.5 text-[#45c133]">{getIconComponent(currentTone.icon)}</span>
                            )}
                            {currentTone.label}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700/50 text-gray-300 hover:bg-[#1a2235]/80 hover:text-white"
                            onClick={() => generateContent()}
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Regenerate
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#16783a] to-[#225b35] hover:from-[#225b35] hover:to-[#16783a] text-white"
                          >
                            <span>Save</span>
                          </Button>
                        </div>
                      </CardFooter>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <Card className="border-gray-800/50 bg-[#111827]/80 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#0c1322]/95 to-[#111827]/95 border-b border-gray-800/50 p-5">
                  <CardTitle className="text-white">Your Content History</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-4">
                    {userHistory.length > 0 ? (
                      userHistory.map((item) => (
                        <motion.div
                          key={item.id}
                          className="p-4 border border-gray-800/50 rounded-xl bg-[#1a2235]/80 hover:bg-[#1a2235] transition-colors cursor-pointer"
                          whileHover={{ y: -2, transition: { duration: 0.2 } }}
                          onClick={() => handleLoadHistoryItem(item)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <Badge
                                  variant="outline"
                                  className="bg-gradient-to-r from-[#16783a]/10 to-[#45c133]/10 text-[#45c133] border-[#16783a]/20"
                                >
                                  {CONTENT_TYPES.find((ct) => ct.id === item.type)?.name || item.type}
                                </Badge>
                                <span className="ml-2 text-xs text-gray-500">{item.date}</span>
                              </div>
                              <p className="mt-2 text-white">{item.prompt}</p>
                            </div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#111827]/50 rounded-lg"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-40 bg-[#1a2235] border-gray-700/50 p-2">
                                <div className="space-y-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-white hover:bg-[#111827]/80 rounded-lg"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (item.content) {
                                        navigator.clipboard.writeText(item.content)
                                        toast({
                                          title: "Copied to clipboard",
                                          description: "Content has been copied to your clipboard",
                                        })
                                      }
                                    }}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-white hover:bg-[#111827]/80 rounded-lg"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleLoadHistoryItem(item)
                                    }}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Regenerate
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-red-500 hover:bg-[#111827]/80 hover:text-red-400 rounded-lg"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteHistoryItem(item.id)
                                    }}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Delete
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-[#1a2235]/80 p-4 rounded-full mb-4">
                          <Clock className="h-8 w-8 text-[#45c133]" />
                        </div>
                        <p className="text-gray-300 text-lg font-medium">No history yet</p>
                        <p className="mt-2 text-gray-500 text-sm max-w-md">
                          Your generated content history will appear here
                        </p>
                        <Button
                          className="mt-6 bg-gradient-to-r from-[#16783a] to-[#225b35] hover:from-[#225b35] hover:to-[#16783a] text-white rounded-lg"
                          onClick={() => setActiveTab("create")}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Create Your First Content
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <Card className="border-gray-800/50 bg-[#111827]/80 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#0c1322]/95 to-[#111827]/95 border-b border-gray-800/50 p-5">
                  <CardTitle className="text-white">Saved Templates</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-[#1a2235]/80 p-4 rounded-full mb-4">
                      <Layers className="h-8 w-8 text-[#45c133]" />
                    </div>
                    <p className="text-gray-300 text-lg font-medium">No templates saved yet</p>
                    <p className="mt-2 text-gray-500 text-sm max-w-md">
                      Save your favorite generated content as templates to quickly reuse them later
                    </p>
                    <Button
                      className="mt-6 bg-gradient-to-r from-[#16783a] to-[#225b35] hover:from-[#225b35] hover:to-[#16783a] text-white rounded-lg"
                      onClick={() => setActiveTab("create")}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Your First Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
