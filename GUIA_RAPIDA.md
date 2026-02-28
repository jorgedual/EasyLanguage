# Guía Rápida: Probar Cambios en la Extensión

## 🚀 Método Rápido: Modo Debug (F5)

### Cuando usar:
- Estás desarrollando y haciendo cambios
- Quieres probar rápidamente
- No quieres instalar/reinstalar

### Pasos:
1. Abre el proyecto en VS Code (`C:\DEV\EasyLanguage`)
2. Presiona **F5**
3. Se abre ventana [Extension Development Host]
4. Abre o crea un archivo `.easy`
5. Prueba los snippets:
   - Escribe `/fecha` + Tab → `fecha: 2026-02-28`
   - Escribe `/co` + Tab → `/*****/`
   - Escribe `/cruz` + Tab → `/++++++/`
6. Prueba los atajos:
   - **Ctrl+Alt+D** → `🗸 `
   - **Ctrl+Alt+I** → `□ `
   - **Ctrl+Alt+F** → `2026-02-28`

### Si haces más cambios:
- **Ctrl+R** en la ventana de desarrollo para recargar
- Para cambios en package.json: cierra y vuelve a F5

---

## 📦 Método Permanente: Instalar .vsix

### Cuando usar:
- Terminaste de desarrollar
- Quieres usar la extensión normalmente
- No quieres abrir modo debug cada vez

### Pasos:
1. **Genera el paquete** (solo si hiciste cambios nuevos):
   ```bash
   cd C:\DEV\EasyLanguage
   npx vsce package --allow-star-activation
   ```

2. **Instala en VS Code**:
   - Ctrl+Shift+X (Extensions)
   - Menú "..." → "Install from VSIX..."
   - Selecciona `C:\DEV\EasyLanguage\easy-0.0.2.vsix`
   - Recarga VS Code

3. **Activa el tema**:
   - Ctrl+K Ctrl+T
   - Busca "Easy"
   - Selecciónalo

4. Ahora todos los archivos `.easy` tendrán:
   - ✅ Colores automáticos
   - ✅ Snippets funcionando
   - ✅ Atajos de teclado

---

## 🔄 Si Haces Más Cambios Después

### Cambios en archivos de código (extension.js, easySnippets.json, etc.):

**Opción 1: Solo probar (Modo Debug)**
```
1. Cierra ventana de debug anterior (si existe)
2. Presiona F5
3. Prueba en la nueva ventana
```

**Opción 2: Actualizar instalación permanente**
```
1. Incrementa versión en package.json (ej: "0.0.3")
2. Genera paquete: npx vsce package --allow-star-activation
3. Desinstala versión anterior (Extensions → Easy Language → Uninstall)
4. Instala nuevo .vsix
5. Recarga VS Code
```

---

## 📝 Estado Actual

✅ Archivo `easy-0.0.2.vsix` está listo con:
- ✅ Snippet `/fecha` (cambiado de `/cd`)
- ✅ Snippet `/co` 
- ✅ Snippet `/cruz`
- ✅ Todos los colores funcionando (Tema, ##, ###, #tags, etc.)
- ✅ Atajos Ctrl+Alt+D/I/F

**Próximo paso:** Elige:
- Probar en modo debug (F5) → Inmediato, sin instalar
- Instalar .vsix → Permanente, funciona siempre
