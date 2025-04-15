import { type NextRequest, NextResponse } from "next/server"
import { parse } from "csv-parse/sync"
import { matchProductToCategory } from "@/lib/ai-category-matcher"
import type { Product } from "@/types"

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

    let auqliCategories = []
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

    // Final validation to ensure no duplicates, no blank titles, and no missing data
    const validatedProducts = validateAndCleanProducts(products)

    return NextResponse.json({
      products: validatedProducts,
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

// Update the mapShopifyToAuqli function to handle the new requirements
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

    // Check if this product has variants
    const hasVariants =
      group.length > 1 ||
      (baseRecord["Option1 Name"] && baseRecord["Option1 Value"] && baseRecord["Option1 Value"] !== "Default Title") ||
      baseRecord["Option2 Name"] ||
      baseRecord["Option3 Name"]

    // If no variants or only one variant with "Default Title", process as a single product
    if (!hasVariants || (group.length === 1 && baseRecord["Option1 Value"] === "Default Title")) {
      const mainRecord = baseRecord

      // Use the first image as the main image, store the rest as additional images
      const mainImage = sortedImages.length > 0 ? sortedImages[0] : ""
      const additionalImages = sortedImages.length > 1 ? sortedImages.slice(1) : []

      // Get weight from the variant and convert to kg
      const weightValue = mainRecord["Variant Grams"] || "0"
      const weightInKg = convertToKg(weightValue, "g")

      // Get condition from Google Shopping / Condition or map from Status
      const shopifyCondition = mainRecord["Google Shopping / Condition"] || ""

      // Use AI-powered category matching
      let mainCategory = "Uncategorized"
      let subCategory = "Uncategorized"
      let aiMatched = false

      if (auqliCategories.length > 0) {
        const match = matchProductToCategory(baseProductName, baseProductDescription, auqliCategories)

        if (match.confidence >= 70) {
          mainCategory = match.mainCategory
          subCategory = match.subCategory
          aiMatched = true
        } else {
          // Fallback to traditional extraction if AI confidence is low
          mainCategory = extractMainCategory(mainRecord["Product Category"] || "") || "Uncategorized"
          subCategory = mainRecord["Type"] || "Uncategorized"
        }
      } else {
        // Fallback if categories couldn't be fetched
        mainCategory = extractMainCategory(mainRecord["Product Category"] || "") || "Uncategorized"
        subCategory = mainRecord["Type"] || "Uncategorized"
      }

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
        mainCategory: mainCategory,
        subCategory: subCategory,
        uploadStatus: mainRecord["Status"] || "active",
        additionalImages: additionalImages,
        sku: mainRecord["Variant SKU"] || "",
        aiMatched: aiMatched,
      })
    } else {
      // Process each variant as a separate product
      group.forEach((variantRecord, variantIndex) => {
        // Initialize the variant title with the base product name
        let variantTitle = baseProductName

        // Skip variants with "Default Title" as the only option value
        if (
          group.length > 1 &&
          variantRecord["Option1 Value"] === "Default Title" &&
          !variantRecord["Option2 Value"] &&
          !variantRecord["Option3 Value"]
        ) {
          // Use the base product name without modification
          // variantTitle is already set to baseProductName
        } else {
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

        // Use AI-powered category matching
        let mainCategory = "Uncategorized"
        let subCategory = "Uncategorized"
        let aiMatched = false

        if (auqliCategories.length > 0) {
          const match = matchProductToCategory(variantTitle, baseProductDescription, auqliCategories)

          if (match.confidence >= 70) {
            mainCategory = match.mainCategory
            subCategory = match.subCategory
            aiMatched = true
          } else {
            // Fallback to traditional extraction if AI confidence is low
            mainCategory = extractMainCategory(variantRecord["Product Category"] || "") || "Uncategorized"
            subCategory = variantRecord["Type"] || "Uncategorized"
          }
        } else {
          // Fallback if categories couldn't be fetched
          mainCategory = extractMainCategory(variantRecord["Product Category"] || "") || "Uncategorized"
          subCategory = variantRecord["Type"] || "Uncategorized"
        }

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
          mainCategory: mainCategory,
          subCategory: subCategory,
          uploadStatus: variantRecord["Status"] || "active",
          additionalImages: sortedImages.filter((img) => img !== variantImage),
          sku: variantRecord["Variant SKU"] || "",
          aiMatched: aiMatched,
        })
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

    // Use AI-powered category matching
    let mainCategory = "Uncategorized"
    let subCategory = "Uncategorized"
    let aiMatched = false

    if (auqliCategories.length > 0) {
      const match = matchProductToCategory(productName, productDescription, auqliCategories)

      if (match.confidence >= 70) {
        mainCategory = match.mainCategory
        subCategory = match.subCategory
        aiMatched = true
      } else {
        // Fallback to traditional extraction if AI confidence is low
        mainCategory = extractMainCategory(record["Categories"] || record["categories"] || "") || "Uncategorized"
        subCategory = record["Tags"] || record["tags"] || "Uncategorized"
      }
    } else {
      // Fallback if categories couldn't be fetched
      mainCategory = extractMainCategory(record["Categories"] || record["categories"] || "") || "Uncategorized"
      subCategory = record["Tags"] || record["tags"] || "Uncategorized"
    }

    // Clean the product title
    const cleanedTitle = cleanProductTitle(productName)

    return {
      id: record["ID"] || record["id"] || record["product_id"] || "",
      name: cleanedTitle,
      price: record["Regular price"] || record["regular_price"] || record["price"] || "",
      image: record["Images"] || record["images"] || record["image"] || "",
      description: productDescription,
      weight: record["Weight"] ? record["Weight"] : "0",
      inventory: record["Stock"] || record["stock"] || record["inventory"] || "0",
      condition: mapCondition(record["Condition"] || ""), // Map to either "New" or "Fairly Used"
      mainCategory: mainCategory,
      subCategory: subCategory,
      uploadStatus: record["Status"] || record["status"] || "active",
      additionalImages: [],
      aiMatched: aiMatched,
    }
  })

  // Apply validation to ensure no duplicates, no blank titles, and no missing data
  return validateAndCleanProducts(mappedProducts)
}
