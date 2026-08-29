import * as vscode from "vscode";
import type { DateFormat } from "../types";

const SUPPORTED_LANGUAGES: readonly string[] = ["easy", "plaintext"];

export function debounce<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;

  return (...args: Parameters<T>): void => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => callback(...args), delay);
  };
}

export function getCurrentDate(format: DateFormat = "YYYY-MM-DD"): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  return format.replace("YYYY", year).replace("MM", month).replace("DD", day);
}

export function validateEditor(
  editor: vscode.TextEditor | undefined
): editor is vscode.TextEditor {
  if (!editor) {
    return false;
  }

  if (!editor.document) {
    return false;
  }

  return true;
}

export function isSupportedLanguage(languageId: string | undefined): boolean {
  if (!languageId) {
    return false;
  }

  return SUPPORTED_LANGUAGES.includes(languageId);
}

export function safeExecute<T>(callback: () => T, context: string): T | null {
  try {
    return callback();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`EasyLanguage: Error during ${context}`, error);
    void vscode.window.showErrorMessage(`EasyLanguage: ${message}`);
    return null;
  }
}

export function logInfo(message: string, data?: unknown): void {
  const logData = data !== undefined ? ` ${JSON.stringify(data)}` : "";
  console.log(`EasyLanguage: ${message}${logData}`);
}

export function logError(message: string, error?: Error | null): void {
  const errorData = error ? ` ${error.message}\n${error.stack ?? ""}` : "";
  console.error(`EasyLanguage: ${message}${errorData}`);
}

export function disposeAll(disposables: vscode.Disposable[]): void {
  for (const disposable of disposables) {
    try {
      disposable.dispose();
    } catch (error) {
      console.error("EasyLanguage: Error disposing resource", error);
    }
  }
}
