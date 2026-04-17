import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk"

export type WalletName = "petra" | "martian"
export type PassportUseCase = "transit" | "identity" | "event" | "institutional"
export type PassportStatus = "active" | "revoked" | "expired" | "missing"

export interface PassportRecord {
    passportId: string
    owner: string
    issuer: string
    passportType: string
    useCase: PassportUseCase
    metadataUrl: string
    qrValue: string
    issuedAt: string
    expiresAt: string
    revoked: boolean
    revokedAt?: string
    notes?: string
}

export interface IssuePassportInput {
    owner: string
    issuer: string
    passportType: string
    useCase: PassportUseCase
    metadataUrl: string
    validityDays: number
    passportId?: string
    qrValue?: string
    notes?: string
}

export interface VerificationResult {
    status: PassportStatus
    valid: boolean
    passport?: PassportRecord
    reason: string
}

export interface WalletState {
    name: WalletName
    address: string
    connected: boolean
}

declare global {
    interface Window {
        aptos?: {
            connect?: () => Promise<{ address?: string } | string | void>
            disconnect?: () => Promise<void>
            account?: { address?: string }
            address?: string
            signAndSubmitTransaction?: (transaction: any) => Promise<any>
        }
        martian?: {
            connect?: () => Promise<{ address?: string } | string | void>
            disconnect?: () => Promise<void>
            account?: { address?: string }
            address?: string
            signAndSubmitTransaction?: (transaction: any) => Promise<any>
        }
    }
}

const demoIssuer = "0x1a2b3c4d5e6f77889900aabbccddeeff00112233"

export const useCaseLabels: Record<PassportUseCase, { label: string; description: string }> = {
    transit: { label: "Transit pass", description: "Daily, monthly, and route-specific access" },
    identity: { label: "Identity credential", description: "Verified personhood and KYC/identity checks" },
    event: { label: "Event credential", description: "Ticketing, venue access, and backstage clearance" },
    institutional: { label: "Institutional credential", description: "Campus, enterprise, and member access" },
}

export const passportTypes: Array<{ value: PassportUseCase; label: string; description: string }> = [
    { value: "transit", label: "Transit", description: "Transport or commute entitlement" },
    { value: "identity", label: "Identity", description: "Government, campus, or service identity" },
    { value: "event", label: "Event", description: "Venue or conference access" },
    { value: "institutional", label: "Institutional", description: "Employer or membership credential" },
]

export const demoPassports: PassportRecord[] = [
    {
        passportId: "PP-2026-0001",
        owner: "0xa11ce0000000000000000000000000000000001",
        issuer: demoIssuer,
        passportType: "Metro Transit Monthly",
        useCase: "transit",
        metadataUrl: "https://passport.example/metadata/pp-2026-0001.json",
        qrValue: "passport-verification:PP-2026-0001",
        issuedAt: "2026-04-01T09:00:00.000Z",
        expiresAt: "2026-05-01T09:00:00.000Z",
        revoked: false,
        notes: "Zone 1-3 commuter access",
    },
    {
        passportId: "PP-2026-0002",
        owner: "0xb0b000000000000000000000000000000000002",
        issuer: demoIssuer,
        passportType: "Campus Identity",
        useCase: "institutional",
        metadataUrl: "https://passport.example/metadata/pp-2026-0002.json",
        qrValue: "passport-verification:PP-2026-0002",
        issuedAt: "2026-03-10T12:00:00.000Z",
        expiresAt: "2027-03-10T12:00:00.000Z",
        revoked: false,
        notes: "Undergraduate access profile",
    },
    {
        passportId: "PP-2025-0099",
        owner: "0xdead000000000000000000000000000000000099",
        issuer: demoIssuer,
        passportType: "Conference Badge",
        useCase: "event",
        metadataUrl: "https://passport.example/metadata/pp-2025-0099.json",
        qrValue: "passport-verification:PP-2025-0099",
        issuedAt: "2025-12-04T12:00:00.000Z",
        expiresAt: "2025-12-05T23:59:59.000Z",
        revoked: false,
        notes: "Archived example",
    },
]

export function getAptosClient() {
    const configuredNetwork = process.env.NEXT_PUBLIC_APTOS_NETWORK?.toLowerCase()
    const resolvedNetwork =
        configuredNetwork === "mainnet"
            ? Network.MAINNET
            : configuredNetwork === "devnet"
                ? Network.DEVNET
                : Network.TESTNET

    return new Aptos(
        new AptosConfig({
            network: resolvedNetwork,
        }),
    )
}

export function getModuleAddress() {
    return process.env.NEXT_PUBLIC_APTOS_MODULE_ADDRESS ?? "0x0"
}

export function getPassportFunction(name: string) {
    return `${getModuleAddress()}::passport::${name}`
}

export function shortenAddress(address?: string | null) {
    if (!address) return "0x0000…0000"
    if (address.length <= 10) return address
    return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function generatePassportId() {
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "")
    const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase()
    return `PP-${timestamp.slice(2, 8)}-${randomSuffix}`
}

export function generateQrValue(passportId: string) {
    return `passport-verification:${passportId}`
}

export function buildIssuePayload(input: IssuePassportInput) {
    const passportId = input.passportId ?? generatePassportId()
    const qrValue = input.qrValue ?? generateQrValue(passportId)

    return {
        function: getPassportFunction("issue_passport"),
        functionArguments: [
            input.owner,
            input.passportType,
            input.useCase,
            input.metadataUrl,
            qrValue,
            passportId,
            input.validityDays.toString(),
            input.notes ?? "",
        ],
    }
}

export function buildVerifyPayload(owner: string, passportId: string) {
    return {
        function: getPassportFunction("inspect_passport"),
        functionArguments: [owner, passportId],
    }
}

export function buildRevokePayload(owner: string, passportId: string) {
    return {
        function: getPassportFunction("revoke_passport"),
        functionArguments: [owner, passportId],
    }
}

export function getWalletStatus(name: WalletName): WalletState | null {
    if (typeof window === "undefined") return null

    const wallet = name === "petra" ? window.aptos : window.martian
    const address = wallet?.account?.address ?? wallet?.address

    if (!wallet || !address) {
        return null
    }

    return {
        name,
        address,
        connected: true,
    }
}

export async function connectWallet(name: WalletName): Promise<WalletState> {
    if (typeof window === "undefined") {
        throw new Error("Wallets can only connect in the browser")
    }

    const wallet = name === "petra" ? window.aptos : window.martian

    if (!wallet?.connect) {
        throw new Error(`${name === "petra" ? "Petra" : "Martian"} is not installed`)
    }

    const result = await wallet.connect()
    const address = typeof result === "string" ? result : result?.address ?? wallet.account?.address ?? wallet.address

    if (!address) {
        throw new Error(`Unable to read address from ${name === "petra" ? "Petra" : "Martian"}`)
    }

    return {
        name,
        address,
        connected: true,
    }
}

export async function disconnectWallet(name: WalletName) {
    if (typeof window === "undefined") return

    const wallet = name === "petra" ? window.aptos : window.martian
    await wallet?.disconnect?.()
}

export function verifyPassportRecord(passport: PassportRecord, now = new Date()): VerificationResult {
    if (passport.revoked) {
        return { status: "revoked", valid: false, passport, reason: "Passport revoked by issuer" }
    }

    if (new Date(passport.expiresAt).getTime() <= now.getTime()) {
        return { status: "expired", valid: false, passport, reason: "Passport has expired" }
    }

    return { status: "active", valid: true, passport, reason: "Passport is valid and on-chain" }
}

export function findDemoPassport(passportId: string) {
    return demoPassports.find((passport) => passport.passportId.toLowerCase() === passportId.toLowerCase()) ?? null
}

export function derivePassportSummary(passport: PassportRecord) {
    const verification = verifyPassportRecord(passport)

    return {
        ...verification,
        summary: `${passport.passportType} • ${useCaseLabels[passport.useCase].label}`,
    }
}
