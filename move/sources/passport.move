module passport_verification::passport {
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use std::signer;
    use std::table::{Self, Table};
    use std::vector;

    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NOT_ADMIN: u64 = 3;
    const E_NOT_ALLOWED: u64 = 4;
    const E_NO_VAULT: u64 = 5;
    const E_PASSPORT_NOT_FOUND: u64 = 6;
    const E_EXPIRED: u64 = 7;
    const E_REVOKED: u64 = 8;
    const E_NOT_ISSUER: u64 = 9;
    const E_NOT_INSPECTOR: u64 = 10;
    const E_INVALID_DURATION: u64 = 11;

    struct AdminCap has key {}

    struct IssuerCap has key {}

    struct InspectorCap has key {}

    struct PassportConfig has key {
        issuers: Table<address, bool>,
        inspectors: Table<address, bool>,
        issued_events: event::EventHandle<PassportIssuedEvent>,
        verified_events: event::EventHandle<PassportVerifiedEvent>,
        revoked_events: event::EventHandle<PassportRevokedEvent>,
    }

    struct PassportVault has key {
        passports: Table<vector<u8>, PassportRecord>,
    }

    struct PassportRecord has store, drop {
        passport_id: vector<u8>,
        owner: address,
        issuer: address,
        passport_type: vector<u8>,
        use_case: vector<u8>,
        metadata_uri: vector<u8>,
        qr_id: vector<u8>,
        notes: vector<u8>,
        issued_at_seconds: u64,
        expiry_seconds: u64,
        revoked: bool,
        revoked_at_seconds: u64,
    }

    struct PassportIssuedEvent has drop, store {
        passport_id: vector<u8>,
        owner: address,
        issuer: address,
        expiry_seconds: u64,
        qr_id: vector<u8>,
    }

    struct PassportVerifiedEvent has drop, store {
        passport_id: vector<u8>,
        owner: address,
        inspector: address,
        valid: bool,
        reason: vector<u8>,
    }

    struct PassportRevokedEvent has drop, store {
        passport_id: vector<u8>,
        owner: address,
        issuer: address,
        revoked_at_seconds: u64,
    }

    public entry fun init(admin: &signer) acquires AdminCap, PassportConfig {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<PassportConfig>(admin_addr), E_ALREADY_INITIALIZED);

        move_to(admin, AdminCap {});
        move_to(
            admin,
            PassportConfig {
                issuers: table::new<address, bool>(admin),
                inspectors: table::new<address, bool>(admin),
                issued_events: event::new_event_handle<PassportIssuedEvent>(admin),
                verified_events: event::new_event_handle<PassportVerifiedEvent>(admin),
                revoked_events: event::new_event_handle<PassportRevokedEvent>(admin),
            },
        );
    }

    public entry fun create_vault(owner: &signer) {
        let owner_addr = signer::address_of(owner);
        assert!(!exists<PassportVault>(owner_addr), E_ALREADY_INITIALIZED);
        move_to(owner, PassportVault { passports: table::new<vector<u8>, PassportRecord>(owner) });
    }

    public entry fun authorize_issuer(admin: &signer, issuer: address) acquires PassportConfig, AdminCap {
        assert_admin(admin);
        let config = borrow_global_mut<PassportConfig>(signer::address_of(admin));
        if (!table::contains(&config.issuers, issuer)) {
            table::add(&mut config.issuers, issuer, true);
        } else {
            let allowed = table::borrow_mut(&mut config.issuers, issuer);
            *allowed = true;
        };
    }

    public entry fun authorize_inspector(admin: &signer, inspector: address) acquires PassportConfig, AdminCap {
        assert_admin(admin);
        let config = borrow_global_mut<PassportConfig>(signer::address_of(admin));
        if (!table::contains(&config.inspectors, inspector)) {
            table::add(&mut config.inspectors, inspector, true);
        } else {
            let allowed = table::borrow_mut(&mut config.inspectors, inspector);
            *allowed = true;
        };
    }

    public entry fun claim_issuer_cap(issuer: &signer) acquires PassportConfig, IssuerCap {
        let issuer_addr = signer::address_of(issuer);
        assert!(is_authorized_issuer(issuer_addr), E_NOT_ALLOWED);
        assert!(!exists<IssuerCap>(issuer_addr), E_ALREADY_INITIALIZED);
        move_to(issuer, IssuerCap {});
    }

    public entry fun claim_inspector_cap(inspector: &signer) acquires PassportConfig, InspectorCap {
        let inspector_addr = signer::address_of(inspector);
        assert!(is_authorized_inspector(inspector_addr), E_NOT_ALLOWED);
        assert!(!exists<InspectorCap>(inspector_addr), E_ALREADY_INITIALIZED);
        move_to(inspector, InspectorCap {});
    }

    public entry fun issue_passport(
        issuer: &signer,
        owner: address,
        passport_type: vector<u8>,
        use_case: vector<u8>,
        metadata_uri: vector<u8>,
        qr_id: vector<u8>,
        passport_id: vector<u8>,
        validity_seconds: u64,
        notes: vector<u8>,
    ) acquires PassportConfig, PassportVault, IssuerCap {
        let issuer_addr = signer::address_of(issuer);
        assert!(exists<IssuerCap>(issuer_addr), E_NOT_ISSUER);
        assert!(is_authorized_issuer(issuer_addr), E_NOT_ALLOWED);
        assert!(exists<PassportVault>(owner), E_NO_VAULT);
        assert!(validity_seconds > 0, E_INVALID_DURATION);

        let config = borrow_global_mut<PassportConfig>(get_admin_address());
        let issued_at_seconds = timestamp::now_seconds();
        let expiry_seconds = issued_at_seconds + validity_seconds;
        let qr_id_copy = copy qr_id;
        let record = PassportRecord {
            passport_id,
            owner,
            issuer: issuer_addr,
            passport_type,
            use_case,
            metadata_uri,
            qr_id: qr_id_copy,
            notes,
            issued_at_seconds,
            expiry_seconds,
            revoked: false,
            revoked_at_seconds: 0,
        };

        let vault = borrow_global_mut<PassportVault>(owner);
        assert!(!table::contains(&vault.passports, passport_id), E_ALREADY_INITIALIZED);
        table::add(&mut vault.passports, passport_id, record);
        event::emit_event(
            &mut config.issued_events,
            PassportIssuedEvent {
                passport_id,
                owner,
                issuer: issuer_addr,
                expiry_seconds,
                qr_id,
            },
        );
    }

    public fun is_valid_passport(owner: address, passport_id: vector<u8>): bool acquires PassportConfig, PassportVault {
        if (!exists<PassportVault>(owner)) {
            return false;
        };

        let vault = borrow_global<PassportVault>(owner);
        if (!table::contains(&vault.passports, passport_id)) {
            return false;
        };

        let record = table::borrow(&vault.passports, passport_id);
        if (record.revoked) {
            return false;
        };

        timestamp::now_seconds() < record.expiry_seconds
    }

    public entry fun inspect_passport(inspector: &signer, owner: address, passport_id: vector<u8>) acquires PassportConfig, PassportVault, InspectorCap {
        let inspector_addr = signer::address_of(inspector);
        assert!(exists<InspectorCap>(inspector_addr), E_NOT_INSPECTOR);
        assert!(is_authorized_inspector(inspector_addr), E_NOT_ALLOWED);

        let config = borrow_global_mut<PassportConfig>(get_admin_address());
        let valid = is_valid_passport(owner, passport_id);
        let reason = if (valid) { b"valid" } else { b"invalid" };

        event::emit_event(
            &mut config.verified_events,
            PassportVerifiedEvent {
                passport_id,
                owner,
                inspector: inspector_addr,
                valid,
                reason,
            },
        );
    }

    public entry fun revoke_passport(issuer: &signer, owner: address, passport_id: vector<u8>) acquires PassportConfig, PassportVault, IssuerCap {
        let issuer_addr = signer::address_of(issuer);
        assert!(exists<IssuerCap>(issuer_addr), E_NOT_ISSUER);
        assert!(is_authorized_issuer(issuer_addr), E_NOT_ALLOWED);
        assert!(exists<PassportVault>(owner), E_NO_VAULT);

        let config = borrow_global_mut<PassportConfig>(get_admin_address());
        let vault = borrow_global_mut<PassportVault>(owner);
        assert!(table::contains(&vault.passports, passport_id), E_PASSPORT_NOT_FOUND);
        let record = table::borrow_mut(&mut vault.passports, passport_id);
        assert!(record.issuer == issuer_addr, E_NOT_ALLOWED);
        record.revoked = true;
        record.revoked_at_seconds = timestamp::now_seconds();

        event::emit_event(
            &mut config.revoked_events,
            PassportRevokedEvent {
                passport_id,
                owner,
                issuer: issuer_addr,
                revoked_at_seconds: record.revoked_at_seconds,
            },
        );
    }

    fun assert_admin(admin: &signer) acquires AdminCap {
        assert!(exists<AdminCap>(signer::address_of(admin)), E_NOT_ADMIN);
    }

    fun get_admin_address(): address acquires PassportConfig {
        @passport_verification
    }

    fun is_authorized_issuer(issuer: address): bool acquires PassportConfig {
        if (!exists<PassportConfig>(get_admin_address())) {
            return false;
        };

        let config = borrow_global<PassportConfig>(get_admin_address());
        if (!table::contains(&config.issuers, issuer)) {
            return false;
        };

        *table::borrow(&config.issuers, issuer)
    }

    fun is_authorized_inspector(inspector: address): bool acquires PassportConfig {
        if (!exists<PassportConfig>(get_admin_address())) {
            return false;
        };

        let config = borrow_global<PassportConfig>(get_admin_address());
        if (!table::contains(&config.inspectors, inspector)) {
            return false;
        };

        *table::borrow(&config.inspectors, inspector)
    }
}
