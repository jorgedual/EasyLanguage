const vscode = tryRequire('vscode');
const { logInfo, logError } = require("../utils");

function tryRequire(moduleName) {
  try {
    return require(moduleName);
  } catch (e) {
    return null;
  }
}

const decorationTypes = {};

function initializeDecorationTypes() {
  if (!vscode) {
    return;
  }
  
  try {
    decorationTypes.todo = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#FFD700",
      color: "black",
      borderRadius: "4px",
      fontWeight: "bold",
    });

    decorationTypes.doing = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#1E90FF",
      color: "white",
      borderRadius: "4px",
      fontWeight: "bold",
    });

    decorationTypes.done = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#32CD32",
      color: "white",
      borderRadius: "4px",
      fontWeight: "bold",
    });

    decorationTypes.tema = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#000000",
      color: "#FFFFFF",
      fontWeight: "bold",
      fontStyle: "italic",
      borderRadius: "4px",
    });

    decorationTypes.nuevoTexto = vscode.window.createTextEditorDecorationType({
      color: "#FF2D55",
      fontWeight: "bold",
    });

    decorationTypes.negrita = vscode.window.createTextEditorDecorationType({
      color: "#000000",
      fontWeight: "bold",
    });

    decorationTypes.checkmark = vscode.window.createTextEditorDecorationType({
      textDecoration: "line-through",
      fontWeight: "bold",
      color: "#000000",
      backgroundColor: "#38F5B1"
    });

    decorationTypes.arroba = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#0F7FBE",
      color: "white",
      fontWeight: "bold",
    });

    decorationTypes.validar = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#E74444",
      color: "#ffffff",
      borderRadius: "4px",
    });

    decorationTypes.checkDos = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#51FB15",
      color: "#282A36",
      borderRadius: "4px",
    });

    decorationTypes.alta = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#F62E2E",
      color: "#FFC8C8",
    });

    decorationTypes.task = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#FFF893",
      color: "#CC8400",
    });

    decorationTypes.media = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#F3DB00",
      color: "#727272",
    });

    decorationTypes.fecha = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#F8F8F8",
      color: "#474747",
      fontWeight: "bold",
      borderRadius: "4px",
    });

    decorationTypes.titulo = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#C1D0E5",
      fontWeight: "bold",
      color: "#000000",
      borderRadius: "4px",
    });

    decorationTypes.subTituloUno = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#E5ECF7",
      fontWeight: "bold",
      color: "#000000",
      borderRadius: "4px",
    });

    decorationTypes.subTituloDos = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#F0F6FF",
      fontWeight: "bold",
      color: "#000000",
      borderRadius: "4px",
    });

    decorationTypes.comentarioUno = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#F6F6F6",
      color: "#000000",
      fontWeight: "bold",
      borderRadius: "4px",
    });

    decorationTypes.comentarioDos = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#666666",
      fontWeight: "bold",
      color: "#FFFFFF",
    });

    decorationTypes.comentarioTres = vscode.window.createTextEditorDecorationType({
      backgroundColor: "#777777",
      fontWeight: "bold",
      color: "#FFFFFF",
    });

    logInfo("Decoration types initialized successfully");
  } catch (error) {
    logError("Failed to initialize decoration types", error);
    throw error;
  }
}

function getDecorationType(type) {
  return decorationTypes[type];
}

function disposeAllDecorationTypes() {
  try {
    Object.values(decorationTypes).forEach(decorationType => {
      if (decorationType && typeof decorationType.dispose === 'function') {
        decorationType.dispose();
      }
    });
    logInfo("All decoration types disposed");
  } catch (error) {
    logError("Error disposing decoration types", error);
  }
}

module.exports = {
  initializeDecorationTypes,
  getDecorationType,
  disposeAllDecorationTypes
};