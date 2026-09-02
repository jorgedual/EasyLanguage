# Solución de Problemas (Troubleshooting)

Problemas comunes de la extensión Easy Language y cómo resolverlos.

## Las etiquetas no se colorean

1. **El archivo debe ser reconocido como lenguaje Easy.** Verifica que la
   extensión del archivo sea `.easy` o que el lenguaje seleccionado sea
   «Easy» (esquina inferior derecha de VS Code).
2. **Las decoraciones también funcionan en texto plano** (`plaintext`), pero si
   abriste el archivo antes de instalar la extensión, recarga la ventana:
   `Ctrl+Shift+P` → «Developer: Reload Window».
3. **¿Está la decoración desactivada?** Revisa
   `easyLanguage.decorations.disabled` en tu configuración — quizá desactivaste
   la etiqueta por accidente.
4. **Colores inválidos en la configuración.** Si un color de
   `decorations.backgroundColor/foregroundColor` no es un hex válido
   (`#RGB` o `#RRGGBB`), se ignora y se muestra una advertencia. Corrige el
   valor o elimina la entrada.

## Una etiqueta personalizada se ve como título

Si defines `customTags: [{ "tag": "urgente", ... }]`, el texto `#urgente` debe
resaltarse con tu color y **no** como título `#`. Si se ve como título:

- La etiqueta debe cumplir `^[a-zA-Z0-9_]+$` (sin espacios ni símbolos). Si es
  inválida se ignora con una advertencia.
- Revisa que el nombre no tenga el `#` duplicado ni mayúsculas/minúsculas
  distintas entre `customTags` y `decorations.disabled`.

Nota: las etiquetas personalizadas se colorean con decoraciones del editor; la
gramática TextMate no las tokeniza. Es un comportamiento esperado, no un bug.

## Los colores se aplican pero «parpadean» al escribir

Las decoraciones se actualizan con un retardo (debounce) configurable en
`easyLanguage.decorationUpdateDelay` (300 ms por defecto). Bájalo para
respuesta más inmediata, o súbelo en archivos muy grandes si notas consumo
de CPU.

## El comando de fecha usa un formato distinto al snippet `/fecha`

- **Ctrl+Alt+F** (comando «Insert Current Date») respeta
  `easyLanguage.dateFormat`.
- El snippet **`/fecha`** siempre usa `YYYY-MM-DD`: los snippets no pueden leer
  la configuración del usuario. Si necesitas otro formato, usa el comando o
  cambia el snippet en `easySnippets.json`.

## Los atajos no funcionan

- Los atajos por defecto son **Ctrl+Alt+D** (check), **Ctrl+Alt+I** (cuadro) y
  **Ctrl+Alt+F** (fecha), solo activos con el foco en el editor.
- Otro comando o extensión puede haberlos interceptado: abre «Métodos
  abreviados de teclado» (`Ctrl+K Ctrl+S`) y busca `extension.insert`.
- Los comandos de tareas («Easy: Ir a la tarea siguiente/anterior»,
  estadísticas, filtro) **no tienen atajos por defecto**; asigna los tuyos
  (sugerencias en el README).

## El tema Easy Dark/Light no cambia los colores de las etiquetas

El tema afecta a la interfaz y al resaltado de la gramática (comentarios,
títulos). El color de fondo de las etiquetas viene de las decoraciones, que
tienen prioridad sobre el tema. Para cambiar esos colores usa
`easyLanguage.decorations.backgroundColor/foregroundColor`.

## Desarrollo: la extensión no arranca tras cambios

- Si ejecutaste F5, asegúrate de que el build exista: `npm run compile` (o la
  tarea `npm: watch` corriendo en segundo plano).
- Tras cambiar `package.json` (comandos, configuración, snippets) hay que
  **reiniciar el host de la extensión**: en la ventana de desarrollo,
  `Ctrl+Shift+P` → «Developer: Restart Extension Host», o vuelve a presionar F5.
- Errores de activación se muestran como notificación y quedan en el registro:
  pestaña «Extension Host» del panel de salida.

## El autocompletado no muestra etiquetas

- El autocompletado de etiquetas se activa al escribir `#` (o justo después).
  Las sugerencias de constructos (`Tema:`, `fecha:`, `>>`) solo aparecen en una
  línea vacía.
- Verifica que `easyLanguage.completions.enabled` no esté en `false`.
- Si tampoco aparecen otros sugeridos (snippets), comprueba que el lenguaje del
  archivo sea «Easy».

## «Format Document» cambia más de lo esperado

El formateador aplica reglas conservadoras: recorta espacios al final de línea,
reduce secuencias de líneas en blanco a una sola y asegura un único salto
final. No reordena ni reescribe contenido. Si quieres formatear
automáticamente al guardar, activa `"[easy]": { "editor.formatOnSave": true }`.

## La fecha límite de mi tarea no aparece

El comando «Easy: Mostrar fechas límite» reconoce fechas en los formatos de
`easyLanguage.dateFormat` (`2026-09-01`, `01/09/2026`, …). Fechas en otros
formatos (p. ej. «1 de septiembre») no se detectan. Las fechas `DD/MM` vs
`MM/DD` se interpretan según tu configuración.

## «Repetir tarea» no avanza la fecha

El comando duplica la línea actual y avanza **todas** las fechas que encuentre
en ella `easyLanguage.recurringTaskDays` días (1 por defecto). Si la línea no
tiene fecha, simplemente la duplica. Para tareas semanales configura el valor
en `7`.

## La exportación a Markdown no guarda el archivo

Si la nota no está guardada en disco (documento sin título), la exportación
abre un documento Markdown nuevo con el contenido convertido: guárdalo con
Ctrl+Shift+S. Archivos guardados como `.easy` se exportan automáticamente a
`<nombre>.md` en la misma carpeta.

## Ver el log de la extensión

En la ventana de desarrollo: panel «Output» (salida) → canal «EasyLanguage»,
con mensajes de activación/desactivación y errores capturados.

## Instalar un `.vsix` concreto

```bash
code --install-extension easy-0.1.0.vsix
# listar versiones instaladas
code --list-extensions --show-versions | grep -i easy
```

Para desinstalar: `code --uninstall-extension JorgeDuarte.easy`.

## Sigue sin funcionar

Abre un issue en el repositorio con: versión de VS Code, versión de la
extensión, tu configuración `easyLanguage` (sin datos sensibles) y pasos para
reproducir el problema.
