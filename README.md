# passport verification

Aptos-based passport verification platform for soul-bound credentials, inspector validation, and QR-driven access flows.

## What it does

- Issues non-transferable passport resources on Aptos Move
- Verifies passport validity on chain
- Supports issuer-controlled revocation
- Uses QR-compatible passport IDs for scanners and mobile apps
- Keeps metadata uploads off chain while preserving auditability

## Architecture

### On-chain

The Move package in `move/` models the access layer as resources:

- `PassportVault` holds all passport records for an owner
- `IssuerCap` and `InspectorCap` enforce capability-based permissions
- Verification checks existence, expiry, and revocation directly on chain
- Events are emitted for issuance, verification, and revocation

### App

The Next.js app provides:

- Aptos wallet onboarding with Petra and Martian
- Passport issuance UI
- Inspector verification UI
- Passport vault views with QR payloads
- Upload support for metadata and assets

### Storage

The upload endpoint stores passport assets locally under `public/uploads` during development and returns a stable public path for the UI.

## Environment variables

```bash
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_APTOS_MODULE_ADDRESS=0x...
TUSKY_API_KEY=...
TUSKY_VAULT_ID=...
```

## Local development

```bash
pnpm install
pnpm dev
```

## Move package

The Move module is in `move/sources/passport.move`. Before deployment, replace the placeholder package address in `move/Move.toml` with your published Aptos account address.

## Notes

- Passports are designed to be soul-bound and cannot be transferred by the UI or the Move API.
- Verification is trustless because the status is derived from on-chain resource state.
- Issuers and inspectors must claim their capabilities after allowlisting.
