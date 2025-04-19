"use client"

import { useState, useEffect } from "react"
import { Settings, Save, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useBloggen } from "@/hooks/use-bloggen"
import { VERTICALS, AI_MODELS } from "@/lib/bloggen-constants"
import type { BloggenPreset } from "@/types/bloggen"

interface UserPresetPanelProps {
  onPresetSaved: () => void
}

export function UserPresetPanel({ onPresetSaved }: UserPresetPanelProps) {
  const { preset, updatePreset } = useBloggen()
  const [isSaving, setIsSaving] = useState(false)
  const [formState, setFormState] = useState<Partial<BloggenPreset>>({
    brand_tone: "",
    writing_style: "",
    blog_components: { intro: true, cta: true, stats: true },
    vertical_focus: [],
    keywords: [],
    word_count_target: 2500,
    preferred_model: "mistralai/Mistral-Small-24B-Instruct-2501",
    daily_schedule_enabled: false,
    scheduled_count_per_day: 1,
  })

  useEffect(() => {
    if (preset) {
      setFormState({
        brand_tone: preset.brand_tone || "",
        writing_style: preset.writing_style || "",
        blog_components: preset.blog_components || { intro: true, cta: true, stats: true },
        vertical_focus: preset.vertical_focus || [],
        keywords: preset.keywords || [],
        word_count_target: preset.word_count_target || 2500,
        preferred_model: preset.preferred_model || "mistralai/Mistral-Small-24B-Instruct-2501",
        daily_schedule_enabled: preset.daily_schedule_enabled || false,
        scheduled_count_per_day: preset.scheduled_count_per_day || 1,
      })
    }
  }, [preset])

  const handleSavePreset = async () => {
    setIsSaving(true)
    try {
      await updatePreset(formState)
      onPresetSaved()
    } finally {
      setIsSaving(false)
    }
  }

  const handleComponentToggle = (component: string, checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      blog_components: {
        ...prev.blog_components,
        [component]: checked,
      },
    }))
  }

  const handleKeywordsChange = (value: string) => {
    const keywordArray = value
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
    setFormState((prev) => ({
      ...prev,
      keywords: keywordArray,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2 text-orange-500" />
          Blog Generation Presets
        </CardTitle>
        <CardDescription>
          Configure your default settings for all blog generation. These will be used for scheduled generation and as
          defaults for manual generation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand-tone">Brand Tone</Label>
              <Input
                id="brand-tone"
                placeholder="e.g., Bold and confident, Witty and relatable"
                value={formState.brand_tone}
                onChange={(e) => setFormState((prev) => ({ ...prev, brand_tone: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Defines the voice and personality of your blog content</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="writing-style">Writing Style</Label>
              <Textarea
                id="writing-style"
                placeholder="e.g., Short paragraphs, no jargon, data-backed"
                value={formState.writing_style}
                onChange={(e) => setFormState((prev) => ({ ...prev, writing_style: e.target.value }))}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Defines the structure, syntax, and formatting of your blog content
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vertical-focus">Vertical Focus</Label>
              <Select
                value={formState.vertical_focus?.[0] || ""}
                onValueChange={(value) => setFormState((prev) => ({ ...prev, vertical_focus: [value] }))}
              >
                <SelectTrigger id="vertical-focus">
                  <SelectValue placeholder="Select primary vertical" />
                </SelectTrigger>
                <SelectContent>
                  {VERTICALS.map((vertical) => (
                    <SelectItem key={vertical.id} value={vertical.id}>
                      {vertical.emoji} {vertical.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Primary industry or topic focus for your blog content</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">SEO Keywords</Label>
              <Textarea
                id="keywords"
                placeholder="Enter keywords separated by commas"
                value={formState.keywords?.join(", ")}
                onChange={(e) => handleKeywordsChange(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Target keywords for SEO optimization, separated by commas</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="word-count">Target Word Count: {formState.word_count_target}</Label>
              <Slider
                id="word-count"
                min={500}
                max={5000}
                step={100}
                value={[formState.word_count_target || 2500]}
                onValueChange={(value) => setFormState((prev) => ({ ...prev, word_count_target: value[0] }))}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>500</span>
                <span>2500</span>
                <span>5000</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Blog Components</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="intro"
                    checked={formState.blog_components?.intro}
                    onCheckedChange={(checked) => handleComponentToggle("intro", checked as boolean)}
                  />
                  <Label htmlFor="intro" className="text-sm font-normal">
                    Introduction
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stats"
                    checked={formState.blog_components?.stats}
                    onCheckedChange={(checked) => handleComponentToggle("stats", checked as boolean)}
                  />
                  <Label htmlFor="stats" className="text-sm font-normal">
                    Statistics Section
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="audience_insight"
                    checked={formState.blog_components?.audience_insight}
                    onCheckedChange={(checked) => handleComponentToggle("audience_insight", checked as boolean)}
                  />
                  <Label htmlFor="audience_insight" className="text-sm font-normal">
                    Audience Insights
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cta"
                    checked={formState.blog_components?.cta}
                    onCheckedChange={(checked) => handleComponentToggle("cta", checked as boolean)}
                  />
                  <Label htmlFor="cta" className="text-sm font-normal">
                    Call to Action
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reference_comparison"
                    checked={formState.blog_components?.reference_comparison}
                    onCheckedChange={(checked) => handleComponentToggle("reference_comparison", checked as boolean)}
                  />
                  <Label htmlFor="reference_comparison" className="text-sm font-normal">
                    Comparisons
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred-model">Preferred AI Model</Label>
              <Select
                value={formState.preferred_model}
                onValueChange={(value) => setFormState((prev) => ({ ...prev, preferred_model: value }))}
              >
                <SelectTrigger id="preferred-model">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Default AI model to use for blog generation</p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-schedule">Daily Auto-Generation</Label>
                  <p className="text-xs text-muted-foreground">Automatically generate blogs on a daily schedule</p>
                </div>
                <Switch
                  id="daily-schedule"
                  checked={formState.daily_schedule_enabled}
                  onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, daily_schedule_enabled: checked }))}
                />
              </div>

              {formState.daily_schedule_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="scheduled-count">Blogs Per Day: {formState.scheduled_count_per_day}</Label>
                  <Slider
                    id="scheduled-count"
                    min={1}
                    max={20}
                    step={1}
                    value={[formState.scheduled_count_per_day || 1]}
                    onValueChange={(value) => setFormState((prev) => ({ ...prev, scheduled_count_per_day: value[0] }))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>10</span>
                    <span>20</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSavePreset} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preset
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
