import { type NextRequest, NextResponse } from "next/server"
import { parse } from "csv-parse/sync"

// Define types inline if they're not properly imported
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
 * @property {string} sku
 */

// Import the smartMatchCategories at the top of the file
import { htmlToText, extractMainCategory, convertToKg, mapCondition, smartMatchCategories } from "@/lib/utils"

// Define the expected Auqli CSV headers
const AUQLI_REQUIRED_HEADERS = [
  "product name",
  "product main price",
  "product main image",
  "product description",
  "product weight",
  "product inventory",
  "product condition",
  "product main category",
  "product subcategory",
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const platform = (formData.get("platform") as string) || "shopify"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check if file is empty
    if (file.size === 0) {
      return NextResponse.json({ error: "The file is empty" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const content = buffer.toString()

    // Parse CSV
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    })

    if (!records || records.length === 0) {
      return NextResponse.json({ error: "The CSV file is empty or invalid" }, { status: 400 })
    }

    // Check if this is already an Auqli-formatted file
    const firstRecord = records[0]
    const headers = Object.keys(firstRecord).map((h) => h.toLowerCase().trim())

    // Check if all required Auqli headers are present
    const isAuqliFormatted = AUQLI_REQUIRED_HEADERS.every((requiredHeader) =>
      headers.some((header) => header === requiredHeader),
    )

    if (isAuqliFormatted) {
      console.log("Detected Auqli-formatted file")
      return NextResponse.json({
        isAuqliFormatted: true,
        products: records,
        message: "This file appears to be already formatted for Auqli.",
      })
    }

    // Fetch Auqli categories for smart matching
    const categoriesResponse = await fetch("https://api.auqli.live/api/public/categories", {
      cache: "no-store",
    })

    let auqliCategories: any[] = []
    if (categoriesResponse.ok) {
      const data = await categoriesResponse.json()
      if (Array.isArray(data)) {
        auqliCategories = data
      }
    }

    // Map CSV columns to Auqli format based on platform
    let products: Product[] = []

    if (platform === "shopify") {
      products = await mapShopifyToAuqli(records, auqliCategories)
    } else if (platform === "woocommerce") {
      products = await mapWooCommerceToAuqli(records, auqliCategories)
    } else {
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 })
    }

    // Final validation to ensure no duplicates, no blank titles, and no missing data
    const validatedProducts = validateAndCleanProducts(products)

    // Add a final validation step to ensure all categories are valid Auqli categories
    const finalValidatedProducts = validatedProducts.map((product) => {
      // Validate main category
      const validMainCategory = validateCategoryAgainstAuqli(product.mainCategory, auqliCategories)

      // If main category is valid, validate subcategory
      let validSubCategory = product.subCategory
      if (validMainCategory !== "Uncategorized") {
        const categoryObj = auqliCategories.find((cat) => cat.name === validMainCategory)
        if (categoryObj && Array.isArray(categoryObj.subcategories)) {
          const subCatMatch = categoryObj.subcategories.find(
            (sub) => sub.name && sub.name.toLowerCase() === product.subCategory.toLowerCase(),
          )

          if (subCatMatch) {
            validSubCategory = subCatMatch.name
          } else {
            validSubCategory = "Uncategorized"
          }
        } else {
          validSubCategory = "Uncategorized"
        }
      } else {
        validSubCategory = "Uncategorized"
      }

      return {
        ...product,
        mainCategory: validMainCategory,
        subCategory: validSubCategory,
      }
    })

    return NextResponse.json({
      products: finalValidatedProducts,
      totalProcessed: records.length,
    })
  } catch (error: any) {
    console.error("Error processing CSV:", error)
    return NextResponse.json(
      { error: `Failed to process the CSV file: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
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
function validateAndCleanProducts(products: Product[]) {
  const seenTitles = new Set()
  const validatedProducts: Product[] = []

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

// First, let's modify the improveApparelCategorization function to only use valid Auqli categories

// Replace the improveApparelCategorization function with this improved version:
function improveApparelCategorization(product: Product, auqliCategories: any[]): Product {
  // First, check if "Apparel & Accessories" or similar category exists in Auqli categories
  const apparelCategory = findValidApparelCategory(auqliCategories)

  if (!apparelCategory) {
    // If no valid apparel category exists in Auqli categories, don't modify the product
    return product
  }

  // Normalize product name for better matching
  const normalizedName = product.name.toLowerCase()

  // Check for specific patterns in clothing items
  // Men's clothing patterns
  if (/\bmen'?s?\b|\bman'?s?\b|\bmale\b/i.test(normalizedName)) {
    // If we already have a valid apparel category as main category
    if (product.mainCategory === apparelCategory) {
      // But subcategory is missing or generic
      if (!product.subCategory || product.subCategory === "Uncategorized") {
        // Try to determine specific subcategory
        if (/\bt-?shirt|\btee\b/i.test(normalizedName)) {
          product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Men's T-Shirts")
        } else if (/\bpolo\b/i.test(normalizedName)) {
          product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Men's Polo Shirts")
        } else if (/\bhenley\b/i.test(normalizedName)) {
          product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Men's Casual Shirts")
        } else if (/\bjean|\bdenim\b/i.test(normalizedName)) {
          product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Men's Jeans")
        } else if (/\bshort\b/i.test(normalizedName)) {
          product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Men's Shorts")
        } else {
          // Default to Men's Clothing if we can't determine specific type
          product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Men's Clothing")
        }
      }
    } else {
      // If main category isn't set to Apparel yet
      product.mainCategory = apparelCategory

      // Try to determine specific subcategory
      if (/\bt-?shirt|\btee\b/i.test(normalizedName)) {
        product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Men's T-Shirts")
      } else if (/\bpolo\b/i.test(normalizedName)) {
        product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Men's Polo Shirts")
      } else if (/\bhenley\b/i.test(normalizedName)) {
        product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Men's Casual Shirts")
      } else if (/\bjean|\bdenim\b/i.test(normalizedName)) {
        product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Men's Jeans")
      } else if (/\bshort\b/i.test(normalizedName)) {
        product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Men's Shorts")
      } else {
        // Default to Men's Clothing if we can't determine specific type
        product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Men's Clothing")
      }
    }
  }

  // Women's clothing patterns - similar logic with valid subcategory checks
  else if (/\bwomen'?s?\b|\bwoman'?s?\b|\bfemale\b|\bladies\b/i.test(normalizedName)) {
    // If we already have a valid apparel category as main category
    if (product.mainCategory === apparelCategory) {
      // But subcategory is missing or generic
      if (!product.subCategory || product.subCategory === "Uncategorized") {
        // Try to determine specific subcategory with validation
        if (/\bt-?shirt|\btee\b/i.test(normalizedName)) {
          product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Women's T-Shirts")
        } else if (/\bdress\b/i.test(normalizedName)) {
          product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Dresses")
        } else if (/\bskirt\b/i.test(normalizedName)) {
          product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Skirts")
        } else if (/\bjean|\bdenim\b/i.test(normalizedName)) {
          product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Women's Jeans")
        } else if (/\bshort\b/i.test(normalizedName)) {
          product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Women's Shorts")
        } else if (/\bblouse\b/i.test(normalizedName)) {
          product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Blouses & Shirts")
        } else {
          // Default to Women's Clothing if we can't determine specific type
          product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Women's Clothing")
        }
      }
    } else {
      // If main category isn't set to Apparel yet
      product.mainCategory = apparelCategory

      // Try to determine specific subcategory with validation
      if (/\bt-?shirt|\btee\b/i.test(normalizedName)) {
        product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Women's T-Shirts")
      } else if (/\bdress\b/i.test(normalizedName)) {
        product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Dresses")
      } else if (/\bskirt\b/i.test(normalizedName)) {
        product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Skirts")
      } else if (/\bjean|\bdenim\b/i.test(normalizedName)) {
        product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Women's Jeans")
      } else if (/\bshort\b/i.test(normalizedName)) {
        product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Women's Shorts")
      } else if (/\bblouse\b/i.test(normalizedName)) {
        product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Blouses & Shirts")
      } else {
        // Default to Women's Clothing if we can't determine specific type
        product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Women's Clothing")
      }
    }
  }

  // Generic clothing items without gender specification
  else if (/\btee\b|\bt-?shirt\b|\bpolo\b|\bhenley\b|\bjean\b|\bdenim\b|\bshort\b/i.test(normalizedName)) {
    product.mainCategory = apparelCategory

    // Try to determine specific subcategory with validation
    if (/\bt-?shirt|\btee\b/i.test(normalizedName)) {
      product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "T-Shirts")
    } else if (/\bpolo\b/i.test(normalizedName)) {
      product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Polo Shirts")
    } else if (/\bhenley\b/i.test(normalizedName)) {
      product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Casual Shirts")
    } else if (/\bjean|\bdenim\b/i.test(normalizedName)) {
      product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Jeans")
    } else if (/\bshort\b/i.test(normalizedName)) {
      product.subCategory = findValidSubcategory(auqliCategories, apparelCategory, "Shorts")
    }
  }

  return product
}

// Add these helper functions to find valid categories and subcategories
function findValidApparelCategory(auqliCategories: any[]): string {
  // List of possible apparel category names to check
  const apparelCategoryNames = ["Apparel & Accessories", "Apparel", "Clothing", "Fashion", "Clothes", "Garments"]

  // Check if any of these categories exist in auqliCategories
  for (const categoryName of apparelCategoryNames) {
    const category = auqliCategories.find((cat) => cat.name && cat.name.toLowerCase() === categoryName.toLowerCase())

    if (category) {
      return category.name
    }
  }

  // If no exact match, try partial matches
  for (const categoryName of apparelCategoryNames) {
    const category = auqliCategories.find(
      (cat) => cat.name && cat.name.toLowerCase().includes(categoryName.toLowerCase()),
    )

    if (category) {
      return category.name
    }
  }

  // If still no match, return null
  return null
}

function findValidSubcategory(auqliCategories: any[], mainCategory: string, preferredSubcategory: string): string {
  // Find the main category object
  const categoryObj = auqliCategories.find((cat) => cat.name === mainCategory)

  if (!categoryObj || !Array.isArray(categoryObj.subcategories)) {
    return "Uncategorized"
  }

  // Check for exact match
  const exactMatch = categoryObj.subcategories.find(
    (sub) => sub.name && sub.name.toLowerCase() === preferredSubcategory.toLowerCase(),
  )

  if (exactMatch) {
    return exactMatch.name
  }

  // Check for partial match
  const partialMatch = categoryObj.subcategories.find(
    (sub) => sub.name && sub.name.toLowerCase().includes(preferredSubcategory.toLowerCase()),
  )

  if (partialMatch) {
    return partialMatch.name
  }

  // If no match found, return the first subcategory or "Uncategorized"
  return categoryObj.subcategories.length > 0 ? categoryObj.subcategories[0].name : "Uncategorized"
}

// Find the findMatchingCategory function and update it to use our expanded dictionary

// Replace the findMatchingCategory function with this enhanced version
function findMatchingCategory(
  productName: string,
  productDescription: string,
  categories: any[],
): { mainCategory: string; subCategory: string; confidence: number } {
  if (!categories || categories.length === 0) {
    return { mainCategory: "", subCategory: "", confidence: 0 }
  }

  // Normalize input text for better matching
  const normalizeText = (text: string) => {
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
  const techTermMappings: { [key: string]: { category: string; subcategory?: string; weight: number } } = {
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

    // Kitchen
    blender: { category: "Home & Living", subcategory: "Small Appliances", weight: 90 },
    mixer: { category: "Home & Living", subcategory: "Small Appliances", weight: 90 },
    toaster: { category: "Home & Living", subcategory: "Small Appliances", weight: 90 },
    coffee: { category: "Home & Living", subcategory: "Coffee & Tea", weight: 90 },

    // Health & Beauty
    skincare: { category: "Health & Beauty", subcategory: "Skin Care", weight: 90 },
    makeup: { category: "Health & Beauty", subcategory: "Makeup", weight: 90 },
    hair: { category: "Health & Beauty", subcategory: "Hair Care", weight: 90 },
    fragrance: { category: "Health & Beauty", subcategory: "Fragrances", weight: 90 },

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

  // At the end of the function, validate the returned category
  const result = {
    mainCategory: scores[0].categoryName,
    subCategory: scores[0].subcategoryName || "",
    confidence: confidence,
  }

  // Validate that the mainCategory exists in the Auqli categories
  const validMainCategory = validateCategoryAgainstAuqli(result.mainCategory, categories)

  // If the mainCategory is not valid, return "Uncategorized"
  if (validMainCategory === "Uncategorized") {
    return {
      mainCategory: "Uncategorized",
      subCategory: "Uncategorized",
      confidence: 0,
    }
  }

  // If the mainCategory is valid, validate the subCategory
  const categoryObj = categories.find((cat) => cat.name === validMainCategory)
  if (categoryObj && Array.isArray(categoryObj.subcategories)) {
    const validSubCategory = categoryObj.subcategories.find(
      (sub) => sub.name && sub.name.toLowerCase() === result.subCategory.toLowerCase(),
    )

    if (!validSubCategory) {
      // If no exact match, try to find a partial match
      const partialMatch = categoryObj.subcategories.find(
        (sub) =>
          sub.name &&
          (sub.name.toLowerCase().includes(result.subCategory.toLowerCase()) ||
            result.subCategory.toLowerCase().includes(sub.name.toLowerCase())),
      )

      if (partialMatch) {
        result.subCategory = partialMatch.name
      } else {
        // If no match found, use the first subcategory or "Uncategorized"
        result.subCategory = categoryObj.subcategories.length > 0 ? categoryObj.subcategories[0].name : "Uncategorized"
      }
    }
  } else {
    result.subCategory = "Uncategorized"
  }

  return {
    mainCategory: validMainCategory,
    subCategory: result.subCategory,
    confidence: result.confidence,
  }
}

// Now let's update the extractMainCategory function to validate against Auqli categories

// Add this function to validate extracted categories against Auqli categories
function validateCategoryAgainstAuqli(categoryName: string, auqliCategories: any[]): string {
  if (!categoryName) return "Uncategorized"

  // Check for exact match
  const exactMatch = auqliCategories.find((cat) => cat.name && cat.name.toLowerCase() === categoryName.toLowerCase())

  if (exactMatch) {
    return exactMatch.name
  }

  // Check for partial match
  const partialMatch = auqliCategories.find(
    (cat) =>
      cat.name &&
      (cat.name.toLowerCase().includes(categoryName.toLowerCase()) ||
        categoryName.toLowerCase().includes(cat.name.toLowerCase())),
  )

  if (partialMatch) {
    return partialMatch.name
  }

  // If no match found, return "Uncategorized"
  return "Uncategorized"
}

// Update the mapShopifyToAuqli function to handle the new requirements
async function mapShopifyToAuqli(records: any[], auqliCategories: any[]): Promise<Product[]> {
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
  const products: Product[] = []

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
          : extractMainCategory(mainRecord["Product Category"] || "", auqliCategories) || "Uncategorized"

      const finalSubCategory = confidence >= confidenceThreshold ? subCategory : mainRecord["Type"] || "Uncategorized"

      // Get inventory quantity
      const totalInventory = Number.parseInt(mainRecord["Variant Inventory Qty"] || "0")

      // Clean the product title - remove "Default Title" references
      const cleanedTitle = cleanProductTitle(baseProductName)

      products.push({
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
        sku: mainRecord["Variant SKU"] || "",
      })
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
            : extractMainCategory(variantRecord["Product Category"] || "", auqliCategories) || "Uncategorized"

        const finalSubCategory =
          confidence >= confidenceThreshold ? subCategory : variantRecord["Type"] || "Uncategorized"

        // Get inventory quantity for this variant
        const variantInventory = Number.parseInt(variantRecord["Variant Inventory Qty"] || "0")

        // Clean the variant title
        const cleanedVariantTitle = cleanProductTitle(variantTitle)

        products.push({
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
          sku: variantRecord["Variant SKU"] || "",
        })
      })
    }
  })

  // Apply additional apparel-specific categorization improvements
  // Update this line to pass auqliCategories to improveApparelCategorization
  const improvedProducts = products.map((product) => improveApparelCategorization(product, auqliCategories))

  return improvedProducts
}

// Update the mapWooCommerceToAuqli function to use the improved matching
async function mapWooCommerceToAuqli(records: any[], auqliCategories: any[]): Promise<Product[]> {
  // Map WooCommerce CSV columns to Auqli format
  const mappedProducts = records.map((record) => {
    const productName = record["Name"] || record["name"] || ""
    const productDescription = htmlToText(record["Description"] || record["description"] || "")

    // Use Sale Price if available, otherwise use Regular Price
    const price =
      record["Sale Price"] || record["sale price"] || record["Regular Price"] || record["regular price"] || "0"

    // Clean up price (remove commas, currency symbols, etc.)
    const cleanedPrice = price.toString().replace(/[^\d.]/g, "")

    // Get stock quantity
    const inventory = record["Stock Quantity"] || record["stock quantity"] || record["Stock"] || record["stock"] || "0"

    // Get image URL
    const image = record["Images"] || record["images"] || ""

    // Find matching Auqli category based on product name and description
    const { mainCategory, subCategory, confidence } = findMatchingCategory(
      productName,
      productDescription,
      auqliCategories,
    )

    // Only use the matched category if confidence is above threshold
    const confidenceThreshold = 60
    const finalMainCategory =
      confidence >= confidenceThreshold
        ? mainCategory
        : extractMainCategory(record["Categories"] || record["categories"] || "", auqliCategories) || "Uncategorized"

    const finalSubCategory = confidence >= confidenceThreshold ? subCategory : "Uncategorized"

    // Clean the product title
    const cleanedTitle = cleanProductTitle(productName)

    return {
      id: record["ID"] || record["id"] || `wc-${Math.random().toString(36).substring(2, 9)}`,
      name: cleanedTitle,
      price: cleanedPrice,
      image: image,
      description: productDescription,
      weight: record["Weight"] || record["weight"] || "0",
      inventory: inventory,
      condition: mapCondition(record["Condition"] || record["condition"] || "New"),
      mainCategory: finalMainCategory,
      subCategory: finalSubCategory,
      uploadStatus: "active",
      additionalImages: [],
      sku: record["SKU"] || record["sku"] || "",
    }
  })

  // Apply validation to ensure no duplicates, no blank titles, and no missing data
  const validatedProducts = validateAndCleanProducts(mappedProducts)

  // Apply the same apparel categorization improvements
  const improvedProducts = validatedProducts.map((product) => improveApparelCategorization(product, auqliCategories))

  return improvedProducts
}
