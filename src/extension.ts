import * as vscode from "vscode";
import { initializeDecorationTypes, disposeAllDecorationTypes } from "./decorations";
import { registerCommands } from "./commands";
import { registerTaskCommands } from "./commands/taskCommands";
import { setActiveEditor, setDecorationRules, updateAllDecorations } from "./decorations/manager";
import { buildDecorationRules } from "./patterns";
import { loadConfig, watchConfig } from "./config";
import type { EasyLanguageConfig } from "./types";
import { debounce, isSupportedLanguage, logError, logInfo, validateEditor } from "./utils";

let currentConfig: EasyLanguageConfig;
let debouncedUpdateDecorations: () => void;

function createDebouncedUpdater(delay: number): () => void {
  return debounce(() => updateAllDecorations(), delay);
}

function applyConfiguration(): void {
  currentConfig = loadConfig();
  initializeDecorationTypes(currentConfig);
  setDecorationRules(buildDecorationRules(currentConfig));
  debouncedUpdateDecorations = createDebouncedUpdater(currentConfig.decorationUpdateDelay);
}

/**
 * Extension entry point: loads config, initializes decorations, wires editor /
 * document / config-change listeners, and registers all commands.
 */
export function activate(context: vscode.ExtensionContext): void {
  logInfo("EasyLanguage extension activating...");

  try {
    applyConfiguration();

    setActiveEditor(vscode.window.activeTextEditor);

    if (validateEditor(vscode.window.activeTextEditor)) {
      debouncedUpdateDecorations();
    }

    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        setActiveEditor(editor);
        if (editor && validateEditor(editor) && isSupportedLanguage(editor.document.languageId)) {
          debouncedUpdateDecorations();
        }
      })
    );

    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        const editor = vscode.window.activeTextEditor;
        if (
          editor &&
          event.document === editor.document &&
          isSupportedLanguage(event.document.languageId)
        ) {
          debouncedUpdateDecorations();
        }
      })
    );

    context.subscriptions.push(
      watchConfig(() => {
        applyConfiguration();
        updateAllDecorations();
      })
    );

    registerCommands(context);
    registerTaskCommands(context, () => currentConfig);

    logInfo("EasyLanguage extension activated successfully");
  } catch (error) {
    logError("Failed to activate extension", error instanceof Error ? error : null);
    void vscode.window.showErrorMessage(
      `EasyLanguage activation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/** Disposes all decoration types on extension shutdown. */
export function deactivate(): void {
  logInfo("EasyLanguage extension deactivating...");

  try {
    disposeAllDecorationTypes();
    logInfo("EasyLanguage extension deactivated successfully");
  } catch (error) {
    logError("Error during deactivation", error instanceof Error ? error : null);
  }
}
