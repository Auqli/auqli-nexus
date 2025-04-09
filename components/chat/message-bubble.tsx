"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check, RefreshCw, Sparkles, Bot, User, Code, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MessageBubbleProps {
  content: string
  isUser: boolean
  timestamp?: string
  onRegenerate?: () => void
  onCopy?: (format: "markdown" | "text" | "html") => void
  model?: string
}

export function MessageBubble({ content, isUser, timestamp, onRegenerate, onCopy, model }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (format: "markdown" | "text" | "html") => {
    if (onCopy) {
      onCopy(format)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`flex max-w-[85%] ${
          isUser
            ? "bg-gradient-to-r from-[#16783a] to-[#225b35] text-white rounded-t-xl rounded-bl-xl"
            : "bg-[#1a2235] text-white rounded-t-xl rounded-br-xl border border-gray-800/50"
        } p-4 shadow-md`}
      >
        <div className={`flex-shrink-0 mr-3 ${isUser ? "order-last ml-3 mr-0" : ""}`}>
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-[#45c133]/20 flex items-center justify-center">
              <User className="h-4 w-4 text-[#45c133]" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#5466b5]/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-[#5466b5]" />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>

              {model && (
                <div className="mt-2 text-xs text-gray-400 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generated with {model.split("/").pop()}
                </div>
              )}
            </div>
          )}

          {timestamp && <div className="mt-2 text-xs text-gray-400">{timestamp}</div>}
        </div>
      </div>

      {!isUser && onCopy && onRegenerate && (
        <div className="flex flex-col ml-2 space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full bg-[#1a2235] border-gray-700 text-gray-400 hover:text-white hover:bg-[#1a2235]/80"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-[#1a2235] border-gray-700/50 p-2">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-white hover:bg-[#111827]/80 rounded-lg"
                        onClick={() => handleCopy("markdown")}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy with Formatting
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-white hover:bg-[#111827]/80 rounded-lg"
                        onClick={() => handleCopy("text")}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Copy as Plain Text
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-white hover:bg-[#111827]/80 rounded-lg"
                        onClick={() => handleCopy("html")}
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Copy as HTML
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Copy content</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full bg-[#1a2235] border-gray-700 text-gray-400 hover:text-white hover:bg-[#1a2235]/80"
                  onClick={onRegenerate}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Regenerate response</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </motion.div>
  )
}
