import { RESERVED_TAG_NAMES } from "../patterns";

const TEMA_LINE = /^(\s*)Tema:\s*(.*)$/;
const FECHA_LINE = /^(\s*)fecha:\s*(.*)$/;
const BLOCKQUOTE_LINE = /^(\s*)>>\s*(.*)$/;
const CHECK_LINE = /^(\s*)🗸\s*(.*)$/;
const SQUARE_LINE = /^(\s*)□\s*(.*)$/;
const SEPARATOR_LINE = /^\s*\/\*+\/\s*$/;
const LINE_COMMENT = /^\s*\/\/\/\s?(.*)$/;
const INLINE_PLUS_COMMENT = /\/\+(.*?)\+\//g;
const MENTION = /\/@(\w+)/g;

/**
 * Converts Easy note text to Markdown:
 *
 * - `Tema: X` → `# X`, `#X` → `## X`, `##X` → `### X`, `###X` → `#### X`
 * - `fecha: X` → `*fecha: X*`, `>> X` → `> X`
 * - `🗸 X` → `- [x] X`, `□ X` → `- [ ] X` (GitHub task lists)
 * - asterisk separator lines → `---`, `/// X` and `/+X+/` → `<!-- X -->`, `/@user` → `@user`
 * - tags (`#todo`, custom…) are bolded so they never read as Markdown headings
 */
export function convertToMarkdown(text: string, customTagNames: readonly string[] = []): string {
  const tagNames = [...new Set([...RESERVED_TAG_NAMES, ...customTagNames])];
  const tagExclusions = tagNames.length > 0 ? tagNames.join("|") : "a^";
  const tituloLine = new RegExp(`^(\\s*)#(?!${tagExclusions})([^#].*)$`);
  const subTituloUnoLine = /^(\s*)##([^#].*)$/;
  const subTituloDosLine = /^(\s*)###(.*)$/;
  const tagPattern = new RegExp(`#(${tagExclusions})`, "g");

  const lines = text
    .split("\n")
    .map((line) => convertLine(line, tituloLine, subTituloUnoLine, subTituloDosLine));

  return lines
    .join("\n")
    .replace(INLINE_PLUS_COMMENT, "<!-- $1 -->")
    .replace(MENTION, "@$1")
    .replace(tagPattern, "**#$1**");
}

function convertLine(
  line: string,
  tituloLine: RegExp,
  subTituloUnoLine: RegExp,
  subTituloDosLine: RegExp
): string {
  const tema = line.match(TEMA_LINE);
  if (tema) {
    return `${tema[1]}# ${tema[2]}`;
  }

  const fecha = line.match(FECHA_LINE);
  if (fecha) {
    return `${fecha[1]}*fecha: ${fecha[2]}*`;
  }

  const subTituloDos = line.match(subTituloDosLine);
  if (subTituloDos) {
    return `${subTituloDos[1]}#### ${subTituloDos[2]}`;
  }

  const subTituloUno = line.match(subTituloUnoLine);
  if (subTituloUno) {
    return `${subTituloUno[1]}### ${subTituloUno[2]}`;
  }

  const titulo = line.match(tituloLine);
  if (titulo) {
    return `${titulo[1]}## ${titulo[2]}`;
  }

  const blockquote = line.match(BLOCKQUOTE_LINE);
  if (blockquote) {
    return `${blockquote[1]}> ${blockquote[2]}`;
  }

  const check = line.match(CHECK_LINE);
  if (check) {
    return `${check[1]}- [x] ${check[2]}`;
  }

  const square = line.match(SQUARE_LINE);
  if (square) {
    return `${square[1]}- [ ] ${square[2]}`;
  }

  if (SEPARATOR_LINE.test(line)) {
    return "---";
  }

  const lineComment = line.match(LINE_COMMENT);
  if (lineComment) {
    return `<!-- ${lineComment[1]} -->`;
  }

  return line;
}
