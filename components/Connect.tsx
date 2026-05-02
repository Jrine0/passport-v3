"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { connectWallet, disconnectWallet, getWalletLabel, getWalletStatus, shortenAddress, type WalletName } from "@/lib/passport"

export default function Connect() {
  const [activeWallet, setActiveWallet] = useState<WalletName | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingWallet, setLoadingWallet] = useState<WalletName | null>(null)

  useEffect(() => {
    const storedWallet = window.localStorage.getItem("passport-wallet") as WalletName | null

    if (storedWallet) {
      const status = getWalletStatus(storedWallet)
      if (status) {
        setActiveWallet(status.name)
        setWalletAddress(status.address)
      }
    }
  }, [])

  const handleConnect = async (walletName: WalletName) => {
    try {
      setLoadingWallet(walletName)
      setError(null)
      const state = await connectWallet(walletName)
      setActiveWallet(state.name)
      setWalletAddress(state.address)
      window.localStorage.setItem("passport-wallet", state.name)
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : "Unable to connect wallet")
    } finally {
      setLoadingWallet(null)
    }
  }

  const handleDisconnect = async () => {
    if (!activeWallet) return

    await disconnectWallet(activeWallet)
    window.localStorage.removeItem("passport-wallet")
    setActiveWallet(null)
    setWalletAddress(null)
    setError(null)
  }

  if (activeWallet && walletAddress) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/90 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Connected wallet</p>
          <p className="text-lg font-semibold text-foreground">
            {getWalletLabel(activeWallet)} {shortenAddress(walletAddress)}
          </p>
        </div>
        <Button onClick={handleDisconnect} variant="outline" className="bg-transparent">
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button onClick={() => handleConnect("freighter")} disabled={loadingWallet !== null} className="gap-2">
          {loadingWallet === "freighter" ? "Connecting..." : "Connect Freighter"}
        </Button>
        <Button onClick={() => handleConnect("albedo")} disabled={loadingWallet !== null} variant="outline" className="gap-2 bg-transparent">
          {loadingWallet === "albedo" ? "Connecting..." : "Connect Albedo"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Use a Stellar wallet to issue passports, sign inspector actions, and keep the flow fully on chain.
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}