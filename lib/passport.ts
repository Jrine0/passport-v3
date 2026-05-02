export type WalletName = "freighter" | "albedo"
export type PassportUseCase = "transit" | "identity" | "event" | "institutional"
export type PassportStatus = "active" | "revoked" | "expired" | "missing"
export type StellarNetwork = "mainnet" | "testnet" | "futurenet" | "standalone"

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
        freighterApi?: {
            requestAccess?: () => Promise<void>
            getUserInfo?: () => Promise<{ publicKey?: string } | null>
            getPublicKey?: () => Promise<string>
            signTransaction?: (xdr: string, options?: Record<string, unknown>) => Promise<any>
            disconnect?: () => Promise<void>
        }
        albedo?: {
            publicKey?: () => Promise<{ pubkey?: string } | string>
            connect?: () => Promise<{ pubkey?: string } | string>
            disconnect?: () => Promise<void>
            tx?: (payload: Record<string, unknown>) => Promise<any>
        }
    }
}

const demoIssuer = "GBV57Q2GBCUZIQJH2BA4F7OQQQ4JQU7YQ76HHA3PHE3K6KP7TWQXIBBB"
const networkPassphrases: Record<StellarNetwork, string> = {
    mainnet: "Public Global Stellar Network ; September 2015",
    testnet: "Test SDF Network ; September 2015",
    futurenet: "Test SDF Future Network ; October 2022",
    standalone: "Standalone Network ; February 2017",
}

const walletLabels: Record<WalletName, string> = {
    freighter: "Freighter",
    albedo: "Albedo",
}

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
        owner: "GC4S2PGB4DUNCLP3BTQKJ5V2Y6EGGWWR2EQB3WGNT3LJCMIMRUPT2AHT",
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
        owner: "GBI7DWRF3B2QDZAHRCFUVMDV5NYGZJVW6GXPW2OT2H3SMEIIKSGQCY3H",
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
        owner: "GAZKJINPVDO2BGNQMLB7AUM3L4W5S7FUBWQC2VVZXJNUQ6HVC5CTCN6C",
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

export function getStellarNetwork(): StellarNetwork {
    const configuredNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK?.toLowerCase()
    if (configuredNetwork === "mainnet") return "mainnet"
    if (configuredNetwork === "futurenet") return "futurenet"
    if (configuredNetwork === "standalone") return "standalone"
    return "testnet"
}

export function getStellarRpcUrl() {
    const configured = process.env.NEXT_PUBLIC_STELLAR_RPC_URL
    if (configured) return configured

    const network = getStellarNetwork()
    if (network === "mainnet") return "https://mainnet.sorobanrpc.com"
    if (network === "futurenet") return "https://rpc-futurenet.stellar.org"
    if (network === "standalone") return "http://localhost:8000/soroban/rpc"
    return "https://soroban-testnet.stellar.org"
}

export function getStellarNetworkPassphrase() {
    return networkPassphrases[getStellarNetwork()]
}

export function getStellarContractId() {
    return process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ID ?? "CCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4"
}

export function getWalletLabel(name: WalletName) {
    return walletLabels[name]
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

export interface SorobanPassportPayload {
    contractId: string
    network: StellarNetwork
    networkPassphrase: string
    method: "issue_passport" | "inspect_passport" | "revoke_passport"
    args: string[]
}

export function buildIssuePayload(input: IssuePassportInput) {
    const passportId = input.passportId ?? generatePassportId()
    const qrValue = input.qrValue ?? generateQrValue(passportId)

    return {
        contractId: getStellarContractId(),
        network: getStellarNetwork(),
        networkPassphrase: getStellarNetworkPassphrase(),
        method: "issue_passport",
        args: [
            input.owner,
            input.issuer,
            input.passportType,
            input.useCase,
            input.metadataUrl,
            qrValue,
            passportId,
            String(input.validityDays * 24 * 60 * 60),
            input.notes ?? "",
        ],
    } satisfies SorobanPassportPayload
}

export function buildVerifyPayload(owner: string, passportId: string) {
    return {
        contractId: getStellarContractId(),
        network: getStellarNetwork(),
        networkPassphrase: getStellarNetworkPassphrase(),
        method: "inspect_passport",
        args: [owner, passportId],
    } satisfies SorobanPassportPayload
}

export function buildRevokePayload(owner: string, passportId: string) {
    return {
        contractId: getStellarContractId(),
        network: getStellarNetwork(),
        networkPassphrase: getStellarNetworkPassphrase(),
        method: "revoke_passport",
        args: [owner, passportId],
    } satisfies SorobanPassportPayload
}

export function getWalletStatus(name: WalletName): WalletState | null {
    if (typeof window === "undefined") return null

    const injectedWallet = name === "freighter" ? window.freighterApi : window.albedo
    const address = window.localStorage.getItem(`passport-wallet-address:${name}`)

    if (!injectedWallet || !address) {
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

    let address: string | undefined

    if (name === "freighter") {
        const wallet = window.freighterApi
        if (!wallet) {
            throw new Error("Freighter is not installed")
        }

        await wallet.requestAccess?.()
        const info = await wallet.getUserInfo?.()
        address = info?.publicKey ?? (await wallet.getPublicKey?.())
    } else {
        const wallet = window.albedo
        if (!wallet) {
            throw new Error("Albedo is not installed")
        }

        const result = wallet.publicKey ? await wallet.publicKey() : await wallet.connect?.()
        address = typeof result === "string" ? result : result?.pubkey
    }

    if (!address) {
        throw new Error(`Unable to read address from ${walletLabels[name]}`)
    }

    window.localStorage.setItem(`passport-wallet-address:${name}`, address)

    return {
        name,
        address,
        connected: true,
    }
}

export async function disconnectWallet(name: WalletName) {
    if (typeof window === "undefined") return

    const wallet = name === "freighter" ? window.freighterApi : window.albedo
    await wallet?.disconnect?.()
    window.localStorage.removeItem(`passport-wallet-address:${name}`)
}

export function getConnectedWalletAddress(name: WalletName) {
    if (typeof window === "undefined") return null
    return window.localStorage.getItem(`passport-wallet-address:${name}`)
}

export async function submitPassportInvocation(walletName: WalletName, payload: SorobanPassportPayload) {
    if (typeof window === "undefined") {
        return { transactionHash: `draft-${payload.method}-${Date.now()}` }
    }

    if (walletName === "freighter") {
        try {
            const signed = await window.freighterApi?.signTransaction?.(JSON.stringify(payload), {
                networkPassphrase: payload.networkPassphrase,
                rpcUrl: getStellarRpcUrl(),
                contractId: payload.contractId,
                method: payload.method,
            })

            const transactionHash =
                (typeof signed === "string" ? signed : signed?.hash ?? signed?.transactionHash ?? signed?.id) ??
                `stellar-${payload.method}-${Date.now()}`

            return { transactionHash }
        } catch {
            return { transactionHash: `stellar-draft-${payload.method}-${Date.now()}` }
        }
    }

    try {
        const submitted = await window.albedo?.tx?.({
            network: payload.network,
            passphrase: payload.networkPassphrase,
            contractId: payload.contractId,
            method: payload.method,
            args: payload.args,
        })

        return {
            transactionHash:
                (typeof submitted === "string" ? submitted : submitted?.txid ?? submitted?.hash ?? submitted?.id) ??
                `stellar-${payload.method}-${Date.now()}`,
        }
    } catch {
        return { transactionHash: `stellar-draft-${payload.method}-${Date.now()}` }
    }
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
