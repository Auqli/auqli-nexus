import { type NextRequest, NextResponse } from "next/server"
import { parse } from "csv-parse/sync"
import type { AuqliCategory, Product } from "@/types"

// Import necessary utility functions
import { htmlToText } from "@/lib/utils"
import { extractMainCategory, convertToKg, mapCondition } from "@/lib/utils"

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
    const categoriesResponse = await fetch("https://auqliserver-8xr8zvib.b4a.run/api/public/categories", {
      cache: "no-store",
    })

    let auqliCategories: AuqliCategory[] = []
    if (categoriesResponse.ok) {
      const data = await categoriesResponse.json()
      if (Array.isArray(data)) {
        auqliCategories = data
      }
    }

    // Map CSV columns to Auqli format based on platform
    let products = []

    if (platform === "shopify") {
      products = await mapShopifyToAuqli(records, auqliCategories)
    } else if (platform === "woocommerce") {
      products = await mapWooCommerceToAuqli(records, auqliCategories)
    } else {
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 })
    }

    return NextResponse.json({
      products,
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

// Add this helper function to the route file
function improveApparelCategorization(product: Product): Product {
  // Normalize product name for better matching
  const normalizedName = product.name.toLowerCase()

  // Check for specific patterns in clothing items

  // Men's clothing patterns
  if (/\bmen'?s?\b|\bman'?s?\b|\bmale\b/i.test(normalizedName)) {
    // If we already have Apparel & Accessories as main category
    if (product.mainCategory === "Apparel & Accessories") {
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
        } else {
          // Default to Men's Clothing if we can't determine specific type
          product.subCategory = "Men's Clothing"
        }
      }
    } else {
      // If main category isn't set to Apparel yet
      product.mainCategory = "Apparel & Accessories"

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
      } else {
        // Default to Men's Clothing if we can't determine specific type
        product.subCategory = "Men's Clothing"
      }
    }
  }

  // Women's clothing patterns
  else if (/\bwomen'?s?\b|\bwoman'?s?\b|\bfemale\b|\bladies\b/i.test(normalizedName)) {
    // If we already have Apparel & Accessories as main category
    if (product.mainCategory === "Apparel & Accessories") {
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
        } else {
          // Default to Women's Clothing if we can't determine specific type
          product.subCategory = "Women's Clothing"
        }
      }
    } else {
      // If main category isn't set to Apparel yet
      product.mainCategory = "Apparel & Accessories"

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
      } else {
        // Default to Women's Clothing if we can't determine specific type
        product.subCategory = "Women's Clothing"
      }
    }
  }

  // Generic clothing items without gender specification
  else if (/\btee\b|\bt-?shirt\b|\bpolo\b|\bhenley\b|\bjean\b|\bdenim\b|\bshort\b/i.test(normalizedName)) {
    product.mainCategory = "Apparel & Accessories"

    // Try to determine specific subcategory
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
    }
  }

  return product
}

// Update the findMatchingCategory function to be more sophisticated (same as in actions.ts)
function findMatchingCategory(
  productName: string,
  productDescription: string,
  categories: AuqliCategory[],
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
    macbook: { category: "Laptops", subcategory: "Apple", weight: 100 },
    laptop: { category: "Laptops", weight: 80 },
    notebook: { category: "Laptops", weight: 70 },
    chromebook: { category: "Laptops", subcategory: "Chrome OS", weight: 90 },

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
    gpu: { category: "PC Gaming", subcategory: "Graphics Cards", weight: 100 },
    "graphics card": { category: "PC Gaming", subcategory: "Graphics Cards", weight: 100 },
    cpu: { category: "PC Gaming", subcategory: "Processors", weight: 100 },
    processor: { category: "PC Gaming", subcategory: "Processors", weight: 90 },
    ram: { category: "PC Gaming", subcategory: "Memory", weight: 90 },
    ssd: { category: "Data Storage", subcategory: "SSD", weight: 100 },
    hdd: { category: "Data Storage", subcategory: "HDD", weight: 100 },
    "hard drive": { category: "Data Storage", weight: 90 },

    // Kitchen
    blender: { category: "Kitchen & Dining", subcategory: "Small Appliances", weight: 90 },
    mixer: { category: "Kitchen & Dining", subcategory: "Small Appliances", weight: 90 },
    toaster: { category: "Kitchen & Dining", subcategory: "Small Appliances", weight: 90 },
    coffee: { category: "Kitchen & Dining", subcategory: "Coffee & Tea", weight: 90 },

    // Health & Beauty
    skincare: { category: "Health & Beauty", subcategory: "Skin Care", weight: 90 },
    makeup: { category: "Health & Beauty", subcategory: "Makeup", weight: 90 },
    hair: { category: "Health & Beauty", subcategory: "Hair Care", weight: 90 },
    fragrance: { category: "Health & Beauty", subcategory: "Fragrances", weight: 90 },
  }

  // Initialize scores for each category and subcategory
  const scores: {
    categoryId: string
    categoryName: string
    score: number
    subcategoryId?: string
    subcategoryName?: string
    subcategoryScore?: number
  }[] = []

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

// Update the mapShopifyToAuqli function in the API route to ensure weight conversion is happening correctly
async function mapShopifyToAuqli(records: any[], auqliCategories: AuqliCategory[]): Promise<Product[]> {
  // Group records by Handle to handle variants and collect images
  const productGroups: { [key: string]: any[] } = {}
  const productImages: { [key: string]: Array<{ url: string; position: number }> } = {}

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

    group.forEach((record, index) => {
      // Use the record for most fields
      const mainRecord = record

      // Sort images by position and extract URLs
      const sortedImages = productImages[handle].sort((a, b) => a.position - b.position).map((img) => img.url)

      // Use the first image as the main image, store the rest as additional images
      const mainImage = sortedImages.length > 0 ? sortedImages[0] : ""
      const additionalImages = sortedImages.length > 1 ? sortedImages.slice(1) : []

      // Get weight from the first variant and convert to kg
      const weightValue = mainRecord["Variant Grams"] || "0"
      // Ensure we're explicitly passing 'g' as the unit to force conversion to kg
      const weightInKg = convertToKg(weightValue, "g")

      // Get condition from Google Shopping / Condition or map from Status
      const shopifyCondition = mainRecord["Google Shopping / Condition"] || ""

      // Extract product name and description for category matching
      let productName = mainRecord["Title"] || ""
      const productDescription = htmlToText(mainRecord["Body (HTML)"] || "")

      // Append variant options to the product name
      const option1 = mainRecord["Option1 Value"] || ""
      const option2 = mainRecord["Option2 Value"] || ""
      const option3 = mainRecord["Option3 Value"] || ""

      if (option1) productName += ` ${option1}`
      if (option2) productName += ` ${option2}`
      if (option3) productName += ` ${option3}`

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
          : extractMainCategory(mainRecord["Product Category"] || "") || "Uncategorized"

      const finalSubCategory = confidence >= confidenceThreshold ? subCategory : mainRecord["Type"] || "Uncategorized"

      // Combine inventory quantities if there are variants
      const totalInventory = Number.parseInt(record["Variant Inventory Qty"] || "0")

      products.push({
        id: `${handle}-${index}`, // Unique ID for each product
        name: productName,
        price: mainRecord["Variant Price"] || "",
        image: mainImage,
        description: productDescription,
        weight: weightInKg, // Use the converted weight in kg
        inventory: totalInventory.toString(),
        condition: mapCondition(shopifyCondition), // Map to either "New" or "Fairly Used"
        mainCategory: finalMainCategory,
        subCategory: finalSubCategory,
        uploadStatus: mainRecord["Status"] || "active", // Use Status for upload status
        additionalImages: additionalImages,
      })
    })
  })

  // Apply additional apparel-specific categorization improvements
  const improvedProducts = products.map((product) => improveApparelCategorization(product))

  return improvedProducts
}

// Update the mapWooCommerceToAuqli function to use the improved matching
async function mapWooCommerceToAuqli(records: any[], auqliCategories: AuqliCategory[]): Promise<Product[]> {
  return records.map((record) => {
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

    return {
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
  })
}
