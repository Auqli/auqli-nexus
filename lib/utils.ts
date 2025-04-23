import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
// Add the import for the enhanced fashion category matcher
import { matchFashionCategory } from "./enhanced-category-matcher.js"

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
 * Extracts the main category from a category string and validates it against Auqli categories.
 * @param {string} categoryString - The category string to extract from.
 * @param {Array} auqliCategories - The list of valid Auqli categories.
 * @returns {string} The extracted and validated main category, or "Uncategorized" if not found.
 */
export function extractMainCategory(categoryString: string, auqliCategories?: any[]): string {
  if (!categoryString) return ""

  // Split the category string by delimiters like '>', '/', or ','
  const delimiters = /[>\\/,]/
  const categories = categoryString.split(delimiters).map((cat) => cat.trim())

  // Get the first non-empty category
  let extractedCategory = ""
  for (const category of categories) {
    if (category) {
      extractedCategory = category
      break
    }
  }

  // If no auqliCategories provided or no category extracted, return as is
  if (!auqliCategories || !extractedCategory) {
    return extractedCategory
  }

  // Validate against Auqli categories
  // Check for exact match
  const exactMatch = auqliCategories.find(
    (cat) => cat.name && cat.name.toLowerCase() === extractedCategory.toLowerCase(),
  )

  if (exactMatch) {
    return exactMatch.name
  }

  // Check for partial match
  const partialMatch = auqliCategories.find(
    (cat) =>
      cat.name &&
      (cat.name.toLowerCase().includes(extractedCategory.toLowerCase()) ||
        extractedCategory.toLowerCase().includes(cat.name.toLowerCase())),
  )

  if (partialMatch) {
    return partialMatch.name
  }

  // If no match found, return the original extraction
  return extractedCategory
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

// Update the findMatchingCategory function to use our enhanced fashion matcher first
// Find the findMatchingCategory function and update it to include this at the beginning:

function findMatchingCategory(productName, productDescription, categories) {
  if (!categories || categories.length === 0) {
    return { mainCategory: "", subCategory: "", confidence: 0 }
  }

  // First, try our enhanced fashion category matcher for specific fashion items
  // This should catch the items that were previously being missed
  const fashionMatch = matchFashionCategory(productName)
  if (fashionMatch && fashionMatch.confidence >= 80) {
    // If we have a high-confidence fashion match, use it
    return fashionMatch
  }

  // Continue with the existing matching logic...
  // (rest of the function remains the same)
}

/**
 * Enhanced category matching dictionary with expanded terms
 */
export const smartMatchCategories = {
  Fashion: [
    "shirt",
    "t-shirt",
    "tee",
    "polo",
    "henley",
    "long sleeve",
    "crewneck",
    "singlet",
    "tank",
    "tanktop",
    "sweater",
    "knitwear",
    "hoodie",
    "jacket",
    "puffer",
    "coat",
    "overcoat",
    "blazer",
    "vest",
    "jeans",
    "denim",
    "trousers",
    "chinos",
    "pants",
    "joggers",
    "shorts",
    "skirt",
    "leggings",
    "boxer",
    "briefs",
    "underwear",
    "bra",
    "tube",
    "top",
    "camisole",
    "blouse",
    "dress",
    "maxi dress",
    "mini dress",
    "gown",
    "scarf",
    "beanie",
    "cap",
    "bucket hat",
    "hat",
    "duckbill",
    "snapback",
    "accessory",
    "socks",
    "belt",
    "fashion",
    "fit",
    "clothing",
    "outfit",
    "apparel",
    "bomber",
    "funnel",
    "neck",
    "longline",
    "textured",
    "headband",
    "knitwear",
    "acrylic",
    "wool",
    "sweat",
    "replen",
    "check",
    "creased",
    "effect",
    "sleeve",
    "lilac",
    "grey",
    "gray",
    "black",
    "blue",
    "brown",
    "multi",
    "stone",
    "louis",
    "zara",
    "collussion",
    "asyou",
    "blend",
    "heylow",
    "bt core",
  ],
  "Health & Beauty": [
    "skincare",
    "moisturizer",
    "cleanser",
    "serum",
    "sunscreen",
    "spf",
    "toner",
    "face wash",
    "mask",
    "peel",
    "eye cream",
    "lip balm",
    "lipstick",
    "makeup",
    "foundation",
    "concealer",
    "highlighter",
    "mascara",
    "eyeliner",
    "fragrance",
    "perfume",
    "deodorant",
    "toothpaste",
    "toothbrush",
    "hairbrush",
    "razor",
    "shaving cream",
    "wellness",
    "health",
    "beauty",
    "vitamins",
    "supplement",
    "lotion",
    "cream",
    "shampoo",
    "conditioner",
    "hair dye",
    "nail polish",
    "facial",
    "body wash",
    "soap",
    "sanitizer",
    "cologne",
    "aftershave",
    "cosmetics",
    "skin care",
  ],
  "Mobile Phones": [
    "iphone",
    "samsung",
    "galaxy",
    "xiaomi",
    "oppo",
    "infinix",
    "itel",
    "nokia",
    "oneplus",
    "smartphone",
    "mobile",
    "android",
    "5g phone",
    "phone",
    "cell phone",
    "google pixel",
    "huawei",
    "vivo",
    "realme",
    "poco",
    "redmi",
    "honor",
    "motorola",
    "moto",
    "tecno",
    "alcatel",
    "blackberry",
    "sony",
    "lg",
    "htc",
  ],
  Tablets: [
    "ipad",
    "tablet",
    "android tablet",
    "galaxy tab",
    "surface",
    "fire hd",
    "tab",
    "ipad mini",
    "ipad pro",
    "touchscreen tablet",
    "kindle",
    "e-reader",
    "lenovo tab",
    "huawei matepad",
    "samsung tab",
    "xiaomi pad",
    "wacom",
    "drawing tablet",
    "graphics tablet",
  ],
  Computing: [
    "laptop",
    "notebook",
    "macbook",
    "chromebook",
    "keyboard",
    "mouse",
    "monitor",
    "ssd",
    "hdd",
    "hard drive",
    "processor",
    "cpu",
    "gpu",
    "graphics card",
    "motherboard",
    "pc",
    "desktop",
    "gaming pc",
    "power supply",
    "ram",
    "webcam",
    "cooling fan",
    "mechanical keyboard",
    "trackpad",
    "usb",
    "usb hub",
    "external drive",
    "computer",
    "dell",
    "hp",
    "lenovo",
    "asus",
    "acer",
    "msi",
    "razer",
    "logitech",
    "corsair",
    "intel",
    "amd",
    "nvidia",
    "router",
    "modem",
    "network",
    "printer",
    "scanner",
  ],
  Electronics: [
    "earbuds",
    "headphones",
    "earphones",
    "bluetooth",
    "speaker",
    "soundbar",
    "smartwatch",
    "charger",
    "powerbank",
    "tv",
    "remote",
    "hdmi",
    "adapter",
    "cable",
    "surveillance",
    "camera",
    "action cam",
    "tripod",
    "gimbal",
    "wearable",
    "digital device",
    "audio",
    "tech",
    "electronic",
    "airpods",
    "wireless",
    "microphone",
    "projector",
    "drone",
    "smart home",
    "alexa",
    "google home",
    "echo",
    "streaming",
    "gaming console",
    "playstation",
    "xbox",
    "nintendo",
    "switch",
    "controller",
    "vr",
    "virtual reality",
  ],
  "Baby & Kids": [
    "baby",
    "kids",
    "child",
    "toddler",
    "infant",
    "babywear",
    "onesie",
    "romper",
    "bib",
    "stroller",
    "crib",
    "baby toy",
    "diaper",
    "milk bottle",
    "pacifier",
    "nursery",
    "baby clothing",
    "baby shoes",
    "children",
    "feeding",
    "baby food",
    "baby monitor",
    "car seat",
    "high chair",
    "playpen",
    "baby carrier",
    "teether",
    "baby lotion",
    "baby shampoo",
    "baby powder",
    "baby wipes",
    "potty",
    "school",
  ],
  "Home & Living": [
    "furniture",
    "sofa",
    "chair",
    "table",
    "bed",
    "mattress",
    "pillow",
    "cushion",
    "blanket",
    "sheet",
    "duvet",
    "comforter",
    "curtain",
    "blind",
    "rug",
    "carpet",
    "lamp",
    "lighting",
    "clock",
    "mirror",
    "shelf",
    "storage",
    "kitchenware",
    "cookware",
    "utensil",
    "plate",
    "bowl",
    "cup",
    "mug",
    "glass",
    "pot",
    "pan",
    "knife",
    "cutlery",
    "home decor",
    "vase",
    "candle",
    "frame",
    "artwork",
    "plant",
    "garden",
    "tool",
    "bathroom",
    "toilet",
    "shower",
    "towel",
    "bedding",
    "dining",
    "living room",
  ],
  "Sports & Outdoors": [
    "fitness",
    "exercise",
    "gym",
    "workout",
    "yoga",
    "running",
    "cycling",
    "swimming",
    "hiking",
    "camping",
    "outdoor",
    "sport",
    "ball",
    "racket",
    "bat",
    "glove",
    "helmet",
    "protective gear",
    "sportswear",
    "athletic",
    "training",
    "equipment",
    "bicycle",
    "skateboard",
    "scooter",
    "fishing",
    "hunting",
    "golf",
    "tennis",
    "basketball",
    "football",
    "soccer",
    "volleyball",
    "baseball",
    "treadmill",
    "weights",
    "dumbbell",
  ],
  "Jewelry & Accessories": [
    "jewelry",
    "necklace",
    "bracelet",
    "ring",
    "earring",
    "watch",
    "pendant",
    "charm",
    "brooch",
    "anklet",
    "gold",
    "silver",
    "diamond",
    "gemstone",
    "pearl",
    "crystal",
    "sunglasses",
    "eyeglasses",
    "wallet",
    "purse",
    "handbag",
    "backpack",
    "bag",
    "luggage",
    "suitcase",
    "travel",
    "umbrella",
    "gloves",
    "tie",
    "bowtie",
    "cufflink",
  ],
}
