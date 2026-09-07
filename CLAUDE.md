# Neffi-com — Guia de Arquitectura para Claude

## Proposito del Proyecto

Neffi-fond (Sistema de Administración y de parte pasiva de Fondos). Es una aplicación para 
administrar toda la parte pasiva de los Fondos, es decir, los ingresos y salidas de recursos 
a los encargos individuales de los fondos de inversión, asi como distribución de utilidades
y presentación de reportes.

---

## Estructura del Repositorio

```
Neffifond/
├── client/          # Frontend — React + TypeScript + Vite
├── backend/         # Backend — Spring Boot 3.2 + Java 17
├── shared/          # Schema compartido — Drizzle ORM
├── docker-compose.yml
├── nginx.conf
├── .env / .env.example
└── CLAUDE.md
```

---

## Frontend — `client/`

### Stack
- **Framework**: React 18 + TypeScript
- **Build**: Vite 5
- **Router**: Wouter (ligero, no React Router)
- **UI**: Radix UI + Shadcn/ui + Tailwind CSS
- **Estado servidor**: TanStack React Query 5
- **Estado UI**: Zustand 5
- **Formularios**: React Hook Form + Zod
- **Auth**: keycloak-js 26 (PKCE flow)
- **Charts**: Recharts
- **Upload**: Uppy (S3)

### Estructura de carpetas

```
client/src/
├── app/
│   ├── App.tsx          # Providers globales
│   └── Router.tsx       # Definicion de rutas (Wouter)
├── features/            # Modulos por funcionalidad
│   ├── auth/            # Integracion Keycloak
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   ├── newName/         # Crear nombre de fideicomiso
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/    # Llamadas a la API
│   │   ├── stores/      # Zustand stores
│   │   └── types/
│   ├── findName/        # Buscar fideicomisos
│   │   └── components/
│   └── homePage/        # Dashboard principal
├── shared/
│   ├── components/      # Header, Sidebar, Layout
│   ├── data/            # Datos DIVIPOLA, Redirects
│   ├── lib/             # Keycloak config, QueryClient, Permisos
│   ├── hooks/           # useMobile, useToast
│   ├── pages/           # NotFound
│   ├── types/           # Tipos compartidos (paginacion, etc.)
│   └── ui/              # Componentes Radix/Shadcn
├── main.tsx
└── index.css
```

### Rutas de la aplicacion

| Ruta | Descripcion |
|------|-------------|
| `/` | HomePage / Dashboard |
| `/buscar-fideicomiso` | Busqueda y listado |
| `/crear-nombre-fideicomiso` | Creacion de nuevo nombre |

### Capas de estado

| Capa | Herramienta | Uso |
|------|-------------|-----|
| Auth global | React Context | Usuario autenticado, token |
| Estado UI / feature | Zustand | Formularios, selecciones |
| Cache del servidor | React Query | Datos traidos de la API |

### Cliente HTTP

Toda comunicacion con el backend pasa por el wrapper en `client/src/shared/lib/queryClient.ts`:
- Inyecta `Authorization: Bearer {token}` automaticamente
- Timeout de 5 minutos por defecto
- Soporta respuestas JSON, paginadas y Blob
- Manejo centralizado de errores

---

## Backend — `backend/`

### Stack

- **Framework**: Spring Boot 3.2
- **Lenguaje**: Java 17
- **Seguridad**: Spring Security + OAuth2 Resource Server (Keycloak)
- **ORM**: JPA / Hibernate
- **Base de datos**: PostgreSQL
- **Export**: Apache POI 5.5 (Excel)
- **Build**: Maven 3.9

### Estructura de capas (MVC)

```
backend/src/main/java/com/neffi/fond/
├── config/          # SecurityConfig, CorsConfig, AuthInterceptor, WebMvcConfig
├── controller/      # REST endpoints
├── service/         # Logica de negocio
├── repository/      # Acceso a datos (Spring Data JPA)
├── model/           # Entidades JPA
├── dto/             # Objetos de transferencia de datos
├── exception/       # GlobalExceptionHandler, excepciones custom
├── util/            # Utilitarios
└── NeffiFondApplication.java
```

### Endpoints principales

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| GET | `/api/auth/user` | Usuario autenticado actual | Si |
| GET | `/api/auth/keycloak-config` | Config de Keycloak | No (publico) |
| GET | `/api/nombres-fideicomisos` | Lista paginada + busqueda | Si |
| POST | `/api/nombres-fideicomisos/guardar` | Crear o editar fideicomiso | Si |
| POST | `/api/nombres-fideicomisos/{id}/anular` | Anular fideicomiso | Si |
| POST | `/api/nombres-fideicomisos/{id}/asignar` | Asignar fideicomiso | Si |
| GET | `/api/prefijos-fideicomisos` | Lista de prefijos | Si |
| GET | `/api/subtipos-fideicomisos` | Lista de subtipos | Si |
| GET | `/api/sucursales` | Lista de sucursales | Si |
| GET | `/api/municipios` | Municipios por departamento DIVIPOLA | Si |
| GET | `/api/export/nombres-fideicomisos` | Exportar a Excel | Si |

### Formato de respuesta estandar

**Exito:**
```json
{
  "data": [...],
  "totalCount": 100,
  "currentPage": 0,
  "pageSize": 25,
  "message": "..."
}
```

**Error:**
```json
{
  "error": "Mensaje de error",
  "status": 400
}
```

### Esquema de base de datos (PostgreSQL)

| Tabla | Descripcion |
|-------|-------------|
| `nombres_fideicomisos` | Tabla principal de nombres |
| `prefijos_fideicomisos` | Prefijos por tipo (FA, MR, FG, etc.) |
| `subtipos_fideicomisos` | Subtipos de fideicomiso |
| `sucursales` | Sucursales de la empresa |
| `divipola_municipios` | Municipios de Colombia |
| `divipola_departamentos` | Departamentos de Colombia |

### Maquina de estados del fideicomiso

```
REG (Registrado)
    ├──► ASG (Asignado)
    └──► ANU (Anulado)
```

---

## Comunicacion Frontend-Backend

```
[Browser]
   │  JWT Bearer Token
   ▼
[Nginx :5050]
   ├── /             ──► SPA React (try_files)
   └── /api/*        ──► [Spring Boot :8093]
                              │
                         [PostgreSQL]
```

### Flujo de autenticacion (Keycloak PKCE)

1. Frontend llama `/api/auth/keycloak-config` (sin token)
2. Inicializa `keycloak-js` con el config recibido
3. Keycloak ejecuta PKCE flow y emite JWT
4. Cada request incluye `Authorization: Bearer {jwt}`
5. Spring Security valida el JWT via OAuth2 Resource Server
6. Roles extraidos del JWT (`realm_access` y `resource_access`)

### Modo desarrollo (sin autenticacion)

Configurar `AUTH_BYPASS=true` en `.env` para saltar la verificacion JWT.

---

## Infraestructura y Despliegue

### Docker Compose

| Servicio | Imagen base | Puerto |
|----------|-------------|--------|
| frontend | node:20-alpine + nginx:1.27-alpine | 5050 |
| backend | maven:3.9.9 + eclipse-temurin:17-jre-alpine | 8093 |

- Red interna: `neffi-network` (bridge)
- Registry: **AWS ECR** (`208202859881.dkr.ecr.us-east-2.amazonaws.com`)

### Variables de entorno clave

| Variable | Descripcion |
|----------|-------------|
| `KEYCLOAK_URL` | URL del servidor Keycloak |
| `KEYCLOAK_REALM` | Nombre del realm |
| `KEYCLOAK_CLIENT_ID` | Client ID OAuth2 |
| `DB_HOST` | Host de PostgreSQL |
| `DB_PORT` | Puerto de PostgreSQL |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USERNAME` | Usuario de BD |
| `DB_PASSWORD` | Password de BD |
| `AUTH_BYPASS` | `true` para deshabilitar auth (solo desarrollo) |
| `EXTERNAL_API_BASE_URL` | API externa de integracion |
| `NEFFI_LAFT_URL` | URL del sistema LAFT externo |

---

## Patrones y Convenciones

### Frontend

- **Feature-based**: cada funcionalidad tiene su propia carpeta en `features/` con `components/`, `services/`, `stores/`, `types/`
- **Custom hooks**: logica reutilizable encapsulada en hooks (`useAuth`, `useMobile`, etc.)
- **Validacion con Zod**: todos los formularios validan con schemas Zod
- **No usar axios directamente**: siempre usar el wrapper de `queryClient.ts`
- **Componentes UI**: usar los de `shared/ui/` (Shadcn/Radix), no crear componentes de UI desde cero

### Backend

- **Siempre pasar por la capa de servicio**: los controllers no deben tener logica de negocio
- **DTOs en vez de entidades**: nunca exponer entidades JPA directamente en los endpoints
- **Usar `BaseApiResponse`**: todas las respuestas deben usar el wrapper estandar
- **Excepciones custom**: lanzar excepciones especificas, el `GlobalExceptionHandler` las maneja
- **Busqueda normalizada**: remover tildes y caracteres especiales antes de buscar

### General

- La comunicacion frontend-backend es **exclusivamente REST + JSON**
- No hay WebSockets ni GraphQL
- Los archivos Excel se generan en el backend con Apache POI y se descargan como Blob en el frontend
- DIVIPOLA (datos geograficos colombianos) esta cargado tanto en la BD como en datos estaticos del frontend