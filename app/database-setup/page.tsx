import { DatabaseSetup } from "@/components/database-setup"

export default function DatabaseSetupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Database Setup</h1>
      <div className="max-w-2xl mx-auto">
        <DatabaseSetup />
      </div>
    </div>
  )
}
