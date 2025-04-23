import { DatabaseCleanup } from "@/components/database-cleanup"

export default function DatabaseCleanupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Database Cleanup & Analysis</h1>
      <div className="max-w-6xl mx-auto">
        <DatabaseCleanup />
      </div>
    </div>
  )
}
