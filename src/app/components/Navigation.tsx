import Link from 'next/link'
import { Home, Settings, List } from 'lucide-react'

export function Navigation() {
  return (
    <nav className="bg-secondary p-4">
      <ul className="flex justify-center space-x-4">
        <li>
          <Link href="/" className="flex items-center space-x-2 text-primary">
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link href="/settings" className="flex items-center space-x-2 text-primary">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </li>
        <li>
          <Link href="/trades" className="flex items-center space-x-2 text-primary">
            <List className="h-5 w-5" />
            <span>Trades</span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}