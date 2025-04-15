export interface AuqliCategory {
  id: string
  name: string
  subcategories?: AuqliCategory[]
}

export interface Product {
  name: string
  price: string
  image: string
  description: string
  weight: string
  inventory: string
  condition: string
  mainCategory: string
  subCategory: string
  uploadStatus: string
  additionalImages: string[]
}
