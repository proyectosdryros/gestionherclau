# Gestor de Hermandades v2.0

Sistema ERP offline-first para gestión integral de Hermandades y Cofradías de Semana Santa.

## Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript 5.3+ (strict mode)
- **Base de Datos**: InsForge (remoto) + IndexedDB (local)
- **Estado**: Zustand 4.5+
- **Validación**: Zod 3.22+
- **UI**: shadcn/ui + Tailwind CSS
- **PWA**: Serwist 9.0+
- **Testing**: Vitest + Playwright

## Arquitectura

Clean Architecture (Hexagonal) con 4 capas:

```text
src/
├── app/              # UI Layer (Next.js App Router)
├── core/             # Domain Layer (framework-agnostic)
│   ├── domain/       # Entities, Value Objects, Aggregates
│   ├── use-cases/    # Business logic
│   └── ports/        # Interfaces (DI)
├── infrastructure/   # Adapters (InsForge, IndexedDB, Services)
└── presentation/     # UI Components & Hooks
```

## Instalación

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run test` - Tests unitarios (Vitest)
- `npm run test:e2e` - Tests E2E (Playwright)
- `npm run migrate -- --file=data.xlsx` - Migración de datos

## Documentación

Ver `/docs/` para ADRs y diagramas de arquitectura.

## Licencia

Propietario - Hermandad XYZ
