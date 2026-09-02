# Guía de Contribución

¡Gracias por tu interés en contribuir a Easy Language! Este documento explica cómo
configurar tu entorno, la estructura del proyecto y el flujo de trabajo de desarrollo.

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- [Visual Studio Code](https://code.visualstudio.com/) 1.52 o superior
- npm (incluido con Node.js)

## Configuración inicial

```bash
git clone https://github.com/tu-usuario/EasyLanguage.git
cd EasyLanguage
npm install
```

## Comandos principales

| Comando                 | Descripción                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `npm run compile`       | Compila el bundle de desarrollo en `dist/` (con source maps) |
| `npm run watch`         | Compila y recompila automáticamente al guardar cambios       |
| `npm run typecheck`     | Verifica tipos con TypeScript (`tsc --noEmit`)               |
| `npm run lint`          | Analiza el código con ESLint (`src/` y `test/`)              |
| `npm run format`        | Formatea el código con Prettier                              |
| `npm run format:check`  | Verifica que todo esté formateado (se comprueba en CI)       |
| `npm test`              | Ejecuta los tests con Jest (corre lint primero)              |
| `npm run test:coverage` | Ejecuta los tests con informe de cobertura (mínimo 70 %)     |
| `npm run package`       | Verificación completa + bundle de producción                 |
| `npx vsce package`      | Genera el `.vsix` instalable                                 |

## Ejecutar la extensión localmente

1. Ejecuta `npm run compile` (o deja `npm run watch` corriendo)
2. Presiona **F5** en VS Code («Run Extension») — se abre una ventana de
   desarrollo con la extensión cargada
3. Crea un archivo `.easy` y escribe etiquetas (`#todo`, `#doing`, `Tema:`, …)
4. Para depurar: coloca puntos de interrupción en `src/` — los source maps ya
   están configurados

## Estructura del proyecto

```
src/
├── extension.ts        # Punto de entrada (activación, listeners, orquestación)
├── types.ts            # Tipos compartidos (config, decoraciones, reglas)
├── commands/           # Comandos de inserción (texto, fecha) y de tareas
├── config/             # Lectura/validación de configuración y watch de cambios
├── decorations/        # Creación de tipos de decoración y gestor (manager)
├── patterns/           # Patrones regex de etiquetas y formatos
├── tasks/              # Lógica pura de tareas (estadísticas, navegación)
└── utils/              # Utilidades (debounce, fechas, validaciones, logging)

test/                   # Suites Jest (unitarias) + mocks de la API de VS Code
syntaxes/               # Gramática TextMate (easy.tmLanguage.json)
themes/                 # Temas Easy Dark / Easy Light
esbuild.js              # Script de build (desarrollo/producción/watch)
```

## Flujo de trabajo

1. Crea una rama desde `dev`: `git checkout -b feature/mi-mejora`
2. Haz tus cambios con sus tests correspondientes
3. Verifica todo antes de subir:

   ```bash
   npm run lint && npm run format:check && npm run typecheck && npm test
   ```

4. Abre un Pull Request hacia `dev`

### Reglas del proyecto

- **Tests**: toda nueva funcionalidad en `src/` debe tener tests en `test/`.
  La cobertura mínima global es 70 % (se verifica en CI).
- **Tipos**: el código es TypeScript estricto, sin `any` implícito.
- **Hooks**: el pre-commit ejecuta ESLint + Prettier sobre los archivos
  modificados (Husky + lint-staged). Si el hook falla, corrige y vuelve a
  hacer commit.
- **Mensajes de commit**: usa el formato `tipo: descripción` — p. ej.
  `feat: navegación entre tareas`, `fix: regex de títulos con etiquetas custom`,
  `docs: guía de troubleshooting`, `test: casos de buildTituloPattern`.

## Proceso de release

Los releases se publican mediante etiquetas git y se automatizan con GitHub
Actions (`.github/workflows/release.yml`):

1. Actualiza la sección `## [Unreleased]` de `CHANGELOG.md` con la nueva
   versión y sus cambios (formato [Keep a Changelog](http://keepachangelog.com/))
2. Crea la etiqueta y súbe-la:

   ```bash
   npm run release:patch   # 0.1.0 → 0.1.1  (también: release:minor, release:major)
   ```

   Esto ejecuta `npm version`, que actualiza `package.json`, crea el commit y la
   etiqueta `vX.Y.Z`, y las sube al remoto.

3. El workflow de release verifica que la etiqueta coincida con la versión de
   `package.json`, ejecuta todos los checks, construye el `.vsix` y crea un
   **GitHub Release** con el binario y los notas del changelog adjuntos.

La CI (`.github/workflows/ci.yml`) corre en cada push/PR a `main` y `dev`:
lint → format → typecheck → tests con cobertura → build → empaquetado del VSIX.

## Reportar problemas

Abre un issue en el repositorio incluyendo:

- Versión de VS Code y de la extensión
- Pasos para reproducir
- Captura de pantalla si aplica (con el tema Easy activo, si el problema es de
  colores)

Consulta también [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) antes de reportar.
