# Backend foundation — what changed and why

Baseline: commit `9de15de`, where the backend was a generated Spring Boot
skeleton in which **every** Java file contained only a package declaration.
Nothing ran; there was no working data layer.

Totals: 24 tracked files changed (+635 / −16), 12 new files, 2 files deleted.

---

## 1. Build configuration

### `backend/pom.xml`

| Added | Why |
|---|---|
| `spring-boot-starter-data-jpa` | **The hard blocker.** `application.properties` configured Hibernate and `ddl-auto`, but no JPA dependency existed. The app could not start at all. |
| `spring-boot-starter-validation` | Needed for `@Valid`, `@NotBlank`, `@Email` on request DTOs. |
| `spring-boot-starter-websocket` | Needed for the live order-status / ETA channel (`/topic/orders/{orderId}`). |
| `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (0.12.6) | JWT signing and validation. No JWT library was present. |

Nothing was removed.

---

## 2. Configuration and secrets

### `backend/src/main/resources/application.properties` (rewritten)

**Before**, this committed file contained the live Supabase host, username and a
password placeholder. On a public repository that exposes the database endpoint.

| Change | Why |
|---|---|
| Credentials removed entirely | They must never sit in a committed file. |
| `spring.profiles.active=${SPRING_PROFILES_ACTIVE:local}` | Loads `application-local.properties` automatically, so `mvnw spring-boot:run` needs no flags. Deployment overrides with an env var. |
| `ddl-auto` changed `update` → `validate` | The schema is owned by `docs/schema.sql`. `update` lets Hibernate silently alter tables and drift from the SQL; `validate` fails loudly at startup if an entity and a table disagree. |
| `hibernate.default_schema=public` | The Supabase `search_path` was `"BitesNWheels", public`, which caused tables to be created in the wrong schema. Pinning this makes Hibernate immune to `search_path`. |
| `open-in-view=false` | Spring Boot warns about this by default. It keeps a DB session open for the whole HTTP request, which hides lazy-loading bugs and holds connections longer than needed. |
| Port note 6543 → 5432 | 6543 is Supabase's transaction pooler; it breaks Hibernate prepared statements and DDL. 5432 is the session pooler. |

### `backend/src/main/resources/application-local.properties.example` (new)

A committed template. Each developer copies it to
`application-local.properties` (already covered by `.gitignore` line 65) and
fills in their own credentials. That copy is never committed.

---

## 3. Data model

### Deleted

| File | Why |
|---|---|
| `models/Order.java` | Duplicate of `Orders.java`. Two empty classes for the same concept — the team would have split across both. |
| `models/UserType.java` | An empty class where an enum belongs. Replaced by `enums/Role.java`. |

### `models/enums/` (new — 8 files)

`Role`, `UserStatus`, `TruckStatus`, `MenuStatus`, `FoodType`,
`ScheduleStatus`, `OrderType`, `OrderStatus`.

Mapped with `@Enumerated(EnumType.STRING)` so the database stores readable
values (`'PENDING'`, not `0`). Ordinal storage breaks the moment someone
reorders the enum. Each has a matching `CHECK` constraint in SQL.

### The 10 entities (all previously empty)

`User`, `Truck`, `Station`, `MenuItem`, `Menu`, `TruckSchedule`, `Orders`,
`OrderItem`, `Notification`, `DemandInsight` — written with real fields,
column mappings and relationships matching `docs/schema.sql` exactly.

Design decisions worth being able to defend:

- **`MenuItem` belongs to `Truck`, not `Menu`.** In the original ER model,
  menu items hung off a dated `MENU`. A dish would be recreated for every
  service date, giving the same food a different `item_id` each day. Since
  `ORDER_ITEM` references `MENU_ITEM`, grouping orders by item across a week
  would return N separate dishes — the 7-day demand-analytics feature could
  never work. `MENU` + `MENU_SELECTION` (a `@ManyToMany` join) now express
  "which catalogue items are on sale today".
- **`Orders`, not `Order`.** `ORDER` is a reserved word in SQL. Same reason
  the table is `users`, not `user`.
- **`price_at_order` on `OrderItem`.** A snapshot. Without it, changing a menu
  price would retroactively rewrite the value of every historical order.
- **`Orders.user` is nullable.** Anonymous walk-in (OFFLINE) sales. A
  `CHECK` constraint still requires a customer on every ONLINE order.
- **All `@ManyToOne` are `FetchType.LAZY`.** The JPA default is EAGER, which
  silently joins parent tables on every query.
- **Lombok `@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder`**
  rather than `@Data`. `@Data` generates `equals`/`hashCode` over all fields,
  which triggers lazy loading and breaks on JPA entities.

---

## 4. Data access — `Repository/` (10 files)

All ten were empty. Each now declares
`interface XRepository extends JpaRepository<Entity, Long>`, which is what
supplies `save`, `findById`, `findAll`, `delete` and paging.

`OrderRepository` manages the `Orders` entity — the filename kept its original
spelling to avoid a rename conflict across the team's branches.

---

## 5. Security — `config/SecurityConfig.java` (new)

`spring-boot-starter-security` was on the classpath with **no configuration**.
Spring's default in that state locks every endpoint behind HTTP Basic with a
randomly generated password printed to the console — which would have blocked
the entire team.

This file provides:

- a permissive filter chain so the app is reachable (carrying a `TODO` block
  listing the real per-role rules for the auth owner to swap in),
- `SessionCreationPolicy.STATELESS` and CSRF disabled, correct for a
  JWT-authenticated REST API with no server-side session,
- a CORS source allowing `http://localhost:5173`, the Vite dev server,
- a `BCryptPasswordEncoder` bean, so passwords are hashed and never stored
  in plain text.

---

## 6. Documentation — `docs/` (new)

| File | Contents |
|---|---|
| `schema.sql` | Full DDL: 11 tables, foreign keys, `CHECK` constraints on every enum column, `NUMERIC(10,2)` for money, and 10 indexes. Begins with `SET search_path TO public;`. |
| `er-diagram.md` | Corrected ER diagram (Mermaid, renders on GitHub) plus the full list of what changed from the original model. |
| `CHANGES.md` | This file. |

### Business rules now enforced by the database, not just by code

| Constraint | Rule |
|---|---|
| `uq_schedule_slot` | A truck cannot double-book the same date and arrival time. |
| `uq_menu_truck_date` | One menu per truck per date. |
| `chk_online_has_user` | Online orders must have a customer; walk-ins may be anonymous. |
| `chk_schedule_times` | Departure must be later than arrival. |
| `chk_oi_qty` | Order line quantity must be greater than zero. |
| `chk_order_status` | Status must be one of the seven defined values. |

---

## 7. Cleanup

`server/` (a leftover empty Maven output directory from an earlier folder
rename) was deleted locally. It was never tracked by git — `.gitignore`
already covered `**/target/` — so this does not appear in the diff.

---

## 8. Database changes (outside git)

Applied manually in the Supabase SQL Editor:

1. Dropped the accidental `"BitesNWheels"` schema, where an unqualified
   `CREATE TABLE` had landed because `search_path` preferred it.
2. Ran `docs/schema.sql` against `public`.

**Every team member must be told:** the database was rebuilt. Anyone holding
seed data needs to re-insert it.

---

## 9. Verification

`mvnw spring-boot:run` reaches
`Started BitesonwheelsApplication in 15.6 seconds`. Because `ddl-auto` is
`validate`, a successful startup is proof that all 10 entities match the 11
tables in Supabase — column names, types and nullability included.

---

## Still empty (by design — assigned to other team members)

Eight `Controllers/` and eight `Services/` files remain package-declaration
stubs. These are the per-module assignments in the team split and were left
untouched to avoid collisions across branches.
