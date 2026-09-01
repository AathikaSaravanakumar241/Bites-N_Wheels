# Bites-N-Wheels — ER Diagram (corrected)

Matches `docs/schema.sql` exactly. GitHub renders the Mermaid block below,
so this is the version to screenshot for the report.

## Diagram

```mermaid
erDiagram
    USERS ||--o{ TRUCK          : owns
    USERS ||--o{ ORDERS         : places
    USERS ||--o{ NOTIFICATION   : receives

    TRUCK ||--o{ MENU_ITEM      : "catalogues"
    TRUCK ||--o{ MENU           : "publishes daily"
    TRUCK ||--o{ TRUCK_SCHEDULE : schedules
    TRUCK ||--o{ ORDERS         : fulfils
    TRUCK ||--o{ DEMAND_INSIGHT : "analysed for"

    MENU      ||--o{ MENU_SELECTION : lists
    MENU_ITEM ||--o{ MENU_SELECTION : "offered via"

    STATION ||--o{ TRUCK_SCHEDULE : "visited by"
    STATION ||--o{ DEMAND_INSIGHT : "referenced by"

    TRUCK_SCHEDULE ||--o{ ORDERS : serves

    ORDERS    ||--|{ ORDER_ITEM   : contains
    MENU_ITEM ||--o{ ORDER_ITEM   : "ordered as"
    ORDERS    ||--o{ NOTIFICATION : "triggers"

    USERS {
        bigint      user_id       PK
        varchar     name
        varchar     email         UK
        varchar     phone         UK
        varchar     password_hash
        varchar     role          "CUSTOMER | TRUCK_OWNER | ADMIN"
        varchar     status        "ACTIVE | SUSPENDED"
        timestamptz created_at
    }

    TRUCK {
        bigint      truck_id   PK
        bigint      owner_id   FK "to users"
        varchar     name
        varchar     tagline    "nullable"
        varchar     status     "ACTIVE | INACTIVE | SUSPENDED"
        timestamptz created_at
    }

    STATION {
        bigint  station_id PK
        varchar name
        numeric latitude   "nullable, for Leaflet"
        numeric longitude  "nullable, for Leaflet"
    }

    MENU_ITEM {
        bigint      item_id        PK
        bigint      truck_id       FK "to truck - NOT to menu"
        varchar     name
        text        description    "nullable"
        numeric     price
        varchar     category_tag   "Pizza | Chinese | ..."
        varchar     food_type      "VEG | NON_VEG"
        boolean     available
        int         stock_quantity "nullable"
        time        available_from "nullable, back-at hint"
        timestamptz created_at
    }

    MENU {
        bigint  menu_id   PK
        bigint  truck_id  FK "to truck"
        date    menu_date "unique per truck"
        varchar status    "DRAFT | CONFIRMED | CLOSED"
    }

    MENU_SELECTION {
        bigint menu_id PK "FK to menu"
        bigint item_id PK "FK to menu_item"
    }

    TRUCK_SCHEDULE {
        bigint  schedule_id    PK
        bigint  truck_id       FK "to truck"
        bigint  station_id     FK "to station"
        date    service_date
        time    arrival_time   "doubles as planned ETA"
        time    departure_time "nullable"
        varchar status         "PLANNED | ARRIVING | OPEN | CLOSED | CANCELLED"
    }

    ORDERS {
        bigint      order_id       PK
        bigint      user_id        FK "nullable - anonymous walk-in only"
        bigint      truck_id       FK "to truck"
        bigint      schedule_id    FK "nullable, to truck_schedule"
        varchar     order_type     "ONLINE | OFFLINE"
        varchar     status         "PENDING .. COMPLETED | REJECTED | CANCELLED"
        timestamptz scheduled_time "nullable, preorder only"
        numeric     total_amount
        text        reject_reason  "nullable"
        timestamptz created_at     "required for 7-day analytics"
    }

    ORDER_ITEM {
        bigint  order_item_id  PK
        bigint  order_id       FK "to orders"
        bigint  item_id        FK "to menu_item"
        int     quantity
        numeric price_at_order "snapshot, keeps history correct"
    }

    NOTIFICATION {
        bigint      notification_id PK
        bigint      user_id         FK "to users"
        bigint      order_id        FK "nullable, to orders"
        text        message
        boolean     is_read
        timestamptz created_at
    }

    DEMAND_INSIGHT {
        bigint      insight_id   PK
        bigint      truck_id     FK "to truck"
        bigint      station_id   FK "nullable, to station"
        date        period_start
        date        period_end
        varchar     metric       "ORDER_COUNT | REVENUE | TOP_ITEM"
        text        suggestion
        timestamptz created_at
    }
```

## What changed from the first draft, and why

| # | Change | Reason |
|---|--------|--------|
| 1 | `MENU_ITEM` now hangs off **`TRUCK`**, not `MENU` | Under the old design a dish was recreated for every dated menu, so the same food had a different `item_id` each day. `ORDER_ITEM` points at `MENU_ITEM`, so `GROUP BY item_id` over 7 days returned 7 separate dishes — the demand-analytics feature could not work. It also contradicted the "reusable menu item" API. |
| 2 | Added **`MENU_SELECTION`** join table | Resolves the M:N between a day's menu and the catalogue. This is what `POST /truck/today-setup` writes. |
| 3 | Removed line `USER —uses→ STATION` | No foreign key exists. Users have no relationship to stations. |
| 4 | Removed line `TRUCK_SCHEDULE —creates→ NOTIFICATION` | `NOTIFICATION` only carries `user_id` and `order_id`. True as application logic, but it is not an FK, so it does not belong on an ER diagram. |
| 5 | Removed line `ORDER —generates→ DEMAND_INSIGHT` | `DEMAND_INSIGHT` only carries `truck_id` and `station_id`. Same reason as above. |
| 6 | `USER` → `USERS`, `ORDER` → `ORDERS` | `USER` and `ORDER` are reserved words in PostgreSQL. |
| 7 | Added `created_at` to `ORDERS` | "Last 7 days" analytics is impossible without it. It was in the table spec but missing from the diagram. |
| 8 | `date` → `service_date` on `TRUCK_SCHEDULE` | Diagram and table spec disagreed. |
| 9 | `period` → `period_start` + `period_end` | Same disagreement in `DEMAND_INSIGHT`. |
| 10 | Added `description`, `stock_quantity`, `available_from` to `MENU_ITEM` | `description` was in the spec but not the diagram; the owner availability API sends a `quantity` that had no column; `available_from` backs the "available at 7:00 PM" screen. |
| 11 | `user_id` on `ORDERS` made nullable | Anonymous walk-in offline sales. Guarded by a CHECK so online orders still require a customer. |

## Cardinality

| Relationship | Cardinality | Note |
|---|---|---|
| `USERS` → `TRUCK` | 1 : 0..N | One owner, many trucks |
| `TRUCK` → `MENU_ITEM` | 1 : N | Permanent catalogue |
| `TRUCK` → `MENU` | 1 : N | One per service date (unique) |
| `MENU` ↔ `MENU_ITEM` | M : N | Resolved by `MENU_SELECTION` |
| `TRUCK` → `TRUCK_SCHEDULE` | 1 : N | Many stops across many dates |
| `STATION` → `TRUCK_SCHEDULE` | 1 : N | Many trucks visit, at different times |
| `USERS` → `ORDERS` | 1 : N | Nullable for walk-ins |
| `TRUCK` → `ORDERS` | 1 : N | |
| `TRUCK_SCHEDULE` → `ORDERS` | 1 : N | The stop the order is served at |
| `ORDERS` → `ORDER_ITEM` | 1 : 1..N | An order has at least one line |
| `MENU_ITEM` → `ORDER_ITEM` | 1 : N | A dish appears in many historical orders |
| `USERS` → `NOTIFICATION` | 1 : N | |
| `ORDERS` → `NOTIFICATION` | 1 : 0..N | Nullable |
| `TRUCK` → `DEMAND_INSIGHT` | 1 : N | |
