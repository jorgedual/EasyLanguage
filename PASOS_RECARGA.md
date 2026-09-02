# 🔄 Cómo Recargar la Extensión Correctamente

## ⚠️ IMPORTANTE: La extensión NO se recarga automáticamente

Cuando haces cambios en el código de la extensión, especialmente en `package.json` o `extension.js`, necesitas **recargar completamente** la ventana de desarrollo.

## 📋 Pasos para Recargar:

### Opción 1: Usar el Comando de Recarga (MÁS RÁPIDO)

1. En la **ventana de desarrollo** (la que dice "[Extension Development Host]"), presiona:
   - **Ctrl+R** (Windows/Linux)
   - o **Cmd+R** (Mac)

2. Esto recargará la extensión sin cerrar la ventana

### Opción 2: Cerrar y Volver a Abrir (MÁS SEGURO)

1. **Cierra completamente** la ventana de desarrollo ([Extension Development Host])

2. **En la ventana principal de VS Code** (donde está tu código), presiona **F5** de nuevo

3. Se abrirá una nueva ventana de desarrollo con la extensión actualizada

### Opción 3: Detener y Reiniciar

1. En la ventana principal, ve a la barra de herramientas de debug (arriba)

2. Haz clic en el botón **rojo cuadrado** (Stop) o presiona **Shift+F5**

3. Presiona **F5** de nuevo para iniciar una nueva sesión

## ✅ Verificar que la Extensión se Recargó

Después de recargar, verifica en la ventana de desarrollo:

1. Abre o recarga el archivo `test-example.easy`

2. **TODOS** estos elementos deberían tener colores:
   - ✅ `Tema:` → Fondo azul con texto claro
   - ✅ `##` → Amarillo claro
   - ✅ `###` → Verde claro
   - ✅ `#todo` → Fondo amarillo con texto negro
   - ✅ `#doing` → Fondo azul con texto blanco
   - ✅ `#done` → Fondo verde con texto blanco
   - ✅ `#alta` → Fondo rojo
   - ✅ `#media` → Fondo naranja
   - ✅ `#task` → Fondo amarillo dorado
   - ✅ `#validar` → Fondo rojo
   - ✅ `#check` → Fondo verde brillante
   - ✅ `fecha:` → Fondo gris claro
   - ✅ `>>` → Rojo subrayado
   - ✅ `/@usuario` → Fondo azul
   - ✅ `🗸` → Verde con tachado

3. **Prueba los atajos:**
   - **Ctrl+Alt+D** → Inserta `🗸 `
   - **Ctrl+Alt+I** → Inserta `□ `
   - **Ctrl+Alt+F** → Inserta la fecha actual

## 🐛 Si los Colores Aún No Aparecen

Si después de recargar sigues sin ver los colores:

### 1. Verifica que es un archivo .easy

En la esquina inferior derecha de VS Code, debe decir **"Easy"** (el lenguaje del archivo).

Si dice "Plain Text" o algo diferente:

- Haz clic en el lenguaje (esquina inferior derecha)
- Busca "Easy" en la lista
- Selecciónalo

### 2. Verifica la consola de desarrollo

1. En la ventana de desarrollo, presiona **Ctrl+Shift+I** (o Cmd+Option+I en Mac)
2. Ve a la pestaña **"Console"**
3. Busca errores en rojo
4. Si hay errores, cópialos y compártelos

### 3. Reinstala las dependencias

En la terminal de la carpeta del proyecto:

```bash
cd C:\DEV\EasyLanguage
npm install
```

Luego recarga la extensión de nuevo.

## 📝 Notas Importantes

- **Siempre** recarga después de cambios en `package.json`
- **Siempre** recarga después de cambios en `extension.js`
- Los cambios en archivos `.easy` NO requieren recarga
- Los cambios en `syntaxes/` o `themes/` generalmente requieren recarga completa
