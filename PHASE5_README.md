# Herb-Tracechain Frontend - Phase 5

A React + Vite + Tailwind CSS frontend for the Herb-Tracechain blockchain supply chain tracking system.

## Features

### Authentication
- JWT-based authentication with localStorage persistence
- AuthContext for global state management
- Protected routes with role-based access control
- Login page with demo credentials

### Dashboards

#### Collector Dashboard (`/collector`)
- **Harvest Form**: Record new herb harvests with details (name, species, location, quantity, date)
- **QR Code Generation**: Generates QR code linking to `/verify/:herbId` after successful harvest
- **Transfer Form**: Transfer herbs to processors with recipient email and notes
- **Inventory Table**: View all recorded herbs with status

#### Processor Dashboard (`/processor`)
- **Process Form**: Record processing details (method, duration, temperature, notes)
- **Package Form**: Package herbs with size, type, quantity, and expiry date
- **Distribute Form**: Distribute packaged herbs to recipients
- **In-Progress Table**: View herbs currently being processed

#### Admin Dashboard (`/admin`)
- **Filters**: Filter herbs by status (HARVESTED, PROCESSED, PACKAGED, DISTRIBUTED, VERIFIED)
- **Search**: Search by herb name, species, or ID
- **All Herbs Table**: View all herbs in the system with verification status
- **Detail View**: Click any herb to see:
  - Complete herb information
  - Ethereum blockchain hash
  - Verification status (Verified/Pending/Failed)
  - Supply chain timeline
  - Participant information

### Public Verification Page (`/verify/:herbId`)
- **No Authentication Required**: Publicly accessible
- **Herb Details**: Name, species, harvest date, current status
- **Timeline**: Visual 5-stage timeline (HARVESTED → PROCESSED → PACKAGED → DISTRIBUTED → VERIFIED)
- **Blockchain Info**: Ethereum hash for immutable verification
- **Verification Status**: Visual indicator (✓ Verified / ⏳ Pending / ✗ Failed)
- **Participants**: Collector and processor information

## Project Structure

```
herb-tracechain-frontend/
├── client/
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── robots.txt
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx      # Shared dashboard layout
│   │   │   ├── ProtectedRoute.tsx       # Role-based route protection
│   │   │   ├── Timeline.tsx             # Supply chain timeline
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ui/                      # shadcn/ui components
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx          # JWT auth state & API client
│   │   │   └── ThemeContext.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx                # Login page
│   │   │   ├── CollectorDashboard.tsx   # Collector dashboard
│   │   │   ├── ProcessorDashboard.tsx   # Processor dashboard
│   │   │   ├── AdminDashboard.tsx       # Admin dashboard
│   │   │   ├── VerifyPage.tsx           # Public verification page
│   │   │   └── NotFound.tsx
│   │   ├── App.tsx                      # Routes configuration
│   │   ├── main.tsx                     # Entry point
│   │   └── index.css                    # Global styles & theme
│   └── index.html
├── server/
│   └── index.ts                         # Production server
├── vite.config.ts                       # Vite configuration with API proxy
├── package.json
├── tsconfig.json
├── COMMANDS_TO_RUN.sh                   # Setup commands
└── PHASE5_README.md                     # This file
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- pnpm 10+

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set environment variables:**
   Create a `.env` file in the project root:
   ```
   VITE_API_URL=http://localhost:5000
   ```

3. **Start development server:**
   ```bash
   pnpm dev
   ```
   The frontend will be available at `http://localhost:3000`

4. **Build for production:**
   ```bash
   pnpm build
   ```

5. **Start production server:**
   ```bash
   pnpm start
   ```

## API Integration

### Authentication
- **Endpoint**: `POST /api/auth/login`
- **Request**: `{ email: string, password: string }`
- **Response**: `{ token: string, user: { id, email, role, name } }`

### Herb Management
- **Harvest**: `POST /api/herbs/harvest`
- **Transfer**: `POST /api/herbs/transfer`
- **Get My Herbs**: `GET /api/herbs/my-herbs`
- **Process**: `POST /api/herbs/process`
- **Package**: `POST /api/herbs/package`
- **Distribute**: `POST /api/herbs/distribute`
- **In Progress**: `GET /api/herbs/in-progress`
- **All Herbs**: `GET /api/herbs/all`
- **Verify**: `GET /api/herbs/verify/:herbId` (public)

### Request Headers
All authenticated requests include:
```
Authorization: Bearer <JWT_TOKEN>
```

## Routes

| Route | Auth | Role | Description |
|-------|------|------|-------------|
| `/login` | No | - | Login page |
| `/collector` | Yes | collector | Collector dashboard |
| `/processor` | Yes | processor | Processor dashboard |
| `/admin` | Yes | admin | Admin dashboard |
| `/verify/:herbId` | No | - | Public verification page |

## Demo Credentials

```
Collector:
  Email: collector@example.com
  Password: password

Processor:
  Email: processor@example.com
  Password: password

Admin:
  Email: admin@example.com
  Password: password
```

## Key Technologies

- **React 19**: UI framework
- **Vite 7**: Build tool and dev server
- **TypeScript**: Type safety
- **Tailwind CSS 4**: Styling
- **shadcn/ui**: Component library
- **Wouter**: Lightweight routing
- **Axios**: HTTP client
- **qrcode.react**: QR code generation
- **Sonner**: Toast notifications
- **Lucide React**: Icons

## QR Code Implementation

QR codes are generated using `qrcode.react` and encode the verification URL:
```
http://localhost:5173/verify/{herbId}
```

When scanned, users are directed to the public verification page where they can view:
- Herb details
- Supply chain timeline
- Blockchain verification status
- Ethereum hash

## Timeline Component

The Timeline component visualizes the 5-stage supply chain:

1. **HARVESTED** - Initial harvest by collector
2. **PROCESSED** - Processing by processor
3. **PACKAGED** - Packaging for distribution
4. **DISTRIBUTED** - Distribution to recipient
5. **VERIFIED** - Final blockchain verification

Each stage shows:
- ✓ Green circle: Completed
- 🔵 Blue circle: Current
- ⚪ Gray circle: Future

## Authentication Flow

1. User enters credentials on `/login`
2. Frontend sends POST request to `/api/auth/login`
3. Backend returns JWT token and user data
4. Frontend stores JWT in localStorage and user data
5. AuthContext provides JWT to all API requests via Authorization header
6. Protected routes check authentication status and role
7. On logout, JWT and user data are cleared from localStorage

## Error Handling

- Failed API requests display toast notifications
- Protected routes redirect unauthorized users to `/login`
- 404 page for undefined routes
- Error boundary catches React component errors

## Development Tips

### Adding New Pages
1. Create page component in `client/src/pages/`
2. Add route in `App.tsx`
3. Use `DashboardLayout` for authenticated pages
4. Use `ProtectedRoute` wrapper with `requiredRole` prop

### Adding New API Calls
1. Use `useAuth()` hook to get `apiClient`
2. All requests automatically include Authorization header
3. Handle errors with try-catch and display toast

### Styling
- Use Tailwind CSS utilities for all styling
- Reference design tokens in `client/src/index.css`
- Use shadcn/ui components for consistency

## Deployment

The frontend can be deployed to:
- Manus (built-in hosting)
- Vercel
- Netlify
- Any static hosting service

Ensure `VITE_API_URL` environment variable is set to the backend API URL.

## Troubleshooting

### "Cannot find module" errors
- Run `pnpm install` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`

### API requests failing
- Verify backend is running at the configured `VITE_API_URL`
- Check CORS configuration on backend
- Verify JWT token is valid in browser localStorage

### QR code not generating
- Ensure `qrcode.react` is installed: `pnpm add qrcode.react`
- Check that herbId is valid and not null

### Styling issues
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server: `pnpm dev`
- Verify Tailwind CSS is properly configured in `vite.config.ts`

## Next Steps

1. Connect to backend API endpoints
2. Implement blockchain verification logic
3. Add user management and role creation
4. Implement email notifications
5. Add analytics and reporting
6. Deploy to production

## Support

For issues or questions, refer to:
- Backend API documentation
- Tailwind CSS documentation: https://tailwindcss.com
- React documentation: https://react.dev
- Vite documentation: https://vitejs.dev
