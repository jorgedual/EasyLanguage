# Plan v0.3.0 — Enlaces, tareas y navegación

Alcance confirmado en [Features.md](./Features.md): **F1–F7**. Decisiones de
diseño cerradas (ver registro abajo). Objetivo: una versión coherente que añada
enlaces reales, un sistema de prioridades/estados completo y navegación
(outline, TreeView, fechas) — sin tocar F8–F13.

---

## Decisiones de diseño (cerradas)

| #   | Decisión         | Resolución                                                    |
| --- | ---------------- | ------------------------------------------------------------- |
| D1  | Taxonomía        | `#alta/#media/#baja` + estados nuevos `#blocked` y `#waiting` |
| D2  | Check y #done    | Sí: al ciclar a `#done`, `□` inicial se convierte en `🗸`      |
| D3  | TreeView         | Activado por defecto, escaneo perezoso solo `**/*.easy`       |
| D4  | Fechas relativas | Solo `hoy`, `mañana`, `+Nd` (días de semana diferidos)        |
| D5  | Atajo de ciclo   | `Alt+S`                                                       |

---

## Visión general de fases

| Fase | Features | Contenido                                     | Tamaño |
| ---- | -------- | --------------------------------------------- | ------ |
| 1    | F2       | Tags nuevos + estadísticas estado × prioridad | M      |
| 2    | F3       | Ciclar estado + sincronización de check       | S      |
| 3    | F6       | Outline y folding                             | S      |
| 4    | F1       | Enlaces web (decoración + DocumentLink)       | M      |
| 5    | F4       | Wiki-links `[[nota]]`                         | M-L    |
| 6    | F7       | Fechas relativas + colores de vencimiento     | M      |
| 7    | F5       | TreeView de tareas del workspace              | L      |
| 8    | —        | Documentación, release e instalación          | S      |

**Por qué este orden:** F2 primero porque añade 3 tags que F3 (ciclo) y F5
(agrupación) necesitan; F3 es trivial sobre F2; F6 es independiente y barato;
F4 introduce la infraestructura de `DocumentLinkProvider` que F5 reutiliza;
F7 extiende el módulo `dates` que ya usan los deadlines; F5 va al final porque
agrupa por vencimiento y así hereda las fechas relativas de F7.

Regla transversal: **cada fase termina con los gates en verde**
(lint, typecheck, tests, format) — no se apilan deudas de verificación.

---

## Fase 1 — F2: Tags nuevos + estadísticas cruzadas

**Tags añadidos:** `#baja` (prioridad), `#blocked` y `#waiting` (estado).

Checklist (×3 tags, ver «Coste de añadir una etiqueta» en Features.md):

- [x] `src/patterns`: regex `#baja|#blocked|#waiting` + añadir a `RESERVED_TAG_NAMES`
- [x] `src/decorations`: estilos base (regla de colores: prioridad = color de
      texto **sin fondo**; `#blocked`/`#waiting` = fondo tenue al ser estado) + tipos en `DecorationTypeName`
- [x] `syntaxes/easy.tmLanguage.json`: pattern de tags
- [x] `themes/*.json`: regla en Easy Dark y Easy Light
- [x] `package.json`: enum de `decorations.disabled`
- [x] `src/tasks`: `STAT_TAG_NAMES` + `BUILTIN_TAG_INFO` en completions
- [x] `test-example.easy` + tests de patrones/decoraciones/stats

**Estadísticas estado × prioridad:**

- [x] Nueva función pura `computeStatePriorityMatrix(lines, states, priorities)`
      → `{ "todo": { "alta": 1, "baja": 2 }, "doing": { … }, "sinEstado": { … } }`
- [x] «Easy: Mostrar estadísticas de tareas» muestra: total por tag (como hoy) + desglose solo de líneas que combinan estado y prioridad
- [x] Convención documentada: estado y prioridad conviven en la misma línea
      (`#todo #alta pagar 2026-09-01`)

**Tests:** matriz cruzada (combinaciones, líneas sin estado, sin prioridad,
custom tags no interfieren), patrones nuevos, decoraciones nuevas.

**Criterio de aceptación:** `#baja`, `#blocked`, `#waiting` se colorean,
autocompletan, aparecen en stats/desactivables; el desglose cruzado aparece en
el mensaje de estadísticas.

---

## Fase 2 — F3: Ciclar estado (`Alt+S`)

- [x] Pura `cycleTaskStatus(line)`:
      `sin estado → #todo → #doing → #done → (quita tag)`.
      Si la línea tiene `#blocked`/`#waiting`, el ciclo los reemplaza por
      `#todo` (primera pulsación los "reactiva")
- [x] D2: al llegar a `#done`, si la línea empieza con `□`, se reemplaza por `🗸`.
      Al salir de `#done` (quitar tag) el símbolo queda como está
- [x] Comando `easyLanguage.cycleTaskStatus` («Easy: Cambiar estado de tarea»)
- [x] Keybinding `Alt+S` en `package.json`
- [x] Solo en líneas con foco; usa `edit builder` (reemplazo del tag, no de la línea)

**Tests:** ciclo completo, línea sin estado, `#blocked`→`#todo`, sincronización
de check (□→🗸, 🗸 ya presente, línea sin símbolo), sin editor.

**Criterio de aceptación:** `Alt+S` recorre el ciclo en cualquier línea de
tarea; el check se sincroniza al llegar a `#done`.

---

## Fase 3 — F6: Outline y folding

- [ ] Puro `src/outline/index.ts`:
  - `computeDocumentSymbols(lines)`: `Tema:` → nivel 1 (kind `Module`),
    `#` → 2, `##` → 3, `###` → 4 (con rango completo hasta el siguiente nivel)
  - `computeFoldingRanges(lines)`: pliegue de cada bloque de título
- [ ] Providers adapter: `DocumentSymbolProvider` + `FoldingRangeProvider`
      para `easy` y `plaintext`
- [ ] Sin config nueva (VS Code ya tiene toggles globales de outline)

**Tests:** jerarquía (Tema/#/##/### anidados), títulos con tags no confunden
(`#todo` no es símbolo), rangos de plegado correctos, documento vacío.

**Criterio de aceptación:** el outline muestra la estructura de la nota y los
bloques se pliegan/despliegan.

---

## Fase 4 — F1: Enlaces web clicables

- [ ] Puro `src/links/index.ts`:
  - `findWebLinks(text)`: regex `\bhttps?://[^\s<>"'`)\]}]+`+`www.` + emails
(`mailto:` implícito para emails), **recorte de puntuación final**
(`.,;:!?)`— si el recorte deja`)`, balancear paréntesis)
  - Devuelve `{ start, end, uri }` (offsets, sin vscode)
- [ ] Decoración: azul (`#4FC3F7` o override) + subrayado, **sin fondo**, hover «Abrir enlace»
- [ ] `DocumentLinkProvider` adapter: mapea rangos → `vscode.Uri` (https/mailto)
- [ ] Gramática: scope `markup.underline.link.easy`
- [ ] `themes/*.json`: tokenColor para ese scope (subrayado + azul) en ambos temas
- [ ] Config: `easyLanguage.links.enabled` (default `true`),
      `easyLanguage.links.color` (default `"#4FC3F7"`, acepta `""` = usar color del tema)

**Tests:** detección (http/https/www/email), recorte de puntuación y
paréntesis, desactivado por config, decoración aplica/omite.

**Criterio de aceptación:** las URLs se ven azules y subrayadas, Ctrl+clic
abre el navegador, el punto final de una frase no forma parte del enlace.

---

## Fase 5 — F4: Wiki-links `[[nota]]`

- [ ] Puro en `src/links` (mismo módulo): `findWikiLinks(text)` →
      `{ start, end, nombre }` para `\[\[([^\[\]]+)\]\]`
- [ ] `DocumentLinkProvider` extendido: resolver `nombre.easy` en el workspace
      (`findFiles` con caché por activación/watcher); si no existe → link igualmente
      y al seguirlo ofrecer «Crear nota» (workspace.fs.writeFile con plantilla mínima)
- [ ] Autocompletado: al escribir `[[`, listar archivos `.easy` del workspace
      (label = nombre sin extensión; reutiliza `registerCompletionProviders`)
- [ ] Decoración propia para `[[…]]` (tono distinto al de URLs, sin fondo)
- [ ] Config: `easyLanguage.wikiLinks.enabled` (default `true`)

**Tests:** detección de `[[…]]` (y casos inválidos `[[a[[b]]`), resolución de
rutas existentes/no existentes, completado de archivos, config off.

**Criterio de aceptación:** `[[nota]]` navega a la nota, ofrece crearla si no
existe, y `[[` sugiere los archivos del workspace.

---

## Fase 6 — F7: Fechas relativas y colores de vencimiento

- [ ] `src/dates`: `resolveDateToken(token, today)` para `hoy`, `mañana`, `+Nd`
      (case-insensitive, `+3d`/`+3D`; lo demás devuelve null) —
      **días de semana explícitamente fuera de alcance (D4)**
- [ ] `findDateMatches` ampliado: los tokens relativos cuentan como fecha
      (su `render` al avanzar días debe re-resolver, p. ej. `hoy` sigue siendo `hoy`)
- [ ] «Fechas límite» y deadlines del TreeView reconocen fechas relativas
      (reutilizan `collectTaskDeadlines` sin cambios extra)
- [ ] Decoración de vencimiento (config-driven):
      vencida = fondo rojo suave, hoy = naranja, próxima = sin color
  - Hover: «Vencida hace 2 días» / «Vence hoy» / «Vence en N días»
    (reutiliza `describeDeadline`)
  - Mitigación de staleness: re-decorar al activar la extensión y al cambiar
    de editor activo (ya hay listener; añadir la llamada al updater)
- [ ] Config: `easyLanguage.deadlineDecorations.enabled` (default `true`)

**Tests:** tokens (hoy/mañana/+Nd, mayúsculas, inválidos), clasificación de
color, hover, interacción con `advanceDatesInText` (repetir tarea con «mañana»).

**Criterio de aceptación:** `#todo pagar mañana` se pinta naranja hoy, rojo
mañana; el hover lo explica; «Repetir tarea» mantiene tokens relativos coherentes.

---

## Fase 7 — F5: TreeView de tareas del workspace

- [ ] Puro `src/workspaceTasks/index.ts`:
  - `buildTaskTree(files: Array<{path, lines}>, tagNames, dateFormat, today)`
    → árbol: raíz → agrupación (archivo/tag/vencimiento) → tareas
  - `summarizeOverdue(nodes)` → `{ overdue, today }` para el badge
- [ ] Provider `TaskTreeDataProvider` + `window.createTreeView`
      (`easyLanguage.tasksView`, en la barra de exploración, `contributes.views`)
- [ ] Escaneo perezoso: `findFiles('**/*.easy', '**/node_modules/**')` al abrir
      el panel o al guardar un `.easy`; `FileSystemWatcher` para refrescar
- [ ] Click en tarea → abre archivo y revela línea (reutiliza patrón de `goToLine`)
- [ ] Agrupación conmutada desde el propio panel (vista: archivo/tag/vencimiento)
- [ ] Badge de la vista: «N vencidas, M hoy»
- [ ] Config: `easyLanguage.workspaceTasks.enabled` (default **`true`**, D3)

**Tests:** construcción del árbol (multi-archivo, agrupaciones, fechas
relativas de F7 incluidas), badge summary, refresco ante cambios (lógica pura);
providers adapter delgado.

**Criterio de aceptación:** el panel muestra las tareas de todos los `.easy`
del workspace, agrupadas, con badge de vencidas y navegación al hacer clic.

---

## Fase 8 — Documentación, release e instalación

- [ ] README: nuevas features (F1–F7), configuraciones nuevas, atajo `Alt+S`,
      convención estado × prioridad, capturas si aplica
- [ ] TROUBLESHOOTING: links que no abren, TreeView vacío, staleness de vencidas
- [ ] CHANGELOG: sección `[0.3.0]` completa
- [ ] `test-example.easy`: ejemplos de `#baja`, `#blocked`, `#waiting`, URLs,
      `[[wiki-links]]`, fechas relativas
- [ ] Gates completos: `npm run format && npm run lint && npm run typecheck && npm test`
- [ ] `npm version minor --no-git-tag-version` → `0.3.0`
- [ ] `npx vsce package --no-dependencies` → `easy-0.3.0.vsix`
- [ ] `code --install-extension easy-0.3.0.vsix` + reload de VS Code

---

## Configuraciones nuevas (resumen)

| Clave                                      | Default   | Feature |
| ------------------------------------------ | --------- | ------- |
| `easyLanguage.links.enabled`               | `true`    | F1      |
| `easyLanguage.links.color`                 | `#4FC3F7` | F1      |
| `easyLanguage.wikiLinks.enabled`           | `true`    | F4      |
| `easyLanguage.deadlineDecorations.enabled` | `true`    | F7      |
| `easyLanguage.workspaceTasks.enabled`      | `true`    | F5      |

## Comandos y atajos nuevos

| Comando                          | Título (paleta)                      | Atajo   |
| -------------------------------- | ------------------------------------ | ------- |
| `easyLanguage.cycleTaskStatus`   | Easy: Cambiar estado de tarea        | `Alt+S` |
| (vista) `easyLanguage.tasksView` | TreeView «Tareas Easy» en Explorador | —       |

## Riesgos y mitigaciones

- **Explosión de tags en decoraciones fijas** → 23 tipos totales; mantener la
  regla de colores (prioridad sin fondo, estados tenues) y techo acordado
- **`findFiles` en workspaces grandes** → escaneo perezoso + solo `*.easy` +
  watcher en vez de polling
- **Regex de URLs demasiado ávida** → recorte de puntuación + tests de bordes
  (`(paréntesis)`, `<html>`, coma final)
- **Decoraciones de vencimiento desactualizadas** → re-decorar al abrir/cambiar
  editor; documentar la limitación
- **Cobertura** → toda la lógica nueva es pura y testeable; los adapters de
  providers son delgados (patrón ya establecido)

_Definición de hecho de v0.3.0: F1–F7 implementados con tests, gates en verde,
docs actualizadas, `easy-0.3.0.vsix` instalado localmente._

_Plan creado: 2026-08-29 — basado en Features.md (F1–F7) y decisiones D1–D5._
