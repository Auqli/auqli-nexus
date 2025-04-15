import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// This is the missing function that's causing the error
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// If there are any utility functions related to category matching, enhance them:

// 1. Add a new utility function for advanced pattern matching
export function advancedCategoryMatching(productName, description = "") {
  const normalizedName = productName.toLowerCase()
  const normalizedDesc = description.toLowerCase()
  const combinedText = `${normalizedName} ${normalizedDesc}`

  // Create a comprehensive pattern matching system
  const categoryPatterns = [
    // Hats and headwear
    {
      pattern: /\bhat\b|\bcap\b|\bbeanie\b|\bbucket\b|\bsnapback\b|\bfedora\b|\bvisor\b|\bberet\b|\bcadet\b/i,
      category: "Apparel & Accessories",
      subcategory: "Hats",
    },
    // Shirts and tops
    {
      pattern: /\bshirt\b|\btshirt\b|\bt-shirt\b|\btee\b|\bpolo\b/i,
      category: "Apparel & Accessories",
      subcategory: "Shirts",
    },
    // Hoodies and sweatshirts
    {
      pattern: /\bhoodie\b|\bsweatshirt\b|\bsweater\b/i,
      category: "Apparel & Accessories",
      subcategory: "Hoodies & Sweatshirts",
    },
    // Add more patterns for other categories
  ]

  // Check for matches in both name and description
  for (const { pattern, category, subcategory } of categoryPatterns) {
    if (pattern.test(combinedText)) {
      return {
        mainCategory: category,
        subCategory: subcategory,
        confidence: 0.9,
      }
    }
  }

  // No match found
  return null
}

// 2. Add a utility function for fuzzy matching category names
export function fuzzyMatchCategory(input, categories) {
  if (!input) return null

  const normalizedInput = input.toLowerCase().trim()

  // Exact match
  const exactMatch = categories.find(
    (cat) =>
      cat.name.toLowerCase() === normalizedInput ||
      cat.subcategories.some((sub) => sub.toLowerCase() === normalizedInput),
  )

  if (exactMatch) return exactMatch

  // Partial match
  const partialMatch = categories.find(
    (cat) =>
      cat.name.toLowerCase().includes(normalizedInput) ||
      normalizedInput.includes(cat.name.toLowerCase()) ||
      cat.subcategories.some(
        (sub) => sub.toLowerCase().includes(normalizedInput) || normalizedInput.includes(sub.toLowerCase()),
      ),
  )

  if (partialMatch) return partialMatch

  // Word match (check if any word in the input matches any word in the category)
  const inputWords = normalizedInput.split(/\s+/)

  for (const cat of categories) {
    const catWords = cat.name.toLowerCase().split(/\s+/)

    for (const inputWord of inputWords) {
      if (inputWord.length < 3) continue // Skip short words

      if (catWords.some((word) => word.includes(inputWord) || inputWord.includes(word))) {
        return cat
      }

      for (const sub of cat.subcategories) {
        const subWords = sub.toLowerCase().split(/\s+/)
        if (subWords.some((word) => word.includes(inputWord) || inputWord.includes(word))) {
          return {
            ...cat,
            matchedSubcategory: sub,
          }
        }
      }
    }
  }

  return null
}

// Add other existing utility functions that were in the file before
export function htmlToText(html) {
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

export function extractMainCategory(categoryString) {
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

export function convertToKg(weightValue, weightUnit) {
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

export function mapCondition(condition) {
  const lowerCaseCondition = condition.toLowerCase()

  if (lowerCaseCondition.includes("new")) {
    return "New"
  } else {
    return "Fairly Used"
  }
}
