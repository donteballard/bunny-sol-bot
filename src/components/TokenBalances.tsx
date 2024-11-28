'use client'

import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'

interface TokenBalance {
  mint: string
  balance: number
  decimals: number
}

export function TokenBalances() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTokenBalances = async () => {
      if (!publicKey) {
        setBalances([])
        setLoading(false)
        return
      }

      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID
        })

        const balances = tokenAccounts.value.map(accountInfo => {
          const parsedInfo = accountInfo.account.data.parsed.info
          return {
            mint: parsedInfo.mint,
            balance: parsedInfo.tokenAmount.uiAmount,
            decimals: parsedInfo.tokenAmount.decimals
          }
        })

        setBalances(balances)
      } catch (error) {
        console.error('Error fetching token balances:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokenBalances()
  }, [connection, publicKey])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (balances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No tokens found in this wallet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {balances.map((token, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>{token.mint.slice(0, 4)}...{token.mint.slice(-4)}</span>
              <span>{token.balance.toFixed(token.decimals)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}