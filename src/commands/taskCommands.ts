import * as vscode from "vscode";
import type { EasyLanguageConfig, TaskLineInfo } from "../types";
import {
  STAT_TAG_NAMES,
  computeTaskStats,
  countTotalTasks,
  findNextTaskLine,
  findPrevTaskLine,
  findTaskLines,
} from "../tasks";
import { safeExecute, validateEditor } from "../utils";

interface TaskQuickPickItem extends vscode.QuickPickItem {
  readonly lineNumber: number;
}

function getTagNames(config: EasyLanguageConfig): string[] {
  return [...STAT_TAG_NAMES, ...config.customTags.map((customTag) => customTag.tag)];
}

function getDocumentLines(editor: vscode.TextEditor): string[] {
  return editor.document.getText().split("\n");
}

function goToLine(editor: vscode.TextEditor, lineNumber: number): void {
  const position = new vscode.Position(lineNumber, 0);
  editor.selection = new vscode.Selection(position, position);
  editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
}

function showTaskStats(getConfig: () => EasyLanguageConfig): void {
  safeExecute(() => {
    const editor = vscode.window.activeTextEditor;

    if (!validateEditor(editor)) {
      void vscode.window.showErrorMessage("No hay editor activo");
      return;
    }

    const tagNames = getTagNames(getConfig());
    const stats = computeTaskStats(editor.document.getText(), tagNames);
    const total = countTotalTasks(stats);

    if (total === 0) {
      void vscode.window.showInformationMessage("Easy: No hay tareas en este documento");
      return;
    }

    const breakdown = tagNames
      .filter((tagName) => stats[tagName] > 0)
      .map((tagName) => `#${tagName}: ${stats[tagName]}`)
      .join("  |  ");

    void vscode.window.showInformationMessage(`Easy: ${total} tareas — ${breakdown}`);
  }, "show task stats operation");
}

function navigateTask(
  getConfig: () => EasyLanguageConfig,
  direction: "next" | "previous"
): void {
  safeExecute(() => {
    const editor = vscode.window.activeTextEditor;

    if (!validateEditor(editor)) {
      void vscode.window.showErrorMessage("No hay editor activo");
      return;
    }

    const taskLines = findTaskLines(getDocumentLines(editor), getTagNames(getConfig()));

    if (taskLines.length === 0) {
      void vscode.window.showInformationMessage("Easy: No hay tareas en este documento");
      return;
    }

    const currentLine = editor.selection.active.line;
    const target =
      direction === "next"
        ? findNextTaskLine(currentLine, taskLines)
        : findPrevTaskLine(currentLine, taskLines);

    const wrapped: TaskLineInfo =
      target ?? (direction === "next" ? taskLines[0] : taskLines[taskLines.length - 1]);

    goToLine(editor, wrapped.lineNumber);
  }, `navigate to ${direction} task operation`);
}

function nextTask(getConfig: () => EasyLanguageConfig): void {
  navigateTask(getConfig, "next");
}

function previousTask(getConfig: () => EasyLanguageConfig): void {
  navigateTask(getConfig, "previous");
}

function filterTasks(getConfig: () => EasyLanguageConfig): void {
  safeExecute(() => {
    const editor = vscode.window.activeTextEditor;

    if (!validateEditor(editor)) {
      void vscode.window.showErrorMessage("No hay editor activo");
      return;
    }

    const taskLines = findTaskLines(getDocumentLines(editor), getTagNames(getConfig()));

    if (taskLines.length === 0) {
      void vscode.window.showInformationMessage("Easy: No hay tareas en este documento");
      return;
    }

    const items: TaskQuickPickItem[] = taskLines.map((taskLine) => ({
      label: taskLine.tags.map((tag) => `#${tag}`).join(" "),
      description: taskLine.text.trim(),
      lineNumber: taskLine.lineNumber,
    }));

    void vscode.window
      .showQuickPick(items, {
        placeHolder: "Easy: Selecciona una tarea para ir a su línea",
        matchOnDescription: true,
      })
      .then((picked) => {
        if (picked) {
          goToLine(editor, (picked as TaskQuickPickItem).lineNumber);
        }
      });
  }, "filter tasks operation");
}

/**
 * Registers the task tool commands (stats, next/previous navigation, QuickPick
 * filter) on the extension context, reading fresh config via `getConfig`.
 */
export function registerTaskCommands(
  context: vscode.ExtensionContext,
  getConfig: () => EasyLanguageConfig
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("easyLanguage.showTaskStats", () => showTaskStats(getConfig)),
    vscode.commands.registerCommand("easyLanguage.nextTask", () => nextTask(getConfig)),
    vscode.commands.registerCommand("easyLanguage.prevTask", () => previousTask(getConfig)),
    vscode.commands.registerCommand("easyLanguage.filterTasks", () => filterTasks(getConfig))
  );
}

export { showTaskStats, nextTask, previousTask, filterTasks };
