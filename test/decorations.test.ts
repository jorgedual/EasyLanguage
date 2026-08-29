import * as vscode from "vscode";
import {
  disposeAllDecorationTypes,
  getDecorationType,
  getDecorationTypeCount,
  initializeDecorationTypes,
} from "../src/decorations/index";
import type { DecorationTypeName } from "../src/types";
import { getCreatedDecorationTypes, resetVscodeMock } from "./__mocks__/vscode";

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
    it("creates one decoration type per style", () => {
      initializeDecorationTypes();

      expect(getDecorationTypeCount()).toBe(20);
      expect(vscode.window.createTextEditorDecorationType).toHaveBeenCalledTimes(20);
      expect(getCreatedDecorationTypes()).toHaveLength(20);
    });

    it("makes every type retrievable by name", () => {
      initializeDecorationTypes();

      const names: DecorationTypeName[] = [
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

      for (const name of names) {
        expect(getDecorationType(name)).toBeDefined();
      }
    });
  });

  describe("getDecorationType", () => {
    it("returns undefined before initialization", () => {
      expect(getDecorationType("todo")).toBeUndefined();
    });
  });

  describe("disposeAllDecorationTypes", () => {
    it("disposes every created decoration type", () => {
      initializeDecorationTypes();
      const created = [...getCreatedDecorationTypes()];

      disposeAllDecorationTypes();

      for (const type of created) {
        expect(type.dispose).toHaveBeenCalledTimes(1);
      }
      expect(getDecorationTypeCount()).toBe(0);
    });
  });
});
