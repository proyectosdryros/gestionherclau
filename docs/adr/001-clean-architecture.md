# ADR 001: Adoption of Clean Architecture

## Context

The ERP Hermandades application requires a robust, scalable, and maintainable architecture. We anticipate changes in external technologies (UI frameworks, Database providers) and need to isolate the core business logic (Secretaría, Tesorería, Cofradía) from these details.

## Decision

We will adopt **Clean Architecture** (influenced by Hexagonal Architecture/Ports and Adapters) with the following layer structure:

1. **Core (Domain & Application)**:
    * **Domain**: Entities (Hermano, Familiar), Value Objects (DNI), and Repository Interfaces (Ports). Pure Typescript, no dependencies.
    * **Use Cases**: Application logic (RegistrarHermano, CobrarRecibo). Orchestrates domain objects and calls repositories.
2. **Infrastructure (Adapters)**:
    * **Repositories**: Implementations of Core interfaces (DexieHermanoRepository, InsForgeReciboRepository).
    * **External Services**: Stripe, Email, Notification adapters.
3. **Presentation (UI)**:
    * **Components**: React components (HermanoForm, HermanosList).
    * **Hooks**: Connect UI to Use Cases (useHermanos).

## Consequences

### Positive

* **Testability**: Core logic can be tested without UI or Database.
* **Flexibility**: Can switch from Dexie (IndexedDB) to another provider by just writing a new Repository adapter.
* **Separation of Concerns**: UI code doesn't contain complex business rules.

### Negative

* **Boilerplate**: Requires creating Interfaces, DTOs, and Mappers, which increases initial development time compared to direct calls.
* **Complexity**: Higher learning curve for developers used to MVC or simple CRUD apps.

## Status

Accepted and Implemented.
