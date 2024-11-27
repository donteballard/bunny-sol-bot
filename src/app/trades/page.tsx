'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'
import { ErrorBoundary } from 'react-error-boundary'

const tradeSchema = z.object({
  id: z.string(),
  token: z.string(),
  type: z.enum(['BUY', 'SELL']),
  amount: z.number(),
  price: z.number(),
  timestamp: z.date(),
  profit: z.number().nullable(),
})

type Trade = z.infer<typeof tradeSchema>

const filterSchema = z.object({
  token: z.string().optional(),
  type: z.enum(['BUY', 'SELL', 'ALL']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

type FilterValues = z.infer<typeof filterSchema>

const fetchTrades = async (filters: FilterValues, page: number): Promise<{ trades: Trade[], totalPages: number }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))

  const mockTrades: Trade[] = [
    { id: '1', token: 'SOL', type: 'BUY', amount: 10, price: 20, timestamp: new Date('2023-06-01T10:00:00'), profit: null },
    { id: '2', token: 'RAY', type: 'SELL', amount: 50, price: 5, timestamp: new Date('2023-06-02T11:30:00'), profit: 25 },
    { id: '3', token: 'SRM', type: 'BUY', amount: 100, price: 2, timestamp: new Date('2023-06-03T09:15:00'), profit: null },
    { id: '4', token: 'SOL', type: 'SELL', amount: 5, price: 22, timestamp: new Date('2023-06-04T14:45:00'), profit: 10 },
    { id: '5', token: 'RAY', type: 'BUY', amount: 75, price: 4.5, timestamp: new Date('2023-06-05T16:20:00'), profit: null },
  ]

  const filteredTrades = mockTrades.filter(trade => {
    if (filters.token && trade.token !== filters.token) return false
    if (filters.type && filters.type !== 'ALL' && trade.type !== filters.type) return false
    if (filters.dateFrom && trade.timestamp < new Date(filters.dateFrom)) return false
    if (filters.dateTo && trade.timestamp > new Date(filters.dateTo)) return false
    return true
  })

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTrades = filteredTrades.slice(startIndex, endIndex)

  return {
    trades: paginatedTrades,
    totalPages: Math.ceil(filteredTrades.length / itemsPerPage)
  }
}

type ErrorFallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div role="alert" className="p-4 bg-red-100 border border-red-400 rounded">
      <h2 className="text-lg font-semibold text-red-800">Something went wrong:</h2>
      <pre className="mt-2 text-sm text-red-600">{error.message}</pre>
      <button onClick={resetErrorBoundary} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
        Try again
      </button>
    </div>
  )
}

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Trade; direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      token: '',
      type: 'ALL',
      dateFrom: '',
      dateTo: '',
    },
  })

  const loadTrades = async (filters: FilterValues, page: number) => {
    setIsLoading(true)
    try {
      const { trades: fetchedTrades, totalPages: fetchedTotalPages } = await fetchTrades(filters, page)
      setTrades(fetchedTrades)
      setTotalPages(fetchedTotalPages)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load trades. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTrades(form.getValues(), currentPage)
  }, [currentPage])

  const onSubmit = (data: FilterValues) => {
    setCurrentPage(1)
    loadTrades(data, 1)
  }

  const handleSort = (key: keyof Trade) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })

    const sortedTrades = [...trades].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
      return 0
    })

    setTrades(sortedTrades)
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => loadTrades(form.getValues(), currentPage)}>
      <div className="container mx-auto p-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>View and filter your bot's trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. SOL" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select trade type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ALL">All</SelectItem>
                            <SelectItem value="BUY">Buy</SelectItem>
                            <SelectItem value="SELL">Sell</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Apply Filters'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trades</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : trades.length === 0 ? (
              <p className="text-center text-muted-foreground">No trades found.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('token')}>
                          Token {sortConfig?.key === 'token' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                          Type {sortConfig?.key === 'type' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                          Amount {sortConfig?.key === 'amount' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>
                          Price {sortConfig?.key === 'price' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('timestamp')}>
                          Date {sortConfig?.key === 'timestamp' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('profit')}>
                          Profit/Loss {sortConfig?.key === 'profit' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trades.map((trade: Trade) => (
                        <TableRow key={trade.id}>
                          <TableCell>{trade.token}</TableCell>
                          <TableCell>{trade.type}</TableCell>
                          <TableCell>{trade.amount}</TableCell>
                          <TableCell>${trade.price.toFixed(2)}</TableCell>
                          <TableCell>{format(trade.timestamp, 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                          <TableCell>
                            {trade.profit !== null ? (
                              <span className={trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                ${trade.profit.toFixed(2)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        size="default"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          size="default"
                          onClick={() => setCurrentPage(i + 1)} 
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        size="default"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  )
}