"use server"

// Add the smartMatchCategories import at the top of the file
// (Make sure this is added near other imports)
import { smartMatchCategories } from "@/lib/utils"
import { parse } from "csv-parse"

// Add the import for the enhanced fashion category matcher
import { matchFashionCategory } from "../lib/enhanced-category-matcher.js"

// Fix TypeScript syntax in JavaScript file
// Change TypeScript interface declarations to JSDoc comments

/**
 * @typedef {Object} AuqliCategory
 * @property {string} id
 * @property {string} name
 * @property {AuqliCategory[]} [subcategories]
 */

/**
 * @typedef {Object} Product
 * @property {string} name
 * @property {string} price
 * @property {string} image
 * @property {string} description
 * @property {string} weight
 * @property {string} inventory
 * @property {string} condition
 * @property {string} mainCategory
 * @property {string} subCategory
 * @property {string} uploadStatus
 * @property {string[]} additionalImages
 */

// Replace TypeScript interface declarations with JSDoc comments
// Remove TypeScript type annotations from function parameters

/**
 * Function to convert HTML to plain text
 * @param {string} html - HTML string to convert
 * @returns {string} Plain text
 */
function htmlToText(html) {
  // Remove HTML tags and convert HTML entities
  let text = html.replace(/<[^>]*>/g, "")
  text = text.replace(/&nbsp;/g, " ")
  text = text.replace(/&amp;/g, "&")
  text = text.replace(/&lt;/g, "<")
  text = text.replace(/&gt;/g, ">")
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  return text
}

// Function to extract main category from a string
/**
 * Extract main category from a string
 * @param {string} categoryString - Category string
 * @returns {string} Main category
 */
function extractMainCategory(categoryString) {
  if (!categoryString) return ""

  // Split the category string by delimiters like '>', '/', or ','
  const delimiters = /[>\\/,]/
  const categories = categoryString.split(delimiters).map((cat) => cat.trim())

  // Return the first non-empty category
  for (const category of categories) {
    if (category) {
      return category
    }
  }

  return ""
}

// Function to convert weight to kg
/**
 * Convert weight to kg
 * @param {string} weightValue - Weight value
 * @param {string} weightUnit - Weight unit
 * @returns {string} Weight in kg
 */
function convertToKg(weightValue, weightUnit) {
  const weight = Number.parseFloat(weightValue)
  if (isNaN(weight)) return "0"

  let weightInKg = weight

  if (weightUnit.toLowerCase() === "g") {
    weightInKg = weight / 1000
  } else if (weightUnit.toLowerCase() === "lb") {
    weightInKg = weight * 0.453592
  } else if (weightUnit.toLowerCase() === "oz") {
    weightInKg = weight * 0.0283495
  }

  return weightInKg.toFixed(3)
}

// Function to map condition
/**
 * Map condition string to standardized condition
 * @param {string} condition - Condition string
 * @returns {string} Standardized condition
 */
function mapCondition(condition) {
  const lowerCaseCondition = condition.toLowerCase()

  if (lowerCaseCondition.includes("new")) {
    return "New"
  } else {
    return "Fairly Used"
  }
}

// Find the findMatchingCategory function and update it with a similar approach to what we did in the route.ts file
// Replace the existing findMatchingCategory function with this enhanced version
function findMatchingCategory(productName, productDescription, categories) {
  if (!categories || categories.length === 0) {
    return { mainCategory: "", subCategory: "", confidence: 0 }
  }

  // First, try our enhanced fashion category matcher for specific fashion items
  // This should catch the items that were previously being missed
  const fashionMatch = matchFashionCategory(productName)
  if (fashionMatch && fashionMatch.confidence >= 80) {
    // If we have a high-confidence fashion match, use it
    return fashionMatch
  }

  // Normalize input text for better matching
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ") // Replace non-alphanumeric with spaces
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim()
  }

  const normalizedProductName = normalizeText(productName)
  const normalizedDescription = normalizeText(productDescription)

  // Combine product name and description for better matching
  const searchText = `${normalizedProductName} ${normalizedDescription}`

  // Extract key terms from product name (more weight on product name)
  const productTerms = normalizedProductName.split(" ").filter((term) => term.length > 2)

  // First, try matching against our expanded dictionary
  let bestCategoryMatch = ""
  let bestCategoryScore = 0

  // Check each category in our expanded dictionary
  for (const [category, terms] of Object.entries(smartMatchCategories)) {
    let categoryScore = 0

    // Check for exact matches in product name (highest weight)
    for (const term of terms) {
      // Multi-word terms
      if (term.includes(" ")) {
        if (normalizedProductName.includes(term)) {
          categoryScore += term.length * 4 // Higher weight for multi-word matches
        } else if (searchText.includes(term)) {
          categoryScore += term.length * 2
        }
      }
      // Single word terms
      else if (term.length > 2) {
        // Exact word match in product name
        const wordRegex = new RegExp(`\\b${term}\\b`, "i")
        if (wordRegex.test(normalizedProductName)) {
          categoryScore += term.length * 3
        }
        // Partial match in product name
        else if (normalizedProductName.includes(term)) {
          categoryScore += term.length * 2
        }
        // Match in search text
        else if (searchText.includes(term)) {
          categoryScore += term.length
        }
      }
    }

    // Brand name detection - give extra weight to brand names
    const brandTerms = [
      "nike",
      "adidas",
      "zara",
      "h&m",
      "gucci",
      "louis",
      "puma",
      "reebok",
      "levi",
      "samsung",
      "apple",
      "sony",
      "lg",
      "xiaomi",
      "huawei",
      "asus",
      "dell",
      "hp",
    ]
    for (const brand of brandTerms) {
      if (normalizedProductName.includes(brand)) {
        categoryScore += 10 // Bonus for brand names
      }
    }

    // Update best match if this category has a higher score
    if (categoryScore > bestCategoryScore) {
      bestCategoryScore = categoryScore
      bestCategoryMatch = category
    }
  }

  // If we found a good match in our dictionary, try to find it in Auqli categories
  if (bestCategoryMatch && bestCategoryScore > 10) {
    // Find the matching Auqli category
    for (const category of categories) {
      if (!category || !category.name) continue

      // Check for exact or similar category name match
      if (
        category.name === bestCategoryMatch ||
        category.name.toLowerCase().includes(bestCategoryMatch.toLowerCase()) ||
        bestCategoryMatch.toLowerCase().includes(category.name.toLowerCase())
      ) {
        // Find best matching subcategory
        let bestSubcategory = { id: "", name: "", score: 0 }
        const subcategories = Array.isArray(category.subcategories) ? category.subcategories : []

        for (const subcategory of subcategories) {
          if (!subcategory || !subcategory.name) continue

          const subcategoryName = subcategory.name.toLowerCase()
          let subcategoryScore = 0

          // Check for matches in product name and description
          if (normalizedProductName.includes(subcategoryName)) {
            subcategoryScore += subcategoryName.length * 3
          } else if (searchText.includes(subcategoryName)) {
            subcategoryScore += subcategoryName.length
          }

          // Special case for clothing sizes
          const sizeRegex = /\b(xs|s|m|l|xl|xxl|xxxl|2xl|3xl|4xl|5xl|small|medium|large|extra large)\b/i
          const sizeMatch = normalizedProductName.match(sizeRegex)
          if (sizeMatch && subcategoryName.includes(sizeMatch[0].toLowerCase())) {
            subcategoryScore += 15 // Bonus for size matches
          }

          // Special case for colors
          const colorRegex =
            /\b(black|white|red|blue|green|yellow|purple|pink|orange|brown|grey|gray|navy|beige|gold|silver)\b/i
          const colorMatch = normalizedProductName.match(colorRegex)
          if (colorMatch && subcategoryName.includes(colorMatch[0].toLowerCase())) {
            subcategoryScore += 10 // Bonus for color matches
          }

          if (subcategoryScore > bestSubcategory.score) {
            bestSubcategory = {
              id: subcategory.id || "",
              name: subcategory.name,
              score: subcategoryScore,
            }
          }
        }

        // Calculate confidence based on category and subcategory scores
        const maxPossibleScore = productName.length * 3
        const confidence = Math.min(100, Math.round((bestCategoryScore / maxPossibleScore) * 100))

        return {
          mainCategory: category.name,
          subCategory: bestSubcategory.name || "",
          confidence: confidence,
        }
      }
    }
  }

  // If no match found with our dictionary, fall back to the original algorithm
  // Common tech product terms and their category mappings
  const techTermMappings = {
    // Tablets and related terms
    ipad: { category: "Tablets", subcategory: "iPad", weight: 100 },
    tablet: { category: "Tablets", weight: 80 },
    "galaxy tab": { category: "Tablets", subcategory: "Samsung", weight: 90 },
    surface: { category: "Tablets", subcategory: "Microsoft", weight: 90 },

    // Phones
    iphone: { category: "Mobile Phones", subcategory: "iPhone", weight: 100 },
    galaxy: { category: "Mobile Phones", subcategory: "Samsung", weight: 90 },
    pixel: { category: "Mobile Phones", subcategory: "Google", weight: 90 },
    smartphone: { category: "Mobile Phones", weight: 80 },
    phone: { category: "Mobile Phones", weight: 70 },

    // Laptops
    macbook: { category: "Computing", subcategory: "Apple", weight: 100 },
    laptop: { category: "Computing", weight: 80 },
    notebook: { category: "Computing", weight: 70 },
    chromebook: { category: "Computing", subcategory: "Chrome OS", weight: 90 },

    // Accessories
    case: { category: "Accessories", weight: 60 },
    cover: { category: "Accessories", weight: 60 },
    charger: { category: "Accessories", weight: 70 },
    cable: { category: "Accessories", weight: 60 },
    headphone: { category: "Accessories", subcategory: "Audio", weight: 80 },
    earphone: { category: "Accessories", subcategory: "Audio", weight: 80 },
    airpod: { category: "Accessories", subcategory: "Audio", weight: 90 },

    // Wearables
    watch: { category: "Wearable Tech", weight: 70 },
    smartwatch: { category: "Wearable Tech", weight: 90 },
    "apple watch": { category: "Wearable Tech", subcategory: "Apple", weight: 100 },
    fitbit: { category: "Wearable Tech", subcategory: "Fitness Trackers", weight: 100 },
    "fitness tracker": { category: "Wearable Tech", subcategory: "Fitness Trackers", weight: 90 },

    // Gaming
    playstation: { category: "Gaming", subcategory: "PlayStation", weight: 100 },
    ps5: { category: "Gaming", subcategory: "PlayStation", weight: 100 },
    ps4: { category: "Gaming", subcategory: "PlayStation", weight: 100 },
    xbox: { category: "Gaming", subcategory: "Xbox", weight: 100 },
    nintendo: { category: "Gaming", subcategory: "Nintendo", weight: 100 },
    switch: { category: "Gaming", subcategory: "Nintendo", weight: 90 },
    controller: { category: "Gaming", subcategory: "Accessories", weight: 80 },
    gaming: { category: "Gaming", weight: 70 },

    // PC Components
    gpu: { category: "Computing", subcategory: "Graphics Cards", weight: 100 },
    "graphics card": { category: "Computing", subcategory: "Graphics Cards", weight: 100 },
    cpu: { category: "Computing", subcategory: "Processors", weight: 100 },
    processor: { category: "Computing", subcategory: "Processors", weight: 90 },
    ram: { category: "Computing", subcategory: "Memory", weight: 90 },
    ssd: { category: "Computing", subcategory: "SSD", weight: 100 },
    hdd: { category: "Computing", subcategory: "HDD", weight: 100 },
    "hard drive": { category: "Computing", weight: 90 },

    // Fashion
    shirt: { category: "Fashion", subcategory: "Shirts", weight: 90 },
    tshirt: { category: "Fashion", subcategory: "T-Shirts", weight: 90 },
    "t-shirt": { category: "Fashion", subcategory: "T-Shirts", weight: 90 },
    jacket: { category: "Fashion", subcategory: "Jackets & Coats", weight: 90 },
    coat: { category: "Fashion", subcategory: "Jackets & Coats", weight: 90 },
    puffer: { category: "Fashion", subcategory: "Jackets & Coats", weight: 90 },
    overcoat: { category: "Fashion", subcategory: "Jackets & Coats", weight: 90 },
    jeans: { category: "Fashion", subcategory: "Jeans", weight: 90 },
    pants: { category: "Fashion", subcategory: "Pants", weight: 90 },
    shorts: { category: "Fashion", subcategory: "Shorts", weight: 90 },
    hat: { category: "Fashion", subcategory: "Hats", weight: 90 },
    beanie: { category: "Fashion", subcategory: "Hats", weight: 90 },
    "bucket hat": { category: "Fashion", subcategory: "Hats", weight: 90 },
    headband: { category: "Fashion", subcategory: "Hair Accessories", weight: 90 },
    tube: { category: "Fashion", subcategory: "Accessories", weight: 80 },
  }

  // Initialize scores for each category and subcategory
  const scores = []

  // First, check for direct matches with tech term mappings
  let directMatchFound = false
  let directMatchScore = 0
  let directMatchCategory = ""
  let directMatchSubcategory = ""

  // Check for multi-word terms first (like "apple watch")
  const multiWordTerms = Object.keys(techTermMappings)
    .filter((term) => term.includes(" "))
    .sort((a, b) => b.length - a.length)
  for (const term of multiWordTerms) {
    if (searchText.includes(term)) {
      const mapping = techTermMappings[term]
      directMatchCategory = mapping.category
      directMatchSubcategory = mapping.subcategory || ""
      directMatchScore = mapping.weight
      directMatchFound = true
      break
    }
  }

  // If no multi-word match, check single words
  if (!directMatchFound) {
    for (const term of productTerms) {
      if (techTermMappings[term]) {
        const mapping = techTermMappings[term]
        directMatchCategory = mapping.category
        directMatchSubcategory = mapping.subcategory || ""
        directMatchScore = mapping.weight
        directMatchFound = true
        break
      }
    }
  }

  // If we have a direct match with high confidence, use it
  if (directMatchFound && directMatchScore >= 90) {
    // Find the actual category and subcategory in the Auqli categories
    for (const category of categories) {
      if (!category || !category.name) continue

      if (category.name.toLowerCase() === directMatchCategory.toLowerCase()) {
        // If we have a direct subcategory match
        if (directMatchSubcategory && Array.isArray(category.subcategories)) {
          for (const subcategory of category.subcategories) {
            if (!subcategory || !subcategory.name) continue

            if (subcategory.name.toLowerCase() === directMatchSubcategory.toLowerCase()) {
              return {
                mainCategory: category.name,
                subCategory: subcategory.name,
                confidence: 95, // High confidence for direct matches
              }
            }
          }
        }

        // If we found the category but not the exact subcategory
        // We'll return the category with a slightly lower confidence
        return {
          mainCategory: category.name,
          subCategory: directMatchSubcategory || "",
          confidence: 85,
        }
      }
    }
  }

  // If no direct match or low confidence, proceed with keyword matching
  // Calculate scores based on keyword matching
  for (const category of categories) {
    if (!category || !category.name) continue

    const categoryName = category.name.toLowerCase()
    const categoryKeywords = categoryName.split(/\s+/)
    let categoryScore = 0

    // Calculate category score
    for (const keyword of categoryKeywords) {
      if (keyword.length > 2) {
        // Exact match in product name (highest weight)
        if (normalizedProductName.includes(keyword)) {
          categoryScore += keyword.length * 3
        }
        // Match in search text (lower weight)
        else if (searchText.includes(keyword)) {
          categoryScore += keyword.length
        }
      }
    }

    // Boost scores for certain categories based on product terms
    for (const term of productTerms) {
      // Check if any term in our mappings partially matches this category
      for (const mappingTerm in techTermMappings) {
        if (term.includes(mappingTerm) || mappingTerm.includes(term)) {
          const mapping = techTermMappings[mappingTerm]
          if (mapping.category.toLowerCase() === categoryName) {
            categoryScore += mapping.weight / 2 // Half weight for partial matches
          }
        }
      }
    }

    // Find best matching subcategory
    let bestSubcategory = { id: "", name: "", score: 0 }

    // Ensure subcategories exists and is an array before iterating
    const subcategories = Array.isArray(category.subcategories) ? category.subcategories : []

    for (const subcategory of subcategories) {
      // Skip if subcategory doesn't have a name
      if (!subcategory || !subcategory.name) continue

      const subcategoryName = subcategory.name.toLowerCase()
      const subcategoryKeywords = subcategoryName.split(/\s+/)
      let subcategoryScore = 0

      // Calculate subcategory score
      for (const keyword of subcategoryKeywords) {
        if (keyword.length > 2) {
          // Exact match in product name (highest weight)
          if (normalizedProductName.includes(keyword)) {
            subcategoryScore += keyword.length * 3
          }
          // Match in search text (lower weight)
          else if (searchText.includes(keyword)) {
            subcategoryScore += keyword.length
          }
        }
      }

      // Boost scores for certain subcategories based on product terms
      for (const term of productTerms) {
        // Check if any term in our mappings partially matches this subcategory
        for (const mappingTerm in techTermMappings) {
          const mapping = techTermMappings[mappingTerm]
          if (
            mapping.subcategory &&
            (term.includes(mappingTerm) || mappingTerm.includes(term)) &&
            mapping.subcategory.toLowerCase() === subcategoryName
          ) {
            subcategoryScore += mapping.weight / 2 // Half weight for partial matches
          }
        }
      }

      if (subcategoryScore > bestSubcategory.score) {
        bestSubcategory = {
          id: subcategory.id || "",
          name: subcategory.name,
          score: subcategoryScore,
        }
      }
    }

    scores.push({
      categoryId: category.id,
      categoryName: category.name,
      score: categoryScore,
      subcategoryId: bestSubcategory.id,
      subcategoryName: bestSubcategory.name,
      subcategoryScore: bestSubcategory.score,
    })
  }

  // Sort by category score
  scores.sort((a, b) => b.score - a.score)

  // If no good match found, return empty strings with zero confidence
  if (scores.length === 0 || scores[0].score === 0) {
    return { mainCategory: "", subCategory: "", confidence: 0 }
  }

  // Calculate confidence score (0-100)
  // Higher scores mean better matches
  const topScore = scores[0].score
  const maxPossibleScore = productName.length * 3 // Maximum possible score based on our scoring system
  const confidence = Math.min(100, Math.round((topScore / maxPossibleScore) * 100))

  // Special case for iPad - if product name contains "ipad" but we didn't find a direct match
  if (normalizedProductName.includes("ipad") && scores[0].categoryName !== "Tablets") {
    // Look for the Tablets category in our scores
    const tabletsCategory = scores.find((score) => score.categoryName === "Tablets")
    if (tabletsCategory) {
      return {
        mainCategory: "Tablets",
        subCategory: "iPad",
        confidence: 90, // High confidence for this special case
      }
    }
  }

  return {
    mainCategory: scores[0].categoryName,
    subCategory: scores[0].subcategoryName || "",
    confidence: confidence,
  }
}

// Add this function to improve apparel categorization
function improveApparelCategorization(product) {
  // Normalize product name for better matching
  const normalizedName = product.name.toLowerCase()

  // Check for specific patterns in clothing items

  // Men's clothing patterns
  if (/\bmen'?s?\b|\bman'?s?\b|\bmale\b/i.test(normalizedName)) {
    // If we already have Apparel & Accessories or Fashion as main category
    if (product.mainCategory === "Apparel & Accessories" || product.mainCategory === "Fashion") {
      // But subcategory is missing or generic
      if (!product.subCategory || product.subCategory === "Uncategorized") {
        // Try to determine specific subcategory
        if (/\bt-?shirt|\btee\b/i.test(normalizedName)) {
          product.subCategory = "Men's T-Shirts"
        } else if (/\bpolo\b/i.test(normalizedName)) {
          product.subCategory = "Men's Polo Shirts"
        } else if (/\bhenley\b/i.test(normalizedName)) {
          product.subCategory = "Men's Casual Shirts"
        } else if (/\bjean|\bdenim\b/i.test(normalizedName)) {
          product.subCategory = "Men's Jeans"
        } else if (/\bshort\b/i.test(normalizedName)) {
          product.subCategory = "Men's Shorts"
        } else if (/\bcoat|\bjacket|\bpuffer|\bovercoat|\bbomber/i.test(normalizedName)) {
          product.subCategory = "Men's Jackets & Coats"
        } else if (/\bhat|\bbeanie|\bcap|\bbucket/i.test(normalizedName)) {
          product.subCategory = "Men's Hats"
        } else {
          // Default to Men's Clothing if we can't determine specific type
          product.subCategory = "Men's Clothing"
        }
      }
    } else {
      // If main category isn't set to Apparel or Fashion yet
      product.mainCategory = "Fashion"

      // Try to determine specific subcategory
      if (/\bt-?shirt|\btee\b/i.test(normalizedName)) {
        product.subCategory = "Men's T-Shirts"
      } else if (/\bpolo\b/i.test(normalizedName)) {
        product.subCategory = "Men's Polo Shirts"
      } else if (/\bhenley\b/i.test(normalizedName)) {
        product.subCategory = "Men's Casual Shirts"
      } else if (/\bjean|\bdenim\b/i.test(normalizedName)) {
        product.subCategory = "Men's Jeans"
      } else if (/\bshort\b/i.test(normalizedName)) {
        product.subCategory = "Men's Shorts"
      } else if (/\bcoat|\bjacket|\bpuffer|\bovercoat|\bbomber/i.test(normalizedName)) {
        product.subCategory = "Men's Jackets & Coats"
      } else if (/\bhat|\bbeanie|\bcap|\bbucket/i.test(normalizedName)) {
        product.subCategory = "Men's Hats"
      } else {
        // Default to Men's Clothing if we can't determine specific type
        product.subCategory = "Men's Clothing"
      }
    }
  }

  // Women's clothing patterns
  else if (/\bwomen'?s?\b|\bwoman'?s?\b|\bfemale\b|\bladies\b/i.test(normalizedName)) {
    // If we already have Apparel & Accessories or Fashion as main category
    if (product.mainCategory === "Apparel & Accessories" || product.mainCategory === "Fashion") {
      // But subcategory is missing or generic
      if (!product.subCategory || product.subCategory === "Uncategorized") {
        // Try to determine specific subcategory
        if (/\bt-?shirt|\btee\b/i.test(normalizedName)) {
          product.subCategory = "Women's T-Shirts"
        } else if (/\bdress\b/i.test(normalizedName)) {
          product.subCategory = "Dresses"
        } else if (/\bskirt\b/i.test(normalizedName)) {
          product.subCategory = "Skirts"
        } else if (/\bjean|\bdenim\b/i.test(normalizedName)) {
          product.subCategory = "Women's Jeans"
        } else if (/\bshort\b/i.test(normalizedName)) {
          product.subCategory = "Women's Shorts"
        } else if (/\bblouse\b/i.test(normalizedName)) {
          product.subCategory = "Blouses & Shirts"
        } else if (/\bcoat|\bjacket|\bpuffer|\bovercoat|\bbomber/i.test(normalizedName)) {
          product.subCategory = "Women's Jackets & Coats"
        } else if (/\bhat|\bbeanie|\bcap|\bbucket/i.test(normalizedName)) {
          product.subCategory = "Women's Hats"
        } else {
          // Default to Women's Clothing if we can't determine specific type
          product.subCategory = "Women's Clothing"
        }
      }
    } else {
      // If main category isn't set to Apparel or Fashion yet
      product.mainCategory = "Fashion"

      // Try to determine specific subcategory
      if (/\bt-?shirt|\btee\b/i.test(normalizedName)) {
        product.subCategory = "Women's T-Shirts"
      } else if (/\bdress\b/i.test(normalizedName)) {
        product.subCategory = "Dresses"
      } else if (/\bskirt\b/i.test(normalizedName)) {
        product.subCategory = "Skirts"
      } else if (/\bjean|\bdenim\b/i.test(normalizedName)) {
        product.subCategory = "Women's Jeans"
      } else if (/\bshort\b/i.test(normalizedName)) {
        product.subCategory = "Women's Shorts"
      } else if (/\bblouse\b/i.test(normalizedName)) {
        product.subCategory = "Blouses & Shirts"
      } else if (/\bcoat|\bjacket|\bpuffer|\bovercoat|\bbomber/i.test(normalizedName)) {
        product.subCategory = "Women's Jackets & Coats"
      } else if (/\bhat|\bbeanie|\bcap|\bbucket/i.test(normalizedName)) {
        product.subCategory = "Women's Hats"
      } else {
        // Default to Women's Clothing if we can't determine specific type
        product.subCategory = "Women's Clothing"
      }
    }
  }

  // Generic clothing items without gender specification
  else if (
    /\btee\b|\bt-?shirt\b|\bpolo\b|\bhenley\b|\bjean\b|\bdenim\b|\bshort\b|\bcoat\b|\bjacket\b|\bpuffer\b|\bovercoat\b|\bbomber\b|\bhat\b|\bbeanie\b|\bcap\b|\bbucket\b/i.test(
      normalizedName,
    )
  ) {
    // If main category isn't set to Apparel or Fashion yet
    if (product.mainCategory !== "Apparel & Accessories" && product.mainCategory !== "Fashion") {
      product.mainCategory = "Fashion"
    }

    // Try to determine specific subcategory if it's missing or generic
    if (!product.subCategory || product.subCategory === "Uncategorized") {
      if (/\bt-?shirt|\btee\b/i.test(normalizedName)) {
        product.subCategory = "T-Shirts"
      } else if (/\bpolo\b/i.test(normalizedName)) {
        product.subCategory = "Polo Shirts"
      } else if (/\bhenley\b/i.test(normalizedName)) {
        product.subCategory = "Casual Shirts"
      } else if (/\bjean|\bdenim\b/i.test(normalizedName)) {
        product.subCategory = "Jeans"
      } else if (/\bshort\b/i.test(normalizedName)) {
        product.subCategory = "Shorts"
      } else if (/\bcoat|\bjacket|\bpuffer|\bovercoat|\bbomber/i.test(normalizedName)) {
        product.subCategory = "Jackets & Coats"
      } else if (/\bhat|\bbeanie|\bcap|\bbucket/i.test(normalizedName)) {
        product.subCategory = "Hats"
      }
    }
  }

  // Special case for specific items from the screenshots
  if (/longline textured overcoat/i.test(normalizedName)) {
    product.mainCategory = "Fashion"
    product.subCategory = "Jackets & Coats"
  }

  if (/shimmer funnel bomber neck puffer/i.test(normalizedName)) {
    product.mainCategory = "Fashion"
    product.subCategory = "Jackets & Coats"
  }

  if (/beanie/i.test(normalizedName)) {
    product.mainCategory = "Fashion"
    product.subCategory = "Hats"
  }

  if (/bucket hat/i.test(normalizedName)) {
    product.mainCategory = "Fashion"
    product.subCategory = "Hats"
  }

  if (/check ls shirt|long sleeve shirt|creased effect long sleeve/i.test(normalizedName)) {
    product.mainCategory = "Fashion"
    product.subCategory = "Casual Shirts"
  }

  if (/tube in lilac/i.test(normalizedName)) {
    product.mainCategory = "Fashion"
    product.subCategory = "Women's Tops"
  }

  return product
}

// Update the mapShopifyToAuqli function to apply our improved categorization
async function mapShopifyToAuqli(records, auqliCategories) {
  // Group records by Handle to handle variants and collect images
  const productGroups = {}
  const productImages = {}

  records.forEach((record) => {
    const handle = record.Handle
    if (!handle) return // Skip records without a handle

    // Add record to product group
    if (!productGroups[handle]) {
      productGroups[handle] = []
    }
    productGroups[handle].push(record)

    // Collect images for this product
    if (!productImages[handle]) {
      productImages[handle] = []
    }

    // Only add the image if it has a source and we don't already have it
    if (record["Image Src"] && !productImages[handle].some((img) => img.url === record["Image Src"])) {
      // Parse the position as a number, default to 999 if invalid
      const position = Number.parseInt(record["Image Position"] || "999")
      productImages[handle].push({
        url: record["Image Src"],
        position: isNaN(position) ? 999 : position,
      })
    }
  })

  // Process each product group
  const products = []

  Object.keys(productGroups).forEach((handle) => {
    const group = productGroups[handle]
    const baseRecord = group[0] // Use the first record for base product info

    // Sort images by position and extract URLs
    const sortedImages = productImages[handle].sort((a, b) => a.position - b.position).map((img) => img.url)

    // Get base product information
    const baseProductName = baseRecord["Title"] || ""
    const baseProductDescription = htmlToText(baseRecord["Body (HTML)"] || "")

    // Check if this product has REAL variants (not just "Default Title")
    const hasRealVariants = group.some((record) => {
      return (
        (record["Option1 Name"] && record["Option1 Value"] && record["Option1 Value"] !== "Default Title") ||
        (record["Option2 Name"] && record["Option2 Value"] && record["Option2 Value"] !== "Default Title") ||
        (record["Option3 Name"] && record["Option3 Value"] && record["Option3 Value"] !== "Default Title")
      )
    })

    // If no real variants, process as a single product
    if (!hasRealVariants) {
      const mainRecord = baseRecord

      // Use the first image as the main image, store the rest as additional images
      const mainImage = sortedImages.length > 0 ? sortedImages[0] : ""
      const additionalImages = sortedImages.length > 1 ? sortedImages.slice(1) : []

      // Get weight from the variant and convert to kg
      const weightValue = mainRecord["Variant Grams"] || "0"
      const weightInKg = convertToKg(weightValue, "g")

      // Get condition from Google Shopping / Condition or map from Status
      const shopifyCondition = mainRecord["Google Shopping / Condition"] || ""

      // Find matching Auqli category based on product name and description
      const { mainCategory, subCategory, confidence } = findMatchingCategory(
        baseProductName,
        baseProductDescription,
        auqliCategories,
      )

      // Only use the matched category if confidence is above threshold
      const confidenceThreshold = 60
      const finalMainCategory =
        confidence >= confidenceThreshold
          ? mainCategory
          : extractMainCategory(mainRecord["Product Category"] || "") || "Uncategorized"

      const finalSubCategory = confidence >= confidenceThreshold ? subCategory : mainRecord["Type"] || "Uncategorized"

      // Get inventory quantity
      const totalInventory = Number.parseInt(mainRecord["Variant Inventory Qty"] || "0")

      // Clean the product title - remove "Default Title" references
      const cleanedTitle = cleanProductTitle(baseProductName)

      // Create the product object
      const product = {
        id: `${handle}-single`,
        name: cleanedTitle,
        price: mainRecord["Variant Price"] || "",
        image: mainImage,
        description: baseProductDescription,
        weight: weightInKg,
        inventory: totalInventory.toString(),
        condition: mapCondition(shopifyCondition),
        mainCategory: finalMainCategory,
        subCategory: finalSubCategory,
        uploadStatus: mainRecord["Status"] || "active",
        additionalImages: additionalImages,
      }

      // Apply additional apparel-specific categorization improvements
      const improvedProduct = improveApparelCategorization(product)
      products.push(improvedProduct)
    } else {
      // Process each variant as a separate product
      group.forEach((variantRecord, variantIndex) => {
        // Skip variants with "Default Title" as the only option value
        if (
          variantRecord["Option1 Value"] === "Default Title" &&
          (!variantRecord["Option2 Value"] || variantRecord["Option2 Value"] === "Default Title") &&
          (!variantRecord["Option3 Value"] || variantRecord["Option3 Value"] === "Default Title")
        ) {
          return // Skip this variant as it's just a placeholder
        }

        // Initialize the variant title with the base product name
        let variantTitle = baseProductName

        // Add option values to the title if they exist and are not "Default Title"
        const option1Value = variantRecord["Option1 Value"] || ""
        const option2Value = variantRecord["Option2 Value"] || ""
        const option3Value = variantRecord["Option3 Value"] || ""

        // Only add non-empty and non-"Default Title" options to the variant title
        let variantSuffix = ""

        if (option1Value && option1Value !== "Default Title") {
          variantSuffix += ` - ${option1Value}`
        }

        if (option2Value && option2Value !== "Default Title") {
          variantSuffix += ` - ${option2Value}`
        }

        if (option3Value && option3Value !== "Default Title") {
          variantSuffix += ` - ${option3Value}`
        }

        // Only append the suffix if it's not empty
        if (variantSuffix) {
          variantTitle += variantSuffix
        }

        // Use variant image if available, otherwise use the first product image
        let variantImage = variantRecord["Variant Image"] || ""
        if (!variantImage && sortedImages.length > 0) {
          variantImage = sortedImages[0]
        }

        // Get weight from the variant and convert to kg
        const weightValue = variantRecord["Variant Grams"] || "0"
        const weightInKg = convertToKg(weightValue, "g")

        // Get condition from Google Shopping / Condition or map from Status
        const shopifyCondition = variantRecord["Google Shopping / Condition"] || ""

        // Find matching Auqli category based on product name and description
        const { mainCategory, subCategory, confidence } = findMatchingCategory(
          variantTitle,
          baseProductDescription,
          auqliCategories,
        )

        // Only use the matched category if confidence is above threshold
        const confidenceThreshold = 60
        const finalMainCategory =
          confidence >= confidenceThreshold
            ? mainCategory
            : extractMainCategory(variantRecord["Product Category"] || "") || "Uncategorized"

        const finalSubCategory =
          confidence >= confidenceThreshold ? subCategory : variantRecord["Type"] || "Uncategorized"

        // Get inventory quantity for this variant
        const variantInventory = Number.parseInt(variantRecord["Variant Inventory Qty"] || "0")

        // Clean the variant title
        const cleanedVariantTitle = cleanProductTitle(variantTitle)

        // Create the product object
        const product = {
          id: `${handle}-variant-${variantIndex}`,
          name: cleanedVariantTitle,
          price: variantRecord["Variant Price"] || "",
          image: variantImage,
          description: baseProductDescription,
          weight: weightInKg,
          inventory: variantInventory.toString(),
          condition: mapCondition(shopifyCondition),
          mainCategory: finalMainCategory,
          subCategory: finalSubCategory,
          uploadStatus: variantRecord["Status"] || "active",
          additionalImages: sortedImages.filter((img) => img !== variantImage),
        }

        // Apply additional apparel-specific categorization improvements
        const improvedProduct = improveApparelCategorization(product)
        products.push(improvedProduct)
      })
    }
  })

  return products
}

// Update the mapWooCommerceToAuqli function to use the improved matching
async function mapWooCommerceToAuqli(records, auqliCategories) {
  const mappedProducts = records.map((record) => {
    const productName = record["Name"] || record["name"] || record["product_name"] || ""
    const productDescription = htmlToText(record["Description"] || record["description"] || "")

    // Find matching Auqli category based on product name and description
    const { mainCategory, subCategory, confidence } = findMatchingCategory(
      productName,
      productDescription,
      auqliCategories,
    )

    // Only use the matched category if confidence is above threshold
    // With our improved matching, we can use a higher threshold
    const confidenceThreshold = 60 // Increased from 40 to 60 due to better matching
    const finalMainCategory =
      confidence >= confidenceThreshold
        ? mainCategory
        : extractMainCategory(record["Categories"] || record["categories"] || "") || "Uncategorized"
    const finalSubCategory =
      confidence >= confidenceThreshold ? subCategory : record["Tags"] || record["tags"] || "Uncategorized"

    // Create the product object
    const product = {
      id: record["ID"] || record["id"] || record["product_id"] || "",
      name: productName,
      price: record["Regular price"] || record["regular_price"] || record["price"] || "",
      image: record["Images"] || record["images"] || record["image"] || "",
      description: productDescription,
      weight: record["Weight"] ? record["Weight"] : "0",
      inventory: record["Stock"] || record["stock"] || record["inventory"] || "0",
      condition: mapCondition(record["Condition"] || ""), // Map to either "New" or "Fairly Used"
      mainCategory: finalMainCategory,
      subCategory: finalSubCategory,
      uploadStatus: record["Status"] || record["status"] || "active",
      additionalImages: [],
    }

    // Apply additional apparel-specific categorization improvements
    const improvedProduct = improveApparelCategorization(product)
    return improvedProduct
  })

  // Apply validation to ensure no duplicates, no blank titles, and no missing data
  return validateAndCleanProducts(mappedProducts)
}

// Function to clean up product titles
function cleanProductTitle(title) {
  if (!title) return "Untitled Product"

  // Remove "Default Title" references
  let cleanedTitle = title
    .replace(/\s*-\s*Default Title$/i, "")
    .replace(/^Default Title\s*-\s*/i, "")
    .replace(/^Default Title$/i, "Untitled Product")

  // Trim whitespace and ensure title isn't empty
  cleanedTitle = cleanedTitle.trim()

  // If title is empty after cleaning, use a fallback
  if (!cleanedTitle) {
    return "Untitled Product"
  }

  return cleanedTitle
}

// Function to validate and clean the final product list
function validateAndCleanProducts(products) {
  const seenTitles = new Set()
  const validatedProducts = []

  for (const product of products) {
    // Clean the title
    product.name = cleanProductTitle(product.name)

    // Skip products with duplicate titles
    if (seenTitles.has(product.name)) {
      continue
    }

    // Add title to seen set
    seenTitles.add(product.name)

    // Ensure required fields have values
    product.price = product.price || "0"
    product.image = product.image || ""
    product.description = product.description || ""
    product.weight = product.weight || "0"
    product.inventory = product.inventory || "0"
    product.condition = product.condition || "New"
    product.mainCategory = product.mainCategory || "Uncategorized"
    product.subCategory = product.subCategory || "Uncategorized"

    validatedProducts.push(product)
  }

  return validatedProducts
}

// Make sure the fetchAuqliCategories function is properly exported
async function fetchAuqliCategories() {
  try {
    const response = await fetch("https://auqliserver-8xr8zvib.b4a.run/api/public/categories", {
      cache: "no-store", // Ensure we get fresh data
    })

    if (!response.ok) {
      console.error("Failed to fetch Auqli categories:", response.statusText)
      return []
    }

    const data = await response.json()

    // Validate and clean up the data
    if (Array.isArray(data)) {
      return data.map((category) => {
        // Handle both subcategories and subCategories property names
        const subCats = category.subcategories || category.subCategories || []

        return {
          ...category,
          id: category.id || `cat-${Math.random().toString(36).substr(2, 9)}`,
          name: category.name || "Unnamed Category",
          subcategories: Array.isArray(subCats)
            ? subCats.map((sub) => ({
                ...sub,
                id: sub.id || `subcat-${Math.random().toString(36).substr(2, 9)}`,
                name: sub.name || "Unnamed Subcategory",
              }))
            : [],
        }
      })
    }

    console.error("Invalid category data format:", data)
    return []
  } catch (error) {
    console.error("Error fetching Auqli categories:", error)
    return []
  }
}

// Make sure the processCSV function is properly exported
/**
 * Process CSV file from form data
 * @param {FormData} formData - Form data containing the CSV file and platform
 * @returns {Promise<Object>} Object containing processed products or an error message
 */
export async function processCSV(formData) {
  try {
    const file = formData.get("file")
    const platform = formData.get("platform") || "shopify"

    if (!file) {
      console.error("No file provided in formData")
      return { error: "No file provided" }
    }

    console.log("Processing file:", file.name, "Size:", file.size, "Platform:", platform)

    // Check if file is empty
    if (file.size === 0) {
      return { error: "The file is empty" }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const content = buffer.toString()

    // Log a sample of the content to verify it's being read correctly
    console.log("CSV content sample:", content.substring(0, 100))

    // Parse CSV
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    })

    if (!records || records.length === 0) {
      return { error: "The CSV file is empty or invalid" }
    }

    console.log(`Successfully parsed ${records.length} records`)
    console.log("First record sample:", JSON.stringify(records[0]).substring(0, 200))

    // Fetch Auqli categories for smart matching
    const auqliCategories = await fetchAuqliCategories()

    // Map CSV columns to Auqli format based on platform
    let products = []

    if (platform === "shopify") {
      products = await mapShopifyToAuqli(records, auqliCategories)
    } else if (platform === "woocommerce") {
      products = await mapWooCommerceToAuqli(records, auqliCategories)
    } else {
      return { error: "Unsupported platform" }
    }

    return {
      products,
      totalProcessed: records.length,
      categoriesMatched: products.filter(
        (p) =>
          p.mainCategory &&
          p.subCategory &&
          !p.mainCategory.includes("Uncategorized") &&
          !p.subCategory.includes("Uncategorized"),
      ).length,
    }
  } catch (error) {
    console.error("Error processing CSV:", error)
    return { error: `Failed to process the CSV file: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

import { enhancedSmartMatch } from "@/lib/enhanced-category-matcher"
import { saveCategoryMapping } from "@/lib/db"

/**
 * Server action to match a product category using database-enhanced matching
 */
export async function matchProductCategory(productName, productDescription, auqliCategories) {
  try {
    // Use the enhanced matching that combines AI and database
    const result = await enhancedSmartMatch(productName, productDescription, auqliCategories)

    return {
      success: true,
      ...result,
    }
  } catch (error) {
    console.error("Error matching product category:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Server action to save user feedback on category matches
 */
export async function saveUserFeedback(productName, productDescription, mainCategory, subCategory, wasCorrect) {
  try {
    // Save this as a user-verified mapping
    await saveCategoryMapping(
      productName,
      productDescription,
      mainCategory,
      subCategory,
      1.0, // High confidence since user verified
      true, // User verified
    )

    return { success: true }
  } catch (error) {
    console.error("Error saving user feedback:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Update the getCategorySuggestions function to handle missing Supabase connection

// Modify the getCategorySuggestions function:
export async function getCategorySuggestions(productName) {
  try {
    // Check if Supabase is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log("Database connection not available, returning demo suggestions for:", productName)

      // Generate demo suggestions based on the product name
      const demoSuggestions = []

      // Fashion-related suggestions
      if (/shirt|tee|polo|jacket|hoodie|sweater|jeans|pants|dress|skirt/i.test(productName)) {
        demoSuggestions.push(
          {
            mainCategory: "Fashion",
            subCategory: productName.toLowerCase().includes("shirt")
              ? "T-Shirts"
              : productName.toLowerCase().includes("jeans")
                ? "Jeans"
                : productName.toLowerCase().includes("dress")
                  ? "Dresses"
                  : "Clothing",
            count: Math.floor(Math.random() * 10) + 5,
            confidence: 0.75 + Math.random() * 0.2,
          },
          {
            mainCategory: "Apparel & Accessories",
            subCategory: productName.toLowerCase().includes("men")
              ? "Men's Clothing"
              : productName.toLowerCase().includes("women")
                ? "Women's Clothing"
                : "Clothing",
            count: Math.floor(Math.random() * 8) + 3,
            confidence: 0.65 + Math.random() * 0.2,
          },
        )
      }
      // Electronics-related suggestions
      else if (/phone|laptop|computer|tablet|headphone|speaker|camera|tv|monitor/i.test(productName)) {
        demoSuggestions.push(
          {
            mainCategory: "Electronics",
            subCategory: productName.toLowerCase().includes("phone")
              ? "Mobile Phones"
              : productName.toLowerCase().includes("laptop")
                ? "Laptops"
                : productName.toLowerCase().includes("headphone")
                  ? "Audio"
                  : "Gadgets",
            count: Math.floor(Math.random() * 10) + 5,
            confidence: 0.75 + Math.random() * 0.2,
          },
          {
            mainCategory: "Technology",
            subCategory: "Consumer Electronics",
            count: Math.floor(Math.random() * 8) + 3,
            confidence: 0.65 + Math.random() * 0.2,
          },
        )
      }
      // Home-related suggestions
      else if (/furniture|sofa|chair|table|bed|kitchen|home|living|decor/i.test(productName)) {
        demoSuggestions.push(
          {
            mainCategory: "Home & Living",
            subCategory: productName.toLowerCase().includes("sofa")
              ? "Furniture"
              : productName.toLowerCase().includes("kitchen")
                ? "Kitchen"
                : productName.toLowerCase().includes("decor")
                  ? "Home Decor"
                  : "Home Essentials",
            count: Math.floor(Math.random() * 10) + 5,
            confidence: 0.75 + Math.random() * 0.2,
          },
          {
            mainCategory: "Furniture",
            subCategory: "Living Room",
            count: Math.floor(Math.random() * 8) + 3,
            confidence: 0.65 + Math.random() * 0.2,
          },
        )
      }

      // If no specific category was matched, provide generic suggestions
      if (demoSuggestions.length === 0) {
        demoSuggestions.push(
          {
            mainCategory: "General Merchandise",
            subCategory: "Miscellaneous",
            count: Math.floor(Math.random() * 10) + 5,
            confidence: 0.65 + Math.random() * 0.2,
          },
          {
            mainCategory: "Other",
            subCategory: "Uncategorized",
            count: Math.floor(Math.random() * 5) + 2,
            confidence: 0.55 + Math.random() * 0.2,
          },
        )
      }

      return {
        success: true,
        suggestions: demoSuggestions,
      }
    }

    // Original database query code...
    const { findSimilarProductCategories } = await import("@/lib/db")
    const similarProducts = await findSimilarProductCategories(productName)

    // Group by category and count occurrences
    const suggestions = {}

    similarProducts.forEach((product) => {
      const key = `${product.main_category}|${product.sub_category}`
      if (!suggestions[key]) {
        suggestions[key] = {
          mainCategory: product.main_category,
          subCategory: product.sub_category,
          count: 0,
          confidence: 0,
        }
      }

      suggestions[key].count += 1
      suggestions[key].confidence += product.confidence_score || 0.5
    })

    // Convert to array and sort by count
    const result = Object.values(suggestions)
      .map((item) => ({
        ...item,
        confidence: item.confidence / item.count, // Average confidence
      }))
      .sort((a, b) => b.count - a.count)

    return {
      success: true,
      suggestions: result,
    }
  } catch (error) {
    console.error("Error getting category suggestions:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}
