import { buildDecorationRules, buildTituloPattern, decorationRules, patterns } from "../src/patterns";
import { createDefaultConfig } from "../src/config";
import type { EasyLanguageConfig } from "../src/types";
import type { DecorationRule } from "../src/types";

function makeConfig(overrides: Partial<EasyLanguageConfig> = {}): EasyLanguageConfig {
  return { ...createDefaultConfig(), ...overrides };
}

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
      for (const tag of [
        "todo",
        "doing",
        "done",
        "blocked",
        "waiting",
        "validar",
        "check",
        "alta",
        "task",
        "media",
        "baja",
      ]) {
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
      ["blocked", "#blocked"],
      ["waiting", "#waiting"],
      ["alta", "#alta"],
      ["media", "#media"],
      ["baja", "#baja"],
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
      expect(matchesOf(patterns.baja, "#blocked algo")).toEqual([]);
      expect(matchesOf(patterns.blocked, "#waiting algo")).toEqual([]);
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

  describe("buildDecorationRules", () => {
    it("returns the fixed rules with the default config", () => {
      const rules = buildDecorationRules(createDefaultConfig());

      expect(rules).toHaveLength(23);
      expect(rules.map((rule) => rule.name)).toContain("titulo");
    });

    it("removes disabled rules", () => {
      const config = makeConfig({ disabledDecorations: new Set(["todo", "tema"]) });

      const rules = buildDecorationRules(config);

      expect(rules).toHaveLength(21);
      expect(rules.map((rule) => rule.name)).not.toContain("todo");
      expect(rules.map((rule) => rule.name)).not.toContain("tema");
    });

    it("adds rules for custom tags", () => {
      const config = makeConfig({
        customTags: [
          { tag: "urgente", backgroundColor: "#FF00FF", hoverMessage: "Urgente" },
        ],
      });

      const rules = buildDecorationRules(config);

      expect(rules).toHaveLength(24);
      const urgente = rules.find((rule) => rule.name === "urgente");
      expect(urgente?.hoverMessage).toBe("Urgente");
      expect(urgente?.pattern.test("#urgente revisar")).toBe(true);
    });

    it("uses the tag name as hover message when none is provided", () => {
      const config = makeConfig({
        customTags: [{ tag: "urgente", backgroundColor: "#FF00FF" }],
      });

      const rules = buildDecorationRules(config);

      expect(rules.find((rule) => rule.name === "urgente")?.hoverMessage).toBe("urgente");
    });

    it("excludes custom tags from the titulo pattern", () => {
      const config = makeConfig({
        customTags: [{ tag: "urgente", backgroundColor: "#FF00FF" }],
      });

      const titulo = buildDecorationRules(config).find((rule) => rule.name === "titulo");

      expect(titulo?.pattern.test("#urgente texto")).toBe(false);
      expect(titulo?.pattern.test("#titulo-normal")).toBe(true);
    });

    it("keeps excluding reserved tags in the titulo pattern", () => {
      const titulo = buildDecorationRules(makeConfig()).find((rule) => rule.name === "titulo");

      expect(titulo?.pattern.test("#todo tarea")).toBe(false);
      expect(titulo?.pattern.test("#otro")).toBe(true);
    });

    it("skips custom tags disabled by name", () => {
      const config = makeConfig({
        customTags: [{ tag: "urgente", backgroundColor: "#FF00FF" }],
        disabledDecorations: new Set(["urgente"]),
      });

      const rules = buildDecorationRules(config);

      expect(rules.map((rule) => rule.name)).not.toContain("urgente");
    });
  });

  describe("buildTituloPattern", () => {
    it("matches everything when no tags are excluded", () => {
      const pattern = buildTituloPattern([]);

      expect(pattern.test("#todo")).toBe(true);
    });

    it("excludes the provided tag names", () => {
      const pattern = buildTituloPattern(["todo", "urgente"]);

      expect(pattern.test("#todo")).toBe(false);
      expect(pattern.test("#urgente")).toBe(false);
      expect(pattern.test("#normal")).toBe(true);
    });
  });
});
