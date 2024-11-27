'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, DollarSign, Settings, Activity, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

// Add proper type for the dashboard data
type DashboardData = {
  totalBalance: number;
  profitLoss: number;
  activeTrades: number;
  priceData: Array<{ time: string; price: number }>;
  holdings: Array<{ token: string; amount: number; value: number }>;
  recentTrades: Array<{
    id: number;
    token: string;
    type: string;
    amount: number;
    price: number;
    time: string;
  }>;
}

// In a real application, these would be fetched from an API
const fetchDashboardData = (): Promise<DashboardData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalBalance: 1750.00,
        profitLoss: 123.45,
        activeTrades: 7,
        priceData: [
          { time: '00:00', price: 100 },
          { time: '04:00', price: 120 },
          { time: '08:00', price: 110 },
          { time: '12:00', price: 130 },
          { time: '16:00', price: 140 },
          { time: '20:00', price: 135 },
        ],
        holdings: [
          { token: 'SOL', amount: 10, value: 1000 },
          { token: 'RAY', amount: 100, value: 500 },
          { token: 'SRM', amount: 50, value: 250 },
        ],
        recentTrades: [
          { id: 1, token: 'SOL', type: 'BUY', amount: 2, price: 100, time: '2023-06-10 14:30' },
          { id: 2, token: 'RAY', type: 'SELL', amount: 50, price: 5, time: '2023-06-10 13:45' },
          { id: 3, token: 'SRM', type: 'BUY', amount: 25, price: 10, time: '2023-06-10 12:15' },
        ],
      })
    }, 1000) // Simulate network delay
  })
}

export default function DashboardPage() {
  const [botActive, setBotActive] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData()
        setDashboardData(data)
        setLoading(false)
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.')
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Bunny Sol Bot</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.totalBalance.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Profit/Loss</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboardData.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dashboardData.profitLoss >= 0 ? '+' : '-'}${Math.abs(dashboardData.profitLoss).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeTrades}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${botActive ? 'text-green-600' : 'text-red-600'}`}>
              {botActive ? 'Active' : 'Inactive'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-wrap justify-between mb-8 gap-4">
        <Button onClick={() => setBotActive(true)} disabled={botActive}>Start Bot</Button>
        <Button variant="outline" onClick={() => setBotActive(false)} disabled={!botActive}>Stop Bot</Button>
        <Link href="/settings">
          <Button variant="secondary">Bot Settings</Button>
        </Link>
        <Link href="/trades">
          <Button variant="secondary">View All Trades</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Price Chart (SOL/USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.priceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Value (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.holdings.map((holding) => (
                  <TableRow key={holding.token}>
                    <TableCell>{holding.token}</TableCell>
                    <TableCell>{holding.amount}</TableCell>
                    <TableCell>${holding.value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.recentTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>{trade.token}</TableCell>
                  <TableCell>{trade.type}</TableCell>
                  <TableCell>{trade.amount}</TableCell>
                  <TableCell>${trade.price.toFixed(2)}</TableCell>
                  <TableCell>{trade.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Bunny Sol Bot</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex flex-wrap justify-between mb-8 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-[100px]" />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}