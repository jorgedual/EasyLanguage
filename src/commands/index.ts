import * as vscode from "vscode";
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

export function insertCurrentDate(): void {
  safeExecute(() => {
    const editor = vscode.window.activeTextEditor;

    if (!validateEditor(editor)) {
      void vscode.window.showErrorMessage("No hay editor activo");
      return;
    }

    const currentDate = getCurrentDate();
    const currentPosition = editor.selection.active;

    void editor.edit((editBuilder) => {
      editBuilder.insert(currentPosition, currentDate);
    });

    logInfo("Inserted current date", { date: currentDate });
  }, "insert date operation");
}

export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.insertText", insertText),
    vscode.commands.registerCommand("extension.insertSquare", insertSquare),
    vscode.commands.registerCommand("extension.insertCurrentDate", insertCurrentDate)
  );

  logInfo("Commands registered successfully");
}
