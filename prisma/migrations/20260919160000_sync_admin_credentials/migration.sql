-- Safe Admin Account Synchronization Migration
-- Synchronizes admin credentials and attributes for educonnects.com@gmail.com without data loss or resetting credentials

DO $$
DECLARE
    legacy_admin_id TEXT;
    canonical_admin_id TEXT;
    legacy_hash TEXT;
BEGIN
    -- Locate legacy typo admin account if present
    SELECT id, "passwordHash" INTO legacy_admin_id, legacy_hash FROM "users" WHERE email = 'educonnets.com@gmail.com' LIMIT 1;
    
    -- Locate canonical admin account if present
    SELECT id INTO canonical_admin_id FROM "users" WHERE email = 'educonnects.com@gmail.com' LIMIT 1;

    -- Scenario 1: Canonical admin does not exist, but legacy typo exists -> Rename in-place
    IF canonical_admin_id IS NULL AND legacy_admin_id IS NOT NULL THEN
        UPDATE "users"
        SET email = 'educonnects.com@gmail.com',
            role = 'ADMIN',
            status = 'ACTIVE',
            "emailVerified" = true,
            "updatedAt" = NOW()
        WHERE id = legacy_admin_id;
        canonical_admin_id := legacy_admin_id;
    END IF;

    -- Scenario 2: Both accounts exist -> Synchronize passwordHash from legacy to canonical if needed, ensure ADMIN role
    IF canonical_admin_id IS NOT NULL AND legacy_admin_id IS NOT NULL AND canonical_admin_id != legacy_admin_id THEN
        -- If legacy has a password hash, synchronize it to canonical
        IF legacy_hash IS NOT NULL AND LENGTH(TRIM(legacy_hash)) > 0 THEN
            UPDATE "users"
            SET "passwordHash" = legacy_hash,
                role = 'ADMIN',
                status = 'ACTIVE',
                "emailVerified" = true,
                "updatedAt" = NOW()
            WHERE id = canonical_admin_id;
        ELSE
            UPDATE "users"
            SET role = 'ADMIN',
                status = 'ACTIVE',
                "emailVerified" = true,
                "updatedAt" = NOW()
            WHERE id = canonical_admin_id;
        END IF;
    END IF;

    -- Scenario 3: Canonical admin exists -> Ensure role = 'ADMIN', status = 'ACTIVE', emailVerified = true
    IF canonical_admin_id IS NOT NULL THEN
        UPDATE "users"
        SET role = 'ADMIN',
            status = 'ACTIVE',
            "emailVerified" = true,
            "updatedAt" = NOW()
        WHERE id = canonical_admin_id;

        -- Ensure profile exists for canonical admin
        IF NOT EXISTS (SELECT 1 FROM "profiles" WHERE "userId" = canonical_admin_id) THEN
            INSERT INTO "profiles" ("id", "userId", "firstName", "lastName", "bio", "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, canonical_admin_id, 'System', 'Administrator', 'EduConnects Governance & Platform Administrator', NOW(), NOW());
        END IF;
    END IF;
END $$;
