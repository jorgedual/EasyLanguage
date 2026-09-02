# Features — Backlog de mejoras (post v0.2.0)

Documento de decisión. Cada feature está validada contra el código actual (v0.2.0)
y originada en [Review.md](./Review.md). **Marca con `[x]` las que quieras
incorporar** y anota prioridad si aplica; con esa selección armamos el plan de
la siguiente versión.

Leyenda: **Valor** (Alto/Medio/Bajo) · **Esfuerzo** (Bajo/Medio/Alto) ·
**Reutiliza** (módulos existentes que abaratan la implementación).

---

## ✅ Selección rápida (roadmap sugerido)

Si solo quieres decidir el orden mínimo: el review y esta validación sugieren
**v0.3.0 = F1 + F2 + F3**, luego **F4 + F5 + F6**, y el resto después.

---

## 🔗 F1. Enlaces web clicables (http/https, www, mailto, email)

- [X ] Incluir en la próxima versión

**Qué es:** URLs en azul subrayado y abribles con Ctrl+clic.

- Dos capas (necesarias, no alternativas):
  - Decoración (azul + subrayado) para `https?://…` — da el color
  - `DocumentLinkProvider` — da el Ctrl+clic hacia el navegador
- Regex práctica con recorte de puntuación final (`.,;:!?)`) para no pintar el punto de la frase
- Hover: «Abrir enlace»
- Opcional: `www.` sin esquema, `mailto:`, emails `algo@dominio.com`
- Gramática: scope `markup.underline.link.easy` **+ regla equivalente en Easy Dark / Easy Light** (sin ella los temas no lo colorean)

**Valor:** Alto · **Esfuerzo:** Medio
**Reutiliza:** motor de decoraciones config-driven, `patterns`, sistema de configuración
**Config nueva:** `easyLanguage.links.enabled`, `easyLanguage.links.color`

---

## 🏷️ F2. Prioridades coherentes (#baja) y estadísticas estado × prioridad

- [X ] Incluir en la próxima versión

**Qué es:** cerrar el hueco del sistema de prioridades.

- Añadir `#baja` (hoy solo existen `#alta`, `#media`, `#task`)
- Desglose cruzado en «Mostrar estadísticas»: estado × prioridad, no solo por tag
- Convención recomendada (decisión D1 abajo):
  - Estado: `#todo` `#doing` `#done` (+ opcionales `#blocked` `#waiting`)
  - Prioridad: `#alta` `#media` `#baja` (o `#p1` `#p2` `#p3`)

**Valor:** Medio · **Esfuerzo:** Bajo (#baja) / Medio (desglose cruzado)
**Reutiliza:** `computeTaskStats`, motor de decoraciones, `STAT_TAG_NAMES`
**Nota:** ver checklist «Coste de añadir una etiqueta integrada» al final.

---

## 🔄 F3. Ciclar estado de tarea con un atajo

- [ X] Incluir en la próxima versión

**Qué es:** un atajo que convierta la tarea de la línea actual:
`#todo → #doing → #done → (quita el tag)`.

- Lógica pura `cycleTaskStatus(line)` — trivial y 100 % testeable
- Comando + keybinding. **Ojo:** NO usar `Ctrl+Alt+T` (GNOME/Linux lo captura
  para abrir terminal). Sugerencia: `Alt+S`
- Opcional: sincronizar `🗸`/`□` con `#done` al ciclar (decisión D2 abajo)

**Valor:** Alto · **Esfuerzo:** Bajo
**Reutiliza:** patrones existentes, sistema de comandos

---

## 🧠 F4. Wiki-links `[[nota]]`

- [x] Incluir en la próxima versión

**Qué es:** enlaces entre notas sin salir del texto plano.

- `[[nombre]]` decorado + Ctrl+clic para abrir `nombre.easy` del workspace
- Si no existe: ofrecer crearlo
- Autocompletado de archivos `.easy` del workspace al escribir `[[`
- Sin conflicto con títulos: `[[` no empieza con `#`

**Valor:** Alto · **Esfuerzo:** Medio-Alto
**Reutiliza:** `registerCompletionProviders`, patrón de DocumentLinks de F1
**Config nueva:** `easyLanguage.wikiLinks.enabled`

---

## 🌳 F5. TreeView de tareas del workspace

- [x] Incluir en la próxima versión

**Qué es:** panel lateral con todas las tareas de los `.easy` del workspace.

- Agrupación: por archivo / por tag / por vencimiento
- Badge: «3 vencidas, 5 de hoy»
- Clic → abre el archivo y salta a la línea
- Escaneo **solo `**/*.easy`** (no todo el repo) + watcher para refrescar

**Valor:** Alto · **Esfuerzo:** Alto
**Reutiliza:** `findTaskLines`, `collectTaskDeadlines` (casi tal cual), módulo `dates`
**Config nueva:** `easyLanguage.workspaceTasks.enabled` (decisión D3: ¿activado por defecto?)

---

## 🧭 F6. Outline y folding (Tema: / # / ## / ###)

- [X ] Incluir en la próxima versión

**Qué es:** estructura navegable de la nota.

- `DocumentSymbolProvider`: `Tema:` = nivel 1, `#`/`##`/`###` = niveles 2-4 → aparecen en el outline
- `FoldingRangeProvider`: plegar bloques entre temas
- Lógica pura: parsear líneas → símbolos/rangos

**Valor:** Medio (Alto en notas largas) · **Esfuerzo:** Bajo-Medio
**Reutiliza:** patrones de títulos existentes

---

## ⏰ F7. Fechas relativas y colores de vencimiento

- [x] Incluir en la próxima versión

**Qué es:** escribir fechas en lenguaje natural y ver el estado de vencimiento de un vistazo.

- Reconocer `hoy`, `mañana`, `+3d` (días de semana tipo `vie`: diferir — locale, decisión D4)
- Decoración: vencida = fondo rojo suave, hoy = naranja, próxima = nada
- Hover: «Vence en 2 días»
- ⚠️ Limitación: las decoraciones se refrescan al editar; una tarea que vence
  «hoy» no cambia de color hasta tocar el archivo. Mitigación: re-decorar al
  abrir/cambiar de editor

**Valor:** Medio-Alto · **Esfuerzo:** Medio
**Reutiliza:** `classifyDeadline`, módulo `dates` (casi todo ya existe)

---

## 💬 F8. Menciones navegables (`/@usuario`)

- [ ] Incluir en la próxima versión

**Qué es:** Ctrl+clic en una mención.

- Vía `DocumentLink`: abrir búsqueda de la mención o crear/abrir `usuario.easy`
- ⚠️ El «clic en texto arbitrario» no existe en la API: DocumentLink es el camino viable
- El «clic en #todo → filtro» quedaría como F-extra solo si F8 sale bien (el filtro QuickPick ya existe)

**Valor:** Medio · **Esfuerzo:** Bajo-Medio
**Reutiliza:** patrón `arroba` existente

---

## 📤 F9. Exportación ampliada

- [ ] Incluir en la próxima versión

**Qué es:** tres mejoras del export existente.

- Copiar al portapapeles la selección (o el documento) ya convertida a Markdown
- Exportar solo tareas abiertas (sin `#done` ni `🗸`)
- Frontmatter YAML opcional (`title`, `tags`, `date`)

**Valor:** Medio · **Esfuerzo:** Bajo
**Reutiliza:** `convertToMarkdown`, `findTaskLines`

---

## 📓 F10. Nota del día (diario)

- [ ] Incluir en la próxima versión

**Qué es:** comando «Easy: Nota de hoy» que abre o crea `2026-08-29.easy` con plantilla.

- Plantilla configurable/reutilizable (tipo `/standup` o `/reunion`)
- Encaja con el atajo de fecha Ctrl+Alt+F

**Valor:** Medio · **Esfuerzo:** Bajo-Medio
**Reutiliza:** módulo `dates`, sistema de comandos

---

## 🔢 F11. CodeLens en `Tema:`

- [ ] Incluir en la próxima versión

**Qué es:** encima de cada tema: «3 #todo · 1 vencida».

- Clic en el CodeLens → filtra/na­vega a esas tareas
- Requiere toggle de configuración (hay quien odia los CodeLens)

**Valor:** Bajo-Medio · **Esfuerzo:** Bajo-Medio
**Reutiliza:** `computeTaskStats`, `collectTaskDeadlines`
**Config nueva:** `easyLanguage.codeLens.enabled` (default `false`)

---

## 🖼️ F12. Enlaces a archivos locales e imágenes

- [ ] Incluir en la próxima versión

**Qué es:** enlaces a rutas relativas (`./captura.png`, `file:///…`) + preview de imagen en hover.

**Valor:** Bajo-Medio · **Esfuerzo:** Medio
**Nota:** depende de la infraestructura de F1 (hacerlo después de F1)

---

## ✍️ F13. Más patrones con significado

- [ ] Incluir en la próxima versión

**Qué es:** azúcares sintácticos opcionales: `@due(2026-09-01)`, `$costo`,
`TODO(nombre)`, `!importante`.

**Valor:** Bajo · **Esfuerzo:** Bajo c/u
**Nota:** riesgo de ruido visual (regla de colores abajo). Recomiendo decidir
caso por caso; `!importante` solapa con `>>` que ya existe.

---

## 🎨 Decisiones de diseño pendientes

- [X ] **D1 — Taxonomía de prioridad:** mantener `#alta/#media/#baja` (recomendado: menor migración) o migrar a `#p1/#p2/#p3`. ¿Añadir también `#blocked`/`#waiting` como estados?
- [ X] **D2 — Sincronizar 🗸/□ con #done:** al ciclar a `#done`, ¿anteponer `🗸 ` automático? (sí / no)
- [ X] **D3 — TreeView por defecto:** ¿escanear el workspace al activarse o solo tras habilitarlo en config? (recomiendo activado por defecto pero escaneo perezoso)
- [ X] **D4 — Fechas relativas:** ¿solo `hoy/mañana/+Nd` ahora, o también días de semana (`vie`) con locale?
- [ X] **D5 — Atajo para ciclar estado:** `Alt+S` (recomendado) u otro de tu preferencia

## 🎨 Reglas de color adoptadas (guía del review)

- Estado de tarea = color de fondo
- Prioridad = color de texto (no más fondos)
- URLs = azul subrayado, sin fondo
- Comentarios `///` = discretos
- Techo de decoraciones fijas: ~12 + custom tags (evitar el «semáforo»)

## 🧾 Coste de añadir una etiqueta integrada (checklist técnico)

Aplica a `#baja`, `#blocked`, `#waiting`, etc. — no es solo «un color más»:

1. `src/patterns` (regex + `RESERVED_TAG_NAMES`)
2. `src/decorations` (estilo base + tipo `DecorationTypeName`)
3. `syntaxes/easy.tmLanguage.json`
4. `themes/easy-color-theme.json` + `easy-light-color-theme.json`
5. `package.json` (enum de `decorations.disabled` + README de settings)
6. `src/tasks` (`STAT_TAG_NAMES`) y autocompletado (`BUILTIN_TAG_INFO`)
7. Tests (patrones, decoraciones, stats) + `test-example.easy`

## 🚫 Acordado NO priorizar

- Kanban visual completo (rompe el modelo de texto plano)
- Grafo de notas tipo Obsidian (caro de mantener)
- IA dentro de la extensión
- Más snippets de plantilla antes de cerrar F1–F3

---

## 📋 Registro de decisión

| Feature               | ¿Incluir? | Versión objetivo | Notas |
| --------------------- | --------- | ---------------- | ----- |
| F1 Enlaces web        | ☐ Si      |                  |       |
| F2 #baja + stats      | ☐ Si      |                  |       |
| F3 Ciclar estado      | ☐ Si      |                  |       |
| F4 Wiki-links         | ☐ Si      |                  |       |
| F5 TreeView           | ☐ Si      |                  |       |
| F6 Outline/folding    | ☐ Si      |                  |       |
| F7 Fechas relativas   | ☐ Si      |                  |       |
| F8 Menciones          | ☐ Si      |                  |       |
| F9 Export ampliada    | ☐         |                  |       |
| F10 Nota del día      | ☐         |                  |       |
| F11 CodeLens          | ☐         |                  |       |
| F12 Archivos/imágenes | ☐         |                  |       |
| F13 Otros patrones    | ☐         |                  |       |

_Decreado: 2026-08-29 — fuente: Review.md validado contra v0.2.0_
