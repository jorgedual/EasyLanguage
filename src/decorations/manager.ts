import * as vscode from "vscode";
import type { DecorationRule } from "../types";
import { decorationRules } from "../patterns";
import { getDecorationType } from "./index";
import { isSupportedLanguage, logError, safeExecute, validateEditor } from "../utils";

let activeEditor: vscode.TextEditor | undefined;
let activeRules: readonly DecorationRule[] = decorationRules;

/** Tracks the editor decorations are applied to. */
export function setActiveEditor(editor: vscode.TextEditor | undefined): void {
  activeEditor = editor;
}

/** Currently tracked editor (or undefined when none is active). */
export function getActiveEditor(): vscode.TextEditor | undefined {
  return activeEditor;
}

/** Replaces the rule list used by the next decoration update (e.g. after a config change). */
export function setDecorationRules(rules: readonly DecorationRule[]): void {
  activeRules = rules;
}

/** Rule list currently used when applying decorations. */
export function getDecorationRules(): readonly DecorationRule[] {
  return activeRules;
}

/** Applies one rule's pattern to the whole document text, setting its decoration ranges. */
export function applyRule(rule: DecorationRule, text: string): void {
  const decorationType = getDecorationType(rule.name);

  if (!activeEditor || !decorationType) {
    return;
  }

  const decorations: vscode.DecorationOptions[] = [];
  const regex = new RegExp(rule.pattern);

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(match.index + match[0].length);

    decorations.push({
      range: new vscode.Range(startPos, endPos),
      hoverMessage: rule.hoverMessage,
    });
  }

  try {
    activeEditor.setDecorations(decorationType, decorations);
  } catch (error) {
    logError(`Failed to apply ${rule.name} decorations`, error instanceof Error ? error : null);
  }
}

/** Re-applies every active rule to the tracked editor (no-op for unsupported languages/editors). */
export function updateAllDecorations(): void {
  safeExecute(() => {
    if (!validateEditor(activeEditor)) {
      return;
    }

    if (!isSupportedLanguage(activeEditor.document.languageId)) {
      return;
    }

    const text = activeEditor.document.getText();

    for (const rule of activeRules) {
      applyRule(rule, text);
    }
  }, "update decorations");
}
