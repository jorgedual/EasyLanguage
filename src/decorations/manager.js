const vscode = tryRequire('vscode');
const patterns = require("../patterns");
const { getDecorationType } = require("./index");
const { validateEditor, isSupportedLanguage, safeExecute, logInfo, logError } = require("../utils");

function tryRequire(moduleName) {
  try {
    return require(moduleName);
  } catch (e) {
    return null;
  }
}

let activeEditor;

function setActiveEditor(editor) {
  activeEditor = editor;
}

function getActiveEditor() {
  return activeEditor;
}

function createDecoration(startPos, endPos, hoverMessage) {
  if (!vscode) {
    return null;
  }
  return {
    range: new vscode.Range(startPos, endPos),
    hoverMessage: hoverMessage
  };
}

function applyPatternDecorations(patternName, pattern, text, hoverMessage) {
  if (!activeEditor || !vscode) {
    return;
  }

  const decorations = [];
  const decorationType = getDecorationType(patternName);
  
  if (!decorationType) {
    logError(`Decoration type not found: ${patternName}`);
    return;
  }

  let match;
  const regex = new RegExp(pattern);
  
  while ((match = regex.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    
    const decoration = createDecoration(startPos, endPos, hoverMessage);
    if (decoration) {
      decorations.push(decoration);
    }
  }

  try {
    activeEditor.setDecorations(decorationType, decorations);
    logInfo(`Applied ${patternName} decorations`, { count: decorations.length });
  } catch (error) {
    logError(`Failed to apply ${patternName} decorations`, error);
  }
}

function updateAllDecorations() {
  return safeExecute(() => {
    if (!validateEditor(activeEditor) || !vscode) {
      return;
    }

    if (!isSupportedLanguage(activeEditor.document.languageId)) {
      return;
    }

    const text = activeEditor.document.getText();

    applyPatternDecorations("tema", patterns.tema, text, "Tema");
    applyPatternDecorations("fecha", patterns.fecha, text, "fecha");
    applyPatternDecorations("subTituloDos", patterns.subTituloDos, text, "Subtítulo Nivel 2");
    applyPatternDecorations("subTituloUno", patterns.subTituloUno, text, "Subtítulo Nivel 1");
    applyPatternDecorations("titulo", patterns.titulo, text, "Título");
    applyPatternDecorations("nuevoTexto", patterns.nuevoTexto, text, "Check");
    applyPatternDecorations("negrita", patterns.negrita, text, "Negrita");
    applyPatternDecorations("checkmark", patterns.checkmark, text, "Check");
    applyPatternDecorations("arroba", patterns.arroba, text, "arroba");
    applyPatternDecorations("validar", patterns.validar, text, "validar");
    applyPatternDecorations("check", patterns.check, text, "checkDos");
    applyPatternDecorations("alta", patterns.alta, text, "alta");
    applyPatternDecorations("task", patterns.task, text, "task");
    applyPatternDecorations("media", patterns.media, text, "media");
    applyPatternDecorations("comentarioUno", patterns.comentarioUno, text, "comentarioUno");
    applyPatternDecorations("comentarioDos", patterns.comentarioDos, text, "comentarioDos");
    applyPatternDecorations("comentarioTres", patterns.comentarioTres, text, "comentarioTres");
    applyPatternDecorations("todo", patterns.todo, text, "Tarea pendiente");
    applyPatternDecorations("doing", patterns.doing, text, "En progreso");
    applyPatternDecorations("done", patterns.done, text, "Completado");

    logInfo("All decorations updated successfully");
  }, "update decorations");
}

module.exports = {
  setActiveEditor,
  getActiveEditor,
  updateAllDecorations
};