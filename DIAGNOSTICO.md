# 🔍 DIAGNÓSTICO: Por qué no se ven los colores

## ✅ Verificación Paso a Paso

### Paso 1: Asegúrate de que el archivo se detecta como "Easy"

1. **Abre** `test-example.easy` en la ventana de desarrollo

2. **Mira la esquina inferior derecha** de VS Code

3. Deberías ver el texto **"Easy"** (indica el lenguaje del archivo)

   **Si dice "Plain Text" o cualquier otra cosa:**
   - Haz clic en ese texto
   - En el menú que aparece, busca "Easy"
   - Selecciónalo
   - Los colores deberían aparecer inmediatamente

### Paso 2: Verifica los Logs de Debug

1. En la ventana de desarrollo, presiona **Ctrl+Shift+I**

2. Ve a la pestaña **"Console"**

3. Busca mensajes que empiecen con **`[Easy]`**

4. Deberías ver:
   ```
   [Easy] Extension activating...
   [Easy] Extension activated successfully!
   [Easy] Initial editor found: c:\DEV\EasyLanguage\test-example.easy
   [Easy] Language ID: easy
   [Easy] File name: c:\DEV\EasyLanguage\test-example.easy
   [Easy] Applying decorations...
   ```

   **Si ves:**
   ```
   [Easy] Language ID: plaintext
   [Easy] Not an .easy file, skipping decorations
   ```
   → El archivo NO está siendo detectado como .easy (ve al Paso 1)

### Paso 3: Asegúrate de estar en la ventana correcta

**IMPORTANTE:** Debes probar la extensión en la **ventana de desarrollo**, NO en la ventana principal.

- ✅ **CORRECTA:** Ventana que dice **"[Extension Development Host]"** en el título
- ❌ **INCORRECTA:** Ventana principal donde está el código de la extensión

### Paso 4: Archivo de Prueba

Si el archivo `test-example.easy` no existe o está en el lugar incorrecto:

1. En la **ventana de desarrollo** ([Extension Development Host])

2. Abre una carpeta cualquiera (puede ser cualquier carpeta, como `C:\temp` o tu escritorio)

3. Crea un nuevo archivo: **File → New File**

4. **Guarda el archivo** con extensión `.easy`:
   - **File → Save As...**
   - Nombre: `prueba.easy`
   - **IMPORTANTE:** Asegúrate de que termine en `.easy`

5. Escribe en el archivo:
   ```
   Tema: Prueba de colores
   
   #todo Tarea pendiente
   #doing En progreso
   #done Completado
   
   #alta Prioridad alta
   #media Prioridad media
   
   fecha: 2026-02-28
   
   ## Subtítulo nivel 1
   ### Subtítulo nivel 2
   
   >> Texto destacado
   
   /@usuario Mención
   ```

6. Al escribir, los colores deberían aparecer **inmediatamente**

### Paso 5: Si NADA funciona

Si después de todo esto sigues sin ver colores:

1. **Cierra completamente VS Code** (todas las ventanas)

2. **Abre una terminal** en `C:\DEV\EasyLanguage`

3. **Ejecuta:**
   ```bash
   npm install
   ```

4. **Luego ejecuta:**
   ```bash
   code .
   ```

5. **Presiona F5** para abrir la ventana de desarrollo

6. **Crea un nuevo archivo** `test.easy` como en el Paso 4

## 🎯 Lo que DEBE pasar cuando funciona

Cuando escribes en un archivo `.easy`, los colores deben aparecer **inmediatamente** al escribir:

- Escribes `Tema:` → Se pone fondo azul
- Escribes `#todo` → Se pone fondo amarillo
- Escribes `##` → Se pone amarillo claro
- etc.

No necesitas guardar el archivo, los colores aparecen **mientras escribes**.

## 📸 Captura de Pantalla para Compartir

Si sigues teniendo problemas, comparte una captura que muestre:

1. **La esquina inferior derecha** donde dice el lenguaje
2. **El archivo completo** con el código
3. **La barra de título** para confirmar que es "[Extension Development Host]"
