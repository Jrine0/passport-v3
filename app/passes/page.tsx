"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowLeft, Fingerprint, Plus, QrCode, ShieldAlert, ShieldCheck } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { demoPassports, derivePassportSummary, shortenAddress } from "@/lib/passport"

export default function PassesPage() {
  const [selectedPassportId, setSelectedPassportId] = useState(demoPassports[0]?.passportId ?? null)

  const selectedPassport = useMemo(
    () => demoPassports.find((passport) => passport.passportId === selectedPassportId) ?? demoPassports[0] ?? null,
    [selectedPassportId],
  )

  const activeCount = demoPassports.filter((passport) => !passport.revoked && new Date(passport.expiresAt).getTime() > Date.now()).length
  const revokedCount = demoPassports.filter((passport) => passport.revoked).length

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/auth" className="flex items-center gap-3">
            <ArrowLeft className="h-4 w-4" />
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">passport verification</p>
              <p className="text-base font-semibold">Vault</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{activeCount} active</Badge>
            <Badge variant="outline">{revokedCount} revoked</Badge>
            <Link href="/mint">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Issue passport
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="mb-8 max-w-3xl space-y-3">
          <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">holder inventory</Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Issued passports and QR payloads.</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Each passport record is a soul-bound Aptos resource. Holders can present the QR payload while inspectors
            verify validity on chain.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-4">
            {demoPassports.map((passport) => {
              const summary = derivePassportSummary(passport)
              const isSelected = selectedPassportId === passport.passportId

              return (
                <Card
                  key={passport.passportId}
                  className={`cursor-pointer border-border/70 bg-card/95 shadow-sm transition ${isSelected ? "ring-2 ring-primary" : "hover:-translate-y-0.5 hover:shadow-md"}`}
                  onClick={() => setSelectedPassportId(passport.passportId)}
                >
                  <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{passport.passportType}</CardTitle>
                          {passport.revoked ? (
                            <Badge variant="secondary" className="gap-1">
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Revoked
                            </Badge>
                          ) : new Date(passport.expiresAt).getTime() <= Date.now() ? (
                            <Badge variant="destructive" className="gap-1">
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Expired
                            </Badge>
                          ) : (
                            <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{summary.summary}</CardDescription>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Passport ID</p>
                        <p className="mt-1 font-mono">{passport.passportId}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>Owner: {shortenAddress(passport.owner)}</p>
                      <p>Issuer: {shortenAddress(passport.issuer)}</p>
                      <p>Issued: {new Date(passport.issuedAt).toLocaleString()}</p>
                      <p>Expires: {new Date(passport.expiresAt).toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl border border-dashed border-border p-4 text-center">
                      <QrCode className="mx-auto h-10 w-10 text-primary" />
                      <p className="mt-3 font-mono text-xs break-all text-muted-foreground">{passport.qrValue}</p>
                      <p className="mt-2 text-xs text-muted-foreground">Scan-ready identifier</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </section>

          <aside className="space-y-6">
            {selectedPassport ? (
              <Card className="sticky top-24 border-border/70 bg-card/95 shadow-sm">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    Passport detail
                  </Badge>
                  <CardTitle className="text-2xl">{selectedPassport.passportType}</CardTitle>
                  <CardDescription>
                    This passport is rendered from the on-chain record shape the inspectors will verify.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">QR payload</p>
                        <p className="mt-2 font-mono text-xs break-all">{selectedPassport.qrValue}</p>
                      </div>
                      <QRCodeSVG value={selectedPassport.qrValue} size={120} className="h-[120px] w-[120px] rounded-2xl border border-border p-2" />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-muted/40 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Owner</p>
                      <p className="mt-2 font-mono text-xs break-all">{selectedPassport.owner}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/40 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Metadata</p>
                      <p className="mt-2 break-all text-sm">{selectedPassport.metadataUrl}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    <p>{selectedPassport.notes}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link href={`/verify?passportId=${selectedPassport.passportId}`}>
                      <Button className="w-full">Verify passport</Button>
                    </Link>
                    <Link href="/mint">
                      <Button variant="outline" className="w-full bg-transparent">
                        Issue another
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  )
}