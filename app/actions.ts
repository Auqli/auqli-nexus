"use server"

import { parse } from "csv-parse/sync"

interface Product {
  name: string
  price: string
  image: string
  description: string
  weight: string
  inventory: string
  condition: string
  mainCategory: string
  subCategory: string
  uploadStatus: string
  additionalImages: string[] // Store additional images
}

interface AuqliCategory {
  id: string
  name: string
  subcategories: AuqliSubcategory[]
}

interface AuqliSubcategory {
  id: string
  name: string
}

// Function to convert HTML to plain text
function htmlToText(html: string): string {
  if (!html) return ""

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, " ")

  // Replace common HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  // Remove extra spaces
  text = text.replace(/\s+/g, " ").trim()

  return text
}

// Function to extract the main category from a hierarchical category string
function extractMainCategory(category: string): string {
  if (!category) return ""

  // Split by ">" and take the first part
  const parts = category.split(">")
  return parts[0].trim()
}

// Function to extract the subcategory from a hierarchical category string
function extractSubCategory(category: string): string {
  if (!category) return ""

  // Split by ">" and take the second part if it exists
  const parts = category.split(">")
  return parts.length > 1 ? parts[1].trim() : ""
}

// Function to convert weight to KG
function convertToKg(grams: string, unit: string): string {
  if (!grams) return "0"

  const weight = Number.parseFloat(grams)
  if (isNaN(weight)) return "0"

  // Always convert to kg regardless of the input unit
  // Shopify stores weight in grams, so we need to divide by 1000
  const weightInKg = weight / 1000

  // Format without decimal places if it's a whole number
  return Number.isInteger(weightInKg) ? weightInKg.toString() : weightInKg.toFixed(2)
}

// Function to map Shopify condition to Auqli condition (New or Fairly Used)
function mapCondition(condition: string): string {
  if (!condition) return "New" // Default to New if no condition provided

  const lowerCondition = condition.toLowerCase()

  // Map to "New" if condition contains new, mint, or unused
  if (
    lowerCondition.includes("new") ||
    lowerCondition.includes("mint") ||
    lowerCondition.includes("unused") ||
    lowerCondition === "active"
  ) {
    return "New"
  }

  // Otherwise map to "Fairly Used"
  return "Fairly Used"
}

// Function to fetch Auqli categories
async function fetchAuqliCategories(): Promise<AuqliCategory[]> {
  try {
    const response = await fetch("https://auqliserver-8xr8zvib.b4a.run/api/public/categories", {
      cache: "no-store", // Ensure we get fresh data
    })

    if (!response.ok) {
      console.error("Failed to fetch Auqli categories:", response.statusText)
      return []
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching Auqli categories:", error)
    return []
  }
}

// Update the findMatchingCategory function to return a confidence score
function findMatchingCategory(
  productName: string,
  productDescription: string,
  categories: AuqliCategory[],
): { mainCategory: string; subCategory: string; confidence: number } {
  if (!categories || categories.length === 0) {
    return { mainCategory: "", subCategory: "", confidence: 0 }
  }

  // Combine product name and description for better matching
  const searchText = `${productName} ${productDescription}`.toLowerCase()

  // Initialize scores for each category and subcategory
  const scores: {
    categoryId: string
    categoryName: string
    score: number
    subcategoryId?: string
    subcategoryName?: string
    subcategoryScore?: number
  }[] = []

  // Calculate scores based on keyword matching
  for (const category of categories) {
    const categoryKeywords = category.name.toLowerCase().split(/\s+/)
    let categoryScore = 0

    // Calculate category score
    for (const keyword of categoryKeywords) {
      if (keyword.length > 2 && searchText.includes(keyword)) {
        // Give more weight to longer keywords
        categoryScore += keyword.length
      }
    }

    // Find best matching subcategory
    let bestSubcategory = { id: "", name: "", score: 0 }

    for (const subcategory of category.subcategories) {
      const subcategoryKeywords = subcategory.name.toLowerCase().split(/\s+/)
      let subcategoryScore = 0

      for (const keyword of subcategoryKeywords) {
        if (keyword.length > 2 && searchText.includes(keyword)) {
          subcategoryScore += keyword.length
        }
      }

      if (subcategoryScore > bestSubcategory.score) {
        bestSubcategory = {
          id: subcategory.id,
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
  const maxPossibleScore = productName.length + Math.min(100, productDescription.length)
  const confidence = Math.min(100, Math.round((topScore / maxPossibleScore) * 100))

  return {
    mainCategory: scores[0].categoryName,
    subCategory: scores[0].subcategoryName || "",
    confidence: confidence,
  }
}

export async function processCSV(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const platform = (formData.get("platform") as string) || "shopify"

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
    let products: Product[] = []

    if (platform === "shopify") {
      products = await mapShopifyToAuqli(records, auqliCategories)
    } else if (platform === "woocommerce") {
      products = await mapWooCommerceToAuqli(records, auqliCategories)
    } else {
      return { error: "Unsupported platform" }
    }

    return { products }
  } catch (error) {
    console.error("Error processing CSV:", error)
    return { error: `Failed to process the CSV file: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

// Update the mapShopifyToAuqli function to use the confidence score
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
  const products = Object.keys(productGroups).map((handle) => {
    const group = productGroups[handle]
    // Use the first record for most fields
    const mainRecord = group[0]

    // Sort images by position and extract URLs
    const sortedImages = productImages[handle].sort((a, b) => a.position - b.position).map((img) => img.url)

    // Use the first image as the main image, store the rest as additional images
    const mainImage = sortedImages.length > 0 ? sortedImages[0] : ""
    const additionalImages = sortedImages.length > 1 ? sortedImages.slice(1) : []

    // Combine inventory quantities if there are variants
    const totalInventory = group.reduce((sum, record) => {
      const qty = Number.parseInt(record["Variant Inventory Qty"] || "0")
      return sum + (isNaN(qty) ? 0 : qty)
    }, 0)

    // Get weight from the first variant and convert to kg
    const weightValue = mainRecord["Variant Grams"] || "0"
    const weightUnit = mainRecord["Variant Weight Unit"] || "g"

    // Get condition from Google Shopping / Condition or map from Status
    const shopifyCondition = mainRecord["Google Shopping / Condition"] || ""

    // Extract product name and description for category matching
    const productName = mainRecord["Title"] || ""
    const productDescription = htmlToText(mainRecord["Body (HTML)"] || "")

    // Find matching Auqli category based on product name and description
    const { mainCategory, subCategory, confidence } = findMatchingCategory(
      productName,
      productDescription,
      auqliCategories,
    )

    // Only use the matched category if confidence is above threshold (e.g., 40%)
    // Otherwise, use "Uncategorized" to flag it for manual selection
    const confidenceThreshold = 40
    const finalMainCategory =
      confidence >= confidenceThreshold
        ? mainCategory
        : extractMainCategory(mainRecord["Product Category"] || "") || "Uncategorized"

    const finalSubCategory = confidence >= confidenceThreshold ? subCategory : mainRecord["Type"] || "Uncategorized"

    return {
      name: productName,
      price: mainRecord["Variant Price"] || "",
      image: mainImage,
      description: productDescription,
      weight: convertToKg(weightValue, weightUnit),
      inventory: totalInventory.toString(),
      condition: mapCondition(shopifyCondition), // Map to either "New" or "Fairly Used"
      mainCategory: finalMainCategory,
      subCategory: finalSubCategory,
      uploadStatus: mainRecord["Status"] || "active", // Use Status for upload status
      additionalImages: additionalImages,
    }
  })

  return products
}

// Make similar updates to mapWooCommerceToAuqli function
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

    // Only use the matched category if confidence is above threshold (e.g., 40%)
    // Otherwise, use "Uncategorized" to flag it for manual selection
    const confidenceThreshold = 40
    const finalMainCategory =
      confidence >= confidenceThreshold
        ? mainCategory
        : extractMainCategory(record["Categories"] || record["categories"] || "") || "Uncategorized"
    const finalSubCategory =
      confidence >= confidenceThreshold ? subCategory : record["Tags"] || record["tags"] || "Uncategorized"

    return {
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

