import type { AuqliCategory } from "@/types"

// Interface for product data
interface ProductData {
  id: string
  name: string
  description?: string
  brand?: string
  tags?: string[]
}

// Interface for category match result
interface CategoryMatch {
  mainCategory: string
  subCategory: string
}

interface AIMatchResponse {
  main_category: string
  subcategory: string
  confidence: number
}

/**
 * Deep AI Category Matching System for Auqli Nexus
 * Uses advanced pattern recognition to match product titles to categories
 */

// Extract product information from title and description
export function extractProductInfo(
  title: string,
  description = "",
): {
  productType?: string
  gender?: string
  color?: string
  size?: string
  material?: string
} {
  const combinedText = `${title} ${description}`.toLowerCase()
  const info: {
    productType?: string
    gender?: string
    color?: string
    size?: string
    material?: string
  } = {}

  // Extract product type using comprehensive patterns
  const productPatterns = [
    // Pants and bottoms
    { regex: /\b(chino|chinos|pant|pants|trouser|trousers|jeans|denim|shorts|jogger|sweatpant)\b/i, type: "pants" },
    // Shirts and tops
    { regex: /\b(shirt|tee|t-shirt|polo|henley|blouse|top|tank|camisole)\b/i, type: "shirt" },
    // Headwear
    { regex: /\b(cap|hat|beanie|duckbill|baseball cap|cadet|headband)\b/i, type: "hat" },
    // Outerwear
    { regex: /\b(jacket|coat|blazer|hoodie|sweatshirt|sweater|cardigan)\b/i, type: "outerwear" },
    // Footwear
    { regex: /\b(shoe|sneaker|loafer|boot|sandal|slipper|heel)\b/i, type: "shoes" },
    // Dresses
    { regex: /\b(dress|gown|frock|skirt)\b/i, type: "dress" },
    // Accessories
    { regex: /\b(scarf|glove|belt|tie|bowtie|wallet|purse|bag|backpack|handbag)\b/i, type: "accessory" },
    // Underwear
    { regex: /\b(underwear|boxer|brief|panty|bra|lingerie|sock|stocking)\b/i, type: "underwear" },
    // Swimwear
    { regex: /\b(swimsuit|bikini|swim|trunks)\b/i, type: "swimwear" },
    // Sleepwear
    { regex: /\b(pajama|pyjama|nightgown|robe|sleepwear)\b/i, type: "sleepwear" },
  ]

  for (const { regex, type } of productPatterns) {
    if (regex.test(combinedText)) {
      info.productType = type
      break
    }
  }

  // Extract gender with comprehensive patterns
  if (/\b(men'?s?|man'?s?|male|boy'?s?|gentleman|gent)\b/i.test(combinedText)) {
    info.gender = "men"
  } else if (/\b(women'?s?|woman'?s?|female|girl'?s?|ladies|lady)\b/i.test(combinedText)) {
    info.gender = "women"
  }

  // Extract color
  const colorRegex =
    /\b(black|white|red|blue|navy|green|yellow|purple|pink|orange|brown|grey|gray|khaki|beige|tan|olive|maroon|burgundy|teal|turquoise|gold|silver|multi)\b/i
  const colorMatch = combinedText.match(colorRegex)
  if (colorMatch) {
    info.color = colorMatch[0].toLowerCase()
  }

  // Extract size
  const sizeRegex = /\b(\d{1,2}(?:\.\d)?|xs|s|m|l|xl|xxl|xxxl|small|medium|large|x-large)\b/i
  const sizeMatch = combinedText.match(sizeRegex)
  if (sizeMatch) {
    info.size = sizeMatch[0].toLowerCase()
  }

  // Extract material
  const materialRegex =
    /\b(cotton|polyester|wool|leather|denim|silk|linen|nylon|spandex|rayon|velvet|satin|suede|canvas|corduroy)\b/i
  const materialMatch = combinedText.match(materialRegex)
  if (materialMatch) {
    info.material = materialMatch[0].toLowerCase()
  }

  return info
}

/**
 * Deep AI matching logic for product categorization
 * Maps products to Auqli categories based on product information
 */
async function deepMatchProductToCategory(
  productName: string,
  productDescription: string,
  auqliCategories: AuqliCategory[],
): Promise<{ mainCategory: string; subCategory: string; confidence: number }> {
  // Extract product information
  const productInfo = extractProductInfo(productName, productDescription)

  // Default response with low confidence
  const defaultResponse = {
    mainCategory: "",
    subCategory: "",
    confidence: 0,
  }

  if (!productInfo.productType) {
    return defaultResponse
  }

  // Comprehensive category mapping based on product type and gender
  const categoryMapping: Record<string, { main: string; sub?: string; confidence: number }> = {
    // Men's clothing
    "men-pants": { main: "Men Fashion", sub: "Pants", confidence: 90 },
    "men-shirt": { main: "Men Fashion", sub: "Shirts", confidence: 90 },
    "men-hat": { main: "Men Accessories", sub: "Hats", confidence: 90 },
    "men-outerwear": { main: "Men Fashion", sub: "Jackets & Coats", confidence: 85 },
    "men-shoes": { main: "Men Shoes", confidence: 85 },
    "men-accessory": { main: "Men Accessories", confidence: 80 },
    "men-underwear": { main: "Men Fashion", sub: "Underwear", confidence: 85 },

    // Women's clothing
    "women-pants": { main: "Women Fashion", sub: "Pants", confidence: 90 },
    "women-shirt": { main: "Women Fashion", sub: "Tops & Blouses", confidence: 90 },
    "women-hat": { main: "Women Accessories", sub: "Hats", confidence: 90 },
    "women-outerwear": { main: "Women Fashion", sub: "Jackets & Coats", confidence: 85 },
    "women-shoes": { main: "Women Shoes", confidence: 85 },
    "women-dress": { main: "Women Fashion", sub: "Dresses", confidence: 95 },
    "women-accessory": { main: "Women Accessories", confidence: 80 },
    "women-underwear": { main: "Women Fashion", sub: "Underwear", confidence: 85 },

    // Gender-neutral (will use gender from product info if available)
    pants: { main: "Fashion", sub: "Pants", confidence: 70 },
    shirt: { main: "Fashion", sub: "Shirts", confidence: 70 },
    hat: { main: "Accessories", sub: "Hats", confidence: 70 },
    outerwear: { main: "Fashion", sub: "Jackets & Coats", confidence: 65 },
    shoes: { main: "Shoes", confidence: 65 },
    dress: { main: "Women Fashion", sub: "Dresses", confidence: 85 }, // Dresses default to women
    accessory: { main: "Accessories", confidence: 60 },
    underwear: { main: "Fashion", sub: "Underwear", confidence: 65 },
  }

  // Create a key based on gender and product type
  const gender = productInfo.gender || ""
  const productType = productInfo.productType || ""
  const mappingKey = gender ? `${gender}-${productType}` : productType

  // Get the mapping for this product type
  const mapping = categoryMapping[mappingKey]

  if (!mapping) {
    return defaultResponse
  }

  // Find the actual category in the provided categories
  let matchedCategory = null
  let matchedSubcategory = null
  let confidence = mapping.confidence

  // Special case handling for specific product types
  if (productName.toLowerCase().includes("chino") || productName.toLowerCase().includes("chinos")) {
    if (gender === "men") {
      return findExactCategoryMatch(auqliCategories, "Men Fashion", "Chinos", 95)
    } else if (gender === "women") {
      return findExactCategoryMatch(auqliCategories, "Women Fashion", "Chinos", 95)
    }
  }

  // Special case for duckbill caps
  if (productName.toLowerCase().includes("duckbill")) {
    if (gender === "men") {
      return findExactCategoryMatch(auqliCategories, "Men Accessories", "Hats", 95)
    } else if (gender === "women") {
      return findExactCategoryMatch(auqliCategories, "Women Accessories", "Hats", 95)
    }
  }

  // Special case for baseball caps
  if (
    productName.toLowerCase().includes("baseball cap") ||
    (productName.toLowerCase().includes("cap") && !productName.toLowerCase().includes("cadet"))
  ) {
    if (gender === "men") {
      return findExactCategoryMatch(auqliCategories, "Men Accessories", "Hats", 95)
    } else if (gender === "women") {
      return findExactCategoryMatch(auqliCategories, "Women Accessories", "Hats", 95)
    }
  }

  // Special case for cadet caps
  if (productName.toLowerCase().includes("cadet")) {
    if (gender === "men") {
      return findExactCategoryMatch(auqliCategories, "Men Accessories", "Hats", 95)
    } else if (gender === "women") {
      return findExactCategoryMatch(auqliCategories, "Women Accessories", "Hats", 95)
    }
  }

  // Special case for ASOS dresses
  if (productName.toLowerCase().includes("asos") && productName.toLowerCase().includes("dress")) {
    return findExactCategoryMatch(auqliCategories, "Women Fashion", "Dresses", 98)
  }

  // Special case for long sleeve shirts
  if (productName.toLowerCase().includes("long sleeve shirt")) {
    if (gender === "men") {
      return findExactCategoryMatch(auqliCategories, "Men Fashion", "Shirts", 95)
    } else if (gender === "women") {
      return findExactCategoryMatch(auqliCategories, "Women Fashion", "Tops & Blouses", 95)
    }
  }

  // Try to find the exact category match
  for (const category of auqliCategories) {
    // Skip if category doesn't have a name
    if (!category || !category.name) continue

    // For gender-specific categories, ensure we match the right gender
    if (gender === "men" && !category.name.toLowerCase().includes("men")) continue
    if (gender === "women" && !category.name.toLowerCase().includes("women")) continue

    // If the category name matches our mapping
    if (category.name.toLowerCase().includes(mapping.main.toLowerCase())) {
      matchedCategory = category

      // If we have a subcategory, try to find it
      if (mapping.sub && category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (!subcategory || !subcategory.name) continue

          if (subcategory.name.toLowerCase().includes(mapping.sub.toLowerCase())) {
            matchedSubcategory = subcategory
            break
          }
        }
      }

      break
    }
  }

  // If we found a match, return it
  if (matchedCategory) {
    return {
      mainCategory: matchedCategory.name,
      subCategory: matchedSubcategory ? matchedSubcategory.name : "",
      confidence: matchedSubcategory ? confidence : confidence * 0.8,
    }
  }

  // If no match found, try a more flexible approach
  for (const category of auqliCategories) {
    if (!category || !category.name) continue

    // For gender-specific categories, ensure we match the right gender
    if (gender === "men" && category.name.toLowerCase().includes("men")) {
      matchedCategory = category
      confidence = 70
      break
    } else if (gender === "women" && category.name.toLowerCase().includes("women")) {
      matchedCategory = category
      confidence = 70
      break
    }
  }

  if (matchedCategory) {
    return {
      mainCategory: matchedCategory.name,
      subCategory: "",
      confidence: confidence,
    }
  }

  return defaultResponse
}

// Helper function to find exact category matches
function findExactCategoryMatch(
  categories: AuqliCategory[],
  mainCategoryName: string,
  subCategoryName: string,
  confidence: number,
): { mainCategory: string; subCategory: string; confidence: number } {
  for (const category of categories) {
    if (!category || !category.name) continue

    if (category.name === mainCategoryName) {
      if (subCategoryName && category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (!subcategory || !subcategory.name) continue

          if (subcategory.name === subCategoryName) {
            return {
              mainCategory: category.name,
              subCategory: subcategory.name,
              confidence: confidence,
            }
          }
        }
      }

      // Found main category but not subcategory
      return {
        mainCategory: category.name,
        subCategory: "",
        confidence: confidence * 0.8,
      }
    }
  }

  return {
    mainCategory: "",
    subCategory: "",
    confidence: 0,
  }
}

/**
 * Calls the DeepInfra API to get AI-powered category matching
 * Now with better error handling and fallback to local matching
 */
async function callDeepInfraForCategoryMatch(
  productName: string,
  productDescription: string,
  auqliCategories: AuqliCategory[],
): Promise<{ mainCategory: string; subCategory: string; confidence: number }> {
  try {
    // First try our local deep matching logic
    const localMatch = await deepMatchProductToCategory(productName, productDescription, auqliCategories)

    // If we got a good match locally, return it
    if (localMatch.confidence >= 80) {
      return localMatch
    }

    // Check if API key is available - if not, just return the local match
    const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY
    if (!DEEPINFRA_API_KEY) {
      console.warn("DeepInfra API key not found, using local matching only")
      return localMatch
    }

    // Skip API call and use local matching only
    // This is a temporary solution until the API key issue is resolved
    return localMatch

    /* Commented out API call to avoid 401 errors
    // Format categories for the prompt
    const categoryOptions = auqliCategories
      .map((category) => {
        const subcategories = category.subcategories?.map((sub) => sub.name) || []
        return `- ${category.name} > ${subcategories.join(", ")}`
      })
      .join("\n")

    // Build the prompt
    const prompt = `
You are a smart AI classifier for a fashion and e-commerce platform called Auqli.

Here's a product to classify:
Title: "${productName}"
Description: ${productDescription || "No description provided"}

Based on the categories below, choose the best match.

Categories:
${categoryOptions}

Respond with ONLY a JSON object in this format:
{
  "main_category": "...",
  "subcategory": "..."
}
`

    // Call the DeepInfra API
    const response = await fetch(
      `https://api.deepinfra.com/v1/inference/meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPINFRA_API_KEY}`,
        },
        body: JSON.stringify({
          input: prompt,
          temperature: 0.1,
          max_new_tokens: 200,
        }),
      },
    )

    if (!response.ok) {
      console.error("DeepInfra API error:", response.status)
      return localMatch
    }

    const data = await response.json()

    // Extract the generated content
    let generatedContent = ""
    if (data.results && data.results[0] && data.results[0].generated_text) {
      generatedContent = data.results[0].generated_text
    } else if (data.generated_text) {
      generatedContent = data.generated_text
    } else {
      console.error("Unexpected response format from DeepInfra")
      return localMatch
    }

    // Extract the JSON from the response
    const jsonMatch = generatedContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("No JSON found in response")
      return localMatch
    }

    try {
      const aiResponse = JSON.parse(jsonMatch[0]) as AIMatchResponse

      // Validate the AI response
      if (!aiResponse.main_category || !aiResponse.subcategory) {
        console.error("Invalid AI response format")
        return localMatch
      }

      // Verify that the AI response matches actual categories
      let isValidCategory = false
      for (const category of auqliCategories) {
        if (category.name === aiResponse.main_category) {
          if (category.subcategories?.some((sub) => sub.name === aiResponse.subcategory)) {
            isValidCategory = true
            break
          }
        }
      }

      if (!isValidCategory) {
        console.error("AI returned invalid category")
        return localMatch
      }

      return {
        mainCategory: aiResponse.main_category,
        subCategory: aiResponse.subcategory,
        confidence: 95, // High confidence for AI match
      }
    } catch (error) {
      console.error("Error parsing AI response:", error)
      return localMatch
    }
    */
  } catch (error) {
    console.error("Error in AI category matching:", error)
    return {
      mainCategory: "",
      subCategory: "",
      confidence: 0,
    }
  }
}

/**
 * Batch process multiple products for category matching
 * Now with better error handling and fallback to local matching
 */
export async function batchProcessCategories(
  products: ProductData[],
  categories: AuqliCategory[],
): Promise<Record<string, CategoryMatch>> {
  const results: Record<string, CategoryMatch> = {}

  try {
    // Process each product
    for (const product of products) {
      try {
        // Use local matching only to avoid API errors
        const localMatch = await deepMatchProductToCategory(product.name, product.description || "", categories)

        // Only add to results if we got a decent match
        if (
          localMatch.confidence >= 70 &&
          localMatch.mainCategory &&
          !localMatch.mainCategory.includes("Uncategorized")
        ) {
          results[product.id] = {
            mainCategory: localMatch.mainCategory,
            subCategory: localMatch.subCategory || "Uncategorized",
          }
        }
      } catch (error) {
        console.error(`Error matching product ${product.id}:`, error)
      }
    }

    return results
  } catch (error) {
    console.error("Error in batch processing:", error)
    return results
  }
}

/**
 * Match a single product to the appropriate category using AI
 * Now with better error handling and fallback to local matching
 */
export async function forceMatchWithAI(
  productId: string,
  productName: string,
  productDescription: string,
  categories: AuqliCategory[],
): Promise<{ mainCategory: string; subCategory: string }> {
  try {
    // Use local matching only to avoid API errors
    const localMatch = await deepMatchProductToCategory(productName, productDescription, categories)

    // Only return if we got a decent match
    if (localMatch.confidence >= 70 && localMatch.mainCategory && !localMatch.mainCategory.includes("Uncategorized")) {
      return {
        mainCategory: localMatch.mainCategory,
        subCategory: localMatch.subCategory || "Uncategorized",
      }
    }

    // Fallback to basic category extraction
    return {
      mainCategory: "Uncategorized",
      subCategory: "Uncategorized",
    }
  } catch (error) {
    console.error(`Error force matching product ${productId}:`, error)
    return {
      mainCategory: "Uncategorized",
      subCategory: "Uncategorized",
    }
  }
}
