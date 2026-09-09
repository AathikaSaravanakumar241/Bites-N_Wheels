-- ---------------------------------------------------------------
-- REFRESH TODAY'S JOURNEYS
--
-- seed.sql wrote schedules as CURRENT_DATE - d, evaluated on the day
-- it ran. Once that day passes, every "today" query returns nothing
-- and the customer area pages look empty.
--
-- Run this in the Supabase SQL editor whenever the demo data is stale.
-- Safe to re-run: it only moves the most recent batch onto today.
-- ---------------------------------------------------------------

-- 1. Move the newest batch of schedules onto today.
UPDATE truck_schedule
SET service_date = CURRENT_DATE,
    status       = 'OPEN'
WHERE service_date = (SELECT MAX(service_date) FROM truck_schedule);

-- 2. Spread more trucks across more areas so several areas have food.
--    Trucks 1..20, three stops each, staggered through the day.
--    ON CONFLICT is not used because there is no unique constraint;
--    the DELETE below keeps it idempotent.
DELETE FROM truck_schedule
WHERE service_date = CURRENT_DATE
  AND truck_id BETWEEN 1 AND 20;

INSERT INTO truck_schedule (truck_id, station_id, service_date,
                            arrival_time, departure_time, status)
SELECT
    t,
    ((t * 7 + s * 11) % 50) + 1,
    CURRENT_DATE,
    TIME '08:00' + ((s * 3 + (t % 3)) * INTERVAL '1 hour'),
    TIME '08:00' + ((s * 3 + (t % 3)) * INTERVAL '1 hour') + INTERVAL '2 hours',
    'OPEN'
FROM generate_series(1, 20) t
CROSS JOIN generate_series(0, 2) s;

-- 3. Check what today looks like.
SELECT st.name AS area,
       COUNT(DISTINCT ts.truck_id) AS trucks
FROM truck_schedule ts
JOIN station st ON st.station_id = ts.station_id
WHERE ts.service_date = CURRENT_DATE
GROUP BY st.name
ORDER BY trucks DESC, st.name
LIMIT 20;
