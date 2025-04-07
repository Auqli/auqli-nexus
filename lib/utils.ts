import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts HTML to plain text by removing HTML tags and converting common HTML entities
 */
export function htmlToText(html: string): string {
  if (!html) return ""

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, "")

  // Convert common HTML entities
  text = text.replace(/&nbsp;/g, " ")
  text = text.replace(/&amp;/g, "&")
  text = text.replace(/&lt;/g, "<")
  text = text.replace(/&gt;/g, ">")
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")

  return text
}

/**
 * Extracts the main category from a category string that may contain subcategories
 * Example: "Apparel & Accessories > Clothing > Shirts" returns "Apparel & Accessories"
 */
export function extractMainCategory(categoryString: string): string {
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

// Update the convertToKg function to properly convert grams to kilograms
export function convertToKg(weightValue: string, weightUnit = "g"): string {
  const weight = Number.parseFloat(weightValue)
  if (isNaN(weight)) return "0"

  let weightInKg = weight

  const unit = weightUnit.toLowerCase()
  if (unit === "g") {
    weightInKg = weight / 1000
  } else if (unit === "lb") {
    weightInKg = weight * 0.453592
  } else if (unit === "oz") {
    weightInKg = weight * 0.0283495
  }

  // Format to 3 decimal places
  return weightInKg.toFixed(3)
}

/**
 * Maps condition strings to standardized values ("New" or "Fairly Used")
 */
export function mapCondition(condition: string): string {
  if (!condition) return "New" // Default to "New" if no condition is provided

  const lowerCaseCondition = condition.toLowerCase()

  if (
    lowerCaseCondition.includes("new") ||
    lowerCaseCondition.includes("brand new") ||
    lowerCaseCondition.includes("unused")
  ) {
    return "New"
  } else {
    return "Fairly Used"
  }
}

