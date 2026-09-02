import { getDecorationType, initializeDecorationTypes } from "../src/decorations/index";
import {
  getActiveEditor,
  getDecorationRules,
  setActiveEditor,
  setDecorationRules,
  updateAllDecorations,
} from "../src/decorations/manager";
import { buildDecorationRules, decorationRules } from "../src/patterns";
import { createDefaultConfig } from "../src/config";
import type { EasyLanguageConfig } from "../src/types";
import { createMockEditor } from "./helpers";
import { resetVscodeMock } from "./__mocks__/vscode";

function makeConfig(overrides: Partial<EasyLanguageConfig> = {}): EasyLanguageConfig {
  return { ...createDefaultConfig(), ...overrides };
}

function decorationsForType(setDecorations: jest.Mock, name: string): unknown[] {
  const type = getDecorationType(name);

  const calls = setDecorations.mock.calls.filter(([decorationType]) => decorationType === type);

  return calls.length > 0 ? (calls[calls.length - 1][1] as unknown[]) : [];
}

describe("decoration manager", () => {
  beforeEach(() => {
    resetVscodeMock();
    initializeDecorationTypes(makeConfig());
    setDecorationRules(decorationRules as readonly import("../src/types").DecorationRule[]);
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("active editor tracking", () => {
    it("starts without an active editor", () => {
      expect(getActiveEditor()).toBeUndefined();
    });

    it("stores and returns the active editor", () => {
      const { editor } = createMockEditor(["Tema: prueba"]);
      setActiveEditor(editor);

      expect(getActiveEditor()).toBe(editor);
    });
  });

  describe("updateAllDecorations", () => {
    it("applies decorations for every rule", () => {
      const { editor, setDecorations } = createMockEditor([
        "Tema: prueba",
        "fecha: 2026-08-29",
        "#todo tarea",
      ]);
      setActiveEditor(editor);

      updateAllDecorations();

      expect(setDecorations).toHaveBeenCalledTimes(decorationRules.length);
    });

    it("computes correct decoration counts per pattern", () => {
      const { editor, setDecorations } = createMockEditor([
        "Tema: prueba",
        "#todo primera",
        "#todo segunda",
        "#doing en curso",
        "texto plano sin formato",
      ]);
      setActiveEditor(editor);

      updateAllDecorations();

      expect(decorationsForType(setDecorations, "tema")).toHaveLength(1);
      expect(decorationsForType(setDecorations, "todo")).toHaveLength(2);
      expect(decorationsForType(setDecorations, "doing")).toHaveLength(1);
      expect(decorationsForType(setDecorations, "done")).toHaveLength(0);
    });

    it("creates decorations with valid ranges and hover messages", () => {
      const { editor, setDecorations } = createMockEditor(["#done completada"]);
      setActiveEditor(editor);

      updateAllDecorations();

      const decorations = decorationsForType(setDecorations, "done") as Array<{
        range: { start: { line: number; character: number }; end: { line: number; character: number } };
        hoverMessage: string;
      }>;

      expect(decorations).toHaveLength(1);
      expect(decorations[0].range.start).toEqual({ line: 0, character: 0 });
      expect(decorations[0].range.end).toEqual({ line: 0, character: 5 });
      expect(decorations[0].hoverMessage).toBe("Completado");
    });

    it("ignores unsupported languages", () => {
      const { editor, setDecorations } = createMockEditor(["#todo tarea"], { languageId: "javascript" });
      setActiveEditor(editor);

      updateAllDecorations();

      expect(setDecorations).not.toHaveBeenCalled();
    });

    it("does nothing without an active editor", () => {
      setActiveEditor(undefined);

      expect(() => updateAllDecorations()).not.toThrow();
    });

    it("survives setDecorations throwing", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
      const { editor } = createMockEditor(["#todo tarea"]);

      (editor.setDecorations as jest.Mock).mockImplementation(() => {
        throw new Error("decoration failure");
      });

      setActiveEditor(editor);

      expect(() => updateAllDecorations()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to apply todo decorations decoration failure")
      );
    });

    it("applies custom tag rules after setDecorationRules", () => {
      const config = makeConfig({
        customTags: [{ tag: "urgente", backgroundColor: "#FF00FF", hoverMessage: "Urgente" }],
      });
      initializeDecorationTypes(config);
      setDecorationRules(buildDecorationRules(config));

      const { editor, setDecorations } = createMockEditor(["#urgente revisar", "#otro texto"]);
      setActiveEditor(editor);

      updateAllDecorations();

      expect(setDecorations).toHaveBeenCalledTimes(config.customTags.length + decorationRules.length);
      const urgenteDecorations = decorationsForType(setDecorations, "urgente") as Array<{
        hoverMessage: string;
      }>;
      expect(urgenteDecorations).toHaveLength(1);
      expect(urgenteDecorations[0].hoverMessage).toBe("Urgente");
    });

    it("skips rules disabled via setDecorationRules", () => {
      const config = makeConfig({ disabledDecorations: new Set(["todo", "doing"]) });
      initializeDecorationTypes(config);
      setDecorationRules(buildDecorationRules(config));

      const { editor, setDecorations } = createMockEditor(["#todo tarea", "#doing otra"]);
      setActiveEditor(editor);

      updateAllDecorations();

      expect(setDecorations).toHaveBeenCalledTimes(decorationRules.length - 2);
    });
  });

  describe("decoration rules state", () => {
    it("exposes the current rules", () => {
      const config = makeConfig({ customTags: [{ tag: "urgente", backgroundColor: "#FF00FF" }] });
      const rules = buildDecorationRules(config);

      setDecorationRules(rules);

      expect(getDecorationRules()).toBe(rules);
    });
  });
});
