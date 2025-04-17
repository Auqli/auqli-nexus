/**
 * Specialized fashion category mapping dictionary
 * This provides more specific mappings for fashion items that are commonly missed
 */
export const fashionCategoryMappings = {
  // Headwear
  "bucket hat": { mainCategory: "Fashion", subCategory: "Hats" },
  "cadet cap": { mainCategory: "Fashion", subCategory: "Hats" },
  "baseball cap": { mainCategory: "Fashion", subCategory: "Hats" },
  cap: { mainCategory: "Fashion", subCategory: "Hats" },
  beanie: { mainCategory: "Fashion", subCategory: "Hats" },
  hat: { mainCategory: "Fashion", subCategory: "Hats" },
  headband: { mainCategory: "Fashion", subCategory: "Hair Accessories" },

  // Tops
  tank: { mainCategory: "Fashion", subCategory: "Tank Tops" },
  "tank top": { mainCategory: "Fashion", subCategory: "Tank Tops" },
  "tank-top": { mainCategory: "Fashion", subCategory: "Tank Tops" },
  tee: { mainCategory: "Fashion", subCategory: "T-Shirts" },
  "t-shirt": { mainCategory: "Fashion", subCategory: "T-Shirts" },
  tshirt: { mainCategory: "Fashion", subCategory: "T-Shirts" },
  shirt: { mainCategory: "Fashion", subCategory: "Shirts" },
  "resort shirt": { mainCategory: "Fashion", subCategory: "Casual Shirts" },
  "check shirt": { mainCategory: "Fashion", subCategory: "Casual Shirts" },
  sweatshirt: { mainCategory: "Fashion", subCategory: "Sweatshirts" },
  hoodie: { mainCategory: "Fashion", subCategory: "Hoodies" },
  polo: { mainCategory: "Fashion", subCategory: "Polo Shirts" },
  blouse: { mainCategory: "Fashion", subCategory: "Blouses" },
  top: { mainCategory: "Fashion", subCategory: "Tops" },

  // Bottoms
  shorts: { mainCategory: "Fashion", subCategory: "Shorts" },
  "linen shorts": { mainCategory: "Fashion", subCategory: "Shorts" },
  jeans: { mainCategory: "Fashion", subCategory: "Jeans" },
  pants: { mainCategory: "Fashion", subCategory: "Pants" },
  trousers: { mainCategory: "Fashion", subCategory: "Pants" },
  chinos: { mainCategory: "Fashion", subCategory: "Pants" },
  skirt: { mainCategory: "Fashion", subCategory: "Skirts" },
  leggings: { mainCategory: "Fashion", subCategory: "Leggings" },

  // Swimwear
  trunk: { mainCategory: "Fashion", subCategory: "Swimwear" },
  swim: { mainCategory: "Fashion", subCategory: "Swimwear" },
  swimwear: { mainCategory: "Fashion", subCategory: "Swimwear" },
  bikini: { mainCategory: "Fashion", subCategory: "Swimwear" },
  swimming: { mainCategory: "Fashion", subCategory: "Swimwear" },

  // Footwear
  loafer: { mainCategory: "Fashion", subCategory: "Loafers" },
  loafers: { mainCategory: "Fashion", subCategory: "Loafers" },
  "bit loafer": { mainCategory: "Fashion", subCategory: "Loafers" },
  "fringe loafers": { mainCategory: "Fashion", subCategory: "Loafers" },
  shoes: { mainCategory: "Fashion", subCategory: "Shoes" },
  sneakers: { mainCategory: "Fashion", subCategory: "Sneakers" },
  boots: { mainCategory: "Fashion", subCategory: "Boots" },
  sandals: { mainCategory: "Fashion", subCategory: "Sandals" },
  slippers: { mainCategory: "Fashion", subCategory: "Slippers" },

  // Accessories
  belt: { mainCategory: "Fashion", subCategory: "Belts" },
  wallet: { mainCategory: "Fashion", subCategory: "Wallets" },
  bag: { mainCategory: "Fashion", subCategory: "Bags" },
  backpack: { mainCategory: "Fashion", subCategory: "Backpacks" },
  purse: { mainCategory: "Fashion", subCategory: "Purses" },
  scarf: { mainCategory: "Fashion", subCategory: "Scarves" },
  gloves: { mainCategory: "Fashion", subCategory: "Gloves" },
  socks: { mainCategory: "Fashion", subCategory: "Socks" },
  tie: { mainCategory: "Fashion", subCategory: "Ties" },
  watch: { mainCategory: "Fashion", subCategory: "Watches" },
  jewelry: { mainCategory: "Fashion", subCategory: "Jewelry" },
  necklace: { mainCategory: "Fashion", subCategory: "Necklaces" },
  bracelet: { mainCategory: "Fashion", subCategory: "Bracelets" },
  earrings: { mainCategory: "Fashion", subCategory: "Earrings" },
  ring: { mainCategory: "Fashion", subCategory: "Rings" },
  sunglasses: { mainCategory: "Fashion", subCategory: "Sunglasses" },

  // Outerwear
  jacket: { mainCategory: "Fashion", subCategory: "Jackets" },
  coat: { mainCategory: "Fashion", subCategory: "Coats" },
  blazer: { mainCategory: "Fashion", subCategory: "Blazers" },
  cardigan: { mainCategory: "Fashion", subCategory: "Cardigans" },
  sweater: { mainCategory: "Fashion", subCategory: "Sweaters" },
  vest: { mainCategory: "Fashion", subCategory: "Vests" },
  puffer: { mainCategory: "Fashion", subCategory: "Puffer Jackets" },

  // Dresses
  dress: { mainCategory: "Fashion", subCategory: "Dresses" },
  gown: { mainCategory: "Fashion", subCategory: "Gowns" },
  "maxi dress": { mainCategory: "Fashion", subCategory: "Maxi Dresses" },
  "mini dress": { mainCategory: "Fashion", subCategory: "Mini Dresses" },

  // Underwear
  underwear: { mainCategory: "Fashion", subCategory: "Underwear" },
  boxers: { mainCategory: "Fashion", subCategory: "Boxers" },
  briefs: { mainCategory: "Fashion", subCategory: "Briefs" },
  bra: { mainCategory: "Fashion", subCategory: "Bras" },
  panties: { mainCategory: "Fashion", subCategory: "Panties" },
  lingerie: { mainCategory: "Fashion", subCategory: "Lingerie" },

  // Specific brand patterns
  sovereign: { mainCategory: "Fashion", subCategory: "Loafers" },
  savanna: { mainCategory: "Fashion", subCategory: "Loafers" },
  kalmar: { mainCategory: "Fashion", subCategory: "Tank Tops" },
  "stone bucket": { mainCategory: "Fashion", subCategory: "Hats" },
  stanford: { mainCategory: "Fashion", subCategory: "Hats" },
  jacnorman: { mainCategory: "Fashion", subCategory: "Swimwear" },
  jacsimon: { mainCategory: "Fashion", subCategory: "Belts" },
  invalli: { mainCategory: "Fashion", subCategory: "Sweatshirts" },
  "chill linen": { mainCategory: "Fashion", subCategory: "Shorts" },
  jprbl: { mainCategory: "Fashion", subCategory: "Shirts" },
}

/**
 * Specialized size pattern detection for fashion items
 */
export const sizePatterns = {
  // Standard sizes
  xs: true,
  s: true,
  m: true,
  l: true,
  xl: true,
  xxl: true,
  xxxl: true,
  "2xl": true,
  "3xl": true,
  "4xl": true,
  "5xl": true,

  // Numeric sizes (common for pants, shoes)
  34: true,
  36: true,
  38: true,
  40: true,
  42: true,
  43: true,
  44: true,
  45: true,
  46: true,
  47: true,
  48: true,
  50: true,
  52: true,
  54: true,
}

/**
 * Color patterns for fashion items
 */
export const colorPatterns = {
  black: true,
  white: true,
  grey: true,
  gray: true,
  navy: true,
  blue: true,
  red: true,
  green: true,
  yellow: true,
  pink: true,
  purple: true,
  orange: true,
  brown: true,
  beige: true,
  khaki: true,
  camo: true,
  multi: true,
  stone: true,
  lilac: true,
}
