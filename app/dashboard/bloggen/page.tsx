import { redirect } from "next/navigation"

export default function DashboardBlogGenPage() {
  // Redirect to the existing bloggen page
  // This is a temporary solution until we fully migrate the tool
  redirect("/bloggen")
}
