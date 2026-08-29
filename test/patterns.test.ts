import { decorationRules, patterns } from "../src/patterns";
import type { DecorationRule } from "../src/types";

function matchesOf(regex: RegExp, text: string): string[] {
  const matches: string[] = [];
  const copy = new RegExp(regex);

  let match: RegExpExecArray | null;
  while ((match = copy.exec(text)) !== null) {
    matches.push(match[0]);
  }

  return matches;
}

describe("patterns", () => {
  describe("tema", () => {
    it("matches lines starting with Tema:", () => {
      expect(matchesOf(patterns.tema, "Tema: Mi tema")).toEqual(["Tema: Mi tema"]);
    });

    it("does not match when Tema: is not at the start of the line", () => {
      expect(matchesOf(patterns.tema, "algo Tema: Mi tema")).toEqual([]);
    });

    it("matches multiple occurrences across lines", () => {
      const matches = matchesOf(patterns.tema, "Tema: uno\nTema: dos");
      expect(matches).toHaveLength(2);
    });
  });

  describe("fecha", () => {
    it("matches lines starting with fecha:", () => {
      expect(matchesOf(patterns.fecha, "fecha: 2026-08-29")).toEqual(["fecha: 2026-08-29"]);
    });

    it("does not match inline occurrences", () => {
      expect(matchesOf(patterns.fecha, "la fecha: 2026-08-29")).toEqual([]);
    });
  });

  describe("headings", () => {
    it("### matches level 3 headings", () => {
      expect(matchesOf(patterns.subTituloDos, "### Nivel 3")).toEqual(["### Nivel 3"]);
    });

    it("## matches level 2 headings", () => {
      expect(matchesOf(patterns.subTituloUno, "## Nivel 2")).toEqual(["## Nivel 2"]);
      expect(matchesOf(patterns.subTituloUno, "### Nivel 3")).toEqual([]);
    });

    it("# matches plain titles", () => {
      expect(matchesOf(patterns.titulo, "# Mi titulo")).toEqual(["# Mi titulo"]);
    });

    it("# does not match known tags", () => {
      for (const tag of ["todo", "doing", "done", "validar", "check", "alta", "task", "media"]) {
        expect(matchesOf(patterns.titulo, `#${tag} texto`)).toEqual([]);
      }
    });

    it("# still matches unknown tags used as titles", () => {
      expect(matchesOf(patterns.titulo, "#otro texto")).toEqual(["#otro texto"]);
    });
  });

  describe("task tags", () => {
    it.each([
      ["todo", "#todo"],
      ["doing", "#doing"],
      ["done", "#done"],
      ["alta", "#alta"],
      ["media", "#media"],
      ["task", "#task"],
      ["validar", "#validar"],
      ["check", "#check"],
    ])("%s matches its own tag", (name, tag) => {
      const pattern = patterns[name as keyof typeof patterns];
      expect(matchesOf(pattern, `${tag} algo`)).toEqual([tag]);
    });

    it("does not cross-match tags", () => {
      expect(matchesOf(patterns.todo, "#doing algo")).toEqual([]);
      expect(matchesOf(patterns.doing, "#done algo")).toEqual([]);
    });
  });

  describe("formatting patterns", () => {
    it(">> matches highlighted text", () => {
      expect(matchesOf(patterns.nuevoTexto, ">> importante")).toEqual([">> importante"]);
    });

    it("** matches bold text", () => {
      expect(matchesOf(patterns.negrita, "**negrita")).toEqual(["**negrita"]);
    });

    it("🗸 matches completed items", () => {
      expect(matchesOf(patterns.checkmark, "🗸 tarea hecha")).toEqual(["🗸 tarea hecha"]);
    });

    it("/@ matches mentions", () => {
      expect(matchesOf(patterns.arroba, "/@usuario")).toEqual(["/@usuario"]);
      expect(matchesOf(patterns.arroba, "@usuario")).toEqual([]);
    });
  });

  describe("comment patterns", () => {
    it("matches decorative asterisk blocks", () => {
      expect(matchesOf(patterns.comentarioUno, "/****/")).toEqual(["/****/"]);
    });

    it("matches plus-delimited comments", () => {
      expect(matchesOf(patterns.comentarioDos, "/+ texto +/")).toEqual(["/+ texto +/"]);
    });

    it("matches triple slash comments", () => {
      expect(matchesOf(patterns.comentarioTres, "/// nota")).toEqual(["/// nota"]);
    });
  });

  describe("decorationRules", () => {
    it("covers all task and formatting patterns", () => {
      const names = decorationRules.map((rule) => rule.name);

      expect(names).toEqual(
        expect.arrayContaining([
          "tema",
          "fecha",
          "subTituloDos",
          "subTituloUno",
          "titulo",
          "nuevoTexto",
          "negrita",
          "checkmark",
          "arroba",
          "validar",
          "check",
          "alta",
          "task",
          "media",
          "comentarioUno",
          "comentarioDos",
          "comentarioTres",
          "todo",
          "doing",
          "done",
        ])
      );
    });

    it("has a hover message for every rule", () => {
      for (const rule of decorationRules as readonly DecorationRule[]) {
        expect(rule.hoverMessage.length).toBeGreaterThan(0);
      }
    });
  });
});
