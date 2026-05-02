"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarDays, CheckCircle2, Fingerprint, Shield, Upload } from "lucide-react"

import Connect from "@/components/Connect"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  buildIssuePayload,
  getConnectedWalletAddress,
  getWalletLabel,
  getWalletStatus,
  generatePassportId,
  generateQrValue,
  passportTypes,
  shortenAddress,
  submitPassportInvocation,
  type PassportUseCase,
  type WalletName,
} from "@/lib/passport"

type IssueResult = {
  passportId: string
  qrValue: string
  transactionHash: string
  owner: string
  issuer: string
  expiresAt: string
}

export default function MintPage() {
  const [activeWallet, setActiveWallet] = useState<{ name: WalletName; address: string } | null>(null)
  const [passportType, setPassportType] = useState(passportTypes[0].label)
  const [useCase, setUseCase] = useState<PassportUseCase>(passportTypes[0].value)
  const [ownerAddress, setOwnerAddress] = useState("")
  const [metadataUrl, setMetadataUrl] = useState("https://passport.example/metadata/draft.json")
  const [validityDays, setValidityDays] = useState("30")
  const [notes, setNotes] = useState("Prepared for transit and identity verification use cases")
  const [result, setResult] = useState<IssueResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const walletName = window.localStorage.getItem("passport-wallet") as WalletName | null
    if (!walletName) return

    const status = getWalletStatus(walletName)
    if (status) {
      setActiveWallet({ name: status.name, address: status.address })
      setOwnerAddress(status.address)
    }
  }, [])

  const handleIssue = async () => {
    if (!ownerAddress.trim()) {
      setError("Enter the passport holder's Stellar address.")
      return
    }

    const walletName = window.localStorage.getItem("passport-wallet") as WalletName | null

    if (!walletName) {
      setError("Connect Freighter or Albedo before issuing a passport.")
      return
    }

    const issuerAddress = getConnectedWalletAddress(walletName)

    if (!issuerAddress) {
      setError("The connected wallet did not expose an address.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const passportId = generatePassportId()
      const qrValue = generateQrValue(passportId)
      const validityDaysNumber = Number(validityDays)
      if (!Number.isFinite(validityDaysNumber) || validityDaysNumber <= 0) {
        setError("Validity days must be greater than zero.")
        return
      }
      const expiryDate = new Date(Date.now() + validityDaysNumber * 24 * 60 * 60 * 1000).toISOString()
      const payload = buildIssuePayload({
        owner: ownerAddress,
        issuer: issuerAddress,
        passportType,
        useCase,
        metadataUrl,
        validityDays: validityDaysNumber,
        passportId,
        qrValue,
        notes,
      })

      const submission = await submitPassportInvocation(walletName, payload)
      const transactionHash = submission.transactionHash ?? `draft-${passportId}`

      setResult({
        passportId,
        qrValue,
        transactionHash,
        owner: ownerAddress,
        issuer: issuerAddress,
        expiresAt: expiryDate,
      })
    } catch (issueError) {
      const message = issueError instanceof Error ? issueError.message : "Unable to issue passport"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <ArrowLeft className="h-4 w-4" />
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">passport verification</p>
              <p className="text-base font-semibold">Issuance console</p>
            </div>
          </Link>
          <Badge variant="outline">Stellar Soroban issuance</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="space-y-3">
              <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">passport issuance</Badge>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Issue a soul-bound passport on Stellar.</h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                This console prepares a transaction payload for a Stellar Soroban passport contract. Issued passports are
                tied to a single owner, mapped to a QR payload, and can be verified trustlessly on chain.
              </p>
            </div>

            <Connect />

            <Card className="border-border/70 bg-card/95 shadow-sm">
              <CardHeader>
                <CardTitle>Passport configuration</CardTitle>
                <CardDescription>Define the credential shape before signing the on-chain issue call.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Passport type</Label>
                    <Select value={passportType} onValueChange={setPassportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select passport type" />
                      </SelectTrigger>
                      <SelectContent>
                        {passportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.label}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Credential category</Label>
                    <Select value={useCase} onValueChange={(value) => setUseCase(value as PassportUseCase)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select use case" />
                      </SelectTrigger>
                      <SelectContent>
                        {passportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner">Passport holder address</Label>
                  <Input id="owner" value={ownerAddress} onChange={(event) => setOwnerAddress(event.target.value)} placeholder="G..." />
                  <p className="text-xs text-muted-foreground">The passport is soul-bound to this Stellar address.</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="validity">Validity in days</Label>
                    <Input id="validity" type="number" min="1" value={validityDays} onChange={(event) => setValidityDays(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metadata">Metadata URL</Label>
                    <Input id="metadata" value={metadataUrl} onChange={(event) => setMetadataUrl(event.target.value)} placeholder="https://..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Issuer notes</Label>
                  <Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
                </div>

                <Button onClick={handleIssue} disabled={loading} className="w-full gap-2" size="lg">
                  <Upload className="h-4 w-4" />
                  {loading ? "Submitting passport issuance..." : "Issue passport"}
                </Button>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6">
            <Card className="border-border/70 bg-card/95 shadow-sm">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  Preview
                </Badge>
                <CardTitle>Issued passport snapshot</CardTitle>
                <CardDescription>What the holder and inspector will see after issuance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Issuer</p>
                  <p className="mt-2 font-medium">{activeWallet ? `${getWalletLabel(activeWallet.name)} ${shortenAddress(activeWallet.address)}` : "No wallet connected"}</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Passport type</p>
                  <p className="mt-2 font-medium">{passportType}</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Validation</p>
                  <p className="mt-2 flex items-center gap-2 font-medium text-emerald-700">
                    <Shield className="h-4 w-4" />
                    Soul-bound and QR-ready
                  </p>
                </div>
                <div className="rounded-2xl border border-dashed border-border p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Blockchain interaction</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The transaction payload targets the Stellar Soroban passport contract and can be submitted by an allowlisted issuer.
                  </p>
                </div>
              </CardContent>
            </Card>

            {result ? (
              <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-700" />
                    <div>
                      <CardTitle className="text-emerald-900">Passport issued</CardTitle>
                      <CardDescription className="text-emerald-800/80">The passport now has a unique on-chain identifier.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-emerald-950">
                  <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Passport ID</p>
                    <p className="mt-2 font-mono text-base">{result.passportId}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Owner</p>
                      <p className="mt-2 break-all font-mono text-xs">{result.owner}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Expires</p>
                      <p className="mt-2 text-sm">{new Date(result.expiresAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">QR payload</p>
                    <p className="mt-2 font-mono text-xs break-all">{result.qrValue}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Transaction</p>
                    <p className="mt-2 font-mono text-xs break-all">{result.transactionHash}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/70 bg-card/95 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarDays className="h-5 w-5" />
                    Issuance defaults
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>1. Select a passport type and use case.</p>
                  <p>2. Connect a Stellar wallet with issuer permissions.</p>
                  <p>3. Submit the issue call to create a soul-bound passport resource.</p>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}