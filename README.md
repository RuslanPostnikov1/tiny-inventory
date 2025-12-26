# Tiny Inventory

A full-stack inventory management system built with NestJS, Prisma, PostgreSQL, React, and Material-UI.

## Quick Start

```bash
docker compose up --build
```

The application will be available at:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs (dev only)

Seed data is automatically loaded on first startup.

## API Sketch

```
GET    /stores              # List stores (paginated)
GET    /stores/:id          # Get store details
GET    /stores/:id/stats    # Get inventory statistics (non-trivial)
POST   /stores              # Create store
PATCH  /stores/:id          # Update store
DELETE /stores/:id          # Delete store (cascades products)

GET    /products?storeId=&category=&minPrice=&maxPrice=&page=&limit=
POST   /products            # Create product
PATCH  /products/:id        # Update product
DELETE /products/:id        # Delete product
```

## Decisions & Trade-offs

### Backend-Focused Approach
**Decision:** Invest more effort in backend quality (position is Backend-Oriented Full-Stack Engineer).

**What's implemented:**
- 100% unit test coverage
- Swagger/OpenAPI documentation
- Structured logging (Pino)
- Rate limiting
- Input sanitization
- Global exception handling with request IDs

**Trade-off:** Frontend is functional but simpler in design.

### Why Prisma over TypeORM?
**Decision:** Use Prisma as the ORM.

**Rationale:** Better TypeScript integration with auto-generated types, type-safe query builder, declarative schema with cleaner migrations.

**Trade-off:** Smaller ecosystem, but type safety outweighs this.

### Why PostgreSQL?
**Decision:** Use PostgreSQL for persistence.

**Rationale:** Production-ready, excellent for relational data with indexes, transactions, and complex queries. Prisma works seamlessly with it.

**Trade-off:** Requires Docker for local development (vs SQLite which would be simpler).

### In-Memory vs Database Aggregation for Stats
**Decision:** Use optimized raw SQL query for inventory value calculation.

**Rationale:** Initially used in-memory aggregation, then optimized to `$queryRaw` for better performance with large datasets.

**Trade-off:** Raw SQL is less type-safe, but performance is critical for production.

### URL-Synced Filters
**Decision:** Sync product filters with URL parameters.

**Rationale:** Allows sharing filtered views via URL, browser back/forward navigation works correctly, bookmarkable filter states.

**Trade-off:** Slightly more complex state management.

## Testing Approach

### Unit Tests
**Location:** `server/test/unit/`

**Coverage:** 100% statements, functions, lines (branches ~90% due to decorators)

**Run:**
```bash
cd server && yarn test
```

**Scope:**
- Service layer business logic
- Controller request handling
- Custom validators
- Utility functions
- Exception filters

**Rationale:** Unit tests ensure business logic correctness in isolation, making refactoring safer. Mocked dependencies allow fast test execution and precise error isolation.

**Trade-off:** No E2E or frontend tests due to time constraints. In production, would add API integration tests and React Testing Library + Playwright for frontend.

## If I Had More Time

1. **Authentication & Authorization** — JWT-based auth with role-based access control for admin/user roles and store-level permissions.

2. **E2E & Frontend Tests** — Add API integration tests with real database, React Testing Library for component tests, and Playwright for frontend E2E.

3. **Advanced Analytics Dashboard** — Sales trends over time, category performance charts, inventory forecasting, and export to PDF/Excel.

## Project Structure

```
tiny-inventory/
├── server/                     # Backend (NestJS)
│   ├── src/
│   │   ├── stores/            # Stores module (controller, service, DTOs)
│   │   ├── products/          # Products module
│   │   ├── prisma/            # Prisma service
│   │   └── common/            # Filters, utils, validators, constants
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed data
│   └── test/unit/             # Unit tests
├── web/                        # Frontend (React)
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom hooks (useFiltersSync, usePageTitle)
│   │   ├── api/               # API client
│   │   └── types/             # TypeScript types
├── docker-compose.yml          # Docker orchestration
└── README.md
```

## Non-Trivial Operation

**Endpoint:** `GET /stores/:id/stats`

Calculates:
- Total inventory value (Σ price × quantity)
- Category breakdown with counts
- Low-stock items count (quantity < 10)

Uses optimized raw SQL for value calculation to handle large datasets efficiently.

---

**Author:** Ruslan Postnikov
**Position:** Middle Full-Stack Engineer (Backend-Oriented)  
**Date:** December 2025
