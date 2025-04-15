import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts HTML to plain text by removing tags and decoding entities.
 * @param {string} html - The HTML string to convert.
 * @returns {string} The plain text representation of the HTML.
 */
export function htmlToText(html: string): string {
  if (!html) return ""

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

/**
 * Extracts the main category from a category string.
 * @param {string} categoryString - The category string to extract from.
 * @returns {string} The extracted main category, or an empty string if not found.
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

/**
 * Converts a weight value to kilograms.
 * @param {string} weightValue - The weight value as a string.
 * @param {string} weightUnit - The unit of weight (e.g., "g", "lb", "oz").
 * @returns {string} The weight in kilograms, formatted to three decimal places.
 */
export function convertToKg(weightValue: string, weightUnit: string): string {
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

/**
 * Maps a condition string to a standardized condition ("New" or "Fairly Used").
 * @param {string} condition - The condition string to map.
 * @returns {string} The standardized condition.
 */
export function mapCondition(condition: string): string {
  const lowerCaseCondition = condition.toLowerCase()

  if (lowerCaseCondition.includes("new")) {
    return "New"
  } else {
    return "Fairly Used"
  }
}
