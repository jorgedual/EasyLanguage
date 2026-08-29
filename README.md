# Easy Language - Extensión para Notas Eficientes

Una extensión de Visual Studio Code diseñada para tomar notas de manera eficiente con colores personalizados y atajos de teclado útiles.

## 🎨 Características

### Colores Automáticos para Palabras Clave

Tu extensión resalta automáticamente las siguientes palabras clave con colores personalizados:

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

Cuatro comandos disponibles en la paleta de comandos (busca «Easy:»):

- **Easy: Mostrar estadísticas de tareas** — cuenta las tareas del documento por etiqueta
- **Easy: Ir a la tarea siguiente** / **Easy: Ir a la tarea anterior** — salta entre líneas con tareas (con vuelta al inicio/fin)
- **Easy: Filtrar tareas (ir a)** — lista todas las tareas en un QuickPick y salta a la seleccionada

Atajos sugeridos (configúralos en «Métodos abreviados de teclado»):

```json
[
  { "key": "alt+n", "command": "easyLanguage.nextTask", "when": "editorTextFocus" },
  { "key": "alt+p", "command": "easyLanguage.prevTask", "when": "editorTextFocus" },
  { "key": "alt+t", "command": "easyLanguage.showTaskStats", "when": "editorTextFocus" }
]
```

## 🚀 Uso

1. Crea un archivo con extensión `.easy`
2. Escribe tus notas usando las palabras clave mencionadas
3. Los colores se aplicarán automáticamente
4. Usa los atajos de teclado para insertar símbolos y fechas rápidamente

## 📋 Ejemplo

Abre el archivo `test-example.easy` incluido en la extensión para ver ejemplos de todos los colores y funcionalidades.

## 🛠️ Instalación para Desarrollo

1. Clona este repositorio
2. Abre el proyecto en VS Code
3. Presiona F5 para abrir una nueva ventana con la extensión cargada
4. Crea un archivo `.easy` para probar

## 📦 Instalación de la Extensión

Si ya tienes el archivo `easy-0.0.1.vsix`:

```bash
code --install-extension easy-0.0.1.vsix
```

## 🔧 Correcciones Aplicadas (v0.0.2)

- ✅ Corregido `activationEvents` en package.json (eliminado espacio extra)
- ✅ Eliminado código duplicado al final de extension.js
- ✅ Agregadas correctamente las decoraciones para #todo, #doing, #done
- ✅ Código limpio y funcional

## 📝 Requisitos

- Visual Studio Code versión 1.52.0 o superior

## 🐛 Problemas Conocidos

Ninguno en este momento. Si encuentras algún problema, por favor reportalo.

## 🎉 Notas de Versión

### 0.0.2 (Última corrección)

- Corrección de errores críticos
- Todas las decoraciones funcionando correctamente
- Código limpio y optimizado

### 0.0.1

- Versión inicial

**¡Disfruta tomando notas eficientes!**
