# 🚀 Instrucciones para Probar tu Extensión Easy Language

## ✅ Correcciones Aplicadas

Se han corregido los siguientes problemas críticos:

1. ✅ **package.json** - Línea 14: Eliminado el espacio en `"onLanguage:easy"` 
2. ✅ **extension.js** - Eliminado código duplicado y mal colocado (líneas 521-552)
3. ✅ **extension.js** - Agregadas decoraciones de `#todo`, `#doing`, `#done` correctamente dentro de `updateDecorations()`
4. ✅ **extension.js** - Agregada función `deactivate()` para completar el ciclo de vida de la extensión

## 🔧 Cómo Probar la Extensión

### Opción 1: Modo de Desarrollo (Recomendado para Pruebas)

1. **Abre el proyecto en VS Code**
   - Asegúrate de estar en la carpeta `C:\DEV\EasyLanguage`

2. **Presiona F5**
   - Esto abrirá una nueva ventana de VS Code con la extensión cargada
   - Verás el texto "[Extension Development Host]" en el título de la ventana

3. **Abre el archivo de prueba**
   - En la nueva ventana, abre el archivo `test-example.easy`
   - Deberías ver todos los colores aplicados automáticamente

4. **Prueba los atajos de teclado**
   - Crea una nueva línea
   - Presiona `Ctrl+Alt+D` → debería insertar "🗸 "
   - Presiona `Ctrl+Alt+I` → debería insertar "□ "
   - Presiona `Ctrl+Alt+F` → debería insertar la fecha actual

5. **Prueba los snippets**
   - Escribe `/co` y presiona Tab → línea decorativa con asteriscos
   - Escribe `/cd` y presiona Tab → fecha con formato "fecha: "

### Opción 2: Instalar la Extensión Localmente

Si ya tienes el archivo `.vsix` o quieres crear uno nuevo:

1. **Instalar vsce (si no lo tienes)**
   ```bash
   npm install -g @vscode/vsce
   ```

2. **Empaquetar la extensión**
   ```bash
   cd C:\DEV\EasyLanguage
   vsce package
   ```
   - Esto creará un archivo `easy-0.0.2.vsix`

3. **Instalar la extensión**
   ```bash
   code --install-extension easy-0.0.2.vsix
   ```

4. **Reiniciar VS Code**

5. **Probar con archivos .easy**
   - Crea o abre cualquier archivo con extensión `.easy`
   - Los colores se aplicarán automáticamente

## 🎨 Elementos para Probar

Asegúrate de probar todos estos elementos en un archivo `.easy`:

### Palabras Clave con Colores

```
#todo Esto debería verse en amarillo
#doing Esto debería verse en azul
#done Esto debería verse en verde

#alta Prioridad alta (rojo)
#media Prioridad media (naranja)
#task Tarea (amarillo dorado)

#validar Elemento a validar (rojo)
#check Verificado (verde brillante)

Tema: Este es un tema (azul con texto claro)

## Subtítulo nivel 1 (amarillo claro)
### Subtítulo nivel 2 (verde claro)

fecha: 2026-02-28 (gris claro)

>> Texto destacado (rojo subrayado)

/@usuario Mención (azul)

🗸 Tarea completada (verde tachado)

/*******************************************************************************/
Línea separadora

/+ Comentario intermedio +/

/// Comentario de triple barra
```

## 🐛 Solución de Problemas

### Si los colores no se muestran:

1. Verifica que el archivo tenga extensión `.easy`
2. Cierra y vuelve a abrir el archivo
3. Presiona `F1` y ejecuta "Developer: Reload Window"

### Si los atajos no funcionan:

1. Verifica que el cursor esté en un editor de texto
2. Verifica que no haya conflictos con otros atajos
3. Revisa la consola de desarrollo (`Help > Toggle Developer Tools`)

### Si la extensión no carga:

1. Verifica que no haya errores en la consola de desarrollo
2. Revisa que `package.json` esté bien formateado
3. Ejecuta `npm install` en la carpeta del proyecto

## 📝 Siguiente Pasos (Opcional)

### Para publicar tu extensión:

1. Crea una cuenta en [Visual Studio Marketplace](https://marketplace.visualstudio.com/)
2. Obtén un Personal Access Token de Azure DevOps
3. Ejecuta `vsce publish` para publicarla

### Para mejorar la extensión:

- Agregar más palabras clave con colores
- Crear más snippets útiles
- Agregar comandos adicionales
- Mejorar las expresiones regulares para mejor detección

## 🎉 ¡Listo!

Tu extensión ahora está completamente funcional y lista para usar. 

Si encuentras algún problema o quieres agregar nuevas funcionalidades, revisa los comentarios en el código para entender cómo funcionan las decoraciones y comandos.

**¡Disfruta tomando notas eficientes!** 📝✨
