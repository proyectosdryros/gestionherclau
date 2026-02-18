# Regla de Versiado y Despliegue

## Patrón de Versiones

Toda subida de versión debe seguir estrictamente la secuencia **X.X.XX**.

- El último segmento (Patch) debe tener siempre **dos dígitos** (rellenado con ceros a la izquierda si es necesario).
- Ejemplo: `1.2.01`, `1.2.02`, ..., `1.2.99`.
- Al llegar a `XX.XX.99`, la siguiente versión incrementará el segmento anterior y reseteará el patch: `1.3.00`.

## Tags de Git

- **Obligatorio**: Cada cambio de versión en `package.json` debe ir acompañado de su respectivo **Git Tag**.
- El tag debe coincidir exactamente con la versión (ej: `v1.2.02`).
- Secuencia de comandos recomendada:

  ```bash
  git add .
  git commit -m "Explicación del cambio vX.X.XX"
  git tag vX.X.XX
  git push origin main
  git push origin vX.X.XX
  ```

## Prioridad

Esta regla es prioritaria para mantener la trazabilidad de los despliegues en Vercel y el control de versiones del proyecto.
