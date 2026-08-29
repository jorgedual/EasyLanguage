import { activate, deactivate } from "../src/extension";
import * as vscode from "vscode";
import { createMockEditor } from "./helpers";
import { emitActiveEditorChange, emitDocumentChange, resetVscodeMock } from "./__mocks__/vscode";

jest.useFakeTimers();

function createContext(): vscode.ExtensionContext {
  return { subscriptions: [] as vscode.Disposable[] } as unknown as vscode.ExtensionContext;
}

describe("extension", () => {
  beforeEach(() => {
    resetVscodeMock();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
  });

  describe("activate", () => {
    it("initializes decorations and registers commands", () => {
      const context = createContext();

      activate(context);

      expect(vscode.window.createTextEditorDecorationType).toHaveBeenCalledTimes(20);
      expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(3);
      expect(context.subscriptions).toHaveLength(5);
    });

    it("updates decorations for the initial active editor after the debounce delay", () => {
      const { editor, setDecorations } = createMockEditor(["#todo tarea"]);
      vscode.window.activeTextEditor = editor;

      activate(createContext());

      expect(setDecorations).not.toHaveBeenCalled();
      jest.advanceTimersByTime(300);
      expect(setDecorations).toHaveBeenCalledTimes(20);
    });

    it("reacts to active editor changes", () => {
      activate(createContext());

      const { editor, setDecorations } = createMockEditor(["Tema: prueba"]);
      emitActiveEditorChange(editor as never);

      jest.advanceTimersByTime(300);
      expect(setDecorations).toHaveBeenCalledTimes(20);
    });

    it("reacts to document changes in the active editor", () => {
      const { editor, setDecorations } = createMockEditor(["#done lista"]);
      vscode.window.activeTextEditor = editor;

      activate(createContext());
      jest.advanceTimersByTime(300);
      setDecorations.mockClear();

      emitDocumentChange({ document: (editor as never as { document: unknown }).document });

      jest.advanceTimersByTime(300);
      expect(setDecorations).toHaveBeenCalledTimes(20);
    });

    it("ignores document changes for inactive editors", () => {
      const { editor, setDecorations } = createMockEditor(["#done lista"]);
      vscode.window.activeTextEditor = editor;

      activate(createContext());
      jest.advanceTimersByTime(300);
      setDecorations.mockClear();

      emitDocumentChange({ document: { languageId: "easy" } });

      jest.advanceTimersByTime(300);
      expect(setDecorations).not.toHaveBeenCalled();
    });

    it("shows an error message when initialization fails", () => {
      (vscode.window.createTextEditorDecorationType as jest.Mock).mockImplementation(() => {
        throw new Error("init failure");
      });

      activate(createContext());

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "EasyLanguage activation failed: init failure"
      );
    });
  });

  describe("deactivate", () => {
    it("disposes all decoration types", () => {
      activate(createContext());

      deactivate();
    });
  });
});
