import type { AuqliCategory } from "@/types"

// Define interfaces for AI requests and responses
interface AIMatchRequest {
  name: string
  description?: string
}

interface AIMatchResponse {
  mainCategory: string
  subCategory: string
  confidence: number
}

/**
 * Match a product with AI to find the best category
 */
export async function matchProductWithAI(
  product: AIMatchRequest,
  categories: AuqliCategory[],
  forceMatch = false,
): Promise<AIMatchResponse> {
  try {
    // First try pattern matching
    const patternMatch = findCategoryByPattern(product.name, product.description || "", categories)

    // If we have a good match from pattern matching, return it
    if (patternMatch.confidence >= 80) {
      return patternMatch
    }

    // If we're not forcing a match and the pattern match is decent, return it
    if (!forceMatch && patternMatch.confidence >= 60) {
      return patternMatch
    }

    // Otherwise, use more advanced matching techniques
    // This could be a call to an external AI service or a more sophisticated algorithm
    return findBestCategory(product.name, product.description || "", categories)
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
 * Force match a product with AI - used for manual category selection
 */
export async function forceMatchWithAI(
  productId: string,
  productName: string,
  productDescription: string,
  categories: AuqliCategory[],
): Promise<{ mainCategory: string; subCategory: string }> {
  try {
    const match = await matchProductWithAI(
      { name: productName, description: productDescription },
      categories,
      true, // Force match
    )

    if (match.confidence >= 60) {
      return {
        mainCategory: match.mainCategory,
        subCategory: match.subCategory,
      }
    }

    // If confidence is too low, return empty values
    return {
      mainCategory: "",
      subCategory: "",
    }
  } catch (error) {
    console.error(`Error force matching product ${productId}:`, error)
    return {
      mainCategory: "",
      subCategory: "",
    }
  }
}

/**
 * Batch process multiple products for category matching
 */
export async function batchProcessCategories(
  products: Array<{ id: string; name: string; description: string }>,
  categories: AuqliCategory[],
): Promise<Record<string, { mainCategory: string; subCategory: string }>> {
  const results: Record<string, { mainCategory: string; subCategory: string }> = {}

  // Process each product
  for (const product of products) {
    try {
      const match = await matchProductWithAI(
        { name: product.name, description: product.description },
        categories,
        true, // Force match for batch processing
      )

      if (match.confidence >= 60) {
        results[product.id] = {
          mainCategory: match.mainCategory,
          subCategory: match.subCategory,
        }
      }
    } catch (error) {
      console.error(`Error matching product ${product.id}:`, error)
    }
  }

  return results
}

/**
 * Find a category by pattern matching
 */
function findCategoryByPattern(
  productName: string,
  productDescription: string,
  categories: AuqliCategory[],
): AIMatchResponse {
  // Normalize input
  const normalizedName = productName.toLowerCase()
  const normalizedDesc = productDescription.toLowerCase()
  const combinedText = `${normalizedName} ${normalizedDesc}`

  // Common patterns for different product types
  const patterns = [
    { regex: /\b(shirt|tee|t-shirt|polo)\b/i, category: "Apparel & Accessories", subcategory: "Shirts" },
    { regex: /\b(pant|trouser|jeans)\b/i, category: "Apparel & Accessories", subcategory: "Pants" },
    { regex: /\b(shoe|sneaker|boot|footwear)\b/i, category: "Shoes", subcategory: "Casual Shoes" },
    { regex: /\b(jacket|coat|hoodie|sweater)\b/i, category: "Apparel & Accessories", subcategory: "Outerwear" },
    { regex: /\b(watch|timepiece)\b/i, category: "Accessories", subcategory: "Watches" },
    { regex: /\b(bag|backpack|purse|handbag)\b/i, category: "Accessories", subcategory: "Bags" },
    { regex: /\b(phone|iphone|android|smartphone)\b/i, category: "Electronics", subcategory: "Mobile Phones" },
    { regex: /\b(laptop|notebook|macbook)\b/i, category: "Electronics", subcategory: "Laptops" },
    { regex: /\b(tablet|ipad)\b/i, category: "Electronics", subcategory: "Tablets" },
    { regex: /\b(camera|dslr|mirrorless)\b/i, category: "Electronics", subcategory: "Cameras" },
    { regex: /\b(headphone|earphone|earbud|airpod)\b/i, category: "Electronics", subcategory: "Audio" },
    { regex: /\b(furniture|chair|table|desk|sofa|couch)\b/i, category: "Home & Garden", subcategory: "Furniture" },
    { regex: /\b(kitchen|cookware|utensil|appliance)\b/i, category: "Home & Garden", subcategory: "Kitchen" },
    { regex: /\b(toy|game|puzzle)\b/i, category: "Toys & Games", subcategory: "Toys" },
    { regex: /\b(book|novel|textbook)\b/i, category: "Books & Media", subcategory: "Books" },
    { regex: /\b(beauty|makeup|cosmetic|skincare)\b/i, category: "Health & Beauty", subcategory: "Beauty" },
    { regex: /\b(health|vitamin|supplement)\b/i, category: "Health & Beauty", subcategory: "Health" },
    { regex: /\b(jewelry|necklace|bracelet|ring)\b/i, category: "Jewelry", subcategory: "Fashion Jewelry" },
    { regex: /\b(sports|fitness|exercise|workout)\b/i, category: "Sports & Outdoors", subcategory: "Fitness" },
    { regex: /\b(outdoor|camping|hiking)\b/i, category: "Sports & Outdoors", subcategory: "Outdoor Recreation" },
  ]

  // Check for pattern matches
  for (const pattern of patterns) {
    if (pattern.regex.test(combinedText)) {
      // Find the actual category in our list
      for (const category of categories) {
        if (category.name.toLowerCase().includes(pattern.category.toLowerCase())) {
          // Find the subcategory
          if (category.subcategories) {
            for (const subcategory of category.subcategories) {
              if (subcategory.name.toLowerCase().includes(pattern.subcategory.toLowerCase())) {
                return {
                  mainCategory: category.name,
                  subCategory: subcategory.name,
                  confidence: 85,
                }
              }
            }
          }

          // If we found the category but not the subcategory
          return {
            mainCategory: category.name,
            subCategory: "",
            confidence: 70,
          }
        }
      }
    }
  }

  // No pattern match found
  return {
    mainCategory: "",
    subCategory: "",
    confidence: 0,
  }
}

/**
 * Find the best category match using more advanced techniques
 */
function findBestCategory(
  productName: string,
  productDescription: string,
  categories: AuqliCategory[],
): AIMatchResponse {
  // Normalize input
  const normalizedName = productName.toLowerCase()
  const normalizedDesc = productDescription.toLowerCase()

  // Calculate scores for each category
  const scores: {
    category: AuqliCategory
    subcategory?: any
    score: number
  }[] = []

  for (const category of categories) {
    const categoryName = category.name.toLowerCase()
    const categoryWords = categoryName.split(/\s+/)

    // Calculate base score for category
    let categoryScore = 0
    for (const word of categoryWords) {
      if (word.length > 2) {
        if (normalizedName.includes(word)) {
          categoryScore += 10
        }
        if (normalizedDesc.includes(word)) {
          categoryScore += 5
        }
      }
    }

    // Find best subcategory
    let bestSubcategory = null
    let bestSubcategoryScore = 0

    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        const subcategoryName = subcategory.name.toLowerCase()
        const subcategoryWords = subcategoryName.split(/\s+/)

        let subcategoryScore = 0
        for (const word of subcategoryWords) {
          if (word.length > 2) {
            if (normalizedName.includes(word)) {
              subcategoryScore += 10
            }
            if (normalizedDesc.includes(word)) {
              subcategoryScore += 5
            }
          }
        }

        if (subcategoryScore > bestSubcategoryScore) {
          bestSubcategoryScore = subcategoryScore
          bestSubcategory = subcategory
        }
      }
    }

    scores.push({
      category,
      subcategory: bestSubcategory,
      score: categoryScore + bestSubcategoryScore,
    })
  }

  // Sort by score
  scores.sort((a, b) => b.score - a.score)

  // If we have a good match
  if (scores.length > 0 && scores[0].score > 0) {
    const bestMatch = scores[0]
    const confidence = Math.min(100, bestMatch.score * 5) // Scale score to confidence

    return {
      mainCategory: bestMatch.category.name,
      subCategory: bestMatch.subcategory ? bestMatch.subcategory.name : "",
      confidence: confidence,
    }
  }

  // No good match found
  return {
    mainCategory: "",
    subCategory: "",
    confidence: 0,
  }
}

/**
 * Batch match products with AI and report progress
 */
export async function batchMatchProductsWithAI(
  products: Array<{ id: string; name: string; description: string }>,
  categories: AuqliCategory[],
  progressCallback?: (processed: number, total: number) => void,
): Promise<Record<string, { mainCategory: string; subCategory: string }>> {
  const results: Record<string, { mainCategory: string; subCategory: string }> = {}
  const total = products.length

  // Process in batches to avoid overwhelming the system
  const batchSize = 5
  const batches = Math.ceil(total / batchSize)

  for (let i = 0; i < batches; i++) {
    const start = i * batchSize
    const end = Math.min(start + batchSize, total)
    const batch = products.slice(start, end)

    // Process each product in the batch
    const batchPromises = batch.map(async (product) => {
      try {
        const match = await matchProductWithAI(
          { name: product.name, description: product.description },
          categories,
          true, // Force match for batch processing
        )

        if (match.confidence >= 60) {
          return {
            id: product.id,
            match: {
              mainCategory: match.mainCategory,
              subCategory: match.subCategory,
            },
          }
        }
        return null
      } catch (error) {
        console.error(`Error matching product ${product.id}:`, error)
        return null
      }
    })

    const batchResults = await Promise.all(batchPromises)

    // Add valid results to the output
    batchResults.forEach((result) => {
      if (result && result.match.mainCategory) {
        results[result.id] = result.match
      }
    })

    // Report progress
    if (progressCallback) {
      progressCallback(end, total)
    }

    // Add a small delay between batches
    if (i < batches - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  return results
}
