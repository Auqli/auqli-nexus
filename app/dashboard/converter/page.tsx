import { redirect } from "next/navigation"

export default function DashboardConverterPage() {
  // Redirect to the existing converter page
  // This is a temporary solution until we fully migrate the tool
  redirect("/converter")
}
