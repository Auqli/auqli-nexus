"use server"

import { supabase } from "@/lib/db"
import { enhancedSmartMatch } from "@/lib/enhanced-category-matcher"

export async function fetchCategoryStats() {
  try {
    // Get total mappings
    const { count: totalMappings, error: mappingsError } = await supabase
      .from("category_mappings")
      .select("*", { count: "exact", head: true })

    if (mappingsError) throw mappingsError

    // Get verified mappings
    const { count: verifiedMappings, error: verifiedError } = await supabase
      .from("category_mappings")
      .select("*", { count: "exact", head: true })
      .eq("user_verified", true)

    if (verifiedError) throw verifiedError

    // Get total corrections
    const { count: totalCorrections, error: correctionsError } = await supabase
      .from("category_corrections")
      .select("*", { count: "exact", head: true })

    if (correctionsError) throw correctionsError

    // Get average confidence score
    const { data: confidenceData, error: confidenceError } = await supabase
      .from("category_mappings")
      .select("confidence_score")

    if (confidenceError) throw confidenceError

    const totalConfidence = confidenceData.reduce((sum, item) => {
      return sum + (item.confidence_score || 0)
    }, 0)

    const averageConfidence = confidenceData.length > 0 ? totalConfidence / confidenceData.length : 0

    return {
      totalMappings: totalMappings || 0,
      verifiedMappings: verifiedMappings || 0,
      totalCorrections: totalCorrections || 0,
      averageConfidence,
    }
  } catch (error) {
    console.error("Error fetching category stats:", error)
    return {
      totalMappings: 0,
      verifiedMappings: 0,
      totalCorrections: 0,
      averageConfidence: 0,
    }
  }
}

export async function fetchTopCategories() {
  try {
    const { data, error } = await supabase.from("category_mappings").select("main_category")

    if (error) throw error

    // Count occurrences of each main category
    const categoryCounts = {}
    data.forEach((item) => {
      const category = item.main_category
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      }
    })

    // Convert to array and sort by count
    const topCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Get top 10

    return topCategories
  } catch (error) {
    console.error("Error fetching top categories:", error)
    return []
  }
}

export async function fetchRecentMappings(limit = 10) {
  try {
    const { data, error } = await supabase
      .from("category_mappings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching recent mappings:", error)
    return []
  }
}

export async function fetchRecentCorrections(limit = 10) {
  try {
    const { data, error } = await supabase
      .from("category_corrections")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching recent corrections:", error)
    return []
  }
}

export async function searchMappings(query: string) {
  try {
    const { data, error } = await supabase
      .from("category_mappings")
      .select("*")
      .textSearch("product_name", query, {
        type: "websearch",
        config: "english",
      })
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error searching mappings:", error)
    return []
  }
}

export async function exportCategoryMappings() {
  try {
    const { data, error } = await supabase
      .from("category_mappings")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error exporting category mappings:", error)
    return []
  }
}

/**
 * Server action to get category suggestions from similar products
 */
export async function getCategorySuggestions(productName) {
  try {
    const { data, error } = await supabase
      .from("category_mappings")
      .select("main_category, sub_category, confidence_score")
      .textSearch("product_name", productName, {
        type: "websearch",
        config: "english",
      })
      .limit(5)

    if (error) {
      console.error("Error fetching category suggestions:", error)
      return { success: false, error: error.message }
    }

    // Group by category and count occurrences
    const suggestions = {}

    data.forEach((item) => {
      const key = `${item.main_category}|${item.sub_category}`
      if (!suggestions[key]) {
        suggestions[key] = {
          mainCategory: item.main_category,
          subCategory: item.sub_category,
          count: 0,
          confidence: 0,
        }
      }

      suggestions[key].count += 1
      suggestions[key].confidence += item.confidence_score || 0.5
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

/**
 * Server action to match a product category
 */
export async function matchProductCategory(productName, productDescription, auqliCategories) {
  try {
    // Use the enhancedSmartMatch function to get the category match
    const match = await enhancedSmartMatch(productName, productDescription, auqliCategories)

    return {
      success: true,
      mainCategory: match.mainCategory,
      subCategory: match.subCategory,
      confidence: match.confidence,
      source: match.source,
    }
  } catch (error) {
    console.error("Error in smart matching:", error)
    return {
      success: false,
      error: "Failed to match category.",
    }
  }
}

/**
 * Server action to save user feedback on category matches
 */
export async function saveUserFeedback(productName, productDescription, mainCategory, subCategory, wasCorrect) {
  // Dummy implementation for now
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log(`Saving feedback for ${productName}: ${mainCategory} > ${subCategory}, wasCorrect: ${wasCorrect}`)

  return { success: true }
}
