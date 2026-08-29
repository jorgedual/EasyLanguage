import type { DecorationRule, EasyLanguageConfig } from "../types";

export const patterns = {
  tema: /^Tema:(.*)$/gm,
  fecha: /^fecha:(.*)$/gm,
  subTituloDos: /^###(.*)$/gm,
  subTituloUno: /^##([^#].*)$/gm,
  titulo: /^#(?!todo|doing|done|validar|check|alta|task|media)([^#].*)$/gm,
  nuevoTexto: />>(.*)/g,
  negrita: /\*\*(.*)/g,
  checkmark: /🗸(.*)/g,
  arroba: /\/@(\w+)/g,
  validar: /#validar/g,
  check: /#check/g,
  alta: /#alta/g,
  task: /#task/g,
  media: /#media/g,
  comentarioUno: /\/\*\*+\//g,
  comentarioDos: /\/\+(.*?)\+\//g,
  comentarioTres: /\/\/\/(.*)$/gm,
  todo: /#todo/g,
  doing: /#doing/g,
  done: /#done/g,
} as const;

export type PatternName = keyof typeof patterns;

export const decorationRules: readonly DecorationRule[] = [
  { name: "tema", pattern: patterns.tema, hoverMessage: "Tema" },
  { name: "fecha", pattern: patterns.fecha, hoverMessage: "fecha" },
  { name: "subTituloDos", pattern: patterns.subTituloDos, hoverMessage: "Subtítulo Nivel 2" },
  { name: "subTituloUno", pattern: patterns.subTituloUno, hoverMessage: "Subtítulo Nivel 1" },
  { name: "titulo", pattern: patterns.titulo, hoverMessage: "Título" },
  { name: "nuevoTexto", pattern: patterns.nuevoTexto, hoverMessage: "Check" },
  { name: "negrita", pattern: patterns.negrita, hoverMessage: "Negrita" },
  { name: "checkmark", pattern: patterns.checkmark, hoverMessage: "Check" },
  { name: "arroba", pattern: patterns.arroba, hoverMessage: "arroba" },
  { name: "validar", pattern: patterns.validar, hoverMessage: "validar" },
  { name: "check", pattern: patterns.check, hoverMessage: "checkDos" },
  { name: "alta", pattern: patterns.alta, hoverMessage: "alta" },
  { name: "task", pattern: patterns.task, hoverMessage: "task" },
  { name: "media", pattern: patterns.media, hoverMessage: "media" },
  { name: "comentarioUno", pattern: patterns.comentarioUno, hoverMessage: "comentarioUno" },
  { name: "comentarioDos", pattern: patterns.comentarioDos, hoverMessage: "comentarioDos" },
  { name: "comentarioTres", pattern: patterns.comentarioTres, hoverMessage: "comentarioTres" },
  { name: "todo", pattern: patterns.todo, hoverMessage: "Tarea pendiente" },
  { name: "doing", pattern: patterns.doing, hoverMessage: "En progreso" },
  { name: "done", pattern: patterns.done, hoverMessage: "Completado" },
];

export const RESERVED_TAG_NAMES: readonly string[] = [
  "todo",
  "doing",
  "done",
  "validar",
  "check",
  "alta",
  "task",
  "media",
];

export function buildTituloPattern(excludedTagNames: readonly string[]): RegExp {
  const excluded = excludedTagNames.length > 0 ? excludedTagNames.join("|") : "a^";
  return new RegExp(`^#(?!${excluded})([^#].*)$`, "gm");
}

export function buildDecorationRules(config: EasyLanguageConfig): DecorationRule[] {
  const customTagNames = config.customTags.map((customTag) => customTag.tag);
  const tituloPattern = buildTituloPattern([...RESERVED_TAG_NAMES, ...customTagNames]);

  const rules: DecorationRule[] = [];

  for (const rule of decorationRules) {
    if (config.disabledDecorations.has(rule.name)) {
      continue;
    }

    if (rule.name === "titulo") {
      rules.push({ ...rule, pattern: tituloPattern });
    } else {
      rules.push(rule);
    }
  }

  for (const customTag of config.customTags) {
    if (config.disabledDecorations.has(customTag.tag)) {
      continue;
    }

    rules.push({
      name: customTag.tag,
      pattern: new RegExp(`#${customTag.tag}`, "g"),
      hoverMessage: customTag.hoverMessage ?? customTag.tag,
    });
  }

  return rules;
}
