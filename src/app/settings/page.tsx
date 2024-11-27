'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type FormField = {
  onChange: (...event: any[]) => void;
  value: any;
}

const settingsSchema = z.object({
  profitThreshold: z.number().min(0).max(100),
  lossThreshold: z.number().min(0).max(100),
  holdingPeriod: z.number().min(1).max(1440),
  slippageTolerance: z.number().min(0).max(10),
  maxTradesPerDay: z.number().min(1).max(1000),
  tradingStrategy: z.enum(['conservative', 'moderate', 'aggressive']),
  enableNotifications: z.boolean(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

// In a real application, these would be API calls
const fetchSettings = (): Promise<SettingsFormValues> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        profitThreshold: 5,
        lossThreshold: 3,
        holdingPeriod: 60,
        slippageTolerance: 1,
        maxTradesPerDay: 10,
        tradingStrategy: 'moderate',
        enableNotifications: true,
      })
    }, 1000)
  })
}

const saveSettings = (settings: SettingsFormValues): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Settings saved:', settings)
      resolve()
    }, 1000)
  })
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      profitThreshold: 5,
      lossThreshold: 3,
      holdingPeriod: 60,
      slippageTolerance: 1,
      maxTradesPerDay: 10,
      tradingStrategy: 'moderate',
      enableNotifications: true,
    },
  })

  useEffect(() => {
    fetchSettings().then((settings) => {
      form.reset(settings)
      setIsLoading(false)
    })
  }, [form])

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setIsLoading(true)
      await saveSettings(data)
      toast({
        title: "Settings saved",
        description: "Your bot settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Bot Settings</CardTitle>
          <CardDescription>Configure your Solana Trading Bot parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="profitThreshold"
                render={({ field }: { field: FormField }) => (
                  <FormItem>
                    <FormLabel>Profit Threshold (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>
                      The percentage of profit at which the bot will sell
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lossThreshold"
                render={({ field }: { field: FormField }) => (
                  <FormItem>
                    <FormLabel>Loss Threshold (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>
                      The percentage of loss at which the bot will sell
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="holdingPeriod"
                render={({ field }: { field: FormField }) => (
                  <FormItem>
                    <FormLabel>Holding Period (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>
                      The minimum time to hold a token before selling
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slippageTolerance"
                render={({ field }: { field: FormField }) => (
                  <FormItem>
                    <FormLabel>Slippage Tolerance (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>
                      The maximum allowed slippage for transactions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxTradesPerDay"
                render={({ field }: { field: FormField }) => (
                  <FormItem>
                    <FormLabel>Max Trades Per Day</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>
                      The maximum number of trades the bot can make in a day
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tradingStrategy"
                render={({ field }: { field: FormField }) => (
                  <FormItem>
                    <FormLabel>Trading Strategy</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a trading strategy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose a trading strategy that fits your risk tolerance
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enableNotifications"
                render={({ field }: { field: FormField }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable Notifications
                      </FormLabel>
                      <FormDescription>
                        Receive notifications about important bot activities
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mb-2"
                onClick={() => {
                  form.reset({
                    profitThreshold: 5,
                    lossThreshold: 3,
                    holdingPeriod: 60,
                    slippageTolerance: 1,
                    maxTradesPerDay: 10,
                    tradingStrategy: 'moderate',
                    enableNotifications: true,
                  })
                  toast({
                    title: "Settings reset",
                    description: "Your bot settings have been reset to default values.",
                  })
                }}
              >
                Reset to Defaults
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" className="w-full">Save Settings</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will update your bot's trading parameters. Please review your changes carefully.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Continue'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}