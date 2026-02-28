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
- **Ctrl+Alt+F** - Inserta la fecha actual (formato YYYY-MM-DD)

### 📝 Snippets

- `/co` - Inserta una línea decorativa con asteriscos
- `/cruz` - Inserta una línea decorativa con símbolos +
- `/cd` - Inserta la fecha actual con formato `fecha: YYYY/MM/DD`

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
