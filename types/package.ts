export interface Package {
  id: string
  name: string
  price: number
  billing_period: "free" | "daily" | "monthly" | "yearly"
  description: string | null
  created_at: string
  updated_at: string
  stripe_price_id: string
  duration: number // Duration in days
}

