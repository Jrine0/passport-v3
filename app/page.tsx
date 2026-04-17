import { ArrowRight, BadgeCheck, Fingerprint, Layers3, QrCode, ScanFace, ShieldCheck } from "lucide-react"

import UploadCard from "@/components/UploadCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const pillars = [
  {
    icon: ShieldCheck,
    title: "Soul-bound passports",
    description: "Passports live as non-transferable Aptos Move resources tied to a single owner address.",
  },
  {
    icon: BadgeCheck,
    title: "Trustless verification",
    description: "Inspectors verify existence, expiry, and revocation directly on chain with no off-chain trust.",
  },
  {
    icon: QrCode,
    title: "QR-compatible IDs",
    description: "Every passport exposes a unique on-chain identifier that can be embedded into scanners and QR payloads.",
  },
]

const useCases = [
  {
    title: "Transit passes",
    description: "Monthly, route-specific, and regional commute rights.",
  },
  {
    title: "Identity verification",
    description: "Government, campus, KYC, or service identity checks.",
  },
  {
    title: "Event access",
    description: "Venue entry, backstage access, and conference credentials.",
  },
  {
    title: "Institutional credentials",
    description: "Employee badges, membership access, and partner entitlements.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">passport verification</p>
              <p className="text-lg font-semibold">Aptos passport system</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Aptos Move</Badge>
            <a href="/auth">
              <Button className="gap-2">
                Open app
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-20 pt-14 lg:pt-20">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="w-fit bg-emerald-100 text-emerald-900 hover:bg-emerald-100">passport verification platform</Badge>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                Issue, verify, and revoke identity-grade passports on Aptos.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground text-balance">
                A clean passport verification stack for transit, events, institutional access, and identity workflows.
                Passports are soul-bound, QR-compatible, and checked trustlessly on chain.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="/mint">
                <Button size="lg" className="gap-2">
                  Issue passport
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href="/verify">
                <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                  <ScanFace className="h-4 w-4" />
                  Verify passport
                </Button>
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Soul-bound", "No transfer or resale path"],
                ["On chain", "Validity and revocation stay trustless"],
                ["QR-ready", "One ID for scanners and mobile flows"],
              ].map(([title, description]) => (
                <Card key={title} className="border-border/70 bg-card/90 shadow-sm">
                  <CardContent className="space-y-2 p-4">
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden border-border/70 bg-card/95 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <CardHeader className="space-y-3 border-b border-border/70 bg-gradient-to-br from-emerald-50 via-background to-amber-50">
              <Badge variant="secondary" className="w-fit">
                Live passport workflow
              </Badge>
              <CardTitle className="text-2xl">Inspector snapshot</CardTitle>
              <CardDescription>Example of what an inspector sees when verifying a passport on Aptos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-muted/50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Passport ID</p>
                  <p className="mt-2 font-mono text-sm">PP-2026-0001</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Status</p>
                  <p className="mt-2 font-semibold text-emerald-700">Valid and active</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Issuer</p>
                  <p className="mt-2 text-sm">Transport authority</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Expiry</p>
                  <p className="mt-2 text-sm">2026-05-01</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-4">
                <QrCode className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">QR payload</p>
                  <p className="font-mono text-xs text-muted-foreground">passport-verification:PP-2026-0001</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon

            return (
              <Card key={pillar.title} className="border-border/70 bg-card/90 shadow-sm">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{pillar.title}</CardTitle>
                  <CardDescription>{pillar.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </section>

        <section className="mt-20 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Metadata upload
              </Badge>
              <CardTitle className="text-2xl">Upload passport assets</CardTitle>
              <CardDescription>
                Keep passport images, supporting docs, and metadata references off chain while preserving auditability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadCard />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Layers3 className="h-5 w-5 text-primary" />
              <h2 className="text-3xl font-semibold">Built for multiple credential models</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {useCases.map((useCase) => (
                <Card key={useCase.title} className="border-border/70 bg-card/90 shadow-sm">
                  <CardContent className="space-y-2 p-5">
                    <p className="font-semibold">{useCase.title}</p>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-border/70 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-sm">
              <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
                {[
                  { label: "Issuer controls", value: "Capability-based" },
                  { label: "Verification", value: "On-chain and trustless" },
                  { label: "Replay safety", value: "Unique passport IDs" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-sm text-white/70">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold">{item.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}