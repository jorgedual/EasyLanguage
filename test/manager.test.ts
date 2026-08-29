import { getDecorationType, initializeDecorationTypes } from "../src/decorations/index";
import { getActiveEditor, setActiveEditor, updateAllDecorations } from "../src/decorations/manager";
import { decorationRules } from "../src/patterns";
import type { DecorationTypeName } from "../src/types";
import { createMockEditor } from "./helpers";
import { resetVscodeMock } from "./__mocks__/vscode";

function decorationsForType(setDecorations: jest.Mock, name: DecorationTypeName): unknown[] {
  const type = getDecorationType(name);

  const calls = setDecorations.mock.calls.filter(([decorationType]) => decorationType === type);

  return calls.length > 0 ? (calls[calls.length - 1][1] as unknown[]) : [];
}

describe("decoration manager", () => {
  beforeEach(() => {
    resetVscodeMock();
    initializeDecorationTypes();
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
  });
});
