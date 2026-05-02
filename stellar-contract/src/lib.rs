#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, String,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum PassportError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotAdmin = 3,
    NotAllowed = 4,
    NoVault = 5,
    PassportNotFound = 6,
    Expired = 7,
    Revoked = 8,
    NotIssuer = 9,
    NotInspector = 10,
    InvalidDuration = 11,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Issuer(Address),
    Inspector(Address),
    Vault(Address),
    Passport(Address, String),
}

#[contracttype]
#[derive(Clone)]
pub struct PassportRecord {
    pub passport_id: String,
    pub owner: Address,
    pub issuer: Address,
    pub passport_type: String,
    pub use_case: String,
    pub metadata_uri: String,
    pub qr_id: String,
    pub notes: String,
    pub issued_at_seconds: u64,
    pub expiry_seconds: u64,
    pub revoked: bool,
    pub revoked_at_seconds: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct PassportIssuedEvent {
    pub passport_id: String,
    pub owner: Address,
    pub issuer: Address,
    pub expiry_seconds: u64,
    pub qr_id: String,
}

#[contracttype]
#[derive(Clone)]
pub struct PassportVerifiedEvent {
    pub passport_id: String,
    pub owner: Address,
    pub inspector: Address,
    pub valid: bool,
    pub reason: String,
}

#[contracttype]
#[derive(Clone)]
pub struct PassportRevokedEvent {
    pub passport_id: String,
    pub owner: Address,
    pub issuer: Address,
    pub revoked_at_seconds: u64,
}

#[contract]
pub struct PassportContract;

#[contractimpl]
impl PassportContract {
    pub fn init(env: Env, admin: Address) -> Result<(), PassportError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(PassportError::AlreadyInitialized);
        }

        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    pub fn create_vault(env: Env, owner: Address) -> Result<(), PassportError> {
        owner.require_auth();

        let key = DataKey::Vault(owner);
        if env.storage().persistent().has(&key) {
            return Err(PassportError::AlreadyInitialized);
        }

        env.storage().persistent().set(&key, &true);
        Ok(())
    }

    pub fn authorize_issuer(
        env: Env,
        admin: Address,
        issuer: Address,
    ) -> Result<(), PassportError> {
        require_admin(&env, &admin)?;
        env.storage()
            .persistent()
            .set(&DataKey::Issuer(issuer), &true);
        Ok(())
    }

    pub fn authorize_inspector(
        env: Env,
        admin: Address,
        inspector: Address,
    ) -> Result<(), PassportError> {
        require_admin(&env, &admin)?;
        env.storage()
            .persistent()
            .set(&DataKey::Inspector(inspector), &true);
        Ok(())
    }

    pub fn issue_passport(
        env: Env,
        issuer: Address,
        owner: Address,
        passport_type: String,
        use_case: String,
        metadata_uri: String,
        qr_id: String,
        passport_id: String,
        validity_seconds: u64,
        notes: String,
    ) -> Result<(), PassportError> {
        issuer.require_auth();

        if !is_authorized_issuer_internal(&env, &issuer) {
            return Err(PassportError::NotIssuer);
        }

        if !has_vault(&env, &owner) {
            return Err(PassportError::NoVault);
        }

        if validity_seconds == 0 {
            return Err(PassportError::InvalidDuration);
        }

        let key = DataKey::Passport(owner.clone(), passport_id.clone());
        if env.storage().persistent().has(&key) {
            return Err(PassportError::AlreadyInitialized);
        }

        let issued_at_seconds = env.ledger().timestamp();
        let expiry_seconds = issued_at_seconds
            .checked_add(validity_seconds)
            .ok_or(PassportError::InvalidDuration)?;

        let record = PassportRecord {
            passport_id: passport_id.clone(),
            owner: owner.clone(),
            issuer: issuer.clone(),
            passport_type,
            use_case,
            metadata_uri,
            qr_id: qr_id.clone(),
            notes,
            issued_at_seconds,
            expiry_seconds,
            revoked: false,
            revoked_at_seconds: 0,
        };

        env.storage().persistent().set(&key, &record);

        env.events().publish(
            (symbol_short!("issued"), owner.clone()),
            PassportIssuedEvent {
                passport_id,
                owner,
                issuer,
                expiry_seconds,
                qr_id,
            },
        );

        Ok(())
    }

    pub fn is_valid_passport(env: Env, owner: Address, passport_id: String) -> bool {
        let key = DataKey::Passport(owner, passport_id);
        if !env.storage().persistent().has(&key) {
            return false;
        }

        let Some(record) = env.storage().persistent().get::<DataKey, PassportRecord>(&key) else {
            return false;
        };

        if record.revoked {
            return false;
        }

        env.ledger().timestamp() < record.expiry_seconds
    }

    pub fn inspect_passport(
        env: Env,
        inspector: Address,
        owner: Address,
        passport_id: String,
    ) -> Result<bool, PassportError> {
        inspector.require_auth();

        if !is_authorized_inspector_internal(&env, &inspector) {
            return Err(PassportError::NotInspector);
        }

        let (valid, reason) = evaluate_validity(&env, &owner, &passport_id);

        env.events().publish(
            (symbol_short!("verify"), owner.clone()),
            PassportVerifiedEvent {
                passport_id,
                owner,
                inspector,
                valid,
                reason,
            },
        );

        Ok(valid)
    }

    pub fn revoke_passport(
        env: Env,
        issuer: Address,
        owner: Address,
        passport_id: String,
    ) -> Result<(), PassportError> {
        issuer.require_auth();

        if !is_authorized_issuer_internal(&env, &issuer) {
            return Err(PassportError::NotIssuer);
        }

        if !has_vault(&env, &owner) {
            return Err(PassportError::NoVault);
        }

        let key = DataKey::Passport(owner.clone(), passport_id.clone());
        let Some(mut record) = env.storage().persistent().get::<DataKey, PassportRecord>(&key) else {
            return Err(PassportError::PassportNotFound);
        };

        if record.issuer != issuer {
            return Err(PassportError::NotAllowed);
        }

        record.revoked = true;
        record.revoked_at_seconds = env.ledger().timestamp();

        env.storage().persistent().set(&key, &record);

        env.events().publish(
            (symbol_short!("revoke"), owner.clone()),
            PassportRevokedEvent {
                passport_id,
                owner,
                issuer: record.issuer,
                revoked_at_seconds: record.revoked_at_seconds,
            },
        );

        Ok(())
    }

    pub fn get_passport(env: Env, owner: Address, passport_id: String) -> Option<PassportRecord> {
        let key = DataKey::Passport(owner, passport_id);
        env.storage().persistent().get(&key)
    }

    pub fn is_authorized_issuer(env: Env, issuer: Address) -> bool {
        is_authorized_issuer_internal(&env, &issuer)
    }

    pub fn is_authorized_inspector(env: Env, inspector: Address) -> bool {
        is_authorized_inspector_internal(&env, &inspector)
    }
}

fn require_admin(env: &Env, admin: &Address) -> Result<(), PassportError> {
    admin.require_auth();

    let Some(stored_admin) = env.storage().instance().get::<DataKey, Address>(&DataKey::Admin) else {
        return Err(PassportError::NotInitialized);
    };

    if &stored_admin != admin {
        return Err(PassportError::NotAdmin);
    }

    Ok(())
}

fn has_vault(env: &Env, owner: &Address) -> bool {
    env.storage().persistent().has(&DataKey::Vault(owner.clone()))
}

fn is_authorized_issuer_internal(env: &Env, issuer: &Address) -> bool {
    env.storage()
        .persistent()
        .get::<DataKey, bool>(&DataKey::Issuer(issuer.clone()))
        .unwrap_or(false)
}

fn is_authorized_inspector_internal(env: &Env, inspector: &Address) -> bool {
    env.storage()
        .persistent()
        .get::<DataKey, bool>(&DataKey::Inspector(inspector.clone()))
        .unwrap_or(false)
}

fn evaluate_validity(env: &Env, owner: &Address, passport_id: &String) -> (bool, String) {
    let key = DataKey::Passport(owner.clone(), passport_id.clone());
    let Some(record) = env.storage().persistent().get::<DataKey, PassportRecord>(&key) else {
        return (false, String::from_str(env, "missing"));
    };

    if record.revoked {
        return (false, String::from_str(env, "revoked"));
    }

    if env.ledger().timestamp() >= record.expiry_seconds {
        return (false, String::from_str(env, "expired"));
    }

    (true, String::from_str(env, "valid"))
}
