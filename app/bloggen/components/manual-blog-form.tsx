"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Loader2, Sparkles } from "lucide-react"
import { useBloggen } from "@/hooks/use-bloggen"
import { useToast } from "@/hooks/use-toast"
import type { BloggenPreset } from "@/types/bloggen"

const AI_MODELS = [
  { id: "mistralai/Mistral-Small-24B-Instruct-2501", name: "Mistral Small 24B" },
  { id: "deepseek-ai/DeepSeek-V3", name: "DeepSeek V3" },
  { id: "Qwen/Qwen2.5-7B-Instruct", name: "Qwen 2.5 7B" },
]

const DEFAULT_VERTICALS = [
  "Technology",
  "Health & Wellness",
  "Finance",
  "Marketing",
  "Education",
  "Travel",
  "Food & Cooking",
  "Fashion",
  "Sports",
  "Entertainment",
]

interface ManualBlogFormProps {
  preset: BloggenPreset | null
  onBlogGenerated: (blog: any) => void
}

export function ManualBlogForm({ preset, onBlogGenerated }: ManualBlogFormProps) {
  const { generateBlogs, isGenerating } = useBloggen()
  const { toast } = useToast()

  const [vertical, setVertical] = useState("")
  const [keyword, setKeyword] = useState("")
  const [customTitle, setCustomTitle] = useState("")
  const [wordCount, setWordCount] = useState(2500)
  const [model, setModel] = useState(AI_MODELS[0].id)
  const [customInstructions, setCustomInstructions] = useState("")
  const [overridePreset, setOverridePreset] = useState(false)
  const [customTone, setCustomTone] = useState("")
  const [customStyle, setCustomStyle] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const params = {
        vertical,
        keyword,
        customTitle,
        count: 1,
        model,
        overridePreset,
        customTone,
        customStyle,
        customWordCount: wordCount,
        customInstructions,
      }

      const blogs = await generateBlogs(params)

      if (blogs && blogs.length > 0) {
        toast({
          title: "Blog Generated",
          description: "Your blog post has been successfully generated.",
        })
        onBlogGenerated(blogs[0])
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate blog post.",
        variant: "destructive",
      })
    }
  }

  const getVerticalOptions = () => {
    const presetVerticals = preset?.vertical_focus || []
    const allVerticals = [...new Set([...DEFAULT_VERTICALS, ...presetVerticals])]
    return allVerticals
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Generate Blog Post</CardTitle>
        <CardDescription>Create a new blog post with AI assistance</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vertical">Industry Vertical</Label>
            <Select value={vertical} onValueChange={setVertical}>
              <SelectTrigger id="vertical">
                <SelectValue placeholder="Select a vertical" />
              </SelectTrigger>
              <SelectContent>
                {getVerticalOptions().map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
                <SelectItem value="custom">+ Add Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {vertical === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customVertical">Custom Vertical</Label>
              <Input
                id="customVertical"
                placeholder="Enter custom vertical"
                onChange={(e) => setVertical(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="keyword">SEO Keyword</Label>
            <Input
              id="keyword"
              placeholder="Main keyword for SEO optimization"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customTitle">Custom Title (Optional)</Label>
            <Input
              id="customTitle"
              placeholder="Leave blank for AI to generate"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="wordCount">Word Count: {wordCount}</Label>
            </div>
            <Slider
              id="wordCount"
              min={500}
              max={5000}
              step={100}
              value={[wordCount]}
              onValueChange={(value) => setWordCount(value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>500</span>
              <span>2500</span>
              <span>5000</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="override" checked={overridePreset} onCheckedChange={setOverridePreset} />
            <Label htmlFor="override">Override preset settings</Label>
          </div>

          {overridePreset && (
            <>
              <div className="space-y-2">
                <Label htmlFor="customTone">Brand Tone</Label>
                <Input
                  id="customTone"
                  placeholder="e.g., Professional, Casual, Humorous"
                  value={customTone}
                  onChange={(e) => setCustomTone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customStyle">Writing Style</Label>
                <Input
                  id="customStyle"
                  placeholder="e.g., Conversational, Technical, Story-based"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="customInstructions">Custom Instructions (Optional)</Label>
            <Textarea
              id="customInstructions"
              placeholder="Additional instructions for the AI"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              rows={4}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className="w-full"
          onClick={handleSubmit}
          disabled={isGenerating || !vertical || !keyword}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Blog
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
