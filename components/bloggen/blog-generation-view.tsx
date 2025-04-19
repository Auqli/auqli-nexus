"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Copy, RefreshCw, Check } from "lucide-react"

interface BlogGenerationViewProps {
  generatedContent: string
  isGenerating: boolean
  onRegenerate: () => void
}

export function BlogGenerationView({ generatedContent, isGenerating, onRegenerate }: BlogGenerationViewProps) {
  const [isCopied, setIsCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom as content is generated
  useEffect(() => {
    if (textareaRef.current && isGenerating) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [generatedContent, isGenerating])

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Generated Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          ref={textareaRef}
          placeholder={isGenerating ? "AI is generating content..." : "Generated content will appear here"}
          value={generatedContent}
          readOnly
          className="min-h-[400px] font-mono text-sm"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onRegenerate} disabled={isGenerating}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
        <Button onClick={handleCopyToClipboard} disabled={!generatedContent || isGenerating}>
          {isCopied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
