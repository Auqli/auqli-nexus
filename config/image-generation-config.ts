// Icons for use cases
const useCaseIcons = {
  socialMedia: "📱",
  productPhoto: "📸",
  advertisement: "🎯",
  banner: "🖼️",
  ugc: "👤",
  ecommerce: "🛒",
  email: "📧",
  website: "🌐",
  creative: "🎨",
  holiday: "🎁",
  meme: "😂",
  story: "📖",
  carousel: "🔄",
}

// Configuration for image generation
export const ImageGenerationConfig = {
  // Model configuration
  models: {
    speed: {
      id: "stabilityai/sdxl-turbo",
      name: "SDXL Turbo",
      description: "Fast generation with good quality",
      maxPromptLength: 1000,
      strengths: ["Speed", "Iteration", "Drafts"],
      weaknesses: ["Fine details", "Complex scenes"],
      inferenceSteps: {
        min: 1,
        max: 10,
        default: 5,
      },
      // Model-specific prompt enhancements
      promptEnhancement: "Ensure clear composition and balanced colors.",
      negativePrompt:
        "blurry, low quality, distorted, deformed, disfigured, bad anatomy, watermark, signature, text, low resolution, ugly, pixelated",
    },
    quality: {
      id: "run-diffusion/Juggernaut-Lightning-Flux",
      name: "Juggernaut Lightning Flux",
      description: "Premium high-quality detailed images with enhanced scene understanding",
      maxPromptLength: 1500,
      strengths: ["Detail", "Realism", "Composition", "Complex Scenes"],
      weaknesses: ["Generation time", "Resource intensive"],
      inferenceSteps: {
        min: 30,
        max: 60,
        default: 40,
      },
      // Enhanced prompt engineering for complex scenes
      promptEnhancement:
        "Professional photography, high resolution, detailed textures, masterful composition, studio lighting, 8k, ultra detailed, photorealistic, hyperrealistic details, perfect lighting, realistic reflections, accurate perspective, precise proportions.",
      negativePrompt:
        "blurry, low quality, distorted, deformed, disfigured, bad anatomy, watermark, signature, text artifacts, illegible text, misspelled text, wrong text, low resolution, ugly, pixelated, oversaturated, cartoon, drawing, painting, crayon, sketch, graphite, impressionist, noisy, grainy, unrealistic reflections, incorrect perspective, disproportionate, unnatural lighting",
    },
  },

  // Context-aware prompt templates for common scenarios
  contextTemplates: {
    "person wearing": {
      template:
        "Authentic lifestyle photo of a person wearing {item}. Urban setting with blurred city background. Natural daylight, soft shadows. Person is standing slightly angled toward camera with a natural smile. The {item} is well-lit with visible texture and details. Subject is holding a coffee cup and has casual, relatable pose. Background includes urban elements with soft bokeh effect. Overall mood is energetic yet approachable, authentic UGC style.",
      requiredFields: ["item"],
      optionalFields: ["gender", "setting", "mood"],
      substitutions: {
        gender: {
          male: "young man",
          female: "young woman",
          default: "person",
        },
        setting: {
          urban: "city street with brick buildings",
          nature: "natural outdoor setting with trees",
          cafe: "cozy cafe with warm lighting",
          default: "urban environment",
        },
        mood: {
          casual: "relaxed and casual",
          professional: "confident and professional",
          playful: "playful and energetic",
          default: "natural and authentic",
        },
      },
    },
    "product on display": {
      template:
        "Professional product photography of {item} on a clean, minimal background. Studio lighting highlighting product details and texture. The {item} is the focal point with perfect clarity and sharpness. Soft shadows add depth. Product features are clearly visible. Commercial quality photography suitable for e-commerce.",
      requiredFields: ["item"],
      optionalFields: ["background", "angle", "lighting"],
      substitutions: {
        background: {
          white: "pure white seamless background",
          gradient: "subtle gradient background",
          contextual: "lifestyle context background, slightly blurred",
          default: "clean, minimal background",
        },
        angle: {
          front: "direct front view",
          "three-quarter": "three-quarter angle view",
          side: "profile view from the side",
          default: "optimal viewing angle",
        },
        lighting: {
          soft: "soft, diffused lighting",
          dramatic: "dramatic lighting with stronger shadows",
          bright: "bright, even lighting",
          default: "professional studio lighting",
        },
      },
    },
    "food item": {
      template:
        "Appetizing food photography of {item}. Professional styling with perfect composition. Rich colors and textures. Shallow depth of field focusing on the food. Natural ingredients visible. Steam or moisture details where appropriate. Styled with complementary props and garnishes. Soft, directional lighting enhancing the food's appeal.",
      requiredFields: ["item"],
      optionalFields: ["style", "setting", "angle"],
      substitutions: {
        style: {
          rustic: "rustic, homemade style",
          gourmet: "high-end gourmet presentation",
          casual: "casual, everyday presentation",
          default: "appealing food styling",
        },
        setting: {
          restaurant: "elegant restaurant setting",
          home: "cozy home kitchen setting",
          outdoor: "bright outdoor dining setting",
          default: "beautiful dining setting",
        },
        angle: {
          overhead: "overhead flat-lay perspective",
          "eye-level": "eye-level perspective",
          "close-up": "close-up detail shot",
          default: "appetizing angle",
        },
      },
    },
    "interior space": {
      template:
        "Professional interior photography of a {item}. Balanced composition showing the space's features and design elements. Natural light complemented by interior lighting. Perfect perspective with architectural details preserved. Inviting atmosphere with attention to textures and materials. Styled with appropriate decor elements.",
      requiredFields: ["item"],
      optionalFields: ["style", "lighting", "mood"],
      substitutions: {
        style: {
          modern: "modern, minimalist design",
          traditional: "traditional, classic design",
          industrial: "industrial style with raw elements",
          default: "contemporary design",
        },
        lighting: {
          bright: "bright, airy lighting",
          cozy: "warm, cozy lighting",
          dramatic: "dramatic, moody lighting",
          default: "balanced natural lighting",
        },
        mood: {
          luxurious: "luxurious and sophisticated",
          comfortable: "comfortable and inviting",
          productive: "productive and functional",
          default: "welcoming and balanced",
        },
      },
    },
  },

  // Enhanced prompt templates for better results
  promptEnhancers: {
    general: "Professional photography, high resolution, detailed textures, masterful composition.",
    product:
      "Product photography, studio lighting, commercial quality, professional marketing image, detailed textures, perfect focus.",
    lifestyle:
      "Lifestyle photography, natural lighting, authentic setting, high-end magazine quality, professional camera.",
    social: "Social media ready, eye-catching, vibrant, trendy, professional quality, perfect for Instagram.",
    advertisement:
      "Advertising photography, attention-grabbing, professional marketing, commercial quality, perfect lighting.",
  },

  // Brand-specific prompt enhancements
  brandPromptEnhancements: {
    "coca-cola":
      "Coca-Cola bottle with accurate red label, white script logo, classic glass bottle shape, correct proportions",
    pepsi: "Pepsi can or bottle with accurate blue, red and white logo, correct proportions and colors",
    nike: "Nike products with accurate swoosh logo, proper proportions and placement",
    apple: "Apple products with minimalist design, accurate logo placement, proper proportions",
    starbucks: "Starbucks cup with accurate green logo, proper cup shape and proportions",
  },

  // Anatomy-specific negative prompts
  anatomyNegativePrompts: {
    hands:
      "distorted hands, extra fingers, missing fingers, fused fingers, too many fingers, mutated hands, deformed hands",
    faces: "deformed face, distorted face, disfigured face, poorly drawn face, extra faces, weird face, multiple faces",
    eyes: "crossed eyes, deformed eyes, poorly drawn eyes, extra eyes, mutated eyes, misaligned eyes",
    body: "deformed body, distorted body, disfigured body, poorly drawn body, extra limbs, missing limbs",
  },

  // Text handling improvements
  textPromptEnhancements: {
    brandLogos: "clear, legible brand logo, accurate text, proper font, correct spelling",
    signage: "clear readable text on signs, proper font, correct spelling, appropriate text size",
    labels: "clear product labels, legible text, accurate information, proper alignment",
  },

  complexSceneEnhancements: {
    reflections:
      "realistic reflections on glass and shiny surfaces, accurate mirror images, proper transparency effects",
    handwriting:
      "natural handwriting on whiteboard, slightly messy authentic handwritten text, realistic marker strokes",
    specificLocations: "accurate architectural landmarks, recognizable skylines, realistic environmental details",
    logos: "accurate brand logos with correct proportions and details, properly rendered text in logos",
    interiors: "realistic interior lighting, proper perspective in room settings, accurate spatial relationships",
    people: "natural poses, realistic clothing with accurate logos and details, proper proportions and perspective",
  },

  // Photography style enhancements
  photographyStyles: {
    commercial: "professional commercial photography, studio lighting, high-end advertising quality, magazine quality",
    lifestyle: "authentic lifestyle photography, natural lighting, candid moment, editorial quality",
    product: "professional product photography, studio lighting, clean background, commercial quality",
    fashion: "high-end fashion photography, editorial quality, professional model pose, magazine quality",
    food: "professional food photography, appetizing presentation, perfect lighting, commercial quality",
  },

  // Smart defaults for common product categories
  productDefaults: {
    clothing: {
      pose: "person wearing the item naturally, showing fit and style",
      lighting: "soft, flattering lighting to show fabric texture",
      background: "lifestyle context or clean studio background",
      details: "focus on stitching, material texture, and design elements",
    },
    electronics: {
      pose: "product displayed at optimal angle showing key features",
      lighting: "clean lighting to highlight sleek surfaces without glare",
      background: "minimal, modern setting or contextual use environment",
      details: "focus on screen clarity, buttons, ports, and design elements",
    },
    furniture: {
      pose: "arranged in a realistic room setting showing scale and function",
      lighting: "natural lighting with soft shadows to show form",
      background: "complementary interior setting with coordinated decor",
      details: "focus on materials, craftsmanship, and design features",
    },
    beauty: {
      pose: "product displayed elegantly, possibly with application demonstration",
      lighting: "soft, flattering lighting that enhances product appearance",
      background: "clean, minimal background or luxury bathroom/vanity setting",
      details: "focus on packaging, texture, and color accuracy",
    },
    food: {
      pose: "appetizing arrangement showing texture and freshness",
      lighting: "warm, inviting lighting that enhances colors",
      background: "complementary tableware and setting",
      details: "focus on texture, steam, moisture, and garnishes",
    },
  },

  // Use cases with improved prompt templates
  useCases: [
    // Ads & Promotions
    {
      id: "facebook-ad",
      name: "Facebook/Instagram Ad",
      icon: useCaseIcons.advertisement,
      category: "Ads & Promotions",
      description: "Advertising creatives optimized for Facebook and Instagram",
      promptTemplate: "Create a professional Facebook/Instagram advertisement showing",
      promptEnhancer: "advertisement",
      aspectRatio: "square",
      defaultPromptExtension:
        "with eye-catching composition, vibrant colors, and clear product focus. Include natural lifestyle context that appeals to target audience. Add subtle branding elements and ensure the image has stopping power in a social feed.",
    },
    {
      id: "tiktok-ad",
      name: "TikTok Ad",
      icon: useCaseIcons.advertisement,
      category: "Ads & Promotions",
      description: "Vertical format ads for TikTok",
      promptTemplate: "Create a professional TikTok advertisement showing",
      promptEnhancer: "advertisement",
      aspectRatio: "story",
      defaultPromptExtension:
        "with dynamic composition that captures attention quickly. Include trendy elements, youthful energy, and clear product visibility. Design for vertical viewing with main subject centered and room for text overlays at top and bottom.",
    },
    {
      id: "google-display",
      name: "Google Display Ad",
      icon: useCaseIcons.advertisement,
      category: "Ads & Promotions",
      description: "Banner ads for Google Display Network",
      promptTemplate: "Create a professional Google display advertisement showing",
      promptEnhancer: "advertisement",
      aspectRatio: "landscape",
      defaultPromptExtension:
        "with clean layout and strong visual hierarchy. Ensure product is prominently featured with space for headline and call-to-action. Use contrasting colors for visibility across different websites.",
    },
    {
      id: "youtube-thumbnail",
      name: "YouTube Thumbnail",
      icon: useCaseIcons.advertisement,
      category: "Ads & Promotions",
      description: "Eye-catching thumbnails for YouTube videos",
      promptTemplate: "Create an eye-catching YouTube thumbnail showing",
      promptEnhancer: "advertisement",
      aspectRatio: "landscape",
      defaultPromptExtension:
        "with high contrast, emotional appeal, and clear subject focus. Design for visibility at small sizes with bold visual elements. Include space for text overlay and ensure the image creates curiosity.",
    },

    // Social (UGC-Style)
    {
      id: "lifestyle-ugc",
      name: "Lifestyle UGC",
      icon: useCaseIcons.ugc,
      category: "Social (UGC-Style)",
      description: "Authentic lifestyle content with products",
      promptTemplate: "Create an authentic lifestyle photo showing",
      promptEnhancer: "lifestyle",
      aspectRatio: "portrait",
      defaultPromptExtension:
        "in a natural, candid moment. The person should appear relaxed and genuine, not posed. Include realistic environment details, natural lighting, and subtle imperfections for authenticity. The product should be integrated naturally into the scene as if captured spontaneously by a friend.",
    },
    {
      id: "testimonial-mockup",
      name: "Testimonial Mockup",
      icon: useCaseIcons.ugc,
      category: "Social (UGC-Style)",
      description: "Visual testimonials with product",
      promptTemplate: "Create a testimonial-style image showing",
      promptEnhancer: "lifestyle",
      aspectRatio: "square",
      defaultPromptExtension:
        "with a person genuinely engaging with the product. Capture a moment of authentic satisfaction or surprise. Include natural facial expression and body language that conveys positive experience. Setting should be realistic home or everyday environment with natural lighting.",
    },
    {
      id: "influencer-style",
      name: "Influencer Style",
      icon: useCaseIcons.ugc,
      category: "Social (UGC-Style)",
      description: "Content that mimics influencer aesthetics",
      promptTemplate: "Create a professional influencer-style photo showing",
      promptEnhancer: "lifestyle",
      aspectRatio: "portrait",
      defaultPromptExtension:
        "with polished yet authentic feel. Subject should have confident, approachable expression and trendy styling. Include fashionable environment with curated details. Lighting should be flattering with subtle filtering effect. Product should be featured prominently but integrated naturally into the lifestyle context.",
    },
    {
      id: "casual-product",
      name: "Casual Product Shot",
      icon: useCaseIcons.ugc,
      category: "Social (UGC-Style)",
      description: "Casual, non-professional product photos",
      promptTemplate: "Create a casual, authentic product photo of",
      promptEnhancer: "lifestyle",
      aspectRatio: "square",
      defaultPromptExtension:
        "as if taken by a regular customer. Include natural environment with everyday objects around. Lighting should be natural, not studio perfect. Product should be the focus but presented in a realistic way with natural shadows and reflections. Add subtle environmental context that suggests real-world use.",
    },

    // Product Catalog
    {
      id: "studio-product",
      name: "Studio Product",
      icon: useCaseIcons.productPhoto,
      category: "Product Catalog",
      description: "Professional studio product photography",
      promptTemplate: "Professional studio product photography of",
      promptEnhancer: "product",
      aspectRatio: "square",
      defaultPromptExtension:
        "with perfect lighting highlighting product details and features. Use soft shadows for dimension and depth. Ensure all product details are clearly visible with sharp focus throughout. Background should be clean and neutral to make the product stand out. Include subtle reflections on shiny surfaces.",
    },
    {
      id: "white-bg-packshot",
      name: "White BG Packshot",
      icon: useCaseIcons.productPhoto,
      category: "Product Catalog",
      description: "Clean product images on white background",
      promptTemplate: "Product packshot on pure white background of",
      promptEnhancer: "product",
      aspectRatio: "square",
      defaultPromptExtension:
        "with perfect isolation and no shadows. Lighting should be even and clean to show accurate product colors and details. All product features should be clearly visible with optimal angle to showcase the item. Perfect for e-commerce and catalog use with professional, commercial quality.",
    },
    {
      id: "styled-catalog",
      name: "Styled Catalog",
      icon: useCaseIcons.productPhoto,
      category: "Product Catalog",
      description: "Styled product shots for catalogs",
      promptTemplate: "Styled catalog photography of",
      promptEnhancer: "product",
      aspectRatio: "square",
      defaultPromptExtension:
        "with complementary props and styling elements that enhance the product appeal. Background should be simple but contextual to the product category. Lighting should be professional with perfect exposure and color accuracy. Composition should be balanced with the product as clear hero.",
    },
    {
      id: "seasonal-catalog",
      name: "Seasonal Catalog",
      icon: useCaseIcons.holiday,
      category: "Product Catalog",
      description: "Seasonal themed product photography",
      promptTemplate: "Seasonal catalog photography of",
      promptEnhancer: "product",
      aspectRatio: "square",
      defaultPromptExtension:
        "with seasonal elements and thematic styling. Include appropriate seasonal colors, props, and atmosphere. Lighting should evoke the season's mood while maintaining product clarity. Background should complement the seasonal theme while keeping product as the focus.",
    },

    // Website / Landing Page
    {
      id: "hero-banner",
      name: "Hero Banner",
      icon: useCaseIcons.website,
      category: "Website / Landing Page",
      description: "Large header images for websites",
      promptTemplate: "Create a professional website hero banner showing",
      promptEnhancer: "advertisement",
      aspectRatio: "landscape",
      defaultPromptExtension:
        "with striking visual impact and clear focal point. Composition should allow for text overlay with negative space in strategic areas. Colors should align with brand identity. Include subtle depth and dimension with background elements slightly blurred to create layering effect.",
    },
    {
      id: "website-background",
      name: "Website Background",
      icon: useCaseIcons.website,
      category: "Website / Landing Page",
      description: "Background images for websites",
      promptTemplate: "Create a professional website background showing",
      promptEnhancer: "general",
      aspectRatio: "landscape",
      defaultPromptExtension:
        "with subtle patterns or textures that won't distract from foreground content. Colors should be muted or desaturated to allow text readability. Design should have consistent tone throughout with no strong focal points that would compete with UI elements.",
    },
    {
      id: "lifestyle-visual",
      name: "Lifestyle Visual",
      icon: useCaseIcons.website,
      category: "Website / Landing Page",
      description: "Lifestyle images for websites",
      promptTemplate: "Create a professional lifestyle visual for website showing",
      promptEnhancer: "lifestyle",
      aspectRatio: "landscape",
      defaultPromptExtension:
        "with authentic, aspirational quality. Include people interacting naturally with product or environment. Lighting should be bright and uplifting with warm tones. Composition should feel editorial and premium while maintaining authenticity. Include environmental details that tell a story about the brand and lifestyle.",
    },
    {
      id: "trust-icons",
      name: "Trust Icons",
      icon: useCaseIcons.website,
      category: "Website / Landing Page",
      description: "Icons that build trust on websites",
      promptTemplate: "Create professional trust-building icons or visuals for",
      promptEnhancer: "general",
      aspectRatio: "square",
      defaultPromptExtension:
        "with clean, simple design that conveys reliability and security. Use professional blue tones or neutral colors that suggest trustworthiness. Design should be minimal and modern with clear symbolism related to security, guarantee, or quality assurance.",
    },

    // Email Marketing
    {
      id: "email-header",
      name: "Email Header",
      icon: useCaseIcons.email,
      category: "Email Marketing",
      description: "Header images for marketing emails",
      promptTemplate: "Create a professional email header image showing",
      promptEnhancer: "advertisement",
      aspectRatio: "landscape",
      defaultPromptExtension:
        "with compact, impactful design optimized for email viewing. Include clear branding elements and visual hierarchy. Colors should be vibrant but web-safe. Composition should be simple with strong focal point and room for header text overlay.",
    },
    {
      id: "product-highlight",
      name: "Product Highlight",
      icon: useCaseIcons.email,
      category: "Email Marketing",
      description: "Product highlight images for emails",
      promptTemplate: "Create a professional product highlight image for email showing",
      promptEnhancer: "product",
      aspectRatio: "square",
      defaultPromptExtension:
        "with clean, simple presentation that works at small sizes. Product should be clearly visible with key features highlighted. Background should be simple and non-distracting. Lighting should create dimension while maintaining clarity in compressed email format.",
    },
    {
      id: "cta-banner",
      name: "CTA Banner",
      icon: useCaseIcons.email,
      category: "Email Marketing",
      description: "Call-to-action banners for emails",
      promptTemplate: "Create a professional call-to-action banner for email showing",
      promptEnhancer: "advertisement",
      aspectRatio: "landscape",
      defaultPromptExtension:
        "with high contrast design that drives action. Include directional cues that lead eye to action area. Colors should create urgency and excitement. Design should be simple but compelling with clear space for CTA button or text.",
    },

    // Special Campaigns
    {
      id: "holiday-campaign",
      name: "Holiday Campaign",
      icon: useCaseIcons.holiday,
      category: "Special Campaigns",
      description: "Holiday-themed campaign visuals",
      promptTemplate: "Create a professional holiday-themed campaign visual showing",
      promptEnhancer: "advertisement",
      aspectRatio: "square",
      defaultPromptExtension:
        "with festive elements and seasonal atmosphere. Include appropriate holiday symbols, colors, and decorations without overwhelming the product. Lighting should be warm and inviting with holiday-appropriate mood. Product should remain the hero while being enhanced by the holiday context.",
    },
    {
      id: "flash-sale",
      name: "Flash Sale",
      icon: useCaseIcons.advertisement,
      category: "Special Campaigns",
      description: "Urgent flash sale visuals",
      promptTemplate: "Create a professional flash sale promotional image showing",
      promptEnhancer: "advertisement",
      aspectRatio: "square",
      defaultPromptExtension:
        "with high energy design that creates urgency. Use dynamic elements and bold colors that suggest limited time. Include visual cues of speed or time passing. Product should be clearly visible with dramatic lighting that creates excitement and immediate interest.",
    },
    {
      id: "limited-edition",
      name: "Limited Edition",
      icon: useCaseIcons.creative,
      category: "Special Campaigns",
      description: "Limited edition product visuals",
      promptTemplate: "Create a professional limited edition promotional image for",
      promptEnhancer: "product",
      aspectRatio: "square",
      defaultPromptExtension:
        "with premium, exclusive presentation. Include elements that suggest rarity and special status. Background should be sophisticated with luxury cues. Lighting should create dramatic highlights that emphasize unique product features. Overall mood should convey exclusivity and desirability.",
    },

    // Remix & Variations
    {
      id: "style-remix",
      name: "Style Remix",
      icon: useCaseIcons.creative,
      category: "Remix & Variations",
      description: "Change the style of existing images",
      promptTemplate: "Remix this image in the style of",
      promptEnhancer: "general",
      aspectRatio: "square",
      defaultPromptExtension:
        "while maintaining the core subject and composition. Apply the new style consistently across all elements. Preserve the original image's key features and focal points while transforming the visual language to match the requested style.",
    },
    {
      id: "color-change",
      name: "Color Change",
      icon: useCaseIcons.creative,
      category: "Remix & Variations",
      description: "Change colors in existing images",
      promptTemplate: "Change the colors in this image to",
      promptEnhancer: "general",
      aspectRatio: "square",
      defaultPromptExtension:
        "while maintaining natural lighting and material properties. Ensure the new colors look realistic and integrated with the scene. Preserve highlights, shadows, and reflections appropriate to the new color scheme. Maintain color harmony throughout the image.",
    },
    {
      id: "angle-change",
      name: "Angle Change",
      icon: useCaseIcons.creative,
      category: "Remix & Variations",
      description: "Change viewing angle of products",
      promptTemplate: "Show this product from a different angle:",
      promptEnhancer: "product",
      aspectRatio: "square",
      defaultPromptExtension:
        "while maintaining consistent lighting, scale, and product details. Ensure all key product features remain visible from the new perspective. Keep the same environment and context but adjust the viewpoint naturally. Preserve material properties and reflections appropriate to the new angle.",
    },

    // Other
    {
      id: "meme-format",
      name: "Meme Format",
      icon: useCaseIcons.meme,
      category: "Other",
      description: "Create meme-style images",
      promptTemplate: "Create a meme-style image about",
      promptEnhancer: "social",
      aspectRatio: "square",
      defaultPromptExtension:
        "with humorous, shareable quality. Design should be simple and direct with clear visual punchline. Include space for typical meme text placement at top and bottom. Image should work well when compressed and shared on social platforms.",
    },
    {
      id: "story-format",
      name: "Story Format",
      icon: useCaseIcons.story,
      category: "Other",
      description: "Vertical format for stories",
      promptTemplate: "Create a professional vertical story format image showing",
      promptEnhancer: "social",
      aspectRatio: "story",
      defaultPromptExtension:
        "optimized for Instagram/Facebook Stories. Design with vertical flow and composition that works in 9:16 format. Include space at top and bottom for text or interactive elements. Create visual interest throughout the vertical frame with clear focal hierarchy.",
    },
    {
      id: "carousel-image",
      name: "Carousel Image",
      icon: useCaseIcons.carousel,
      category: "Other",
      description: "Images for carousel posts",
      promptTemplate: "Create a professional carousel post image showing",
      promptEnhancer: "social",
      aspectRatio: "square",
      defaultPromptExtension:
        "designed to encourage swiping to next image. Include visual cues that suggest continuation or narrative. Composition should work both as standalone and as part of sequence. Create visual consistency that would work across multiple connected images.",
    },
  ],

  // Tone options with improved prompt additions
  toneOptions: [
    {
      value: "friendly",
      label: "Friendly",
      promptAddition: "in a friendly, approachable style with warm colors and inviting composition",
    },
    {
      value: "professional",
      label: "Professional",
      promptAddition:
        "in a professional, business-like style with clean lines, neutral colors, and polished appearance",
    },
    {
      value: "bold",
      label: "Bold",
      promptAddition: "in a bold, striking style with high contrast, vibrant colors, and dynamic composition",
    },
    {
      value: "playful",
      label: "Playful",
      promptAddition: "in a playful, fun style with bright colors, whimsical elements, and energetic composition",
    },
    {
      value: "elegant",
      label: "Elegant",
      promptAddition:
        "in an elegant, sophisticated style with refined aesthetics, subtle colors, and graceful composition",
    },
    {
      value: "minimalist",
      label: "Minimalist",
      promptAddition:
        "in a clean, minimalist style with ample negative space, simple color palette, and essential elements only",
    },
    {
      value: "luxury",
      label: "Luxury",
      promptAddition: "in a luxurious, high-end style with premium aesthetics, rich colors, and exclusive appearance",
    },
    {
      value: "trendy",
      label: "Trendy",
      promptAddition: "in a trendy, contemporary style following current design trends and modern aesthetics",
    },
    {
      value: "experimental",
      label: "Experimental",
      promptAddition: "in an experimental, avant-garde style with unconventional composition and creative techniques",
    },
  ],

  // Creativity levels with better descriptions and prompt additions
  creativityLevels: [
    {
      value: 0,
      label: "Conservative",
      description: "Realistic and conventional style",
      promptAddition:
        "Keep the style conservative, realistic, and true to life with accurate proportions and natural lighting.",
    },
    {
      value: 30,
      label: "Balanced",
      description: "Slightly creative while maintaining realism",
      promptAddition:
        "Use a balanced approach to creativity with mostly realistic elements but slightly enhanced colors and composition.",
    },
    {
      value: 50,
      label: "Creative",
      description: "More artistic elements and style",
      promptAddition:
        "Add creative elements and artistic style while maintaining recognizable subjects and reasonable composition.",
    },
    {
      value: 70,
      label: "Artistic",
      description: "Highly creative and artistic style",
      promptAddition:
        "Make it highly creative and artistic with unique style elements, enhanced colors, and distinctive visual approach.",
    },
    {
      value: 100,
      label: "Experimental",
      description: "Pushing boundaries with experimental style",
      promptAddition:
        "Use experimental and boundary-pushing artistic style with unconventional techniques, bold creative choices, and innovative visual language.",
    },
  ],

  // Image sizes with aspect ratio information
  imageSizes: [
    { id: "square", name: "Square (1:1)", width: 1024, height: 1024, description: "Perfect for Instagram posts" },
    {
      id: "portrait",
      name: "Portrait (4:5)",
      width: 1024,
      height: 1280,
      description: "Ideal for Instagram and Pinterest",
    },
    {
      id: "landscape",
      name: "Landscape (16:9)",
      width: 1280,
      height: 720,
      description: "Great for Facebook and Twitter",
    },
    { id: "story", name: "Story (9:16)", width: 1080, height: 1920, description: "For Instagram and Facebook stories" },
  ],

  // Loading messages
  loadingMessages: [
    "Painting your masterpiece...",
    "Just a moment, your creative is loading...",
    "Bringing your vision to life...",
    "Crafting pixels with AI magic...",
    "Generating your perfect image...",
    "Creating something amazing for you...",
    "Blending art and technology...",
    "Transforming your words into visuals...",
    "Almost there! Adding final touches...",
    "Brewing up something special...",
  ],

  // Example prompts for better results
  examplePrompts: [
    "Professional product photo of a skincare serum bottle with clean white background, minimalist style, high-end luxury feel",
    "Lifestyle photo of a person using a wireless headphone while working at a modern desk with natural lighting",
    "Facebook ad for a fitness app showing a person exercising in a bright, modern home gym setting",
    "Website hero banner for an eco-friendly clothing brand showing sustainable fabrics in natural settings",
    "Email header for a summer sale promotion with beach-themed products and bright, sunny atmosphere",
  ],

  // Add this function to the ImageGenerationConfig object

  /**
   * Expands a minimal prompt with additional details based on use case and product category
   */
  expandMinimalPrompt: (prompt: string, useCase: string, productCategory = ""): string => {
    // Start with the original prompt
    let expandedPrompt = prompt.trim()

    // If prompt is too short, add basic structure
    if (expandedPrompt.split(/\s+/).length < 5) {
      // Try to identify the subject
      const promptLower = expandedPrompt.toLowerCase()

      // Check for common subjects
      if (
        promptLower.includes("person") ||
        promptLower.includes("model") ||
        promptLower.includes("man") ||
        promptLower.includes("woman")
      ) {
        expandedPrompt += ", natural pose, authentic expression, well-lit"
      } else if (promptLower.includes("product") || promptLower.includes("item")) {
        expandedPrompt += ", professional product photography, studio lighting, detailed texture visible"
      }
    }

    // Add product category specific details
    if (productCategory && productCategory !== "none") {
      const categoryDetails = {
        clothing:
          "with visible fabric texture, stitching details, and proper fit. Natural lighting to show true colors.",
        electronics: "with clean design, visible features, and proper scale. Studio lighting to highlight details.",
        beauty:
          "with clear packaging, visible texture, and proper color representation. Soft lighting for appealing look.",
        furniture: "showing material quality, craftsmanship, and in a styled setting. Warm lighting for inviting feel.",
        food: "with appetizing presentation, vibrant colors, and proper styling. Professional food photography lighting.",
      }

      if (categoryDetails[productCategory as keyof typeof categoryDetails]) {
        expandedPrompt += `. ${categoryDetails[productCategory as keyof typeof categoryDetails]}`
      }
    }

    // Add use case specific enhancements
    const useCaseConfig = ImageGenerationConfig.useCases.find((uc) => uc.id === useCase)
    if (useCaseConfig) {
      // Extract the template without the "Create a" part
      const template = useCaseConfig.promptTemplate.replace(/^Create an? /i, "").replace(/showing/i, "with")

      // Only add if not already in the prompt
      if (!expandedPrompt.toLowerCase().includes(template.toLowerCase())) {
        expandedPrompt += `. ${template}`
      }
    }

    // Add photography style enhancements if not already detailed
    if (expandedPrompt.split(/\s+/).length < 20) {
      expandedPrompt += ". Professional photography, high resolution, detailed textures, masterful composition."
    }

    return expandedPrompt
  },
}

export function enhanceComplexScenePrompt(prompt: string): string {
  const config = ImageGenerationConfig
  let enhancedPrompt = prompt

  // Check for specific elements in the prompt
  if (
    prompt.toLowerCase().includes("reflection") ||
    prompt.toLowerCase().includes("glass") ||
    prompt.toLowerCase().includes("mirror")
  ) {
    enhancedPrompt += `. ${config.complexSceneEnhancements.reflections}.`
  }

  if (
    prompt.toLowerCase().includes("handwriting") ||
    prompt.toLowerCase().includes("whiteboard") ||
    prompt.toLowerCase().includes("writing")
  ) {
    enhancedPrompt += `. ${config.complexSceneEnhancements.handwriting}.`
  }

  if (
    prompt.toLowerCase().includes("bridge") ||
    prompt.toLowerCase().includes("skyline") ||
    prompt.toLowerCase().includes("landmark")
  ) {
    enhancedPrompt += `. ${config.complexSceneEnhancements.specificLocations}.`
  }

  if (prompt.toLowerCase().includes("logo") || prompt.toLowerCase().includes("brand")) {
    enhancedPrompt += `. ${config.complexSceneEnhancements.logos}.`
  }

  if (
    prompt.toLowerCase().includes("room") ||
    prompt.toLowerCase().includes("interior") ||
    prompt.toLowerCase().includes("office")
  ) {
    enhancedPrompt += `. ${config.complexSceneEnhancements.interiors}.`
  }

  if (
    prompt.toLowerCase().includes("person") ||
    prompt.toLowerCase().includes("people") ||
    prompt.toLowerCase().includes("woman") ||
    prompt.toLowerCase().includes("man")
  ) {
    enhancedPrompt += `. ${config.complexSceneEnhancements.people}.`
  }

  return enhancedPrompt
}

// New function to expand minimal prompts into detailed ones
export function expandMinimalPrompt(prompt: string, useCase: string, productCategory?: string): string {
  const config = ImageGenerationConfig

  // First, identify what type of content the user is requesting
  let contentType = "general"
  let mainSubject = prompt

  // Extract the main subject and identify content type
  if (prompt.toLowerCase().includes("person wearing") || prompt.toLowerCase().includes("wearing")) {
    contentType = "person wearing"
    // Extract what they're wearing
    const match = prompt.match(/(?:person wearing|wearing) (.*?)(?:\.|,|$)/i)
    if (match && match[1]) {
      mainSubject = match[1].trim()
    }
  } else if (prompt.toLowerCase().includes("product") || productCategory) {
    contentType = "product on display"
    // Extract the product
    const match = prompt.match(/(?:product|photo of) (.*?)(?:\.|,|$)/i)
    if (match && match[1]) {
      mainSubject = match[1].trim()
    }
  } else if (
    prompt.toLowerCase().includes("food") ||
    prompt.toLowerCase().includes("dish") ||
    prompt.toLowerCase().includes("meal")
  ) {
    contentType = "food item"
    // Extract the food item
    const match = prompt.match(/(?:food|dish|meal|photo of) (.*?)(?:\.|,|$)/i)
    if (match && match[1]) {
      mainSubject = match[1].trim()
    }
  } else if (
    prompt.toLowerCase().includes("room") ||
    prompt.toLowerCase().includes("interior") ||
    prompt.toLowerCase().includes("space")
  ) {
    contentType = "interior space"
    // Extract the space type
    const match = prompt.match(/(?:room|interior|space|photo of) (.*?)(?:\.|,|$)/i)
    if (match && match[1]) {
      mainSubject = match[1].trim()
    }
  }

  // If we have a matching template, use it
  if (config.contextTemplates[contentType]) {
    const template = config.contextTemplates[contentType]
    let expandedPrompt = template.template.replace("{item}", mainSubject)

    // Add product category defaults if available
    if (productCategory && config.productDefaults[productCategory]) {
      const defaults = config.productDefaults[productCategory]
      expandedPrompt += ` ${defaults.pose}. ${defaults.lighting}. ${defaults.background}. ${defaults.details}.`
    }

    return expandedPrompt
  }

  // If no template matches, use the use case default extensions
  const selectedUseCase = config.useCases.find((uc) => uc.id === useCase)
  if (selectedUseCase && selectedUseCase.defaultPromptExtension) {
    return `${prompt}. ${selectedUseCase.defaultPromptExtension}`
  }

  // If all else fails, add general enhancements
  return `${prompt}. Professional photography with optimal lighting, composition, and detail. Subject is clearly visible with appropriate context and environment.`
}
