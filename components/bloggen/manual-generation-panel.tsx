"use client"

import { useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBloggen } from "@/hooks/use-bloggen"
import { VERTICALS, AI_MODELS } from "@/lib/bloggen-constants"
import type { BloggenPreset } from "@/types/bloggen"

interface ManualGenerationPanelProps {
  onBlogGenerated: () => void
  preset: BloggenPreset | null
  onStreamUpdate: (text: string) => void
}

export function ManualGenerationPanel({ onBlogGenerated, preset, onStreamUpdate }: ManualGenerationPanelProps) {
  const [count, setCount] = useState<number>(1)
  const [vertical, setVertical] = useState<string>("")
  const [customVertical, setCustomVertical] = useState<string>("")
  const [keyword, setKeyword] = useState<string>("")
  const [customTopic, setCustomTopic] = useState<string>("")
  const [wordCount, setWordCount] = useState<number>(0)
  const [model, setModel] = useState<string>("")
  const { generateBlogs, isGenerating, error } = useBloggen()

  const handleGenerate = async () => {
    // Use either the selected vertical or custom vertical
    const finalVertical = vertical === "custom" ? customVertical : vertical

    const result = await generateBlogs(
      {
        count,
        vertical: finalVertical || undefined,
        keyword: keyword || undefined,
        customTopic: customTopic || undefined,
        wordCount: wordCount || undefined,
        model: model || undefined,
        overridePreset: Boolean(finalVertical || keyword || customTopic || wordCount || model),
      },
      onStreamUpdate,
    )

    if (result) {
      onBlogGenerated()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-orange-500" />
          Generate Blogs Instantly
        </CardTitle>
        <CardDescription>
          Create high-quality SEO blogs with AI. Use your preset settings or customize for this batch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="count">Number of Blogs</Label>
            <Select value={count.toString()} onValueChange={(value) => setCount(Number.parseInt(value))}>
              <SelectTrigger id="count">
                <SelectValue placeholder="Select count" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "blog" : "blogs"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model">
                <SelectValue placeholder={`Default (${preset?.preferred_model || "Mistral"})`} />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} - {m.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vertical">Vertical</Label>
          <Select value={vertical} onValueChange={setVertical}>
            <SelectTrigger id="vertical">
              <SelectValue placeholder={`Default (${preset?.vertical_focus[0] || "General"})`} />
            </SelectTrigger>
            <SelectContent>
              {VERTICALS.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.emoji} {v.name}
                </SelectItem>
              ))}
              <SelectItem value="custom">✏️ Custom Vertical</SelectItem>
            </SelectContent>
          </Select>

          {vertical === "custom" && (
            <div className="mt-2">
              <Input
                id="customVertical"
                placeholder="Enter custom vertical (e.g., Cryptocurrency, Pet Care)"
                value={customVertical}
                onChange={(e) => setCustomVertical(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="keyword">SEO Keyword</Label>
          <Input
            id="keyword"
            placeholder={`Default (${preset?.keywords[0] || "General keywords"})`}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customTopic">Custom Topic/Title</Label>
          <Input
            id="customTopic"
            placeholder="Leave blank for AI to generate"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wordCount">Word Count</Label>
          <Input
            id="wordCount"
            type="number"
            placeholder={`Default (${preset?.word_count_target || 2500})`}
            value={wordCount || ""}
            onChange={(e) => setWordCount(Number.parseInt(e.target.value) || 0)}
          />
        </div>

        {error && <div className="text-sm text-red-500 mt-2">Error: {error}</div>}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate {count} {count === 1 ? "Blog" : "Blogs"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
