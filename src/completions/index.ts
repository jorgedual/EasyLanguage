import * as vscode from "vscode";
import type { CustomTagDefinition } from "../types";

const SUPPORTED_LANGUAGES: readonly string[] = ["easy", "plaintext"];

const BUILTIN_TAG_INFO: Readonly<Record<string, string>> = {
  todo: "Tarea pendiente",
  doing: "Tarea en progreso",
  done: "Tarea completada",
  alta: "Prioridad alta",
  media: "Prioridad media",
  task: "Tarea general",
  validar: "Pendiente de validar",
  check: "Verificado",
};

/** Suggestions offered at the start of a line (before any content). */
const LINE_START_COMPLETIONS: readonly CompletionItemData[] = [
  { label: "Tema:", insertText: "Tema: ", detail: "Título de tema", kind: "construct" },
  { label: "fecha:", insertText: "fecha: ", detail: "Fecha", kind: "construct" },
  { label: ">>", insertText: ">> ", detail: "Texto destacado", kind: "construct" },
];

export interface CompletionItemData {
  readonly label: string;
  readonly insertText: string;
  readonly detail: string;
  readonly documentation?: string;
  readonly kind: "tag" | "construct";
}

export type CompletionContextKind = "tag" | "lineStart" | "none";

/**
 * Detects what is being typed from the text before the cursor:
 * - `tag`: a `#` optionally followed by word characters (`#`, `#to`, …)
 * - `lineStart`: nothing but whitespace on the current line
 * - `none`: anywhere else (no suggestions)
 */
export function detectCompletionContext(textBeforeCursor: string): CompletionContextKind {
  if (/#\w*$/.test(textBeforeCursor)) {
    return "tag";
  }

  const currentLinePrefix = textBeforeCursor.split("\n").pop() ?? "";
  return currentLinePrefix.trim() === "" ? "lineStart" : "none";
}

/** Builds tag completions: built-in tags first, then custom tags from settings. */
export function buildTagCompletions(
  customTags: readonly CustomTagDefinition[]
): CompletionItemData[] {
  const builtin: CompletionItemData[] = Object.entries(BUILTIN_TAG_INFO).map(
    ([tagName, description]) => ({
      label: `#${tagName}`,
      insertText: `${tagName} `,
      detail: description,
      kind: "tag" as const,
    })
  );

  const custom: CompletionItemData[] = customTags.map((customTag) => ({
    label: `#${customTag.tag}`,
    insertText: `${customTag.tag} `,
    detail: "Etiqueta personalizada",
    ...(customTag.hoverMessage !== undefined ? { documentation: customTag.hoverMessage } : {}),
    kind: "tag" as const,
  }));

  return [...builtin, ...custom];
}

/** Maps completion data to VS Code completion items. */
export function toCompletionItems(data: readonly CompletionItemData[]): vscode.CompletionItem[] {
  return data.map((item) => {
    const completionItem = new vscode.CompletionItem(
      item.label,
      item.kind === "tag" ? vscode.CompletionItemKind.Keyword : vscode.CompletionItemKind.Snippet
    );
    completionItem.insertText = item.insertText;
    completionItem.detail = item.detail;
    if (item.documentation !== undefined) {
      completionItem.documentation = item.documentation;
    }
    return completionItem;
  });
}

/** Registers the completion provider for supported languages (trigger: `#`). */
export function registerCompletionProviders(
  context: vscode.ExtensionContext,
  getConfig: () => { completionsEnabled: boolean; customTags: readonly CustomTagDefinition[] }
): void {
  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position
    ): vscode.CompletionList {
      const config = getConfig();

      if (!config.completionsEnabled) {
        return { items: [] };
      }

      const textBeforeCursor = document.lineAt(position.line).text.slice(0, position.character);
      const completionContext = detectCompletionContext(textBeforeCursor);

      if (completionContext === "none") {
        return { items: [] };
      }

      const data =
        completionContext === "tag"
          ? buildTagCompletions(config.customTags)
          : LINE_START_COMPLETIONS;

      return { items: toCompletionItems(data) };
    },
  };

  for (const language of SUPPORTED_LANGUAGES) {
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(language, provider, "#")
    );
  }
}
