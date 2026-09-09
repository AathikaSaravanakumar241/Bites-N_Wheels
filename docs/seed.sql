-- =====================================================================
-- Bites-N-Wheels : demo seed data
-- 50 rows in every one of the 11 tables.
--
-- Run AFTER docs/schema.sql, in the Supabase SQL Editor.
-- Safe to re-run: it truncates first and restarts the identity counters.
--
-- Demo login for EVERY seeded user:  Password@123
-- (BCrypt hash below is verified against that password. Demo only.)
--
-- Station coordinates are approximate Chennai localities - close enough
-- for Leaflet markers to land in the right neighbourhood, not surveyed.
-- =====================================================================

SET search_path TO public;

BEGIN;

TRUNCATE demand_insight, notification, order_item, orders, truck_schedule,
         menu_selection, menu, menu_item, station, truck, users
    RESTART IDENTITY CASCADE;

-- ------------------------------------------------------------ 1. USERS
-- 2 admins, 20 truck owners, 28 customers.
INSERT INTO users (name, email, phone, password_hash, role, status)
SELECT
    n.name,
    lower(replace(n.name, ' ', '.')) || g || '@bnw.test',
    '9' || lpad((100000000 + g * 7919)::text, 9, '0'),
    '$2a$10$5idu2Dx6CoPiwrdCS9I9D.A2e3OFaXcmLC2fD1TQpstBhXKZJ1y0S',
    CASE WHEN g <= 2 THEN 'ADMIN'
         WHEN g <= 22 THEN 'TRUCK_OWNER'
         ELSE 'CUSTOMER' END,
    CASE WHEN g % 17 = 0 THEN 'SUSPENDED' ELSE 'ACTIVE' END
FROM generate_series(1, 50) g
CROSS JOIN LATERAL (SELECT (ARRAY[
    'Aarav Sharma','Diya Nair','Rohan Iyer','Ananya Reddy','Karthik Menon',
    'Meera Pillai','Vikram Rao','Sneha Krishnan','Arjun Desai','Priya Balan',
    'Nikhil Verma','Kavya Subramanian','Rahul Ganesh','Divya Raman','Siddharth Bose',
    'Ishita Mehta','Aditya Kulkarni','Nandini Shetty','Vivek Chandran','Pooja Nambiar',
    'Manish Gupta','Lakshmi Venkat','Sanjay Prasad','Anjali Thomas','Harish Kumar',
    'Ritika Joshi','Ravi Sekar','Deepa Mohan','Sameer Khan','Swathi Raju',
    'Gopal Krishnan','Tanya Bhatt','Prakash Nair','Shruti Kapoor','Dinesh Babu',
    'Nisha Varma','Ajay Pandian','Bhavana Rao','Suresh Anand','Neha Agarwal',
    'Vishal Naidu','Preethi Suresh','Mohan Das','Aishwarya Lal','Kiran Bedi',
    'Sunita Rani','Arun Vijay','Madhavi Rao','Rajesh Pillai','Geetha Murthy'
])[g] AS name) n;

-- ------------------------------------------------------------ 2. TRUCK
-- 50 trucks spread across the 20 owners (user_id 3..22).
INSERT INTO truck (owner_id, name, tagline, status)
SELECT
    3 + (g % 20),
    t.name,
    t.tagline,
    CASE WHEN g % 23 = 0 THEN 'SUSPENDED'
         WHEN g % 11 = 0 THEN 'INACTIVE'
         ELSE 'ACTIVE' END
FROM generate_series(1, 50) g
CROSS JOIN LATERAL (SELECT
    (ARRAY[
    'Wheels on Fire','Curry Cruiser','The Dosa Dispatch','Biryani Boulevard','Wok This Way',
    'Tandoori Trails','Chennai Chaat Co','Roll Rangers','The Grill Wagon','Spice Shuttle',
    'Masala Motors','Pizza Pilgrim','Idli Express','Kebab Karavan','Momo Mobile',
    'The Filter Coffee Cart','Chettinad Chariot','Burger Bandi','Noodle Nomad','Paratha Patrol',
    'Sizzle Street','Coastal Catch','The Thali Truck','Frankie Fleet','Shawarma Station',
    'Sweet Wheels','Rasam Rover','Crispy Cruiser','The Vada Van','Biryani Bros',
    'Green Bowl Co','Chaat Chowk','Tiffin Trolley','The Naan Stop','Chilli Chase',
    'Sundal Stop','Pepper Pot Truck','Anna Rasoi','The Podi Post','Kothu Kart',
    'Fry Day Wagon','Mango Mile','Brew and Bite','Sambar Sprint','The Ghee Grill',
    'Urban Uttapam','Kari Kitchen','Tiffin Turbo','The Chutney Chase','Marina Munch'
    ])[g] AS name,
    (ARRAY[
    'Wood-fired pizza on the move','Home-style North Indian curries','Crisp dosas, all day',
    'Dum biryani, cooked slow','Indo-Chinese, wok tossed','Clay oven kebabs and breads',
    'Chennai street chaat','Wraps and kathi rolls','Charcoal grills and burgers','Regional spice bowls',
    'Everyday South Indian','Thin crust, thick toppings','Steamed idli and podi','Seekh and shami kebabs',
    'Steamed and pan-fried momos','Degree coffee and tiffin','Chettinad heat, done right','Smash burgers and fries',
    'Hakka noodles and more','Stuffed parathas, hot off the tawa','Sizzlers and grills','Fresh coastal seafood',
    'Unlimited South Indian thali','Bombay-style frankies','Levantine wraps and mezze','Halwa, jamun and falooda',
    'Rasam, sambar and rice','Fried snacks and sides','Medhu vada and chutney','Ambur and Hyderabadi biryani',
    'Salads and grain bowls','Pani puri and bhel','Office tiffin, delivered hot','Butter naan and rich gravies',
    'Chilli chicken and gobi','Beach-style sundal and corn','Pepper fry specialists','Simple veg meals',
    'Idli podi and gunpowder','Kothu parotta, chopped fresh','Fried chicken and wings','Seasonal mango desserts',
    'Coffee and quick bites','Sambar rice and poriyal','Ghee roast everything','Uthappam with a twist',
    'Kari dosa and curries','Fast tiffin for commuters','Chutney flights and dosas','Beach snacks by the shore'
    ])[g] AS tagline
) t;

-- ---------------------------------------------------------- 3. STATION
-- 50 Chennai localities. Coordinates are approximate.
INSERT INTO station (name, latitude, longitude)
SELECT
    s.name,
    ROUND((12.9200 + (g * 0.0041))::numeric, 6),
    ROUND((80.1600 + (((g * 17) % 40) * 0.0038))::numeric, 6)
FROM generate_series(1, 50) g
CROSS JOIN LATERAL (SELECT (ARRAY[
    'Marina Beach','T Nagar','Anna Nagar','Adyar','Velachery',
    'Guindy','Mylapore','Besant Nagar','Nungambakkam','Egmore',
    'Tambaram','Chromepet','Porur','Ambattur','Perambur',
    'Royapuram','Triplicane','Saidapet','Kodambakkam','Ashok Nagar',
    'KK Nagar','Vadapalani','Virugambakkam','Valasaravakkam','Poonamallee',
    'Avadi','Thiruvanmiyur','Sholinganallur','Perungudi','Taramani',
    'Pallikaranai','Medavakkam','Madipakkam','Nanganallur','Alandur',
    'Ekkattuthangal','Choolaimedu','Aminjikarai','Kilpauk','Purasawalkam',
    'Washermanpet','Tondiarpet','Manali','Red Hills','Villivakkam',
    'Korattur','Mogappair','Nolambur','Maduravoyal','Thirumangalam'
])[g] AS name) s;

-- -------------------------------------------------------- 4. MENU_ITEM
-- 50 dishes concentrated on trucks 1-10 (5 each), so those trucks are
-- fully demo-able rather than 50 trucks holding one dish apiece.
INSERT INTO menu_item (truck_id, name, description, price, category_tag,
                       food_type, available, stock_quantity, available_from)
SELECT
    ((g - 1) / 5) + 1,
    m.name,
    m.name || ' - prepared fresh to order.',
    m.price,
    m.category,
    m.ftype,
    (g % 9 <> 0),
    CASE WHEN g % 4 = 0 THEN NULL ELSE 10 + (g % 25) END,
    CASE WHEN g % 9 = 0 THEN TIME '19:00' ELSE NULL END
FROM generate_series(1, 50) g
CROSS JOIN LATERAL (SELECT
    (ARRAY[
    'Margherita Pizza','Chicken Tikka Pizza','Paneer Butter Masala','Chicken Biryani','Mutton Biryani',
    'Veg Fried Rice','Chicken Fried Rice','Gobi Manchurian','Chilli Chicken','Masala Dosa',
    'Ghee Roast','Onion Uthappam','Idli Vada Combo','Ven Pongal','Filter Coffee',
    'Chicken 65','Mushroom Pepper Fry','Veg Hakka Noodles','Schezwan Noodles','Egg Noodles',
    'Paneer Tikka Roll','Chicken Shawarma','Veg Shawarma','Falafel Wrap','Aloo Tikki Burger',
    'Chicken Burger','Veg Club Sandwich','Grilled Cheese Sandwich','Pav Bhaji','Vada Pav',
    'Samosa Chaat','Pani Puri','Bhel Puri','Butter Naan','Tandoori Roti',
    'Dal Makhani','Chole Bhature','Rajma Chawal','Curd Rice','Lemon Rice',
    'Gulab Jamun','Rasmalai','Chocolate Brownie','Vanilla Ice Cream','Falooda',
    'Mango Lassi','Masala Chaas','Fresh Lime Soda','Cold Coffee','Jigarthanda'
    ])[g] AS name,
    (ARRAY[
    180,260,220,190,290, 140,170,150,200,70,
    90,80,60,70,30, 210,190,130,150,140,
    120,160,110,130,90, 140,100,80,90,40,
    70,50,50,40,25, 180,120,130,60,50,
    60,80,110,70,90, 80,30,40,70,90
    ])[g]::numeric AS price,
    (ARRAY[
    'Pizza','Pizza','North Indian','Biryani','Biryani',
    'Chinese','Chinese','Chinese','Chinese','South Indian',
    'South Indian','South Indian','South Indian','South Indian','Beverages',
    'Chinese','South Indian','Chinese','Chinese','Chinese',
    'Rolls and Wraps','Rolls and Wraps','Rolls and Wraps','Rolls and Wraps','Burgers',
    'Burgers','Burgers','Burgers','Street Food','Street Food',
    'Street Food','Street Food','Street Food','North Indian','North Indian',
    'North Indian','North Indian','North Indian','South Indian','South Indian',
    'Desserts','Desserts','Desserts','Desserts','Desserts',
    'Beverages','Beverages','Beverages','Beverages','Beverages'
    ])[g] AS category,
    (ARRAY[
    'VEG','NON_VEG','VEG','NON_VEG','NON_VEG',
    'VEG','NON_VEG','VEG','NON_VEG','VEG',
    'VEG','VEG','VEG','VEG','VEG',
    'NON_VEG','VEG','VEG','VEG','NON_VEG',
    'VEG','NON_VEG','VEG','VEG','VEG',
    'NON_VEG','VEG','VEG','VEG','VEG',
    'VEG','VEG','VEG','VEG','VEG',
    'VEG','VEG','VEG','VEG','VEG',
    'VEG','VEG','VEG','VEG','VEG',
    'VEG','VEG','VEG','VEG','VEG'
    ])[g] AS ftype
) m;

-- ------------------------------------------------------------- 5. MENU
-- Trucks 1-10, one menu per day for the last 5 days = 50.
-- Satisfies uq_menu_truck_date.
INSERT INTO menu (truck_id, menu_date, status)
SELECT t, CURRENT_DATE - d,
       CASE WHEN d = 0 THEN 'CONFIRMED' ELSE 'CLOSED' END
FROM generate_series(1, 10) t
CROSS JOIN generate_series(0, 4) d;

-- --------------------------------------------------- 6. MENU_SELECTION
-- Today's 10 menus each select that truck's own 5 dishes = 50 pairs.
INSERT INTO menu_selection (menu_id, item_id)
SELECT m.menu_id, mi.item_id
FROM menu m
JOIN menu_item mi ON mi.truck_id = m.truck_id
WHERE m.menu_date = CURRENT_DATE;

-- --------------------------------------------------- 7. TRUCK_SCHEDULE
-- Trucks 1-10 x last 5 days = 50. Satisfies uq_schedule_slot
-- (one arrival time per truck per date) and chk_schedule_times.
INSERT INTO truck_schedule (truck_id, station_id, service_date,
                            arrival_time, departure_time, status)
SELECT
    t,
    ((t * 5 + d) % 50) + 1,
    CURRENT_DATE - d,
    TIME '09:00' + ((t % 5) * INTERVAL '2 hours'),
    TIME '09:00' + ((t % 5) * INTERVAL '2 hours') + INTERVAL '90 minutes',
    CASE WHEN d = 0 THEN 'OPEN' ELSE 'CLOSED' END
FROM generate_series(1, 10) t
CROSS JOIN generate_series(0, 4) d;

-- ------------------------------------------------------------ 8. ORDERS
-- 50 orders backdated across the last 5 days so the 7-day demand
-- analytics has something real to aggregate. Every 7th is an anonymous
-- OFFLINE walk-in, which chk_online_has_user permits.
INSERT INTO orders (user_id, truck_id, schedule_id, order_type, status,
                    scheduled_time, total_amount, reject_reason, created_at)
SELECT
    CASE WHEN s.rn % 7 = 0 THEN NULL ELSE 23 + (s.rn % 28) END,
    s.truck_id,
    s.schedule_id,
    CASE WHEN s.rn % 7 = 0 THEN 'OFFLINE' ELSE 'ONLINE' END,
    st.status,
    CASE WHEN s.rn % 5 = 0
         THEN (s.service_date + s.arrival_time)::timestamptz + INTERVAL '30 minutes'
         ELSE NULL END,
    0,
    CASE WHEN st.status = 'REJECTED' THEN 'Ingredients ran out for the day' END,
    (s.service_date + s.arrival_time)::timestamptz + (s.rn % 90) * INTERVAL '1 minute'
FROM (
    SELECT schedule_id, truck_id, service_date, arrival_time,
           row_number() OVER (ORDER BY schedule_id) AS rn
    FROM truck_schedule
) s
CROSS JOIN LATERAL (SELECT (ARRAY[
    'COMPLETED','COMPLETED','COMPLETED','COMPLETED','READY',
    'PREPARING','ACCEPTED','PENDING','REJECTED','CANCELLED'
])[1 + (s.rn % 10)] AS status) st;

-- -------------------------------------------------------- 9. ORDER_ITEM
-- One line per order = 50. price_at_order snapshots the price at
-- purchase time, so later menu edits cannot rewrite order history.
INSERT INTO order_item (order_id, item_id, quantity, price_at_order)
SELECT
    o.order_id,
    mi.item_id,
    1 + (o.order_id % 3),
    mi.price
FROM orders o
CROSS JOIN LATERAL (
    SELECT item_id, price
    FROM menu_item
    WHERE truck_id = o.truck_id
    ORDER BY (item_id + o.order_id) % 5, item_id
    LIMIT 1
) mi;

-- Make totals agree with the lines rather than being invented.
UPDATE orders o
SET total_amount = sub.total
FROM (SELECT order_id, SUM(quantity * price_at_order) AS total
      FROM order_item GROUP BY order_id) sub
WHERE o.order_id = sub.order_id;

-- ------------------------------------------------------ 10. NOTIFICATION
-- One per order = 50. Skips the anonymous walk-ins (no user to notify)
-- and back-fills those against a customer so the count lands on 50.
INSERT INTO notification (user_id, order_id, message, is_read, created_at)
SELECT
    COALESCE(o.user_id, 23 + (o.order_id % 28)),
    o.order_id,
    CASE o.status
        WHEN 'COMPLETED' THEN 'Your order #' || o.order_id || ' was collected. Thanks for ordering!'
        WHEN 'READY'     THEN 'Order #' || o.order_id || ' is ready for pickup.'
        WHEN 'PREPARING' THEN 'Order #' || o.order_id || ' is being prepared.'
        WHEN 'ACCEPTED'  THEN 'Order #' || o.order_id || ' was accepted by the truck.'
        WHEN 'PENDING'   THEN 'Order #' || o.order_id || ' is waiting for the truck to confirm.'
        WHEN 'REJECTED'  THEN 'Order #' || o.order_id || ' was rejected. Ingredients ran out.'
        ELSE 'Order #' || o.order_id || ' was cancelled.'
    END,
    (o.order_id % 3 = 0),
    o.created_at + INTERVAL '5 minutes'
FROM orders o;

-- --------------------------------------------------- 11. DEMAND_INSIGHT
-- Trucks 1-10 x 5 metrics = 50. In the running app these are computed
-- from orders; seeded here so the analytics screen has content on day one.
INSERT INTO demand_insight (truck_id, station_id, period_start, period_end,
                            metric, suggestion, created_at)
SELECT
    t,
    ((t * 3 + m) % 50) + 1,
    CURRENT_DATE - 7,
    CURRENT_DATE,
    mt.metric,
    mt.suggestion,
    NOW() - (m * INTERVAL '1 hour')
FROM generate_series(1, 10) t
CROSS JOIN generate_series(0, 4) m
CROSS JOIN LATERAL (SELECT
    (ARRAY['ORDER_COUNT','REVENUE','TOP_ITEM','PEAK_WINDOW','STATION_DEMAND'])[m + 1] AS metric,
    (ARRAY[
      'Order volume peaked on the weekend. Consider a longer Saturday shift.',
      'Revenue is highest at the evening stop. Stock more before 6 PM.',
      'One dish drove most orders this week. Prepare extra of it.',
      'The 6-8 PM window had the most orders. Arrive before 5:45 PM.',
      'This station had the highest demand in the last 7 days.'
    ])[m + 1] AS suggestion
) mt;

COMMIT;

-- ================================================================ CHECK
-- Every row below should read 50.
SELECT 'users' AS table_name, count(*) FROM users
UNION ALL SELECT 'truck',          count(*) FROM truck
UNION ALL SELECT 'station',        count(*) FROM station
UNION ALL SELECT 'menu_item',      count(*) FROM menu_item
UNION ALL SELECT 'menu',           count(*) FROM menu
UNION ALL SELECT 'menu_selection', count(*) FROM menu_selection
UNION ALL SELECT 'truck_schedule', count(*) FROM truck_schedule
UNION ALL SELECT 'orders',         count(*) FROM orders
UNION ALL SELECT 'order_item',     count(*) FROM order_item
UNION ALL SELECT 'notification',   count(*) FROM notification
UNION ALL SELECT 'demand_insight', count(*) FROM demand_insight
ORDER BY table_name;
