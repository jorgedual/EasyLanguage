import * as vscode from "vscode";
import {
  buildDecorationStyles,
  disposeAllDecorationTypes,
  getDecorationType,
  getDecorationTypeCount,
  initializeDecorationTypes,
} from "../src/decorations/index";
import { createDefaultConfig } from "../src/config";
import type { DecorationTypeName, EasyLanguageConfig } from "../src/types";
import { getCreatedDecorationTypes, resetVscodeMock } from "./__mocks__/vscode";

const ALL_FIXED_NAMES: DecorationTypeName[] = [
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
];

function makeConfig(overrides: Partial<EasyLanguageConfig> = {}): EasyLanguageConfig {
  return { ...createDefaultConfig(), ...overrides };
}

describe("decorations", () => {
  beforeEach(() => {
    resetVscodeMock();
    disposeAllDecorationTypes();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("initializeDecorationTypes", () => {
    it("creates one decoration type per style with the default config", () => {
      initializeDecorationTypes(makeConfig());

      expect(getDecorationTypeCount()).toBe(20);
      expect(vscode.window.createTextEditorDecorationType).toHaveBeenCalledTimes(20);
      expect(getCreatedDecorationTypes()).toHaveLength(20);
    });

    it("makes every type retrievable by name", () => {
      initializeDecorationTypes(makeConfig());

      for (const name of ALL_FIXED_NAMES) {
        expect(getDecorationType(name)).toBeDefined();
      }
    });

    it("skips disabled decorations", () => {
      initializeDecorationTypes(
        makeConfig({ disabledDecorations: new Set(["todo", "checkmark"]) })
      );

      expect(getDecorationTypeCount()).toBe(18);
      expect(getDecorationType("todo")).toBeUndefined();
      expect(getDecorationType("checkmark")).toBeUndefined();
    });

    it("creates decoration types for custom tags", () => {
      initializeDecorationTypes(
        makeConfig({
          customTags: [{ tag: "urgente", backgroundColor: "#FF00FF" }],
        })
      );

      expect(getDecorationTypeCount()).toBe(21);
      expect(getDecorationType("urgente")).toBeDefined();
    });

    it("can be re-initialized (disposes previous types first)", () => {
      initializeDecorationTypes(makeConfig());
      const firstBatch = [...getCreatedDecorationTypes()];

      initializeDecorationTypes(
        makeConfig({ customTags: [{ tag: "urgente", backgroundColor: "#FF00FF" }] })
      );

      expect(getDecorationTypeCount()).toBe(21);
      for (const type of firstBatch) {
        expect(type.dispose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe("buildDecorationStyles", () => {
    it("applies background color overrides", () => {
      const styles = buildDecorationStyles(
        makeConfig({ backgroundColorOverrides: { todo: "#FF0000" } })
      );

      expect(styles.get("todo")?.backgroundColor).toBe("#FF0000");
    });

    it("applies foreground color overrides", () => {
      const styles = buildDecorationStyles(
        makeConfig({ foregroundColorOverrides: { done: "#FFFFFF" } })
      );

      expect(styles.get("done")?.color).toBe("#FFFFFF");
    });

    it("does not mutate the base styles when overriding", () => {
      buildDecorationStyles(makeConfig({ backgroundColorOverrides: { todo: "#FF0000" } }));

      const styles = buildDecorationStyles(makeConfig());
      expect(styles.get("todo")?.backgroundColor).toBe("#FFD700");
    });

    it("excludes disabled decorations", () => {
      const styles = buildDecorationStyles(
        makeConfig({ disabledDecorations: new Set(["tema", "fecha"]) })
      );

      expect(styles.has("tema")).toBe(false);
      expect(styles.has("fecha")).toBe(false);
      expect(styles.size).toBe(18);
    });

    it("builds styles for custom tags", () => {
      const styles = buildDecorationStyles(
        makeConfig({
          customTags: [
            { tag: "urgente", backgroundColor: "#FF00FF", foregroundColor: "#FFFFFF" },
          ],
        })
      );

      const urgente = styles.get("urgente");
      expect(urgente?.backgroundColor).toBe("#FF00FF");
      expect(urgente?.color).toBe("#FFFFFF");
    });

    it("excludes custom tags disabled by name", () => {
      const styles = buildDecorationStyles(
        makeConfig({
          customTags: [{ tag: "urgente", backgroundColor: "#FF00FF" }],
          disabledDecorations: new Set(["urgente"]),
        })
      );

      expect(styles.has("urgente")).toBe(false);
    });
  });

  describe("getDecorationType", () => {
    it("returns undefined before initialization", () => {
      expect(getDecorationType("todo")).toBeUndefined();
    });
  });

  describe("disposeAllDecorationTypes", () => {
    it("disposes every created decoration type", () => {
      initializeDecorationTypes(makeConfig());
      const created = [...getCreatedDecorationTypes()];

      disposeAllDecorationTypes();

      for (const type of created) {
        expect(type.dispose).toHaveBeenCalledTimes(1);
      }
      expect(getDecorationTypeCount()).toBe(0);
    });
  });
});
