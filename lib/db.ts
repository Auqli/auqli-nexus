import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

// Type definitions based on our database schema
export interface CategoryMapping {
  id: number
  product_name: string
  product_description: string | null
  main_category: string
  sub_category: string
  confidence_score: number | null
  user_verified: boolean
  created_at: string
  user_id?: string
}

export interface CategoryCorrection {
  id: string
  product_title: string
  original_main_category: string
  original_subcategory: string
  corrected_main_category: string
  corrected_subcategory: string
  created_at: string
  user_id?: string
}

// Function to find similar product categories from historical data
export async function findSimilarProductCategories(productName: string, threshold = 0.7): Promise<CategoryMapping[]> {
  // Use Supabase's text search capabilities
  // This uses PostgreSQL's full-text search with word similarity
  const { data, error } = await supabase
    .from("category_mappings")
    .select("*")
    .textSearch("product_name", productName, {
      type: "websearch",
      config: "english",
    })
    .order("confidence_score", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching similar products:", error)
    return []
  }

  return data as CategoryMapping[]
}

// Add a function to check if RLS is enabled on the category_mappings table
export async function checkRLS() {
  try {
    const { data, error } = await supabase.rpc("execute_sql", {
      sql_query: `
        SELECT tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'category_mappings'
      `,
    })

    if (error) {
      console.error("Error checking RLS:", error)
      return { error: error.message }
    }

    return { data }
  } catch (err) {
    console.error("Exception checking RLS:", err)
    return { error: err.message }
  }
}

// Improve the saveCategoryMapping function with better error handling and retry logic
export async function saveCategoryMapping(
  productName: string,
  productDescription: string | null,
  mainCategory: string,
  subCategory: string,
  confidenceScore: number,
  userVerified = false,
) {
  try {
    console.log("Attempting to save category mapping:", {
      product_name: productName,
      main_category: mainCategory,
      sub_category: subCategory,
    })

    const { data, error } = await supabase
      .from("category_mappings")
      .insert([
        {
          product_name: productName,
          product_description: productDescription,
          main_category: mainCategory,
          sub_category: subCategory,
          confidence_score: confidenceScore,
          user_verified: userVerified,
        },
      ])
      .select()

    if (error) {
      console.error("Error saving category mapping:", error)
      throw error
    } else {
      console.log("Successfully saved category mapping:", data)
    }
  } catch (error) {
    console.error("Error saving category mapping:", error)
    throw error
  }
}

/**
 * Batch save multiple category mappings to improve performance
 * @param mappings - Array of category mappings to save
 * @returns Promise<void>
 */
export async function batchSaveCategoryMappings(
  mappings: Array<{
    productName: string
    productDescription: string | null
    mainCategory: string
    subCategory: string
    confidenceScore: number
    userVerified: boolean
  }>,
): Promise<void> {
  if (!mappings || mappings.length === 0) return

  // Process in batches of 50 to avoid overwhelming the database
  const BATCH_SIZE = 50

  for (let i = 0; i < mappings.length; i += BATCH_SIZE) {
    const batch = mappings.slice(i, i + BATCH_SIZE)

    try {
      const { error } = await supabase.from("category_mappings").insert(batch)

      if (error) {
        console.error(`Error batch saving category mappings (batch ${i / BATCH_SIZE + 1}):`, error)
      }
    } catch (error) {
      console.error(`Exception during batch save (batch ${i / BATCH_SIZE + 1}):`, error)
    }

    // Small delay to prevent rate limiting
    if (i + BATCH_SIZE < mappings.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}

// Function to save a category correction
export async function saveCategoryCorrection(
  productTitle: string,
  originalMainCategory: string,
  originalSubcategory: string,
  correctedMainCategory: string,
  correctedSubcategory: string,
  userId: string | null = null, // Add user_id parameter
): Promise<void> {
  const { error } = await supabase.from("category_corrections").insert([
    {
      product_title: productTitle,
      original_main_category: originalMainCategory,
      original_subcategory: originalSubcategory,
      corrected_main_category: correctedMainCategory,
      corrected_subcategory: correctedSubcategory,
      user_id: userId, // Include user_id in the insert
    },
  ])

  if (error) {
    console.error("Error saving category correction:", error)
  }
}

// Function to get the most common category for similar products
export async function getMostCommonCategoryForSimilarProducts(
  productName: string,
): Promise<{ mainCategory: string; subCategory: string; confidence: number } | null> {
  const similarProducts = await findSimilarProductCategories(productName)

  if (similarProducts.length === 0) {
    return null
  }

  // Count occurrences of each category combination
  const categoryCounts: Record<string, { count: number; confidence: number }> = {}

  similarProducts.forEach((product) => {
    const key = `${product.main_category}|${product.sub_category}`
    if (!categoryCounts[key]) {
      categoryCounts[key] = { count: 0, confidence: 0 }
    }
    categoryCounts[key].count += 1
    // If user verified, give it more weight
    categoryCounts[key].confidence += product.user_verified
      ? (product.confidence_score || 0.5) * 1.5
      : product.confidence_score || 0.5
  })

  // Find the most common category
  let maxCount = 0
  let bestCategory = null
  let bestConfidence = 0

  for (const [key, data] of Object.entries(categoryCounts)) {
    const avgConfidence = data.confidence / data.count

    // Prioritize by count, then by confidence
    if (data.count > maxCount || (data.count === maxCount && avgConfidence > bestConfidence)) {
      maxCount = data.count
      bestCategory = key
      bestConfidence = avgConfidence
    }
  }

  if (bestCategory) {
    const [mainCategory, subCategory] = bestCategory.split("|")
    return {
      mainCategory,
      subCategory,
      confidence: bestConfidence,
    }
  }

  return null
}

// Function to get frequently corrected categories
export async function getFrequentCorrections(): Promise<Record<string, { main: string; sub: string }>> {
  const { data, error } = await supabase
    .from("category_corrections")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching category corrections:", error)
    return {}
  }

  const corrections: Record<string, { main: string; sub: string }> = {}

  // Build a map of original categories to their most frequent corrections
  data.forEach((correction) => {
    const key = `${correction.original_main_category}|${correction.original_subcategory}`

    // We're taking the most recent correction for simplicity
    // In a production system, you might want to count frequencies
    if (!corrections[key]) {
      corrections[key] = {
        main: correction.corrected_main_category,
        sub: correction.corrected_subcategory,
      }
    }
  })

  return corrections
}
