import * as vscode from "vscode";
import { initializeDecorationTypes, disposeAllDecorationTypes } from "./decorations";
import { registerCommands } from "./commands";
import { setActiveEditor, updateAllDecorations } from "./decorations/manager";
import {
  debounce,
  isSupportedLanguage,
  logError,
  logInfo,
  validateEditor,
} from "./utils";

const DECORATION_UPDATE_DELAY_MS = 300;

const debouncedUpdateDecorations = debounce(
  () => updateAllDecorations(),
  DECORATION_UPDATE_DELAY_MS
);

export function activate(context: vscode.ExtensionContext): void {
  logInfo("EasyLanguage extension activating...");

  try {
    initializeDecorationTypes();

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

    registerCommands(context);

    logInfo("EasyLanguage extension activated successfully");
  } catch (error) {
    logError("Failed to activate extension", error instanceof Error ? error : null);
    void vscode.window.showErrorMessage(
      `EasyLanguage activation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function deactivate(): void {
  logInfo("EasyLanguage extension deactivating...");

  try {
    disposeAllDecorationTypes();
    logInfo("EasyLanguage extension deactivated successfully");
  } catch (error) {
    logError("Error during deactivation", error instanceof Error ? error : null);
  }
}
