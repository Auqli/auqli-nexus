import { DatabaseAnalyzer } from "@/components/database-analyzer"
import { SupabaseConnectionTest } from "@/components/supabase-connection-test"

export default function DatabaseAdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Database Administration</h1>
      <div className="max-w-6xl mx-auto">
        <SupabaseConnectionTest />
        <DatabaseAnalyzer />
      </div>
    </div>
  )
}
