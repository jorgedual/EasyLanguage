import type * as vscode from "vscode";

export type SupportedLanguageId = "easy" | "plaintext";

export type DecorationTypeName =
  | "tema"
  | "fecha"
  | "subTituloDos"
  | "subTituloUno"
  | "titulo"
  | "nuevoTexto"
  | "negrita"
  | "checkmark"
  | "arroba"
  | "validar"
  | "check"
  | "alta"
  | "task"
  | "media"
  | "comentarioUno"
  | "comentarioDos"
  | "comentarioTres"
  | "todo"
  | "doing"
  | "done";

export interface DecorationRule {
  readonly name: string;
  readonly pattern: RegExp;
  readonly hoverMessage: string;
}

export type DateFormat = "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY/MM/DD";

export interface CustomTagDefinition {
  readonly tag: string;
  readonly backgroundColor: string;
  readonly foregroundColor?: string;
  readonly hoverMessage?: string;
}

export interface EasyLanguageConfig {
  readonly decorationUpdateDelay: number;
  readonly dateFormat: DateFormat;
  readonly disabledDecorations: ReadonlySet<string>;
  readonly backgroundColorOverrides: Readonly<Record<string, string>>;
  readonly foregroundColorOverrides: Readonly<Record<string, string>>;
  readonly customTags: readonly CustomTagDefinition[];
}

export interface TaskLineInfo {
  readonly lineNumber: number;
  readonly text: string;
  readonly tags: readonly string[];
}

export type DecorationStyleMap = Map<string, vscode.DecorationRenderOptions>;
