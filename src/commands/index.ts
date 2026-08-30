import * as vscode from "vscode";
import { loadConfig } from "../config";
import { getCurrentDate, logInfo, safeExecute, validateEditor } from "../utils";

function insertAtLineStart(editor: vscode.TextEditor, text: string): void {
  const currentPosition = editor.selection.active;
  const lineText = editor.document.lineAt(currentPosition.line).text;
  const nonWhiteSpaceIndex = lineText.search(/\S/);

  const insertPosition =
    nonWhiteSpaceIndex !== -1
      ? new vscode.Position(currentPosition.line, nonWhiteSpaceIndex)
      : currentPosition;

  void editor.edit((editBuilder) => {
    editBuilder.insert(insertPosition, text);
  });
}

/** Command handler: inserts a "🗸 " at the start of the current line's text. */
export function insertText(): void {
  safeExecute(() => {
    const editor = vscode.window.activeTextEditor;

    if (!validateEditor(editor)) {
      void vscode.window.showErrorMessage("No hay editor activo");
      return;
    }

    insertAtLineStart(editor, "🗸 ");
    logInfo("Inserted check mark");
  }, "insert text operation");
}

/** Command handler: inserts a "□ " at the start of the current line's text. */
export function insertSquare(): void {
  safeExecute(() => {
    const editor = vscode.window.activeTextEditor;

    if (!validateEditor(editor)) {
      void vscode.window.showErrorMessage("No hay editor activo");
      return;
    }

    insertAtLineStart(editor, "□ ");
    logInfo("Inserted square checkbox");
  }, "insert square operation");
}

/** Command handler: inserts the current date at the cursor, honoring `easyLanguage.dateFormat`. */
export function insertCurrentDate(): void {
  safeExecute(() => {
    const editor = vscode.window.activeTextEditor;

    if (!validateEditor(editor)) {
      void vscode.window.showErrorMessage("No hay editor activo");
      return;
    }

    const currentDate = getCurrentDate(loadConfig().dateFormat);
    const currentPosition = editor.selection.active;

    void editor.edit((editBuilder) => {
      editBuilder.insert(currentPosition, currentDate);
    });

    logInfo("Inserted current date", { date: currentDate });
  }, "insert date operation");
}

/** Registers all text/date insertion commands on the extension context. */
export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.insertText", insertText),
    vscode.commands.registerCommand("extension.insertSquare", insertSquare),
    vscode.commands.registerCommand("extension.insertCurrentDate", insertCurrentDate)
  );

  logInfo("Commands registered successfully");
}
