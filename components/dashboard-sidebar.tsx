"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Database, Settings, FileText, Upload, BarChart } from "lucide-react"

export function DashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Category Mappings",
      href: "/dashboard/mappings",
      icon: <Database className="h-5 w-5" />,
    },
    {
      name: "CSV Converter",
      href: "/converter",
      icon: <Upload className="h-5 w-5" />,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <aside className="hidden md:flex w-64 flex-col bg-[#0a0f1a] text-white">
      <div className="p-6">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-semibold">Auqli Nexus</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    pathname === item.href
                      ? "bg-[#16783a] text-white hover:bg-[#16783a]/90"
                      : "text-gray-300 hover:bg-[#1a2235] hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#16783a] flex items-center justify-center">
            <span className="font-bold">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-400">admin@auqli.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
