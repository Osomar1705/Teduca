export interface MerchProduct {
  id: string
  name: string
  description: string | null
  price: number | null
  currency: string
  image: string
  images: string[]
  category: string | null
  stock: number
  active: boolean
}
