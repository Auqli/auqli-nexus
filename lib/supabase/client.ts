import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a single instance of the Supabase client to be used across the app
// This prevents multiple instances from being created
export const createClient = () => {
  return createClientComponentClient()
}
