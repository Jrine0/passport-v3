"use client"

import Link from "next/link"
import { ArrowLeft, Fingerprint, ScanFace, ShieldCheck, Sparkles } from "lucide-react"

import Connect from "@/components/Connect"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const accessPaths = [
  {
    title: "Issuers",
    description: "Create and revoke passports using allowlisted Aptos signer capabilities.",
  },
  {
    title: "Inspectors",
    description: "Verify passport validity on chain and emit inspection events for audit trails.",
  },
  {
    title: "Holders",
    description: "Receive soul-bound passports, display QR payloads, and present credentials wherever needed.",
  },
]

export default function AuthPage() {
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
              <p className="text-base font-semibold">Wallet access</p>
            </div>
          </Link>
          <Badge variant="secondary" className="gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Petra and Martian
          </Badge>
        </div>
      </header>

      <main className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <section className="space-y-6">
          <div className="space-y-4">
            <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">Aptos wallet flow</Badge>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Connect the wallet that will issue or inspect passports.
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Use Petra or Martian to sign Aptos Move transactions. Issuer and inspector privileges are enforced by the
              on-chain capability model, not by the UI.
            </p>
          </div>

          <Connect />

          <div className="grid gap-4 sm:grid-cols-3">
            {accessPaths.map((path) => (
              <Card key={path.title} className="border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="space-y-2 p-4">
                  <CardTitle className="text-base">{path.title}</CardTitle>
                  <CardDescription>{path.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <Card className="border-border/70 bg-card/95 shadow-sm">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Next step
              </Badge>
              <CardTitle className="text-2xl">Issue or verify a passport</CardTitle>
              <CardDescription>
                Once connected, move to the issuance console or the inspector verification page.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Link href="/mint">
                <Button className="w-full">Open issuance console</Button>
              </Link>
              <Link href="/verify">
                <Button variant="outline" className="w-full bg-transparent">
                  Open verification desk
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-sm">
            <CardHeader>
              <Badge className="w-fit bg-white/10 text-white hover:bg-white/10">Operating model</Badge>
              <CardTitle className="text-2xl text-white">Capability-gated by design</CardTitle>
              <CardDescription className="text-white/70">
                The UI never decides who can issue or inspect. Aptos resources do.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="mb-3 h-5 w-5" />
                <p className="font-semibold">Issuer caps</p>
                <p className="mt-2 text-sm text-white/70">Allowlisted issuers claim capabilities before passport issuance.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ScanFace className="mb-3 h-5 w-5" />
                <p className="font-semibold">Inspector calls</p>
                <p className="mt-2 text-sm text-white/70">Verification emits events while still relying on pure on-chain checks.</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}