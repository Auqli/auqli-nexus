import { fashionCategoryMappings, sizePatterns, colorPatterns } from "./fashion-categories"

/**
 * Enhanced category matcher specifically designed to handle fashion items
 * that were previously not being categorized correctly
 *
 * @param {string} productName - The name of the product
 * @returns {Object|null} - The matched category or null if no match
 */
export function matchFashionCategory(productName) {
  if (!productName) return null

  // Normalize the product name
  const normalizedName = productName.toLowerCase().trim()

  // Extract product type, ignoring sizes and colors
  const productType = extractProductType(normalizedName)

  // First, try exact matches with our fashion mappings
  for (const [key, value] of Object.entries(fashionCategoryMappings)) {
    if (normalizedName.includes(key)) {
      return {
        mainCategory: value.mainCategory,
        subCategory: value.subCategory,
        confidence: 90,
      }
    }
  }

  // If no exact match, try to match the extracted product type
  if (productType) {
    for (const [key, value] of Object.entries(fashionCategoryMappings)) {
      if (productType.includes(key) || key.includes(productType)) {
        return {
          mainCategory: value.mainCategory,
          subCategory: value.subCategory,
          confidence: 80,
        }
      }
    }
  }

  // Special case handling for specific patterns in the screenshots

  // Bucket hats
  if (normalizedName.includes("bucket") && normalizedName.includes("hat")) {
    return {
      mainCategory: "Fashion",
      subCategory: "Hats",
      confidence: 95,
    }
  }

  // Loafers
  if (
    normalizedName.includes("loafer") ||
    normalizedName.includes("sovereign bit") ||
    normalizedName.includes("savanna fringe")
  ) {
    return {
      mainCategory: "Fashion",
      subCategory: "Loafers",
      confidence: 95,
    }
  }

  // Tank tops
  if (normalizedName.includes("tank") || normalizedName.includes("tank-top") || normalizedName.includes("kalmar")) {
    return {
      mainCategory: "Fashion",
      subCategory: "Tank Tops",
      confidence: 95,
    }
  }

  // Trunks/Swimwear
  if (normalizedName.includes("trunk") || normalizedName.includes("jacnorman contrast")) {
    return {
      mainCategory: "Fashion",
      subCategory: "Swimwear",
      confidence: 95,
    }
  }

  // Belts
  if (normalizedName.includes("belt") || normalizedName.includes("jacsimon")) {
    return {
      mainCategory: "Fashion",
      subCategory: "Belts",
      confidence: 95,
    }
  }

  // Shirts
  if (normalizedName.includes("shirt") || normalizedName.includes("jprbl")) {
    const subCategory = normalizedName.includes("sweatshirt")
      ? "Sweatshirts"
      : normalizedName.includes("t-shirt") || normalizedName.includes("tshirt")
        ? "T-Shirts"
        : "Shirts"

    return {
      mainCategory: "Fashion",
      subCategory: subCategory,
      confidence: 95,
    }
  }

  // Shorts
  if (normalizedName.includes("shorts") || normalizedName.includes("chill linen")) {
    return {
      mainCategory: "Fashion",
      subCategory: "Shorts",
      confidence: 95,
    }
  }

  // If we still haven't found a match but the name contains fashion-related terms
  if (containsFashionTerms(normalizedName)) {
    return {
      mainCategory: "Fashion",
      subCategory: "Uncategorized",
      confidence: 70,
    }
  }

  return null
}

/**
 * Extract the core product type from a product name by removing sizes and colors
 *
 * @param {string} productName - The normalized product name
 * @returns {string} - The extracted product type
 */
function extractProductType(productName) {
  let words = productName.split(/\s+/)

  // Remove size indicators
  words = words.filter((word) => {
    // Skip common size patterns
    if (sizePatterns[word]) return false

    // Skip size ranges like "34-36"
    if (/^\d+-\d+$/.test(word)) return false

    return true
  })

  // Remove color indicators
  words = words.filter((word) => !colorPatterns[word])

  // Remove common words that don't help with categorization
  const stopWords = ["in", "the", "a", "an", "with", "for", "and", "or", "by", "of"]
  words = words.filter((word) => !stopWords.includes(word))

  return words.join(" ")
}

/**
 * Check if the product name contains any fashion-related terms
 *
 * @param {string} productName - The normalized product name
 * @returns {boolean} - True if the name contains fashion terms
 */
function containsFashionTerms(productName) {
  const fashionTerms = [
    "wear",
    "apparel",
    "clothing",
    "fashion",
    "style",
    "outfit",
    "dress",
    "casual",
    "formal",
    "men",
    "women",
    "unisex",
    "ladies",
    "gents",
  ]

  return fashionTerms.some((term) => productName.includes(term))
}
