import * as vscode from "vscode";
import type { DateFormat } from "../types";
import { formatDateValue } from "../dates";

const SUPPORTED_LANGUAGES: readonly string[] = ["easy", "plaintext"];

/**
 * Returns a debounced wrapper that invokes `callback` after `delay` ms of inactivity.
 * Each call within the window resets the timer.
 */
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

/** Formats the current local date according to the given `DateFormat` token string. */
export function getCurrentDate(format: DateFormat = "YYYY-MM-DD"): string {
  return formatDateValue(new Date(), format);
}

/** Type guard that checks an active text editor and its document are available. */
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

/** Returns true when the language id is decorated by this extension ("easy" or "plaintext"). */
export function isSupportedLanguage(languageId: string | undefined): boolean {
  if (!languageId) {
    return false;
  }

  return SUPPORTED_LANGUAGES.includes(languageId);
}

/**
 * Runs `callback`, catching any error: logs it, shows a user-facing message,
 * and returns null instead of crashing the extension host.
 */
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

/** Logs an informational message with the `EasyLanguage:` prefix. */
export function logInfo(message: string, data?: unknown): void {
  const logData = data !== undefined ? ` ${JSON.stringify(data)}` : "";
  console.log(`EasyLanguage: ${message}${logData}`);
}

/** Logs an error message (with stack when available) to the console. */
export function logError(message: string, error?: Error | null): void {
  const errorData = error ? ` ${error.message}\n${error.stack ?? ""}` : "";
  console.error(`EasyLanguage: ${message}${errorData}`);
}

/** Disposes every disposable, logging (but not throwing on) individual failures. */
export function disposeAll(disposables: vscode.Disposable[]): void {
  for (const disposable of disposables) {
    try {
      disposable.dispose();
    } catch (error) {
      console.error("EasyLanguage: Error disposing resource", error);
    }
  }
}
