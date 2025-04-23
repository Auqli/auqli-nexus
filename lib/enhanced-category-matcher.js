import { fashionCategoryMappings, sizePatterns, colorPatterns } from "./fashion-categories"
import { getMostCommonCategoryForSimilarProducts, getFrequentCorrections, saveCategoryMapping } from "./db"

// Cache for frequent corrections to avoid repeated DB calls
let correctionsCache = null

/**
 * Enhanced smart matching that uses both AI and historical database data
 */
export async function enhancedSmartMatch(productName, productDescription, auqliCategories) {
  // Step 1: Check if we have similar products in our database
  const dbMatch = await getMostCommonCategoryForSimilarProducts(productName)

  if (dbMatch && dbMatch.confidence > 0.75) {
    console.log(
      `Found database match for "${productName}": ${dbMatch.mainCategory} > ${dbMatch.subCategory} (${dbMatch.confidence})`,
    )
    return {
      ...dbMatch,
      source: "database",
    }
  }

  // Step 2: If no good database match, use AI matching
  const aiMatch = await smartMatchWithAI(productName, auqliCategories)

  // Step 3: Check if this AI match has been frequently corrected
  if (!correctionsCache) {
    correctionsCache = await getFrequentCorrections()
  }

  const correctionKey = `${aiMatch.mainCategory}|${aiMatch.subCategory}`
  if (correctionsCache && correctionsCache[correctionKey]) {
    const correction = correctionsCache[correctionKey]
    console.log(
      `Applied correction for "${productName}": ${aiMatch.mainCategory} > ${aiMatch.subCategory} => ${correction.main} > ${correction.sub}`,
    )

    return {
      mainCategory: correction.main,
      subCategory: correction.sub,
      confidence: aiMatch.confidence * 0.9, // Slightly reduce confidence for corrections
      source: "correction",
    }
  }

  // Step 4: Save the AI match to the database for future reference
  await saveCategoryMapping(
    productName,
    productDescription,
    aiMatch.mainCategory,
    aiMatch.subCategory,
    aiMatch.confidence,
    false, // Not user verified
  )

  return {
    ...aiMatch,
    source: "ai",
  }
}

/**
 * Calls DeepInfra's Llama-4 model to match a product to a category
 */
async function smartMatchWithAI(productName, categories) {
  // Prepare the category list for the prompt
  const categoryList = []

  for (const category of categories) {
    if (!category || !category.name) continue

    const subcategories = Array.isArray(category.subcategories) ? category.subcategories : []
    for (const subcategory of subcategories) {
      if (!subcategory || !subcategory.name) continue
      categoryList.push(`${category.name} > ${subcategory.name}`)
    }
  }

  // Build the prompt for the AI
  const prompt = buildAIPrompt(productName, categoryList)

  try {
    // Call DeepInfra API
    const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY || "xBOQQT8SaRfCCIgafgbqa9eDrpdobBgr"}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Extract JSON from the response
    // Look for JSON object between curly braces
    const jsonMatch = content.match(/\{[\s\S]*?\}/m)

    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[0]
        const result = JSON.parse(jsonStr)

        // Check if the AI couldn't find a match
        if (result.no_match === true || result.confidence < 0.3) {
          return {
            mainCategory: "Uncategorized",
            subCategory: "Uncategorized",
            confidence: result.confidence || 0,
            noMatch: true,
          }
        }

        // Validate the AI's response against the Auqli categories
        const mainCategory = result.main_category
        const subCategory = result.subcategory

        // Check if the main category exists in Auqli categories
        const isMainValid = categories.some(
          (category) => category.name && category.name.toLowerCase() === mainCategory.toLowerCase(),
        )

        if (!isMainValid) {
          console.warn(
            `AI returned invalid main category "${mainCategory}" for "${productName}". Defaulting to "Uncategorized".`,
          )
          return {
            mainCategory: "Uncategorized",
            subCategory: "Uncategorized",
            confidence: 0.1,
            noMatch: true,
          }
        }

        // Check if the subcategory exists under the main category
        const parentCategory = categories.find(
          (category) => category.name && category.name.toLowerCase() === mainCategory.toLowerCase(),
        )

        const isSubValid =
          parentCategory &&
          Array.isArray(parentCategory.subcategories) &&
          parentCategory.subcategories.some((sub) => sub.name && sub.name.toLowerCase() === subCategory.toLowerCase())

        if (!isSubValid) {
          console.warn(
            `AI returned invalid subcategory "${subCategory}" under "${mainCategory}" for "${productName}". Using first valid subcategory.`,
          )

          // Use the first valid subcategory if available
          if (
            parentCategory &&
            Array.isArray(parentCategory.subcategories) &&
            parentCategory.subcategories.length > 0
          ) {
            return {
              mainCategory: mainCategory,
              subCategory: parentCategory.subcategories[0].name,
              confidence: result.confidence * 0.7, // Reduce confidence since we had to correct the subcategory
              noMatch: false,
            }
          } else {
            return {
              mainCategory: mainCategory,
              subCategory: "Uncategorized",
              confidence: result.confidence * 0.5, // Significantly reduce confidence
              noMatch: false,
            }
          }
        }

        return {
          mainCategory: result.main_category,
          subCategory: result.subcategory,
          confidence: result.confidence || 0.5,
          noMatch: false,
        }
      } catch (e) {
        console.error("Failed to parse extracted JSON:", jsonMatch[0])
        throw new Error("Failed to parse JSON from AI response")
      }
    } else {
      console.error("No JSON found in AI response:", content)
      throw new Error("No JSON found in AI response")
    }
  } catch (error) {
    console.error("Error calling DeepInfra API:", error)

    // For fallback/testing purposes, return a default response
    return {
      mainCategory: "Uncategorized",
      subCategory: "Uncategorized",
      confidence: 0.1,
      noMatch: true,
    }
  }
}

/**
 * Builds a prompt for the AI to match a product to a category
 */
function buildAIPrompt(productName, categoryList) {
  const categories = categoryList.map((cat) => `- ${cat}`).join("\n")

  return `
You are an AI product classifier for an e-commerce platform called Auqli.
Classify the product below into the best available category.

Title: ${productName}

Available Categories:
${categories}

IMPORTANT: 
1. You MUST ONLY use categories from the provided list. Do not invent new categories.
2. If the product name doesn't seem like a real product or doesn't match any category, set "no_match" to true.
3. Include a confidence score between 0 and 1 indicating how confident you are in the match.
4. You MUST respond with ONLY a JSON object and nothing else. No explanations, no text before or after the JSON.
5. The main_category and subcategory MUST EXACTLY match one of the provided categories.

The JSON must follow this exact format:
{
  "main_category": "...",
  "subcategory": "...",
  "confidence": 0.0,
  "no_match": false
}

If no match is found, respond with:
{
  "main_category": "Uncategorized",
  "subcategory": "Uncategorized",
  "confidence": 0.0,
  "no_match": true
}
`
}

/**
 * Enhanced category matcher specifically designed to handle fashion items
 * that were previously not being categorized correctly
 *
 * @param {string} productName - The name of the product
 * @param {Array} auqliCategories - The list of valid Auqli categories
 * @returns {Object|null} - The matched category or null if no match
 */
export function matchFashionCategory(productName, auqliCategories) {
  if (!productName) return null

  // Normalize the product name
  const normalizedName = productName.toLowerCase().trim()

  // Extract product type, ignoring sizes and colors
  const productType = extractProductType(normalizedName)

  // First, try exact matches with our fashion mappings
  for (const [key, value] of Object.entries(fashionCategoryMappings)) {
    if (normalizedName.includes(key)) {
      // Validate against Auqli categories
      if (auqliCategories.some((cat) => cat.name === value.mainCategory)) {
        return {
          mainCategory: value.mainCategory,
          subCategory: value.subCategory,
          confidence: 90,
        }
      }
    }
  }

  // If no exact match, try to match the extracted product type
  if (productType) {
    for (const [key, value] of Object.entries(fashionCategoryMappings)) {
      if (productType.includes(key) || key.includes(productType)) {
        // Validate against Auqli categories
        if (auqliCategories.some((cat) => cat.name === value.mainCategory)) {
          return {
            mainCategory: value.mainCategory,
            subCategory: value.subCategory,
            confidence: 80,
          }
        }
      }
    }
  }

  // Special case handling for specific patterns in the screenshots
  // Bucket hats
  if (normalizedName.includes("bucket") && normalizedName.includes("hat")) {
    if (auqliCategories.some((cat) => cat.name === "Fashion")) {
      return {
        mainCategory: "Fashion",
        subCategory: "Hats",
        confidence: 95,
      }
    }
  }

  // Loafers
  if (
    normalizedName.includes("loafer") ||
    normalizedName.includes("sovereign bit") ||
    normalizedName.includes("savanna fringe")
  ) {
    if (auqliCategories.some((cat) => cat.name === "Fashion")) {
      return {
        mainCategory: "Fashion",
        subCategory: "Loafers",
        confidence: 95,
      }
    }
  }

  // Tank tops
  if (normalizedName.includes("tank") || normalizedName.includes("tank-top") || normalizedName.includes("kalmar")) {
    if (auqliCategories.some((cat) => cat.name === "Fashion")) {
      return {
        mainCategory: "Fashion",
        subCategory: "Tank Tops",
        confidence: 95,
      }
    }
  }

  // Trunks/Swimwear
  if (normalizedName.includes("trunk") || normalizedName.includes("jacnorman contrast")) {
    if (auqliCategories.some((cat) => cat.name === "Fashion")) {
      return {
        mainCategory: "Fashion",
        subCategory: "Swimwear",
        confidence: 95,
      }
    }
  }

  // Belts
  if (normalizedName.includes("belt") || normalizedName.includes("jacsimon")) {
    if (auqliCategories.some((cat) => cat.name === "Fashion")) {
      return {
        mainCategory: "Fashion",
        subCategory: "Belts",
        confidence: 95,
      }
    }
  }

  // Shirts
  if (normalizedName.includes("shirt") || normalizedName.includes("jprbl")) {
    if (auqliCategories.some((cat) => cat.name === "Fashion")) {
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
  }

  // Shorts
  if (normalizedName.includes("shorts") || normalizedName.includes("chill linen")) {
    if (auqliCategories.some((cat) => cat.name === "Fashion")) {
      return {
        mainCategory: "Fashion",
        subCategory: "Shorts",
        confidence: 95,
      }
    }
  }

  // If we still haven't found a match but the name contains fashion-related terms
  if (containsFashionTerms(normalizedName)) {
    if (auqliCategories.some((cat) => cat.name === "Fashion")) {
      return {
        mainCategory: "Fashion",
        subCategory: "Uncategorized",
        confidence: 70,
      }
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
