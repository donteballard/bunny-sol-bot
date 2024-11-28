'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useEffect } from 'react'
import { toast } from "@/components/ui/use-toast"
import { handleError, createAppError } from '@/lib/errorHandler'

export function WalletConnection() {
  const { wallet, connect, connected, disconnect } = useWallet()

  useEffect(() => {
    if (connected) {
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected.",
      })
    }
  }, [connected])

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      handleError(createAppError('Failed to connect wallet', 'WALLET_NOT_CONNECTED', 'high'))
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      })
    } catch (error) {
      handleError(createAppError('Failed to disconnect wallet', 'WALLET_NOT_CONNECTED', 'medium'))
    }
  }

  return (
    <div>
      <WalletMultiButton />
    </div>
  )
}