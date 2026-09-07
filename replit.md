# NEFFI Fond Management System

## Overview
NEFFI Fond is a comprehensive web application for managing fiduciary trusts (fideicomisos). The system provides functionality for trust administration, contract management, event tracking, document handling, and automated fond name generation with consecutive code tracking.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Architecture Overview
The system uses a clean two-tier architecture:
- **Frontend**: React (Vite) served via a thin Express proxy on port 5000
- **Backend**: Spring Boot REST API on port 8090

All `/api/*` requests from the frontend are transparently proxied from port 5000 to Spring Boot on port 8090. No business logic exists in the Express layer.

### Workflows
- **"Spring Boot Backend"**: Starts the Spring Boot API server on port 8090 (`cd backend && mvn spring-boot:run -Dspring-boot.run.jvmArguments='-DAUTH_BYPASS=true'`)
- **"Start application"**: Starts the thin Express proxy + Vite frontend dev server on port 5000

### Frontend Architecture (`client/`)
React + TypeScript with modern patterns:
- **Component Library**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with glass morphism, gradients, and advanced animations
- **State Management**: React Query (@tanstack/react-query)
- **Authentication**: Custom auth context + hooks (`client/src/hooks/use-auth.ts`)
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite

#### Application Layout
The app uses a persistent sidebar layout (`client/src/components/layout.tsx`):
- **Desktop**: Fixed 240px sidebar (collapsible to 64px icon-only mode via toggle button)
- **Mobile**: Sidebar hidden behind hamburger menu (Sheet component)
- **Sidebar sections**: NEFFI Fond logo, navigation items (with active highlighting), user profile + logout at bottom
- **Navigation items**:
  - Building2 icon → "Fideicomisos" (`/`) — trust search and list
  - Wand2 icon → "Generador de Nombres" (`/generador`) — fond name generator page
- The old `Header` component is retired; navigation is entirely sidebar-based

### Express Proxy Layer (`server/`)
Minimal Node.js/Express server — NOT a full backend. Only two responsibilities:
1. Proxy all `/api/*` requests to Spring Boot (`http://localhost:8090`)
2. Serve the Vite dev server (development) or static build (production)

Key files:
- `server/index.ts`: Entry point — proxy setup + Vite integration
- `server/vite.ts`: Vite dev server integration (DO NOT MODIFY)

### Spring Boot Backend (`backend/`)
Full REST API in Java with multi-layer architecture:
- **Controller Layer** (`controller/`): REST controllers — Trust, Event, Contract, Auth
- **Service Layer** (`service/`): Business logic
- **Repository Layer** (`repository/`): In-memory data stores
- **Model Layer** (`model/`): Domain entities (Trust, Event, Contract)
- **DTO Layer** (`dto/`): Request/response data transfer objects with validation
- **Config Layer** (`config/`): SecurityConfig (Keycloak OAuth2 + AUTH_BYPASS), CorsConfig
- **Security**: Spring Security + OAuth2 Resource Server for Keycloak JWT validation
- **AUTH_BYPASS mode**: Set via `-DAUTH_BYPASS=true` JVM arg; returns dev user without Keycloak

#### Spring Boot Endpoints
- `GET /api/auth/user` — current user info
- `GET/POST /api/trusts` — trust management
- `GET/POST /api/trusts/{id}/events` — event management
- `GET/POST /api/trusts/{id}/contracts` — contract management

### Shared Types (`shared/`)
- `shared/schema.ts`: TypeScript types used by both frontend and (previously) backend. Frontend imports types like `Trust`, `Event`, `Contract`, `EventWithUser` from here.

### fond name Generator
Feature for generating and tracking standardized fond names:
- **Types**: FA (Fiducia de Administración), MR (Manejo de Recursos), FG (Fiducia en Garantía)
- **Format**: `{TYPE}-{CODE} {BUSINESS_NAME_UPPERCASE}` — e.g., `FA-2799 FIDEICOMISO PARQUEO MAJOR-EL MANANTIAL`
- **Backend**: `FondCodeController`, `FondCodeService`, `InMemoryFondCodeRepository`, `FondCode` model
- **Endpoints**:
  - `POST /api/fond-codes/generate` — validates uniqueness (type+code), stores, and returns the generated name
  - `GET /api/fond-codes` — list all reserved codes
  - `GET /api/fond-codes/{type}/used` — list used code numbers for a specific type
- **Frontend**: `client/src/components/fond-name-generator.tsx` — modal dialog with form, live preview, copy-to-clipboard, and history view
- **Entry point**: Button on home page "Generador de Nombres de Fideicomisos"

### Authentication
- **Development**: AUTH_BYPASS=true → Spring Boot returns a dev user without Keycloak
- **Production**: Keycloak OAuth2 JWT validation via Spring Security
- Environment variables needed for production:
  - `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`

### Design System — NORMA OBLIGATORIA
`client/src/index.css` es la **única fuente de verdad** del sistema de diseño. Todos los componentes **DEBEN** heredar de ella.

**REGLAS QUE SIEMPRE APLICAN:**
1. **Prohibido usar colores quemados** en componentes (no `text-gray-700`, `bg-blue-50`, `border-gray-200`, etc.)
2. **Todo color y tamaño** debe venir de clases semánticas del design system o tokens Tailwind mapeados a variables CSS
3. Si se necesita sobreescribir un estilo puntual, usar la **hoja de estilos propia del componente** (`.module.css` o sección scoped), nunca inline
4. El verde del `--chart-2` es solo para gráficas. El `--accent` es azul para interacciones (hover, selección)

**Estructura del CSS global (`client/src/index.css`):**
- Sección 1: Tokens de diseño (variables CSS) — `:root` y `.dark`
- Sección 2: Base global (`@layer base`)
- Sección 3: Superficies y fondos (`.bg-surface`, `.bg-glass`, etc.)
- Sección 4: Layout de página (`.page-wrapper`, `.page-header`, `.page-title`, etc.)
- Sección 5: Tarjetas de sección (`.section-card`, `.section-card-header`, etc.)
- Sección 6: Cabecera superior (`.top-header`, `.top-header-logo`, etc.)
- Sección 7: Sidebar de navegación (`.sidebar-root`, `.sidebar-nav-group-btn`, etc.)
- Sección 8: Formularios (`.input-modern`, `.field-label`, `.field-description`)
- Sección 9: Botones (`.btn-gradient-primary`)
- Sección 10: Tabs internos
- Sección 11: Cajas de destacado (`.highlight-box`, `.preview-box`, `.result-box`)
- Sección 12: Etiquetas/pills (`.tag-primary`, `.tag-secondary`)
- Sección 13: Badges de estado (`.badge-active`, `.badge-inactive`, `.badge-pending`)
- Sección 14: Filas de información (`.info-row`, `.info-label`, `.info-value`)
- Sección 15–19: Sombras, texto, transiciones, foco, animaciones

**Paleta de colores principal:**
- Primario: `hsl(217, 91%, 60%)` (azul)
- Cabecera top: `hsl(222, 47%, 18%)` (azul oscuro navy)
- Accent (hover/selección): `hsl(217, 65%, 94%)` (azul muy suave)
- Texto principal: `hsl(215, 28%, 17%)`
- Texto secundario: `hsl(215, 16%, 47%)`

### UI Libraries
- Radix UI, Lucide React, Tailwind CSS, Uppy (file uploads)

#### Key Design Classes:
- `.glass-card`: Glass morphism effects for dialogs and prominent cards
- `.btn-gradient-primary/.btn-gradient-secondary`: Modern gradient buttons with hover animations
- `.input-modern`: Consistent styling for all form inputs with advanced focus states
- `.shadow-modern/.shadow-modern-xl`: Contemporary shadow effects
- `.bg-gradient-primary/.bg-gradient-secondary`: Background gradients for cards and surfaces

### UI/UX Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Lucide React**: Modern icon library
- **Tailwind CSS**: Utility-first CSS framework with custom design system extensions
- **Uppy**: Modular file uploader with dashboard interface

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Static type checking across the entire codebase
- **Replit Integration**: Development environment optimizations and error handling

### Security Features
- **SSO Authentication**: Enterprise-grade authentication through Keycloak
- **Session Security**: HTTP-only cookies with secure session management
- **Route Protection**: Comprehensive protection for both API and frontend routes
- **Role-Based Access**: Support for user roles and permissions through Keycloak
- **CSRF Protection**: Built-in protection against cross-site request forgery

The system is designed for deployment on Replit with specific configurations for the platform's infrastructure, including sidecar services for cloud storage authentication and development-specific tooling. For production deployment, ensure proper Keycloak server configuration and Redis session storage for scalability.

### Entorno de Desarrollo
- **Correr desde vs code en Windows**: npx cross-env NODE_ENV=development tsx server/index.ts### Local Development (Windows)
Run each in a separate terminal:
1. `cd backend && mvn spring-boot:run -Dspring-boot.run.jvmArguments='-DAUTH_BYPASS=true'`
2. `npx cross-env NODE_ENV=development npx tsx server/index.ts`