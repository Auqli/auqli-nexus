"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Copy, Info } from "lucide-react"

interface BrandPromptHelperProps {
  onSelectPrompt: (prompt: string) => void
}

export function BrandPromptHelper({ onSelectPrompt }: BrandPromptHelperProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState("")

  const brandPrompts = {
    "Coca-Cola": [
      "Person enjoying a refreshing Coca-Cola at a summer picnic with friends, bright natural lighting, authentic lifestyle photography",
      "Close-up of a Coca-Cola bottle with condensation droplets, ice cubes, red cap, classic glass bottle shape, professional product photography",
      "Family sharing Coca-Cola during a backyard barbecue, casual setting, natural lighting, authentic moment",
    ],
    Nike: [
      "Athlete wearing Nike running shoes on a morning jog through the city, dynamic pose, professional sports photography",
      "Close-up of Nike Air Max sneakers with accurate swoosh logo, detailed texture, professional product photography",
      "Person wearing Nike athletic wear during an intense workout, action shot, dramatic lighting",
    ],
    Apple: [
      "Person using the latest iPhone with accurate proportions and design, minimalist setting, lifestyle photography",
      "Apple MacBook on a clean desk workspace, minimalist design, accurate logo placement, professional product photography",
      "Person wearing Apple Watch during daily activities, clear watch face details, lifestyle photography",
    ],
  }

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setSelectedPrompt(prompt)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUsePrompt = (prompt: string) => {
    onSelectPrompt(prompt)
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
      >
        <Info className="h-4 w-4 mr-1.5" />
        Brand Prompts
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#1a2235] border-gray-700 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Brand-Specific Prompt Templates</DialogTitle>
            <DialogDescription className="text-gray-400">
              Use these templates to generate more accurate brand representations
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="Coca-Cola" className="mt-4">
            <TabsList className="bg-[#111827]/80 border border-gray-800/50">
              {Object.keys(brandPrompts).map((brand) => (
                <TabsTrigger
                  key={brand}
                  value={brand}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600"
                >
                  {brand}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(brandPrompts).map(([brand, prompts]) => (
              <TabsContent key={brand} value={brand} className="mt-4 space-y-4">
                {prompts.map((prompt, index) => (
                  <div key={index} className="bg-[#111827] p-4 rounded-md border border-gray-700 flex flex-col">
                    <p className="text-sm text-gray-300 mb-3">{prompt}</p>
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-400 border-gray-700 hover:bg-gray-800"
                        onClick={() => copyPrompt(prompt)}
                      >
                        {copied && selectedPrompt === prompt ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1.5" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => handleUsePrompt(prompt)}
                      >
                        Use This Prompt
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
