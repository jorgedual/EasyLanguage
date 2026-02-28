# 📦 Cómo Instalar y Actualizar la Extensión Easy Language

## 🚀 Primera Instalación

### Paso 1: Instalar la Extensión
1. Abre VS Code
2. Presiona **Ctrl+Shift+X** (Extensions)
3. Haz clic en el menú **"..." (tres puntos)** arriba a la derecha
4. Selecciona **"Install from VSIX..."**
5. Navega a `C:\DEV\EasyLanguage\easy-0.0.2.vsix`
6. Haz clic en **Install**
7. **Recarga VS Code** cuando te lo pida

### Paso 2: Activar el Tema
1. Presiona **Ctrl+K Ctrl+T**
2. Busca **"Easy"**
3. Selecciónalo

¡Listo! La extensión está instalada.

---

## 🔄 Actualizar la Extensión (Después de Cambios)

Cuando hagas cambios al código:

### 1. Generar Nuevo Paquete
Abre una terminal en `C:\DEV\EasyLanguage` y ejecuta:
```bash
npx vsce package --allow-star-activation
```

Esto creará un nuevo `easy-0.0.2.vsix` (o incrementa la versión en `package.json`)

### 2. Reinstalar
- Ve a Extensions (**Ctrl+Shift+X**)
- Busca "Easy Language"
- Haz clic en **Uninstall**
- Espera a que se desinstale
- Instala de nuevo desde el nuevo `.vsix` (pasos de arriba)
- Recarga VS Code

---

## ✨ Funcionalidades de la Extensión

### 📝 Snippets (escribe y presiona Tab)
- `/co` + Tab → `/***********************/`
- `/cruz` + Tab → `/++++++++++++++++++++/`
- `/fecha` + Tab → `fecha: 2026-02-28`

### ⌨️ Atajos de Teclado
- **Ctrl+Alt+D** → Inserta `🗸 ` (check mark)
- **Ctrl+Alt+I** → Inserta `□ ` (cuadro vacío)
- **Ctrl+Alt+F** → Inserta fecha actual `2026-02-28`

### 🎨 Colores Automáticos (en archivos .easy)
- `Tema:` → Fondo azul
- `fecha:` → Fondo gris
- `##` → Fondo amarillo (Subtítulo nivel 1)
- `###` → Fondo verde (Subtítulo nivel 2)
- `#todo` → Fondo amarillo dorado
- `#doing` → Fondo azul
- `#done` → Fondo verde
- `#alta` → Fondo rojo (prioridad alta)
- `#media` → Fondo naranja (prioridad media)
- `#task` → Fondo amarillo
- `#validar` → Fondo rojo
- `#check` → Fondo verde brillante
- `/@usuario` → Fondo azul (menciones)
- `>>` → Rojo subrayado (texto destacado)
- `🗸` → Verde con tachado (completado)
- `/*****/` → Fondo gris oscuro (comentario decorativo)
- `/+ +/` → Fondo gris medio (comentario decorativo 2)
- `///` → Fondo gris claro (comentario triple slash)

---

## 🐛 Modo Debug (Para Desarrollo)

Si estás haciendo cambios y quieres probarlos rápidamente:

1. Abre el proyecto en VS Code (`C:\DEV\EasyLanguage`)
2. Presiona **F5**
3. Se abre una ventana de desarrollo
4. Abre un archivo `.easy` ahí para probar
5. Para recargar cambios: **Ctrl+R** en la ventana de desarrollo
6. Para detener: **Shift+F5**

**Nota:** Los colores y snippets funcionan automáticamente, pero los atajos de teclado (Ctrl+Alt+...) solo funcionan en modo debug o con la extensión instalada.

---

## 📝 Incrementar Versión

Antes de empaquetar una nueva versión, actualiza en `package.json`:

```json
"version": "0.0.3",
```

Luego empaqueta de nuevo.

---

## 🎯 Uso Diario

Una vez instalada la extensión:

1. Crea o abre cualquier archivo con extensión `.easy`
2. Los colores aparecerán automáticamente
3. Los snippets funcionarán (escribe `/fecha` + Tab)
4. Los atajos funcionarán (Ctrl+Alt+D, etc.)

¡Disfruta tomando notas eficientemente! 📝✨
