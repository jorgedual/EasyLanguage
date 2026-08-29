import * as vscode from "vscode";
import type { DecorationStyleMap, DecorationTypeName, EasyLanguageConfig } from "../types";
import { logError, logInfo } from "../utils";

const baseDecorationStyles: Record<DecorationTypeName, vscode.DecorationRenderOptions> = {
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
  checkmark: {
    textDecoration: "line-through",
    fontWeight: "bold",
    color: "#000000",
    backgroundColor: "#38F5B1",
  },
  arroba: { backgroundColor: "#0F7FBE", color: "white", fontWeight: "bold" },
  validar: { backgroundColor: "#E74444", color: "#ffffff", borderRadius: "4px" },
  check: { backgroundColor: "#51FB15", color: "#282A36", borderRadius: "4px" },
  alta: { backgroundColor: "#F62E2E", color: "#FFC8C8" },
  task: { backgroundColor: "#FFF893", color: "#CC8400" },
  media: { backgroundColor: "#F3DB00", color: "#727272" },
  fecha: {
    backgroundColor: "#F8F8F8",
    color: "#474747",
    fontWeight: "bold",
    borderRadius: "4px",
  },
  titulo: {
    backgroundColor: "#C1D0E5",
    fontWeight: "bold",
    color: "#000000",
    borderRadius: "4px",
  },
  subTituloUno: {
    backgroundColor: "#E5ECF7",
    fontWeight: "bold",
    color: "#000000",
    borderRadius: "4px",
  },
  subTituloDos: {
    backgroundColor: "#F0F6FF",
    fontWeight: "bold",
    color: "#000000",
    borderRadius: "4px",
  },
  comentarioUno: {
    backgroundColor: "#F6F6F6",
    color: "#000000",
    fontWeight: "bold",
    borderRadius: "4px",
  },
  comentarioDos: { backgroundColor: "#666666", fontWeight: "bold", color: "#FFFFFF" },
  comentarioTres: { backgroundColor: "#777777", fontWeight: "bold", color: "#FFFFFF" },
};

const decorationTypes = new Map<string, vscode.TextEditorDecorationType>();

export function buildDecorationStyles(config: EasyLanguageConfig): DecorationStyleMap {
  const styles: DecorationStyleMap = new Map();

  for (const name of Object.keys(baseDecorationStyles) as DecorationTypeName[]) {
    if (config.disabledDecorations.has(name)) {
      continue;
    }

    const style: vscode.DecorationRenderOptions = { ...baseDecorationStyles[name] };

    const backgroundOverride = config.backgroundColorOverrides[name];
    if (backgroundOverride) {
      style.backgroundColor = backgroundOverride;
    }

    const foregroundOverride = config.foregroundColorOverrides[name];
    if (foregroundOverride) {
      style.color = foregroundOverride;
    }

    styles.set(name, style);
  }

  for (const customTag of config.customTags) {
    if (config.disabledDecorations.has(customTag.tag)) {
      continue;
    }

    styles.set(customTag.tag, {
      backgroundColor: customTag.backgroundColor,
      ...(customTag.foregroundColor !== undefined
        ? { color: customTag.foregroundColor }
        : {}),
      borderRadius: "4px",
      fontWeight: "bold",
    });
  }

  return styles;
}

export function initializeDecorationTypes(config: EasyLanguageConfig): void {
  try {
    disposeAllDecorationTypes();

    for (const [name, style] of buildDecorationStyles(config)) {
      decorationTypes.set(name, vscode.window.createTextEditorDecorationType(style));
    }

    logInfo("Decoration types initialized successfully", { count: decorationTypes.size });
  } catch (error) {
    logError("Failed to initialize decoration types", error instanceof Error ? error : null);
    throw error;
  }
}

export function getDecorationType(
  name: string
): vscode.TextEditorDecorationType | undefined {
  return decorationTypes.get(name);
}

export function getDecorationTypeCount(): number {
  return decorationTypes.size;
}

export function disposeAllDecorationTypes(): void {
  try {
    for (const decorationType of decorationTypes.values()) {
      decorationType.dispose();
    }

    decorationTypes.clear();

    logInfo("All decoration types disposed");
  } catch (error) {
    logError("Error disposing decoration types", error instanceof Error ? error : null);
  }
}
