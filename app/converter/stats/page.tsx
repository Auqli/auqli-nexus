import { ConverterOperations } from "@/components/converter-operations"

export default function ConverterStatsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">CSV Converter Statistics</h1>
      <ConverterOperations />
    </div>
  )
}
