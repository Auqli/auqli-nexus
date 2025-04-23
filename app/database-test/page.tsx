import { DatabaseTester } from "@/components/database-tester"

export default function DatabaseTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      <div className="max-w-2xl mx-auto">
        <DatabaseTester />
      </div>
    </div>
  )
}
