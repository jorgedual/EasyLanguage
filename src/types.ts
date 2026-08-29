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
  readonly name: DecorationTypeName;
  readonly pattern: RegExp;
  readonly hoverMessage: string;
}
