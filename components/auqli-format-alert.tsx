import { CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AuqliFormatAlertProps {
  message: string
}

export function AuqliFormatAlert({ message }: AuqliFormatAlertProps) {
  return (
    <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <AlertTitle className="text-green-800 dark:text-green-300">Already in Auqli Format</AlertTitle>
      <AlertDescription className="text-green-700 dark:text-green-400">
        <p className="mb-2">{message}</p>
        <p className="text-sm">
          This file is already in the correct format for Auqli. You can download it directly or upload it to Auqli. If
          you need assistance, please{" "}
          <a href="mailto:support@auqli.com" className="underline">
            contact Auqli support
          </a>
          .
        </p>
      </AlertDescription>
    </Alert>
  )
}
