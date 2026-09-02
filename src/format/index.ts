import * as vscode from "vscode";

const SUPPORTED_LANGUAGES: readonly string[] = ["easy", "plaintext"];

/**
 * Conservative document normalization:
 * - trims trailing whitespace from every line
 * - collapses runs of blank lines into a single blank line (no leading blanks)
 * - strips trailing blank lines and ensures exactly one final newline
 */
export function formatDocumentText(text: string): string {
  if (text === "") {
    return text;
  }

  const result: string[] = [];
  let emptyRun = 0;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.replace(/[ \t]+$/, "");

    if (line === "") {
      emptyRun++;
      if (emptyRun === 1 && result.length > 0) {
        result.push("");
      }
    } else {
      emptyRun = 0;
      result.push(line);
    }
  }

  while (result.length > 0 && result[result.length - 1] === "") {
    result.pop();
  }

  return `${result.join("\n")}\n`;
}

/** Registers the document formatting provider for supported languages. */
export function registerFormattingProvider(context: vscode.ExtensionContext): void {
  const provider: vscode.DocumentFormattingEditProvider = {
    provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
      const text = document.getText();
      const formatted = formatDocumentText(text);

      if (formatted === text) {
        return [];
      }

      const lastLine = document.lineCount - 1;
      const range = new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(lastLine, document.lineAt(lastLine).text.length)
      );

      return [vscode.TextEdit.replace(range, formatted)];
    },
  };

  for (const language of SUPPORTED_LANGUAGES) {
    context.subscriptions.push(
      vscode.languages.registerDocumentFormattingEditProvider(language, provider)
    );
  }
}
