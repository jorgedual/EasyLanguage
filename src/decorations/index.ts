import * as vscode from "vscode";
import type { DecorationTypeName } from "../types";
import { logError, logInfo } from "../utils";

const decorationStyles: Record<DecorationTypeName, vscode.DecorationRenderOptions> = {
  todo: { backgroundColor: "#FFD700", color: "black", borderRadius: "4px", fontWeight: "bold" },
  doing: { backgroundColor: "#1E90FF", color: "white", borderRadius: "4px", fontWeight: "bold" },
  done: { backgroundColor: "#32CD32", color: "white", borderRadius: "4px", fontWeight: "bold" },
  tema: {
    backgroundColor: "#000000",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontStyle: "italic",
    borderRadius: "4px",
  },
  nuevoTexto: { color: "#FF2D55", fontWeight: "bold" },
  negrita: { color: "#000000", fontWeight: "bold" },
  checkmark: { textDecoration: "line-through", fontWeight: "bold", color: "#000000", backgroundColor: "#38F5B1" },
  arroba: { backgroundColor: "#0F7FBE", color: "white", fontWeight: "bold" },
  validar: { backgroundColor: "#E74444", color: "#ffffff", borderRadius: "4px" },
  check: { backgroundColor: "#51FB15", color: "#282A36", borderRadius: "4px" },
  alta: { backgroundColor: "#F62E2E", color: "#FFC8C8" },
  task: { backgroundColor: "#FFF893", color: "#CC8400" },
  media: { backgroundColor: "#F3DB00", color: "#727272" },
  fecha: { backgroundColor: "#F8F8F8", color: "#474747", fontWeight: "bold", borderRadius: "4px" },
  titulo: { backgroundColor: "#C1D0E5", fontWeight: "bold", color: "#000000", borderRadius: "4px" },
  subTituloUno: { backgroundColor: "#E5ECF7", fontWeight: "bold", color: "#000000", borderRadius: "4px" },
  subTituloDos: { backgroundColor: "#F0F6FF", fontWeight: "bold", color: "#000000", borderRadius: "4px" },
  comentarioUno: { backgroundColor: "#F6F6F6", color: "#000000", fontWeight: "bold", borderRadius: "4px" },
  comentarioDos: { backgroundColor: "#666666", fontWeight: "bold", color: "#FFFFFF" },
  comentarioTres: { backgroundColor: "#777777", fontWeight: "bold", color: "#FFFFFF" },
};

const decorationTypes: Partial<Record<DecorationTypeName, vscode.TextEditorDecorationType>> = {};

export function initializeDecorationTypes(): void {
  try {
    (Object.keys(decorationStyles) as DecorationTypeName[]).forEach((name) => {
      decorationTypes[name] = vscode.window.createTextEditorDecorationType(decorationStyles[name]);
    });

    logInfo("Decoration types initialized successfully");
  } catch (error) {
    logError("Failed to initialize decoration types", error instanceof Error ? error : null);
    throw error;
  }
}

export function getDecorationType(
  name: DecorationTypeName
): vscode.TextEditorDecorationType | undefined {
  return decorationTypes[name];
}

export function getDecorationTypeCount(): number {
  return Object.keys(decorationTypes).length;
}

export function disposeAllDecorationTypes(): void {
  try {
    for (const decorationType of Object.values(decorationTypes)) {
      decorationType?.dispose();
    }

    for (const key of Object.keys(decorationTypes) as DecorationTypeName[]) {
      delete decorationTypes[key];
    }

    logInfo("All decoration types disposed");
  } catch (error) {
    logError("Error disposing decoration types", error instanceof Error ? error : null);
  }
}
