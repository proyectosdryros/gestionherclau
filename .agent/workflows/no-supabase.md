---
description: Regla crítica - este proyecto NO usa Supabase. Nunca ejecutar migraciones ni queries en Supabase MCP.
---

# ⛔ NUNCA USAR SUPABASE EN ESTE PROYECTO

Este proyecto `gestion hermandad` usa **InsForge** como base de datos, NO Supabase.

- El cliente está en `src/lib/insforge.ts`
- Todos los repositorios están en `src/infrastructure/repositories/insforge/`
- Las variables de entorno son `NEXT_PUBLIC_INSFORGE_URL` y `NEXT_PUBLIC_INSFORGE_ANON_KEY`

## Regla estricta

- **PROHIBIDO** usar las herramientas MCP de Supabase (`mcp_supabase-mcp-server_*`) para este proyecto.
- Supabase pertenece a otro proyecto diferente (`gestion costaleros` u otros).
- **Cualquier migración de base de datos** se hace directamente en el panel de InsForge, o a través del SDK de InsForge en el código.

## Para añadir columnas a la base de datos

Notificar al usuario para que acceda al panel de InsForge y aplique el cambio de esquema manualmente, o bien adaptar el código para que no dependa de la nueva columna hasta que el usuario la añada.
