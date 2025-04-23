"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"

export function RealtimeNotifications() {
  const [newMapping, setNewMapping] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    const channel = supabase
      .channel("public:category_mappings")
      .on("postgres_changes", { event: "*", schema: "public", table: "category_mappings" }, (payload) => {
        if (payload.new) {
          setNewMapping(payload.new)
          toast({
            title: "New Category Mapping",
            description: `New mapping added for ${payload.new.product_name}`,
            variant: "success",
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast])

  return null
}
