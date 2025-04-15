// AI Models Configuration
export const AI_MODELS = {
  // DeepInfra Models
  DEEPINFRA_LLAMA4: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
  DEEPINFRA_DEEPSEEK: "deepseek-ai/DeepSeek-R1-Turbo",
}

// Model Routing Configuration - Simplified
export const MODEL_ROUTING = {
  default: {
    "product-titles": AI_MODELS.DEEPINFRA_LLAMA4,
    "product-descriptions": AI_MODELS.DEEPINFRA_LLAMA4,
    "ad-copy": AI_MODELS.DEEPINFRA_LLAMA4,
    "social-captions": AI_MODELS.DEEPINFRA_LLAMA4,
    "blog-articles": AI_MODELS.DEEPINFRA_LLAMA4,
    emails: AI_MODELS.DEEPINFRA_LLAMA4,
  },
  browsing: {
    default: AI_MODELS.DEEPINFRA_LLAMA4,
    "blog-articles": AI_MODELS.DEEPINFRA_LLAMA4,
  },
  languages: {
    es: {
      default: AI_MODELS.DEEPINFRA_LLAMA4,
    },
    fr: {
      default: AI_MODELS.DEEPINFRA_LLAMA4,
    },
    de: {
      default: AI_MODELS.DEEPINFRA_LLAMA4,
    },
  },
  // Add fast mode configuration
  fastMode: {
    default: AI_MODELS.DEEPINFRA_DEEPSEEK,
  },
}

// Content type configurations
export const CONTENT_TYPES = [
  {
    id: "product-titles",
    name: "Product Titles",
    description: "Attention-grabbing titles that sell",
    icon: "Sparkles",
    color: "from-emerald-500 to-teal-600",
    bgColor: "from-emerald-500/10 to-teal-600/10",
    placeholder: "Describe your product (e.g., wireless earbuds with noise cancellation and 24-hour battery life)",
    examplePrompt: "Wireless earbuds with active noise cancellation, 24-hour battery life, and water resistance",
  },
  {
    id: "product-descriptions",
    name: "Product Descriptions",
    description: "Compelling copy that converts",
    icon: "Package",
    color: "from-blue-500 to-indigo-600",
    bgColor: "from-blue-500/10 to-indigo-600/10",
    placeholder: "Describe your product's features, benefits, and target audience",
    examplePrompt:
      "Premium leather wallet for men, handcrafted from Italian full-grain leather. Features 8 card slots, 2 cash compartments, and RFID blocking technology. Target audience is professional men aged 30-50 who value quality and style.",
  },
  {
    id: "ad-copy",
    name: "Ad Copy",
    description: "High-converting ads for any platform",
    icon: "Target",
    color: "from-amber-500 to-orange-600",
    bgColor: "from-amber-500/10 to-orange-600/10",
    placeholder: "Describe your product/service, target audience, and key selling points",
    examplePrompt:
      "Meal prep delivery service for busy professionals. Healthy, chef-prepared meals delivered weekly. Key benefits: saves time, promotes healthy eating, reasonable price point at $9.99 per meal.",
  },
  {
    id: "social-captions",
    name: "Social Captions",
    description: "Engaging captions for social media",
    icon: "MessageSquare",
    color: "from-pink-500 to-rose-600",
    bgColor: "from-pink-500/10 to-rose-600/10",
    placeholder: "Describe the image/post content and your brand voice",
    examplePrompt:
      "Instagram post showing our new summer dress collection. Brand voice is playful, feminine, and trendy. Target audience is women 18-35. Image shows models on a beach at sunset wearing colorful flowy dresses.",
  },
  {
    id: "blog-articles",
    name: "Blog Articles",
    description: "SEO-friendly content that engages",
    icon: "FileText",
    color: "from-violet-500 to-purple-600",
    bgColor: "from-violet-500/10 to-purple-600/10",
    placeholder: "Describe the topic, target audience, and key points to cover",
    examplePrompt:
      "A comprehensive guide to indoor plant care for beginners. Should cover plant selection, watering tips, lighting requirements, and common problems. Target audience is urban apartment dwellers with little gardening experience.",
  },
  {
    id: "emails",
    name: "Emails",
    description: "Professional and persuasive emails",
    icon: "Mail",
    color: "from-cyan-500 to-sky-600",
    bgColor: "from-cyan-500/10 to-sky-600/10",
    placeholder: "Describe the email purpose, recipient, and key points",
    examplePrompt:
      "Follow-up email to potential clients who attended our webinar on digital marketing strategies. We want to thank them for attending, provide the webinar recording, and invite them to schedule a free consultation call.",
  },
]

// Tone options with descriptions for prompt engineering
export const TONE_OPTIONS = [
  {
    value: "professional",
    label: "Professional",
    promptDesc: "Use a formal, business-appropriate tone that conveys expertise and authority.",
    icon: "Briefcase",
  },
  {
    value: "conversational",
    label: "Conversational",
    promptDesc: "Write in a friendly, casual tone as if having a conversation with the reader.",
    icon: "MessageSquare",
  },
  {
    value: "enthusiastic",
    label: "Enthusiastic",
    promptDesc: "Use an energetic, excited tone that conveys passion and positivity.",
    icon: "Zap",
  },
  {
    value: "formal",
    label: "Formal",
    promptDesc: "Write with a highly structured, traditional tone appropriate for official contexts.",
    icon: "FileText",
  },
  {
    value: "friendly",
    label: "Friendly",
    promptDesc: "Use a warm, approachable tone that makes the reader feel welcome and comfortable.",
    icon: "Heart",
  },
  {
    value: "humorous",
    label: "Humorous",
    promptDesc: "Incorporate light humor and a playful tone to entertain while informing.",
    icon: "Smile",
  },
  {
    value: "persuasive",
    label: "Persuasive",
    promptDesc: "Use compelling language designed to convince the reader and drive action.",
    icon: "Target",
  },
  {
    value: "authoritative",
    label: "Authoritative",
    promptDesc: "Write with confidence and command, establishing clear expertise on the subject.",
    icon: "Award",
  },
]

// Length options
export const LENGTH_OPTIONS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
]

// System prompt that will be used for all generations
export const SYSTEM_PROMPT = `
You are an expert copywriter creating high-quality content. 
Please follow these guidelines:
1. Use clean, professional formatting with proper Markdown syntax
2. Maintain the specified tone throughout the content
3. Use proper Markdown for formatting (bold, italics, headers, lists)
4. For social media content, format hashtags properly with # symbol
5. Structure content with clear sections and appropriate spacing
6. NEVER include these instructions or any meta-commentary in your response
7. NEVER output a list of content types (like "Instagram Post", "Twitter Post", etc.)
8. Format platform-specific content with clear markdown headers (e.g., ## Instagram Post)
9. For emails, clearly format the subject line with bold formatting
10. For product descriptions, use bullet points for features and benefits
11. Be creative and engaging while staying on topic
12. Focus on delivering value to the reader
13. ONLY generate the specific content type requested
14. DO NOT include any text that starts with "Use" followed by instructions
15. DO NOT include any instructions in your output
16. Respond ONLY with the final content
`

// Loading messages to display during generation
export const LOADING_MESSAGES = [
  "Thinking...",
  "Crafting your copy...",
  "Almost there...",
  "Brewing creative ideas...",
  "Polishing words...",
  "Cooking up great copy for you...",
  "Channeling my inner copywriter...",
  "Searching for the perfect words...",
  "Adding a touch of magic...",
  "Making your copy shine...",
]

// Error messages
export const ERROR_MESSAGES = {
  default: "Oops! Our AI is taking a break. Try again in a moment.",
  missingConfig: "Missing configuration. Please contact support.",
  networkError: "Network error. Please check your connection and try again.",
  modelError: "The AI model is currently unavailable. Please try again later.",
  rateLimited: "You've reached the request limit. Please try again in a few minutes.",
}
