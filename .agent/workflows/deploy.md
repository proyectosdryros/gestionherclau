---
description: Proceso de despliegue y reglas de versionado de la aplicación
---

# Flujo de Despliegue y Versionado

Este documento establece las reglas estrictas para subir cambios a GitHub y gestionar las versiones del proyecto.

## 🏷️ Reglas de Versionado (SemVer Adaptado)

Usamos un sistema de tres números: `MAJOR.MINOR.PATCH` (ej. 1.5.01)

1. **PATCH (Últimos dos dígitos)**: Se incrementan en cada subida de corrección o mejora menor.
    * **Rango**: De `.00` a `.99`.
    * **IMPORTANTE**: NO se debe saltar al siguiente MINOR hasta alcanzar el PATCH `.99`.
2. **MINOR (Segundo número)**: Se incrementa solo después de alcanzar el parche `.99` o ante una funcionalidad mayor aprobada.
    * Al subir el MINOR, el PATCH se reinicia a `.00`.
3. **MAJOR (Primer número)**: Reservado para cambios estructurales completos o hitos del proyecto.

## 🚀 Proceso de Subida

Para cada subida a producción, se deben seguir estos pasos:

1. **Actualizar `package.json`**: Incrementar la versión siguiendo las reglas anteriores.
2. **Commit Descriptivo**: El mensaje de commit debe incluir la versión (ej. `feat: nueva gestión de cortejo v1.5.01`).
3. **Comandos Secuenciales (PowerShell)**:

    ```powershell
    git add .
    git commit -m "mensaje descriptivo vX.X.XX"
    git push origin main
    ```

## 📝 Registro de Tareas

Siempre actualizar el `walkthrough.md` y `task.md` en el cerebro del agente para reflejar los cambios de la versión actual.
