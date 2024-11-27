"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Settings, List } from 'lucide-react'
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/trades", label: "Trades", icon: List },
  ]

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <ul className="flex justify-center space-x-8">
          {links.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link 
                href={href} 
                className={cn(
                  "flex items-center space-x-2 py-4 text-sm font-medium transition-colors hover:text-primary",
                  pathname === href 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
} 