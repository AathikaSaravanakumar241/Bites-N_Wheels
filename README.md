# Bites-N-Wheels

A food-truck ordering platform. Customers pick their area, find the trucks
parked nearby today, order from a live menu and follow their order until it is
ready. Truck owners manage their menu, daily route and incoming orders from
their own dashboard.

Built as a team project during a 6-week internship.

---

## Features

**Customers**
- Register and log in (JWT authentication)
- Choose an area and see the trucks stationed there today
- Browse trucks and categories, and search for food
- Cart and checkout
- Live order tracking: `PENDING → ACCEPTED → PREPARING → READY → COMPLETED`
- Order history and profile

**Truck owners**
- Dashboard with the day's stats
- Menu management: add, edit, delete items and toggle availability
- Plan the day's route and stations
- Accept orders, update their status and issue pickup tokens
- Record offline (walk-in) orders and billing

**Admins**
- Manage users and trucks, including activating or suspending accounts

---

## Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, React Router 7, Vite |
| Backend  | Java 21, Spring Boot 4, Spring Security, Spring Data JPA, WebSocket |
| Auth     | JWT (jjwt) |
| Database | PostgreSQL (hosted on Supabase) |

---

## Project structure

```
Bites-N_Wheels/
├── backend/     Spring Boot REST API
│   └── src/main/java/com/food/bitesonwheels/
│       ├── Controllers/   REST endpoints
│       ├── Services/      business logic
│       ├── Repository/    JPA repositories
│       ├── models/        entities and enums
│       ├── dto/           request / response objects
│       └── config/        security, JWT filter, error handling
├── frontend/    React + Vite client
│   └── src/pages/
│       ├── User/          customer screens
│       └── Vendor/        truck-owner screens
└── docs/        SQL schema, seed data, ER diagram, API documentation
```

---

## Getting started

### Prerequisites
- Java 21
- Node.js 20 or newer
- A PostgreSQL database (a free Supabase project works)

### 1. Set up the database

Run these in your database's SQL editor, in this order:

1. `docs/schema.sql` creates the tables
2. `docs/seed.sql` adds sample data

The other scripts in `docs/` add optional demo data.

### 2. Run the backend

```bash
cd backend/src/main/resources
cp application-local.properties.example application-local.properties
```

Fill in your database URL, username, password and a JWT secret in
`application-local.properties`. The file is gitignored, so never commit it.

> **Supabase users:** use the **Session pooler** connection on port `5432`.
> Port `6543` (the transaction pooler) breaks Hibernate.

Then start the API from the `backend` folder:

```bash
./mvnw spring-boot:run
```

The API runs on `http://localhost:8080`.

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite forwards every `/api` request to the backend,
so there is nothing else to configure.

---

## API overview

| Area      | Base path |
|-----------|-----------|
| Auth      | `/api/auth` (register, login, logout) |
| Customer  | `/api/v1/trucks`, `/api/v1/foods`, `/api/v1/stations` |
| Cart      | `/api/v1/cart` |
| Orders    | `/api/v1/orders` |
| Tracking  | `/api/v1/orders/{orderId}/tracking` |
| Truck owner | `/api/v1/truck` |
| Admin     | `/api/v1/admin` |

The full API reference and the database ER diagram are in [`docs/`](docs).

---

## Team

| Name | GitHub |
|------|--------|
| Aathika Saravanakumar | [@AathikaSaravanakumar241](https://github.com/AathikaSaravanakumar241) |
| Dharsan Ramesh Kumar | [@Dharsanrameshkumar](https://github.com/Dharsanrameshkumar) |
| Kavita Sri G | [@KavitaSri06](https://github.com/KavitaSri06) |
| Nandhini Ilayaraja | [@Nandhiniilayaraja](https://github.com/Nandhiniilayaraja) |
| Prakash R | [@prakash-1006](https://github.com/prakash-1006) |

---

## Contributions

We're open to collaboration. To report a bug, suggest a feature or discuss an
idea, open an issue. For code contributions, please follow
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE).
