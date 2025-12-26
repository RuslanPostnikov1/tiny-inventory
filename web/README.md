# Tiny Inventory - Web (Frontend)

React-based web application for inventory management.

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

## Quick Start

### Using Docker (Recommended)

From the project root:

```bash
docker compose up --build
```

Frontend available at http://localhost

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API URL
```

3. Start development server:
```bash
npm run dev
```

Frontend runs on http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Features

### Stores List Page
- View all stores as cards
- Shows product count per store
- Pagination for large datasets
- Create new store (modal dialog)
- Navigation to store details

### Store Detail Page
- Store information display
- **Inventory Statistics Dashboard:**
  - Total products count
  - Total inventory value
  - Low stock items count
  - Category breakdown with chips
- Products table with:
  - Category filtering
  - Price range filtering
  - Stock status indicators
  - Add/Edit/Delete product actions
- Delete store with confirmation

### Product Management
- Add new products (dialog form)
- Edit existing products
- Delete products with confirmation
- Stock level color coding:
  - 🟢 Green: In Stock (10+)
  - 🟠 Orange: Low Stock (1-9)
  - 🔴 Red: Out of Stock (0)

## Project Structure

```
src/
├── pages/                 # Page components
│   ├── StoresList.tsx
│   └── StoreDetail.tsx
├── components/            # Reusable components
│   ├── Layout.tsx         # App layout with navbar
│   ├── ProductsTable.tsx  # Products table with filtering
│   └── ProductDialog.tsx  # Add/Edit product dialog
├── api/                   # API client
│   ├── client.ts          # Axios configuration
│   ├── stores.ts          # Stores API methods
│   └── products.ts        # Products API methods
├── types/                 # TypeScript types
│   └── index.ts
├── App.tsx                # Main app component
└── main.tsx              # Application entry point
```

## Technologies

- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI) v7** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

## Environment Variables

```env
VITE_API_URL=http://localhost:3001
```

## Error Handling

The application gracefully handles:
- **Loading states** - CircularProgress spinners
- **Error states** - Alert components with error messages
- **Empty states** - Informative messages when no data
- **Network errors** - User-friendly error messages
- **Validation errors** - Form field error displays

## UI/UX Features

- **Responsive Design** - Works on mobile, tablet, and desktop
- **Material Design** - Consistent, modern UI
- **Color-coded Status** - Visual indicators for stock levels
- **Confirmation Dialogs** - Prevent accidental deletions
- **Loading Indicators** - User feedback during async operations
- **Error Messages** - Clear feedback on failures

## Browser Support

Modern browsers with ES2020+ support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
