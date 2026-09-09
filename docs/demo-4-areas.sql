-- ---------------------------------------------------------------
-- DEMO DATASET: four areas, every one of them stocked.
--
-- Narrows the customer area picker to four Chennai areas and makes
-- sure each has trucks that actually carry food, so "pick any area,
-- see food" holds while walking the register -> order -> vendor flow.
--
-- Pairs with app.demo.areas in application.properties, which limits
-- GET /api/v1/stations to the same four names.
--
-- Safe to re-run. It never deletes a schedule an order points at.
-- ---------------------------------------------------------------

BEGIN;

-- The four demo areas, numbered 0..3.
CREATE TEMP TABLE demo_station ON COMMIT DROP AS
SELECT station_id,
       name,
       (row_number() OVER (ORDER BY station_id) - 1) AS idx
FROM   station
WHERE  name IN ('Adyar', 'Anna Nagar', 'T Nagar', 'Velachery');

-- Only trucks that are active AND actually have an available dish.
-- Scheduling an empty truck is what made an area look "closed".
CREATE TEMP TABLE demo_truck ON COMMIT DROP AS
SELECT t.truck_id,
       (row_number() OVER (ORDER BY t.truck_id) - 1) AS idx
FROM   truck t
WHERE  t.status <> 'INACTIVE'
AND    EXISTS (SELECT 1
               FROM   menu_item m
               WHERE  m.truck_id  = t.truck_id
               AND    m.available = true);

-- Clear today's slate, but never orphan an existing order.
DELETE FROM truck_schedule ts
WHERE  ts.service_date = CURRENT_DATE
AND    NOT EXISTS (SELECT 1 FROM orders o WHERE o.schedule_id = ts.schedule_id);

-- Three stops per area. The evening window is deliberately open now,
-- so at least one truck per area is always orderable.
INSERT INTO truck_schedule (truck_id, station_id, service_date,
                            arrival_time, departure_time, status)
SELECT dt.truck_id,
       ds.station_id,
       CURRENT_DATE,
       slot.arr,
       slot.dep,
       'OPEN'
FROM       demo_station ds
CROSS JOIN (VALUES (0, TIME '08:00', TIME '11:00'),
                   (1, TIME '11:00', TIME '16:00'),
                   (2, TIME '16:00', TIME '23:30')) AS slot(s, arr, dep)
JOIN       demo_truck dt
       ON  dt.idx = ((ds.idx * 3 + slot.s) % (SELECT COUNT(*) FROM demo_truck));

COMMIT;

-- What a customer will now see in each of the four areas.
SELECT st.name                                   AS area,
       COUNT(*)                                  AS stops,
       COUNT(*) FILTER (WHERE LOCALTIME BETWEEN ts.arrival_time
                                            AND ts.departure_time) AS open_now,
       SUM((SELECT COUNT(*) FROM menu_item m
            WHERE m.truck_id = ts.truck_id AND m.available = true)) AS dishes
FROM   truck_schedule ts
JOIN   station st ON st.station_id = ts.station_id
WHERE  ts.service_date = CURRENT_DATE
AND    st.name IN ('Adyar', 'Anna Nagar', 'T Nagar', 'Velachery')
GROUP  BY st.name
ORDER  BY st.name;
