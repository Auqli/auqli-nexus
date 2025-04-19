"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { useBloggen } from "@/hooks/use-bloggen"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
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

interface ScheduleSettingsFormProps {
  preset: BloggenPreset | null
}

export function ScheduleSettingsForm({ preset }: ScheduleSettingsFormProps) {
  const { updatePreset, isLoading } = useBloggen()
  const { toast } = useToast()

  const [formState, setFormState] = useState({
    daily_schedule_enabled: false,
    scheduled_count_per_day: 1,
    preferred_model: AI_MODELS[0].id,
    word_count_target: 2500,
    vertical_focus: [],
    keywords: [],
    brand_tone: "",
    writing_style: "",
    blog_components: {
      intro: true,
      cta: true,
      stats: true,
    },
    custom_instructions: "",
  })

  const [newVertical, setNewVertical] = useState("")
  const [newKeyword, setNewKeyword] = useState("")

  // Initialize form with preset data when available
  useEffect(() => {
    if (preset) {
      setFormState({
        daily_schedule_enabled: preset.daily_schedule_enabled,
        scheduled_count_per_day: preset.scheduled_count_per_day,
        preferred_model: preset.preferred_model,
        word_count_target: preset.word_count_target,
        vertical_focus: preset.vertical_focus || [],
        keywords: preset.keywords || [],
        brand_tone: preset.brand_tone || "",
        writing_style: preset.writing_style || "",
        blog_components: preset.blog_components || {
          intro: true,
          cta: true,
          stats: true,
        },
        custom_instructions: preset.custom_instructions || "",
      })
    }
  }, [preset])

  const handleChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleComponentToggle = (component) => {
    setFormState((prev) => ({
      ...prev,
      blog_components: {
        ...prev.blog_components,
        [component]: !prev.blog_components[component],
      },
    }))
  }

  const addVertical = () => {
    if (newVertical && !formState.vertical_focus.includes(newVertical)) {
      setFormState((prev) => ({
        ...prev,
        vertical_focus: [...prev.vertical_focus, newVertical],
      }))
      setNewVertical("")
    }
  }

  const removeVertical = (vertical) => {
    setFormState((prev) => ({
      ...prev,
      vertical_focus: prev.vertical_focus.filter((v) => v !== vertical),
    }))
  }

  const addKeyword = () => {
    if (newKeyword && !formState.keywords.includes(newKeyword)) {
      setFormState((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword],
      }))
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword) => {
    setFormState((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await updatePreset(formState)
      toast({
        title: "Settings Saved",
        description: "Your blog generation settings have been updated.",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save settings.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Settings</CardTitle>
        <CardDescription>Configure your automated blog generation settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="schedule-toggle">Auto-Generation</Label>
              <p className="text-sm text-muted-foreground">Enable scheduled blog generation</p>
            </div>
            <Switch
              id="schedule-toggle"
              checked={formState.daily_schedule_enabled}
              onCheckedChange={(checked) => handleChange("daily_schedule_enabled", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blogs-per-day">Blogs Per Day: {formState.scheduled_count_per_day}</Label>
            <Slider
              id="blogs-per-day"
              min={1}
              max={20}
              step={1}
              value={[formState.scheduled_count_per_day]}
              onValueChange={(value) => handleChange("scheduled_count_per_day", value[0])}
              disabled={!formState.daily_schedule_enabled}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>10</span>
              <span>20</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred-model">Preferred Model</Label>
            <Select value={formState.preferred_model} onValueChange={(value) => handleChange("preferred_model", value)}>
              <SelectTrigger id="preferred-model">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="word-count">Word Count Target: {formState.word_count_target}</Label>
            <Slider
              id="word-count"
              min={500}
              max={5000}
              step={100}
              value={[formState.word_count_target]}
              onValueChange={(value) => handleChange("word_count_target", value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>500</span>
              <span>2500</span>
              <span>5000</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vertical Focus</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Input
                placeholder="Add industry vertical"
                value={newVertical}
                onChange={(e) => setNewVertical(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={addVertical}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {formState.vertical_focus.map((vertical) => (
                <Badge key={vertical} variant="secondary" className="px-3 py-1">
                  {vertical}
                  <button
                    type="button"
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => removeVertical(vertical)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {formState.vertical_focus.length === 0 && (
                <p className="text-sm text-muted-foreground">No verticals selected</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Keyword Bank</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Input placeholder="Add SEO keyword" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} />
              <Button type="button" variant="outline" onClick={addKeyword}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {formState.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="px-3 py-1">
                  {keyword}
                  <button
                    type="button"
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => removeKeyword(keyword)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {formState.keywords.length === 0 && <p className="text-sm text-muted-foreground">No keywords added</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-tone">Brand Tone</Label>
            <Input
              id="brand-tone"
              placeholder="e.g., Professional, Casual, Humorous"
              value={formState.brand_tone}
              onChange={(e) => handleChange("brand_tone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="writing-style">Writing Style</Label>
            <Input
              id="writing-style"
              placeholder="e.g., Conversational, Technical, Story-based"
              value={formState.writing_style}
              onChange={(e) => handleChange("writing_style", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Blog Components</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="intro-toggle"
                  checked={formState.blog_components.intro}
                  onCheckedChange={() => handleComponentToggle("intro")}
                />
                <Label htmlFor="intro-toggle">Introduction</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="stats-toggle"
                  checked={formState.blog_components.stats}
                  onCheckedChange={() => handleComponentToggle("stats")}
                />
                <Label htmlFor="stats-toggle">Statistics</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="cta-toggle"
                  checked={formState.blog_components.cta}
                  onCheckedChange={() => handleComponentToggle("cta")}
                />
                <Label htmlFor="cta-toggle">Call to Action</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-instructions">Custom Instructions</Label>
            <Textarea
              id="custom-instructions"
              placeholder="Additional instructions for the AI"
              value={formState.custom_instructions}
              onChange={(e) => handleChange("custom_instructions", e.target.value)}
              rows={4}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preset
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
