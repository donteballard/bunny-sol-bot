'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, DollarSign, Settings, Activity, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserSettings, getPerformanceMetrics, getTrades, connectWebSocket } from '@/lib/api'
import { toast } from "@/components/ui/use-toast"
import { AppError } from '@/lib/errorHandler'
import { Socket } from 'socket.io-client'
import { TokenBalances } from '@/components/TokenBalances'
import { useWallet } from '@solana/wallet-adapter-react'

interface DashboardData {
  settings: any; // Replace with proper type from your API
  metrics: any; // Replace with proper type from your API
  trades: Array<{
    id: string;
    token: string;
    type: string;
    amount: number;
    price: number;
    timestamp: string;
  }>;
}

export default function DashboardPage() {
  const [botActive, setBotActive] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settings, metrics, trades] = await Promise.all([
          getUserSettings(),
          getPerformanceMetrics(),
          getTrades()
        ])
        
        setDashboardData({
          settings: settings.data,
          metrics: metrics.data,
          trades: trades.data
        })
        setLoading(false)
      } catch (error) {
        const appError = error as AppError
        setError(appError.message || 'Failed to load dashboard data. Please try again later.')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!dashboardData) return;

    let socket: Socket | null = null;

    const connectSocket = async () => {
      try {
        socket = await connectWebSocket();
        
        if (!socket) return;

        socket.on('trade_executed', (newTrade: DashboardData['trades'][0]) => {
          setDashboardData(prevData => {
            if (!prevData) return prevData;
            return {
              ...prevData,
              trades: [newTrade, ...prevData.trades.slice(0, 29)]
            };
          });
        });

        socket.on('performance_update', (newMetrics: DashboardData['metrics']) => {
          setDashboardData(prevData => {
            if (!prevData) return prevData;
            return {
              ...prevData,
              metrics: newMetrics
            };
          });
        });
      } catch (error) {
        const appError = error as AppError;
        console.error('WebSocket connection error:', appError.message);
      }
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [dashboardData]);

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

  if (!dashboardData) {
    return <div>No data available</div>
  }

  const { settings, metrics, trades } = dashboardData

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Bunny Sol Bot Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <TokenBalances />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalBalance.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Profit/Loss</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.dailyProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.dailyProfitLoss >= 0 ? '+' : '-'}${Math.abs(metrics.dailyProfitLoss).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeTrades}</div>
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
              <LineChart data={trades.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[metrics]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalTrades" fill="#8884d8" name="Total Trades" />
                <Bar dataKey="successfulTrades" fill="#82ca9d" name="Successful Trades" />
                <Bar dataKey="failedTrades" fill="#ffc658" name="Failed Trades" />
              </BarChart>
            </ResponsiveContainer>
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
              {trades.slice(0, 5).map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>{trade.token}</TableCell>
                  <TableCell>{trade.type}</TableCell>
                  <TableCell>{trade.amount}</TableCell>
                  <TableCell>${trade.price.toFixed(2)}</TableCell>
                  <TableCell>{new Date(trade.timestamp).toLocaleString()}</TableCell>
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
      <h1 className="text-4xl font-bold mb-8">Bunny Sol Bot Dashboard</h1>
      
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
            <Skeleton className="h-[300px] w-full" />
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