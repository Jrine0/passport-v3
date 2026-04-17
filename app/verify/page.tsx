"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, BadgeCheck, Fingerprint, ScanFace, Shield, ShieldAlert } from "lucide-react"

import Connect from "@/components/Connect"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { demoPassports, findDemoPassport, shortenAddress, verifyPassportRecord } from "@/lib/passport"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const [passportId, setPassportId] = useState(searchParams.get("passportId") ?? "")
  const [verification, setVerification] = useState<ReturnType<typeof verifyPassportRecord> | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const queryPassportId = searchParams.get("passportId")
    if (queryPassportId) {
      setPassportId(queryPassportId)
    }
  }, [searchParams])

  const handleVerify = async () => {
    if (!passportId.trim()) return

    setLoading(true)

    try {
      const passport = findDemoPassport(passportId)
      if (!passport) {
        setVerification({ status: "missing", valid: false, reason: "Passport not found on chain" })
        return
      }

      setVerification(verifyPassportRecord(passport))
    } finally {
      setLoading(false)
    }
  }

  const selectedPassport = verification?.passport

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
              <p className="text-base font-semibold">Inspector desk</p>
            </div>
          </Link>
          <Badge variant="outline" className="gap-2">
            <Shield className="h-3.5 w-3.5" />
            On-chain checks
          </Badge>
        </div>
      </header>

      <main className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-6">
          <div className="space-y-3">
            <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">trustless verification</Badge>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Inspect passports on chain.</h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Verification checks whether a passport exists, is still within its validity window, and has not been revoked.
              Inspectors can then emit an audit event after the read-only decision is made.
            </p>
          </div>

          <Connect />

          <Card className="border-border/70 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanFace className="h-5 w-5" />
                Passport lookup
              </CardTitle>
              <CardDescription>Enter a passport ID or scan a QR payload to verify the on-chain record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passport-id">Passport ID</Label>
                <Input id="passport-id" value={passportId} onChange={(event) => setPassportId(event.target.value)} placeholder="PP-2026-0001" />
                <p className="text-xs text-muted-foreground">Example: {demoPassports[0]?.passportId}</p>
              </div>

              <Button onClick={handleVerify} disabled={!passportId.trim() || loading} className="w-full gap-2" size="lg">
                {loading ? "Verifying passport..." : "Verify passport"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95 shadow-sm">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Verification rules
              </Badge>
              <CardTitle className="text-2xl">What gets checked</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-700" />
                <p>Passport exists and matches a known passport ID.</p>
              </div>
              <div className="flex gap-3">
                <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-700" />
                <p>Expiry time is still in the future.</p>
              </div>
              <div className="flex gap-3">
                <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-700" />
                <p>The passport has not been revoked by an issuer.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          {verification ? (
            <Card className={`border-2 shadow-sm ${verification.valid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {verification.valid ? <BadgeCheck className="h-10 w-10 text-emerald-700" /> : <ShieldAlert className="h-10 w-10 text-red-700" />}
                  <div>
                    <CardTitle className={verification.valid ? "text-emerald-900" : "text-red-900"}>
                      {verification.valid ? "Valid passport" : verification.status === "missing" ? "Passport not found" : "Passport invalid"}
                    </CardTitle>
                    <CardDescription className={verification.valid ? "text-emerald-800/80" : "text-red-800/80"}>{verification.reason}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              {selectedPassport ? (
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Passport ID</p>
                      <p className="mt-2 font-mono text-sm">{selectedPassport.passportId}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Owner</p>
                      <p className="mt-2 font-mono text-xs break-all">{shortenAddress(selectedPassport.owner)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Issuer</p>
                      <p className="mt-2 font-mono text-xs break-all">{shortenAddress(selectedPassport.issuer)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Expiry</p>
                      <p className="mt-2 text-sm">{new Date(selectedPassport.expiresAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Decision model</p>
                    <p className="mt-2">
                      The inspector can treat this output as a direct on-chain response. If valid, the passport remains active until
                      the expiry timestamp or a revocation event changes the state.
                    </p>
                  </div>
                </CardContent>
              ) : null}
            </Card>
          ) : (
            <Card className="border-border/70 bg-card/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">No verification yet</CardTitle>
                <CardDescription>Enter a passport ID to see the trustless result.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Use a QR payload or passport ID from the holder's credential.</p>
                <p>Inspector wallets can submit the verification event after the read-only check completes.</p>
                <p>Active passport IDs in the demo data: {demoPassports.map((passport) => passport.passportId).join(", ")}.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}