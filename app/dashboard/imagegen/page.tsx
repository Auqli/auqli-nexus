import { redirect } from "next/navigation"

export default function DashboardImageGenPage() {
  // Redirect to the existing imagegen page
  // This is a temporary solution until we fully migrate the tool
  redirect("/imagegen")
}
