# Tiny Inventory - Server (Backend)

NestJS-based REST API for inventory management.

## Prerequisites

- Node.js 20.19+ or 22.12+
- PostgreSQL 16+
- npm or yarn

## Quick Start

### Using Docker (Recommended)

From the project root:

```bash
docker compose up --build
```

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL
```

3. Run migrations and seed:
```bash
npx prisma migrate dev
npx prisma db seed
```

4. Start development server:
```bash
npm run start:dev
```

Server runs on http://localhost:3001

## Available Scripts

- `npm run start:dev` - Start in development mode (watch mode)
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run test:cov` - Run tests with coverage
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations

## Testing

### Unit Tests
```bash
npm test
```

Tests include:
- StoresService with mocked Prisma
- ProductsService with mocked Prisma
- Statistics calculation logic

### E2E Tests
```bash
npm run test:e2e
```

Tests include:
- Full CRUD operations for stores and products
- Filtering and pagination
- Input validation
- Error handling (404, 400)

## Project Structure

```
src/
├── stores/                 # Stores module
│   ├── dto/               # Data Transfer Objects
│   ├── stores.controller.ts
│   ├── stores.service.ts
│   └── stores.service.spec.ts
├── products/              # Products module
│   ├── dto/
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.service.spec.ts
├── prisma/                # Prisma service
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── common/                # Shared code
│   └── filters/
│       └── http-exception.filter.ts
└── main.ts               # Application entry point
```

## API Endpoints

See main README.md for detailed API documentation.

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
PORT=3001
```

## Database Schema

Managed by Prisma - see `prisma/schema.prisma` for full schema definition.

## Validation

All inputs are validated using class-validator decorators:
- String length limits
- Number ranges (min/max)
- Required fields
- UUID format for IDs
- Type checking

## Error Handling

Global exception filter provides consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-12-26T10:30:00.000Z",
  "path": "/products"
}
```

## Technologies

- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **TypeScript** - Type-safe JavaScript
- **class-validator** - Decorator-based validation
- **Jest** - Testing framework
