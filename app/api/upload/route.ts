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
  const apparelCategory = findApparelCategoryForImprovement(auqliCategories)

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
function findApparelCategoryForImprovement(auqliCategories: any[]): string {
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
    return { mainCategory: "Uncategorized", subCategory: "Uncategorized", confidence: 0 }
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
    // Find the matching Auqli category - STRICT VALIDATION
    const validCategory = validateCategoryAgainstAuqli(bestCategoryMatch, categories)

    if (validCategory !== "Uncategorized") {
      // Find the category object
      const categoryObj = categories.find((cat) => cat.name === validCategory)

      // Find best matching subcategory
      let bestSubcategory = "Uncategorized"
      let bestSubcategoryScore = 0

      if (categoryObj && Array.isArray(categoryObj.subcategories)) {
        for (const subcategory of categoryObj.subcategories) {
          if (!subcategory || !subcategory.name) continue

          const subcategoryName = subcategory.name.toLowerCase()
          let subcategoryScore = 0

          // Check for matches in product name and description
          if (normalizedProductName.includes(subcategoryName)) {
            subcategoryScore += subcategoryName.length * 3
          } else if (searchText.includes(subcategoryName)) {
            subcategoryScore += subcategoryName.length
          }

          if (subcategoryScore > bestSubcategoryScore) {
            bestSubcategoryScore = subcategoryScore
            bestSubcategory = subcategory.name
          }
        }

        // If no good subcategory match, use the first subcategory
        if (bestSubcategory === "Uncategorized" && categoryObj.subcategories.length > 0) {
          bestSubcategory = categoryObj.subcategories[0].name
        }
      }

      // Calculate confidence based on category score
      const maxPossibleScore = productName.length * 3
      const confidence = Math.min(100, Math.round((bestCategoryScore / maxPossibleScore) * 100))

      return {
        mainCategory: validCategory,
        subCategory: bestSubcategory,
        confidence: confidence,
      }
    }
  }

  // If no match found with our dictionary or no valid match in Auqli categories,
  // return Uncategorized
  return { mainCategory: "Uncategorized", subCategory: "Uncategorized", confidence: 0 }
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

  // If no exact match, return "Uncategorized"
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
    // Get product name
    const productName = record["Name"] || ""

    // Combine short description and description
    const shortDesc = record["Short description"] || ""
    const fullDesc = record["Description"] || ""
    const combinedDescription = shortDesc ? shortDesc + (fullDesc ? "\n\n" + fullDesc : "") : fullDesc

    // Process as HTML to plain text
    const productDescription = htmlToText(combinedDescription)

    // Use Sale Price if available, otherwise use Regular Price
    const salePrice = record["Sale price"] || ""
    const regularPrice = record["Regular price"] || ""
    const price = salePrice || regularPrice || "0"

    // Clean up price (remove commas, currency symbols, etc.)
    const cleanedPrice = price.toString().replace(/[^\d.]/g, "")

    // Get stock quantity
    const inventory = record["Stock"] || record["In stock?"] || "0"

    // Get image URL
    const image = record["Images"] || ""

    // Get weight (convert to kg if needed)
    const weight = record["Weight (kg)"] || "0"

    // Find matching Auqli category based on product name and description
    // Also consider Categories and Brands fields for better matching
    const categories = record["Categories"] || ""
    const brands = record["Brands"] || ""
    const tags = record["Tags"] || ""

    // Combine all category information for better matching
    const categoryInfo = `${categories} ${brands} ${tags}`

    const { mainCategory, subCategory, confidence } = findMatchingCategory(
      productName,
      productDescription + " " + categoryInfo,
      auqliCategories,
    )

    // Extract category from WooCommerce categories field
    const extractedCategory = extractMainCategory(categoryInfo, auqliCategories)

    // Use the matched category if confidence is above threshold, otherwise use extracted category
    // If both fail, use "Uncategorized"
    const confidenceThreshold = 60
    const finalMainCategory =
      confidence >= confidenceThreshold ? mainCategory : extractedCategory !== "" ? extractedCategory : "Uncategorized"

    // Ensure the subcategory is valid for the main category
    let finalSubCategory = subCategory

    if (finalMainCategory !== "Uncategorized") {
      const categoryObj = auqliCategories.find((cat) => cat.name === finalMainCategory)
      if (categoryObj && Array.isArray(categoryObj.subcategories)) {
        // Check if the subcategory exists in this category
        const validSubcategory = categoryObj.subcategories.find(
          (sub) => sub.name && sub.name.toLowerCase() === subCategory.toLowerCase(),
        )

        if (!validSubcategory) {
          // If not valid, use the first subcategory or "Uncategorized"
          finalSubCategory = categoryObj.subcategories.length > 0 ? categoryObj.subcategories[0].name : "Uncategorized"
        }
      } else {
        finalSubCategory = "Uncategorized"
      }
    } else {
      finalSubCategory = "Uncategorized"
    }

    // Determine product condition (default to "New")
    const condition = "New"

    // Determine upload status
    const uploadStatus = record["Published"] === "1" ? "active" : "inactive"

    // Clean the product title
    const cleanedTitle = cleanProductTitle(productName)

    return {
      id: record["ID"] || `wc-${Math.random().toString(36).substring(2, 9)}`,
      name: cleanedTitle,
      price: cleanedPrice,
      image: image,
      description: productDescription,
      weight: weight,
      inventory: inventory,
      condition: condition,
      mainCategory: finalMainCategory,
      subCategory: finalSubCategory,
      uploadStatus: uploadStatus,
      additionalImages: [],
      sku: record["SKU"] || "",
    }
  })

  // Apply validation to ensure no duplicates, no blank titles, and no missing data
  const validatedProducts = validateAndCleanProducts(mappedProducts)

  // Apply the same apparel categorization improvements with strict validation
  const improvedProducts = validatedProducts.map((product) => {
    const improved = improveApparelCategorization(product, auqliCategories)

    // Final validation to ensure categories exist in Auqli
    improved.mainCategory = validateCategoryAgainstAuqli(improved.mainCategory, auqliCategories)

    if (improved.mainCategory !== "Uncategorized") {
      const categoryObj = auqliCategories.find((cat) => cat.name === improved.mainCategory)
      if (categoryObj && Array.isArray(categoryObj.subcategories)) {
        const validSubcategory = categoryObj.subcategories.find(
          (sub) => sub.name && sub.name.toLowerCase() === improved.subCategory.toLowerCase(),
        )

        if (!validSubcategory) {
          improved.subCategory =
            categoryObj.subcategories.length > 0 ? categoryObj.subcategories[0].name : "Uncategorized"
        }
      } else {
        improved.subCategory = "Uncategorized"
      }
    } else {
      improved.subCategory = "Uncategorized"
    }

    return improved
  })

  return improvedProducts
}

// Update the findValidApparelCategory function to be more strict
function findApparelCategory(auqliCategories: any[]): string {
  // List of possible apparel category names to check
  const apparelCategoryNames = ["Apparel & Accessories", "Apparel", "Clothing", "Fashion", "Clothes", "Garments"]

  // Check if any of these categories exist in auqliCategories - EXACT MATCH ONLY
  for (const categoryName of apparelCategoryNames) {
    const category = auqliCategories.find((cat) => cat.name && cat.name.toLowerCase() === categoryName.toLowerCase())

    if (category) {
      return category.name
    }
  }

  // If no exact match, return null
  return null
}
