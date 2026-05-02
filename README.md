# passport verification

Stellar-based passport verification platform for soul-bound credentials, inspector validation, and QR-driven access flows.

## What it does

- Issues non-transferable passport records through a Soroban smart contract
- Verifies passport validity on chain
- Supports issuer-controlled revocation
- Uses QR-compatible passport IDs for scanners and mobile apps
- Keeps metadata uploads off chain while preserving auditability

## Architecture

### On-chain

The Soroban Rust contract in `stellar-contract/` models the access layer:

- `create_vault` registers holder vaults
- `authorize_issuer` and `authorize_inspector` gate permissions
- `issue_passport`, `inspect_passport`, and `revoke_passport` drive lifecycle events
- `is_valid_passport` and `get_passport` expose read-side verification helpers

### App

The Next.js app provides:

- Stellar wallet onboarding with Freighter and Albedo
- Passport issuance UI
- Inspector verification UI
- Passport vault views with QR payloads
- Upload support for metadata and assets

### Storage

The upload endpoint stores passport assets locally under `public/uploads` during development and returns a stable public path for the UI.

## Environment variables

```bash
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_CONTRACT_ID=C...
TUSKY_API_KEY=...
TUSKY_VAULT_ID=...
```

## Local development

```bash
pnpm install
pnpm dev
```

## Soroban contract

Build the contract WebAssembly from `stellar-contract/`:

```bash
cd stellar-contract
cargo build --target wasm32-unknown-unknown --release
```

## Notes

- Passports are designed to be soul-bound and cannot be transferred by the UI or contract API.
- Verification is trustless because the status is derived from on-chain contract state.
- Issuers and inspectors must be allowlisted by the admin address.
