# Easy Language - Extensión para Notas Eficientes

Una extensión de Visual Studio Code diseñada para tomar notas de manera
eficiente: colores automáticos para etiquetas y títulos, autocompletado,
herramientas de tareas (estadísticas, navegación, fechas límite, tareas
recurrentes), formato del documento, exportación a Markdown y atajos de
teclado — todo configurable.

## ✨ Funciones destacadas

- 🎨 **Colores automáticos** para etiquetas (`#todo`, `#doing`…), títulos y formatos
- 💡 **Autocompletado** de etiquetas y constructos al escribir
- 📊 **Herramientas de tareas**: estadísticas, navegación, filtro, fechas límite y tareas recurrentes
- 📤 **Exportación a Markdown** con casillas de verificación, citas y títulos
- 🧹 **Formato del documento** compatible con «Format On Save»
- 🏷️ **Etiquetas personalizadas** con tus propios colores
- ⚙️ **Configuración al instante** (formato de fecha, colores, decoraciones…), sin recargar

## 🎨 Características

### Colores Automáticos para Palabras Clave

La extensión resalta automáticamente las siguientes palabras clave con colores personalizados:

#### Gestión de Tareas

- `#todo` - Amarillo - Tareas pendientes
- `#doing` - Azul - Tareas en progreso
- `#done` - Verde - Tareas completadas

#### Prioridades

- `#alta` - Rojo - Prioridad alta
- `#media` - Naranja - Prioridad media
- `#task` - Amarillo dorado - Tarea general

#### Validaciones

- `#validar` - Rojo - Elementos a validar
- `#check` - Verde brillante - Elementos verificados

#### Organizadores

- `Tema:` - Azul con texto claro - Títulos de tema
- `##` - Amarillo claro - Subtítulo nivel 1
- `###` - Verde claro - Subtítulo nivel 2
- `fecha:` - Gris claro - Fechas
- `>>` - Rojo subrayado - Texto destacado/nuevo
- `/@usuario` - Azul - Menciones de usuarios
- `🗸` - Verde tachado - Tareas completadas

#### Comentarios Decorativos

- `/***...****/` - Gris claro - Línea separadora larga
- `/+...+/` - Gris medio - Comentario intermedio
- `///` - Gris oscuro - Comentario de línea

### ⌨️ Atajos de Teclado

- **Ctrl+Alt+D** - Inserta un símbolo de check "🗸" al inicio de la línea
- **Ctrl+Alt+I** - Inserta un símbolo de cuadro "□" al inicio de la línea
- **Ctrl+Alt+F** - Inserta la fecha actual (formato configurable, ver ⚙️ Configuración)

### 💡 Autocompletado

Al escribir en archivos Easy se sugiere automáticamente:

- **Etiquetas** al escribir `#` (o después de `#`): todas las integradas
  (`#todo`, `#doing`, `#done`, `#alta`, `#media`, `#task`, `#validar`, `#check`)
  y tus etiquetas personalizadas, cada una con su descripción
- **Constructos** al inicio de una línea: `Tema:`, `fecha:` y `>>`

Puedes desactivarlo con `easyLanguage.completions.enabled: false`.

### 🧹 Formato del documento

La extensión registra un formateador de documentos (Format Document) con
reglas conservadoras: recorta espacios al final de cada línea, colapsa
repeticiones de líneas en blanco y garantiza un único salto final.

Para formatear al guardar, activa en tu configuración:

```json
"[easy]": { "editor.formatOnSave": true }
```

### 📝 Snippets

- `/co` - Inserta una línea decorativa con asteriscos
- `/cruz` - Inserta una línea decorativa con símbolos +
- `/fecha` - Inserta la fecha actual con formato `fecha: YYYY-MM-DD`
- `/tarea` - Inserta una tarea con prioridad a elegir (`#alta`, `#media`, `#task`)
- `/reunion` - Plantilla de notas de reunión (asistentes, puntos, acuerdos, pendientes)
- `/proyecto` - Plantilla de plan de proyecto (objetivo, fases, tareas, riesgos)
- `/standup` - Plantilla de daily standup (ayer, hoy, bloqueos)

> Nota: el snippet `/fecha` usa siempre el formato YYYY-MM-DD (los snippets no pueden
> leer la configuración). El comando **Ctrl+Alt+F** sí respeta `easyLanguage.dateFormat`.

## ⚙️ Configuración

Todas las opciones están en la sección `easyLanguage` de la configuración de VS Code:

| Opción                                     | Predeterminado | Descripción                                                                                   |
| ------------------------------------------ | -------------- | --------------------------------------------------------------------------------------------- |
| `easyLanguage.decorationUpdateDelay`       | `300`          | Retardo (ms) para actualizar colores mientras escribes                                        |
| `easyLanguage.dateFormat`                  | `"YYYY-MM-DD"` | Formato de fecha del comando «Insert Current Date» (`DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY/MM/DD`) |
| `easyLanguage.decorations.disabled`        | `[]`           | Decoraciones integradas a desactivar                                                          |
| `easyLanguage.decorations.backgroundColor` | `{}`           | Sobrescribe colores de fondo, p. ej. `{ "todo": "#FF0000" }`                                  |
| `easyLanguage.decorations.foregroundColor` | `{}`           | Sobrescribe colores de texto                                                                  |
| `easyLanguage.customTags`                  | `[]`           | Etiquetas personalizadas con su propio color                                                  |
| `easyLanguage.completions.enabled`         | `true`         | Activa el autocompletado de etiquetas y constructos                                           |
| `easyLanguage.recurringTaskDays`           | `1`            | Días que avanza la fecha al repetir una tarea (7 = semanal)                                   |

Los cambios de configuración se aplican al instante, sin recargar.

### Etiquetas personalizadas

Puedes crear tus propias etiquetas con color, y se resaltarán igual que las integradas
(sin ser tratadas como títulos):

```json
"easyLanguage.customTags": [
  {
    "tag": "urgente",
    "backgroundColor": "#FF00FF",
    "foregroundColor": "#FFFFFF",
    "hoverMessage": "Revisar cuanto antes"
  },
  {
    "tag": "idea",
    "backgroundColor": "#00CED1"
  }
]
```

> Limitación conocida: las etiquetas personalizadas se colorean mediante decoraciones del
> editor; la gramática estática (`easy.tmLanguage.json`) no las tokeniza para los temas
> Easy Dark / Easy Light.

## 📊 Herramientas de tareas

Comandos disponibles en la paleta de comandos (busca «Easy:»):

- **Easy: Mostrar estadísticas de tareas** — cuenta las tareas del documento por etiqueta
- **Easy: Ir a la tarea siguiente** / **Easy: Ir a la tarea anterior** — salta entre líneas con tareas (con vuelta al inicio/fin)
- **Easy: Filtrar tareas (ir a)** — lista todas las tareas en un QuickPick y salta a la seleccionada
- **Easy: Mostrar fechas límite de tareas** — lista las tareas que tienen una fecha, ordenadas por vencimiento (vencidas, hoy, próximas) y salta a la elegida. Reconoce los formatos de `easyLanguage.dateFormat` (p. ej. `2026-09-01` o `01/09/2026`)
- **Easy: Repetir tarea (duplicar con fecha avanzada)** — duplica la línea actual debajo, avanzando sus fechas `recurringTaskDays` días (1 = tarea diaria, 7 = semanal)

Atajos sugeridos (configúralos en «Métodos abreviados de teclado»):

```json
[
  { "key": "alt+n", "command": "easyLanguage.nextTask", "when": "editorTextFocus" },
  { "key": "alt+p", "command": "easyLanguage.prevTask", "when": "editorTextFocus" },
  { "key": "alt+t", "command": "easyLanguage.showTaskStats", "when": "editorTextFocus" },
  { "key": "alt+l", "command": "easyLanguage.showDeadlines", "when": "editorTextFocus" },
  { "key": "alt+r", "command": "easyLanguage.repeatTask", "when": "editorTextFocus" }
]
```

## 📤 Exportar a Markdown

El comando **Easy: Exportar a Markdown** convierte la nota activa y guarda un
`.md` junto al archivo original (o abre un documento nuevo si la nota no está
guardada). Conversión aplicada:

| Easy                        | Markdown                 |
| --------------------------- | ------------------------ |
| `Tema: X`                   | `# X`                    |
| `#Título`                   | `## Título`              |
| `##Subtítulo`               | `### Subtítulo`          |
| `###Subtítulo`              | `#### Subtítulo`         |
| `fecha: X`                  | `*fecha: X*`             |
| `>> texto`                  | `> texto` (cita)         |
| `🗸 tarea`                   | `- [x] tarea`            |
| `□ tarea`                   | `- [ ] tarea`            |
| Línea de asteriscos         | `---`                    |
| `/// nota` y `/+nota+/`     | `<!-- nota -->`          |
| `/@usuario`                 | `@usuario`               |
| Etiquetas (`#todo`, custom) | `**#todo**` (en negrita) |

## 🚀 Uso

1. Crea un archivo con extensión `.easy` (o usa un archivo de texto plano)
2. Escribe tus notas usando las palabras clave — los colores se aplican automáticamente
3. Escribe `#` para ver sugerencias de etiquetas y usa los atajos para insertar símbolos y fechas
4. Añade fechas a tus tareas (`#todo pagar 2026-09-01`) y revisa vencimientos con
   «Easy: Mostrar fechas límite de tareas»
5. Comparte tus notas exportándolas a Markdown con
   «Easy: Exportar a Markdown»

## 📋 Ejemplo

Abre el archivo `test-example.easy` incluido en la extensión para ver ejemplos de todos los colores y funcionalidades.

## 🛠️ Desarrollo

Consulta la [guía de contribución](./CONTRIBUTING.md) para configurar tu
entorno, la estructura del proyecto y el flujo de trabajo. Resumen:

```bash
npm install          # dependencias
npm run compile      # build de desarrollo (dist/, con source maps)
npm run watch        # recompilación automática
npm test             # lint + tests (Jest)
npx vsce package     # generar .vsix
```

Presiona **F5** en VS Code para probar la extensión en una ventana de desarrollo.

## 📦 Instalación

Desde un archivo `.vsix` (disponible en cada [release](../../releases)):

```bash
code --install-extension easy-<versión>.vsix
```

## 📝 Requisitos

- Visual Studio Code versión 1.52.0 o superior

## 🐛 Problemas y Soporte

¿Algo no funciona como esperabas? Revisa la
[guía de solución de problemas](./TROUBLESHOOTING.md) antes de reportar.
Si encuentras un bug, abre un issue en el repositorio.

## 📜 Changelog

Los cambios de cada versión están documentados en [CHANGELOG.md](./CHANGELOG.md).

**¡Disfruta tomando notas eficientes!**
