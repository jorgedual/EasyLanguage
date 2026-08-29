import type { DecorationRule } from "../types";

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
