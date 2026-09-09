-- ---------------------------------------------------------------
-- ONE TRUCK PER OWNER
--
-- TruckService.getCurrentTruck() does:
--
--     truckRepository.findByOwnerUserId(userId)   -> Optional<Truck>
--
-- An Optional cannot hold two rows, so any owner with more than one
-- truck made Spring Data throw IncorrectResultSizeDataAccessException
-- and EVERY vendor page 500'd for them. The seed data had 25 owners
-- holding 55 trucks, so 20 accounts were permanently broken.
--
-- The rule is now one truck per owner, enforced by the database.
--
-- The extra trucks are NOT deleted - they are the demo fleet customers
-- browse, with menus, schedules and orders attached. Each one is given
-- its own owner account instead, cloned from the current owner (same
-- password hash, so it signs in with the same password). Nothing a
-- customer can see changes.
--
-- Safe to re-run: the reassignment finds nothing once every owner holds
-- a single truck, and the constraint is only added if missing.
-- ---------------------------------------------------------------

BEGIN;

-- 1. Give every surplus truck its own owner.
--    "Surplus" = not the lowest truck_id for that owner, so each original
--    owner keeps their first truck and nothing already-correct moves.
WITH ranked AS (
    SELECT t.truck_id,
           t.name,
           t.owner_id,
           ROW_NUMBER() OVER (PARTITION BY t.owner_id ORDER BY t.truck_id) AS rn
    FROM   truck t
),
extra AS (
    SELECT * FROM ranked WHERE rn > 1
),
new_owners AS (
    INSERT INTO users (name, email, phone, password_hash, role, status)
    SELECT left(e.name || ' Owner', 100),
           'owner.truck' || e.truck_id || '@bnw.test',
           '7' || lpad(e.truck_id::text, 9, '0'),
           u.password_hash,          -- same credentials as the original owner
           'TRUCK_OWNER',
           'ACTIVE'
    FROM   extra e
    JOIN   users u ON u.user_id = e.owner_id
    WHERE  NOT EXISTS (
               SELECT 1 FROM users x
               WHERE  x.email = 'owner.truck' || e.truck_id || '@bnw.test')
    RETURNING user_id, email
)
UPDATE truck t
SET    owner_id = n.user_id
FROM   new_owners n
WHERE  n.email = 'owner.truck' || t.truck_id || '@bnw.test';

-- 2. Enforce it from here on. Registration already creates exactly one
--    truck per owner, so this only guards against regressions.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_truck_owner'
    ) THEN
        ALTER TABLE truck ADD CONSTRAINT uq_truck_owner UNIQUE (owner_id);
    END IF;
END
$$;

COMMIT;

-- 3. Prove it: owners_with_multiple_trucks must be 0, and the constraint
--    must be listed.
SELECT (SELECT COUNT(*) FROM truck)                  AS trucks_total,
       (SELECT COUNT(DISTINCT owner_id) FROM truck)  AS distinct_owners,
       (SELECT COUNT(*) FROM (
            SELECT owner_id FROM truck
            GROUP BY owner_id HAVING COUNT(*) > 1) q) AS owners_with_multiple_trucks;

SELECT conname, pg_get_constraintdef(oid) AS def
FROM   pg_constraint
WHERE  conrelid = 'truck'::regclass AND conname = 'uq_truck_owner';
