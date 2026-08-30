# Changelog

All notable changes to the "Easy Language" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/), and this project
adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [0.1.0]

### Added

- Sistema de configuración: retardo de actualización (`decorationUpdateDelay`),
  formato de fecha (`dateFormat`), decoraciones desactivables
  (`decorations.disabled`) y sobrescritura de colores
  (`decorations.backgroundColor` / `foregroundColor`).
- Etiquetas personalizadas (`easyLanguage.customTags`) con color propio, mensaje
  hover opcional y exclusión dinámica del patrón de títulos.
- Comandos de tareas: «Easy: Mostrar estadísticas de tareas», «Ir a la tarea
  siguiente/anterior» (con vuelta) y «Filtrar tareas (ir a)» vía QuickPick.
- Formatos de fecha configurables: `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`,
  `YYYY/MM/DD`.
- Snippets en español: `/tarea`, `/reunion`, `/proyecto`, `/standup`.

### Changed

- Migración completa a TypeScript con modo estricto y arquitectura modular
  (`commands`, `config`, `decorations`, `patterns`, `tasks`, `utils`).
- Suite de tests con Jest (143 tests, cobertura > 93 %) y CI con lint, format,
  typecheck, tests y empaquetado del VSIX.
- Los cambios de configuración reconstruyen las decoraciones al instante, sin
  recargar la ventana.

### Fixed

- Manejo de errores y degradación elegante en la activación y actualización de
  decoraciones (previene fallos de la extensión).
- Debounce en las actualizaciones de decoraciones (menos CPU al escribir).

## [0.0.2]

### Fixed

- `activationEvents` corregido en `package.json`.
- Eliminado código duplicado en `extension.js`.
- Decoraciones `#todo`, `#doing`, `#done` funcionando.

## [0.0.1]

### Added

- Versión inicial: resaltado de etiquetas, temas Easy Dark/Light, atajos de
  teclado y snippets básicos.
