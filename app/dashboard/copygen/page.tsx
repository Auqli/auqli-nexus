import { redirect } from "next/navigation"

export default function DashboardCopyGenPage() {
  // Redirect to the existing copygen page
  // This is a temporary solution until we fully migrate the tool
  redirect("/copygen")
}
