import * as vscode from "vscode";
import { writeFile } from "fs/promises";
import { convertToMarkdown } from "../markdown";
import type { EasyLanguageConfig } from "../types";
import { isSupportedLanguage, safeExecute, validateEditor } from "../utils";

function getTargetPath(fsPath: string): string {
  return /\.easy$/i.test(fsPath) ? fsPath.replace(/\.easy$/i, ".md") : `${fsPath}.md`;
}

function openDocument(target: vscode.Uri | { content: string; language: string }): void {
  void vscode.workspace
    .openTextDocument(target as vscode.Uri)
    .then((document) => vscode.window.showTextDocument(document));
}

/** Command handler: converts the active note to Markdown and saves `<nombre>.md` next to it. */
export function exportToMarkdown(getConfig: () => EasyLanguageConfig): void {
  safeExecute(() => {
    const editor = vscode.window.activeTextEditor;

    if (!validateEditor(editor)) {
      void vscode.window.showErrorMessage("No hay editor activo");
      return;
    }

    if (!isSupportedLanguage(editor.document.languageId)) {
      void vscode.window.showErrorMessage(
        "Easy: La exportación solo está disponible en archivos .easy"
      );
      return;
    }

    const markdown = convertToMarkdown(
      editor.document.getText(),
      getConfig().customTags.map((customTag) => customTag.tag)
    );

    const fsPath = (editor.document as { uri?: { fsPath?: string } }).uri?.fsPath;

    if (fsPath) {
      const targetPath = getTargetPath(fsPath);
      void writeFile(targetPath, markdown, "utf8").then(() => {
        void vscode.window
          .showInformationMessage(`Easy: Exportado a ${targetPath}`, "Abrir")
          .then((choice) => {
            if (choice === "Abrir") {
              openDocument(vscode.Uri.file(targetPath));
            }
          });
      });
    } else {
      openDocument({ content: markdown, language: "markdown" });
    }
  }, "export to markdown operation");
}

/** Registers the Markdown export command on the extension context. */
export function registerExportCommands(
  context: vscode.ExtensionContext,
  getConfig: () => EasyLanguageConfig
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("easyLanguage.exportToMarkdown", () =>
      exportToMarkdown(getConfig)
    )
  );
}
