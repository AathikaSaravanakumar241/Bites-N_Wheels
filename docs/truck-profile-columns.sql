-- ---------------------------------------------------------------
-- TRUCK PROFILE COLUMNS
--
-- The vendor Profile page edited cuisine, spice, veg-only, phone,
-- parking spot and opening hours, but `truck` only had name, tagline
-- and status - so everything else lived in the browser's localStorage
-- and was lost on a different machine.
--
-- Every column is nullable and additive, so a teammate still running
-- the older code is unaffected (Hibernate's `validate` only checks
-- that mapped columns exist, not that extra ones don't).
--
-- RUN THIS BEFORE starting the backend that has the new Truck entity,
-- otherwise ddl-auto=validate will refuse to boot.
--
-- Safe to re-run.
-- ---------------------------------------------------------------

ALTER TABLE truck ADD COLUMN IF NOT EXISTS cuisine     VARCHAR(60);
ALTER TABLE truck ADD COLUMN IF NOT EXISTS spice_level VARCHAR(20);
ALTER TABLE truck ADD COLUMN IF NOT EXISTS veg_only    BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE truck ADD COLUMN IF NOT EXISTS phone       VARCHAR(20);
ALTER TABLE truck ADD COLUMN IF NOT EXISTS parked_at   VARCHAR(200);
ALTER TABLE truck ADD COLUMN IF NOT EXISTS opens_at    TIME;
ALTER TABLE truck ADD COLUMN IF NOT EXISTS closes_at   TIME;

-- Show the result.
SELECT column_name, data_type, is_nullable
FROM   information_schema.columns
WHERE  table_schema = 'public' AND table_name = 'truck'
ORDER  BY ordinal_position;
