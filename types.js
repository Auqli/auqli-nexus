/**
 * @typedef {Object} AuqliCategory
 * @property {string} id
 * @property {string} name
 * @property {AuqliCategory[]} [subcategories]
 */

/**
 * @typedef {Object} Product
 * @property {string} name
 * @property {string} price
 * @property {string} image
 * @property {string} description
 * @property {string} weight
 * @property {string} inventory
 * @property {string} condition
 * @property {string} mainCategory
 * @property {string} subCategory
 * @property {string} uploadStatus
 * @property {string[]} additionalImages
 */

// Export the types for documentation purposes
export const types = {
  AuqliCategory: "AuqliCategory",
  Product: "Product",
}
