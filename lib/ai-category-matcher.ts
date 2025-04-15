import type { AuqliCategory } from "@/types"

// Define the interface for the AI category matcher response
interface AICategoryMatchResponse {
  mainCategory: string
  subCategory: string
  confidence: number
}

// Function to extract product information from a title
export function extractProductInfo(title: string): {
  productType?: string
  gender?: string
  color?: string
  size?: string
} {
  const info: {
    productType?: string
    gender?: string
    color?: string
    size?: string
  } = {}

  // Extract product type
  const productTypes = [
    { regex: /\b(dress|gown|frock)\b/i, type: "dress" },
    { regex: /\b(pant|trouser|chino|jean|denim)\b/i, type: "pants" },
    { regex: /\b(shirt|tee|t-shirt|polo|henley)\b/i, type: "shirt" },
    { regex: /\b(cap|hat|beanie|duckbill|baseball cap|cadet)\b/i, type: "hat" },
    { regex: /\b(jacket|coat|blazer)\b/i, type: "jacket" },
    { regex: /\b(shoe|sneaker|loafer|boot)\b/i, type: "shoes" },
    { regex: /\b(sweater|jumper|pullover)\b/i, type: "sweater" },
    { regex: /\b(skirt)\b/i, type: "skirt" },
    { regex: /\b(hoodie|sweatshirt)\b/i, type: "hoodie" },
    { regex: /\b(sock|stocking)\b/i, type: "socks" },
    { regex: /\b(underwear|boxer|brief)\b/i, type: "underwear" },
    { regex: /\b(bag|purse|backpack|tote)\b/i, type: "bag" },
    { regex: /\b(watch|jewelry|necklace|bracelet|ring)\b/i, type: "accessories" },
    { regex: /\b(scarf|glove|belt)\b/i, type: "accessories" },
  ]

  for (const { regex, type } of productTypes) {
    if (regex.test(title)) {
      info.productType = type
      break
    }
  }

  // Extract gender
  if (/\b(men'?s?|man'?s?|male|boy'?s?)\b/i.test(title)) {
    info.gender = "men"
  } else if (/\b(women'?s?|woman'?s?|female|girl'?s?|ladies)\b/i.test(title)) {
    info.gender = "women"
  }

  // Extract color
  const colorRegex = /\b(black|white|red|blue|green|yellow|purple|pink|orange|brown|grey|gray|navy|khaki)\b/i
  const colorMatch = title.match(colorRegex)
  if (colorMatch) {
    info.color = colorMatch[0].toLowerCase()
  }

  // Extract size
  const sizeRegex = /\b(\d{1,2}(?:\.\d)?|xs|s|m|l|xl|xxl|xxxl)\b/i
  const sizeMatch = title.match(sizeRegex)
  if (sizeMatch) {
    info.size = sizeMatch[0].toLowerCase()
  }

  return info
}

// Function to match a product to a category using AI-like heuristics
export function matchProductToCategory(
  productName: string,
  productDescription: string,
  categories: AuqliCategory[],
): AICategoryMatchResponse {
  // Extract product information from the title
  const productInfo = extractProductInfo(productName)

  // Default response with low confidence
  const defaultResponse: AICategoryMatchResponse = {
    mainCategory: "",
    subCategory: "",
    confidence: 0,
  }

  if (!productInfo.productType) {
    return defaultResponse
  }

  // Map product types to likely categories
  const categoryMapping: Record<string, { main: string; sub?: string }> = {
    dress: { main: "Women Fashion", sub: "Dresses" },
    pants: { main: productInfo.gender === "women" ? "Women Fashion" : "Men Fashion", sub: "Pants" },
    shirt: { main: productInfo.gender === "women" ? "Women Fashion" : "Men Fashion", sub: "Shirts" },
    hat: { main: productInfo.gender === "women" ? "Women Accessories" : "Men Accessories", sub: "Hats" },
    jacket: { main: productInfo.gender === "women" ? "Women Fashion" : "Men Fashion", sub: "Jackets & Coats" },
    shoes: { main: productInfo.gender === "women" ? "Women Shoes" : "Men Shoes" },
    sweater: { main: productInfo.gender === "women" ? "Women Fashion" : "Men Fashion", sub: "Sweaters" },
    skirt: { main: "Women Fashion", sub: "Skirts" },
    hoodie: { main: productInfo.gender === "women" ? "Women Fashion" : "Men Fashion", sub: "Hoodies & Sweatshirts" },
    socks: { main: productInfo.gender === "women" ? "Women Accessories" : "Men Accessories", sub: "Socks" },
    underwear: { main: productInfo.gender === "women" ? "Women Fashion" : "Men Fashion", sub: "Underwear" },
    bag: { main: productInfo.gender === "women" ? "Women Accessories" : "Men Accessories", sub: "Bags" },
    accessories: { main: productInfo.gender === "women" ? "Women Accessories" : "Men Accessories" },
  }

  // Get the mapping for this product type
  const mapping = categoryMapping[productInfo.productType]

  if (!mapping) {
    return defaultResponse
  }

  // Determine gender if not explicitly mentioned
  let gender = productInfo.gender
  if (!gender) {
    // Try to infer gender from product name or description
    const combinedText = `${productName} ${productDescription}`.toLowerCase()
    if (/women|woman|female|ladies|girl/i.test(combinedText)) {
      gender = "women"
    } else if (/men|man|male|boy/i.test(combinedText)) {
      gender = "men"
    } else {
      // Default to men if we can't determine
      gender = "men"
    }
  }

  // Adjust main category based on inferred gender
  let mainCategory = mapping.main
  if (mainCategory.includes("Fashion") || mainCategory.includes("Accessories") || mainCategory.includes("Shoes")) {
    mainCategory = mainCategory.replace(/^(Men|Women)/, gender === "women" ? "Women" : "Men")
  }

  // Find the actual category in the provided categories
  let matchedCategory = null
  let matchedSubcategory = null

  for (const category of categories) {
    if (category.name.toLowerCase() === mainCategory.toLowerCase()) {
      matchedCategory = category

      // If we have a subcategory, try to find it
      if (mapping.sub && category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (subcategory.name.toLowerCase() === mapping.sub.toLowerCase()) {
            matchedSubcategory = subcategory
            break
          }
        }
      }

      break
    }
  }

  // If we found a match, return it with high confidence
  if (matchedCategory) {
    return {
      mainCategory: matchedCategory.name,
      subCategory: matchedSubcategory ? matchedSubcategory.name : "",
      confidence: matchedSubcategory ? 90 : 70,
    }
  }

  return defaultResponse
}

// Function to match a batch of products to categories
export async function batchMatchProductsToCategories(
  products: Array<{ id: string; name: string; description: string }>,
  categories: AuqliCategory[],
): Promise<Record<string, { mainCategory: string; subCategory: string }>> {
  const results: Record<string, { mainCategory: string; subCategory: string }> = {}

  for (const product of products) {
    const match = matchProductToCategory(product.name, product.description, categories)

    // Only include matches with reasonable confidence
    if (match.confidence >= 60) {
      results[product.id] = {
        mainCategory: match.mainCategory,
        subCategory: match.subCategory,
      }
    }
  }

  return results
}

// Function to force match a product using AI (simulated)
export async function forceMatchWithAI(
  productName: string,
  productDescription: string,
  categories: AuqliCategory[],
): Promise<{ mainCategory: string; subCategory: string }> {
  // This would normally call an actual AI API, but we'll use our heuristic matcher
  const match = matchProductToCategory(productName, productDescription, categories)

  // If we got a decent match, return it
  if (match.confidence >= 60) {
    return {
      mainCategory: match.mainCategory,
      subCategory: match.subCategory,
    }
  }

  // Otherwise, try to find any reasonable category
  for (const category of categories) {
    if (category.subcategories && category.subcategories.length > 0) {
      return {
        mainCategory: category.name,
        subCategory: category.subcategories[0].name,
      }
    }
  }

  // Last resort fallback
  return {
    mainCategory: "Uncategorized",
    subCategory: "Uncategorized",
  }
}
