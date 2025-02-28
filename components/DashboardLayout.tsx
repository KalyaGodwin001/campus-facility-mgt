import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import UserManagement from "./userManagement"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  userName: string
  titleClassName?: string
}

export default function DashboardLayout({ children, title, userName }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE5E5] to-[#FFD1D1]">
      <div className="fixed inset-0 w-full h-full">
        <Image
          src="https://media.istockphoto.com/id/1437410049/photo/abstract-white-watercolor-painting-texture-background-stain-watercolor-for-design.jpg?s=612x612&w=0&k=20&c=bHzaXcsq7-aczwhgSSnwyecJJIMRYJNAFTEBlRZDeNg="
          alt="Dashboard background"
          fill
          className="object-cover"
          quality={100}
          priority
        />
      </div>
      <div className="relative z-10 min-h-screen p-6 max-w-7xl mx-auto">
        <nav className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="inline-flex items-center gap-2 text-[#800000] hover:text-[#600000]">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-2 h-auto p-0 text-[#800000] hover:text-[#600000]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <header className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6 mb-8 border-l-4 border-[#800000]">
          <h1 className="text-xl font-extrabold text-[#800000]">{title}</h1>
          <p className="text-md text-gray-600 mt-2 italic">Welcome, {userName}</p>
        </header>
        {/* UserManagement */}
        <div className="space-y-4">
          <UserManagement />
          <main className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

