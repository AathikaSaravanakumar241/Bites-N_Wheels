-- =====================================================================
-- Bites-N-Wheels : MVP database schema (PostgreSQL / Supabase)
-- Paste this whole file into Supabase -> SQL Editor -> Run.
--
-- Naming notes:
--   * "user" and "order" are RESERVED WORDS in PostgreSQL, so the
--     tables are named  users  and  orders.
--   * Enum-like columns are VARCHAR + CHECK so they map cleanly to
--     Java enums via @Enumerated(EnumType.STRING).
--   * Money is NUMERIC(10,2) -- never float/double.
--   * menu_item hangs off TRUCK (permanent catalogue), NOT off menu.
--     menu + menu_selection express which items are on sale on a date.
-- =====================================================================

-- Force everything into the public schema. Without this, a search_path
-- that prefers another schema silently creates the tables there and
-- Hibernate cannot find them.
SET search_path TO public;

-- ---------------------------------------------------------------- USERS
CREATE TABLE users (
    user_id       BIGSERIAL    PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    phone         VARCHAR(20)  UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_user_role   CHECK (role   IN ('CUSTOMER','TRUCK_OWNER','ADMIN')),
    CONSTRAINT chk_user_status CHECK (status IN ('ACTIVE','SUSPENDED'))
);

-- ---------------------------------------------------------------- TRUCK
CREATE TABLE truck (
    truck_id   BIGSERIAL    PRIMARY KEY,
    owner_id   BIGINT       NOT NULL REFERENCES users(user_id),
    name       VARCHAR(120) NOT NULL,
    tagline    VARCHAR(200),
    status     VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_truck_status CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED'))
);

-- -------------------------------------------------------------- STATION
CREATE TABLE station (
    station_id BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    latitude   NUMERIC(9,6),
    longitude  NUMERIC(9,6)
);

-- ------------------------------------------------------------ MENU_ITEM
-- The permanent catalogue of a truck. One row per dish, forever.
-- Keeping this under TRUCK (not MENU) is what makes 7-day demand
-- analytics and reusable menu items possible.
CREATE TABLE menu_item (
    item_id        BIGSERIAL     PRIMARY KEY,
    truck_id       BIGINT        NOT NULL REFERENCES truck(truck_id) ON DELETE CASCADE,
    name           VARCHAR(120)  NOT NULL,
    description    TEXT,
    price          NUMERIC(10,2) NOT NULL,
    category_tag   VARCHAR(60)   NOT NULL,
    food_type      VARCHAR(10)   NOT NULL,
    available      BOOLEAN       NOT NULL DEFAULT TRUE,
    stock_quantity INT,
    available_from TIME,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_item_price CHECK (price >= 0),
    CONSTRAINT chk_item_type  CHECK (food_type IN ('VEG','NON_VEG')),
    CONSTRAINT chk_item_stock CHECK (stock_quantity IS NULL OR stock_quantity >= 0)
);

-- ----------------------------------------------------------------- MENU
-- One row per truck per service date. The menu for that day.
CREATE TABLE menu (
    menu_id   BIGSERIAL   PRIMARY KEY,
    truck_id  BIGINT      NOT NULL REFERENCES truck(truck_id) ON DELETE CASCADE,
    menu_date DATE        NOT NULL,
    status    VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    CONSTRAINT uq_menu_truck_date UNIQUE (truck_id, menu_date),
    CONSTRAINT chk_menu_status    CHECK (status IN ('DRAFT','CONFIRMED','CLOSED'))
);

-- Resolves the M:N between a given day menu and the catalogue.
CREATE TABLE menu_selection (
    menu_id BIGINT NOT NULL REFERENCES menu(menu_id)      ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES menu_item(item_id) ON DELETE CASCADE,
    PRIMARY KEY (menu_id, item_id)
);

-- ------------------------------------------------------- TRUCK_SCHEDULE
CREATE TABLE truck_schedule (
    schedule_id    BIGSERIAL   PRIMARY KEY,
    truck_id       BIGINT      NOT NULL REFERENCES truck(truck_id) ON DELETE CASCADE,
    station_id     BIGINT      NOT NULL REFERENCES station(station_id),
    service_date   DATE        NOT NULL,
    arrival_time   TIME        NOT NULL,
    departure_time TIME,
    status         VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    CONSTRAINT uq_schedule_slot   UNIQUE (truck_id, service_date, arrival_time),
    CONSTRAINT chk_schedule_times CHECK (departure_time IS NULL OR departure_time > arrival_time),
    CONSTRAINT chk_schedule_status
        CHECK (status IN ('PLANNED','ARRIVING','OPEN','CLOSED','CANCELLED'))
);

-- --------------------------------------------------------------- ORDERS
CREATE TABLE orders (
    order_id       BIGSERIAL     PRIMARY KEY,
    user_id        BIGINT        REFERENCES users(user_id),
    truck_id       BIGINT        NOT NULL REFERENCES truck(truck_id),
    schedule_id    BIGINT        REFERENCES truck_schedule(schedule_id),
    order_type     VARCHAR(10)   NOT NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    scheduled_time TIMESTAMPTZ,
    total_amount   NUMERIC(10,2) NOT NULL,
    reject_reason  TEXT,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_order_type   CHECK (order_type IN ('ONLINE','OFFLINE')),
    CONSTRAINT chk_order_total  CHECK (total_amount >= 0),
    CONSTRAINT chk_order_status CHECK (status IN
        ('PENDING','ACCEPTED','REJECTED','PREPARING','READY','COMPLETED','CANCELLED')),
    -- walk-in sales may be anonymous; online orders may not
    CONSTRAINT chk_online_has_user CHECK (order_type = 'OFFLINE' OR user_id IS NOT NULL)
);

-- ----------------------------------------------------------- ORDER_ITEM
CREATE TABLE order_item (
    order_item_id  BIGSERIAL     PRIMARY KEY,
    order_id       BIGINT        NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    item_id        BIGINT        NOT NULL REFERENCES menu_item(item_id),
    quantity       INT           NOT NULL,
    price_at_order NUMERIC(10,2) NOT NULL,
    CONSTRAINT chk_oi_qty   CHECK (quantity > 0),
    CONSTRAINT chk_oi_price CHECK (price_at_order >= 0)
);

-- --------------------------------------------------------- NOTIFICATION
CREATE TABLE notification (
    notification_id BIGSERIAL   PRIMARY KEY,
    user_id         BIGINT      NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    order_id        BIGINT      REFERENCES orders(order_id)        ON DELETE CASCADE,
    message         TEXT        NOT NULL,
    is_read         BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------- DEMAND_INSIGHT
CREATE TABLE demand_insight (
    insight_id   BIGSERIAL   PRIMARY KEY,
    truck_id     BIGINT      NOT NULL REFERENCES truck(truck_id) ON DELETE CASCADE,
    station_id   BIGINT      REFERENCES station(station_id),
    period_start DATE        NOT NULL,
    period_end   DATE        NOT NULL,
    metric       VARCHAR(60) NOT NULL,
    suggestion   TEXT        NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_insight_period CHECK (period_end >= period_start)
);

-- ================================================================ INDEXES
CREATE INDEX idx_truck_owner        ON truck(owner_id, status);
CREATE INDEX idx_menu_truck_date    ON menu(truck_id, menu_date);
CREATE INDEX idx_item_truck_cat     ON menu_item(truck_id, category_tag, available);
CREATE INDEX idx_sched_truck_date   ON truck_schedule(truck_id, service_date, arrival_time);
CREATE INDEX idx_sched_station_date ON truck_schedule(station_id, service_date, arrival_time);
CREATE INDEX idx_orders_user        ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_truck       ON orders(truck_id, status, created_at DESC);
CREATE INDEX idx_orders_schedule    ON orders(schedule_id);
CREATE INDEX idx_order_item_order   ON order_item(order_id);
CREATE INDEX idx_notif_user_unread  ON notification(user_id, is_read, created_at DESC);
