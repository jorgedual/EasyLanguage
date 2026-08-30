import { activate, deactivate } from "../src/extension";
import * as vscode from "vscode";
import { createMockEditor } from "./helpers";
import {
  clearConfiguration,
  emitActiveEditorChange,
  emitConfigurationChange,
  emitDocumentChange,
  resetVscodeMock,
  setConfiguration,
} from "./__mocks__/vscode";

jest.useFakeTimers();

function createContext(): vscode.ExtensionContext {
  return { subscriptions: [] as vscode.Disposable[] } as unknown as vscode.ExtensionContext;
}

describe("extension", () => {
  beforeEach(() => {
    resetVscodeMock();
    clearConfiguration();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
  });

  describe("activate", () => {
    it("initializes decorations and registers commands and providers", () => {
      const context = createContext();

      activate(context);

      expect(vscode.window.createTextEditorDecorationType).toHaveBeenCalledTimes(23);
      expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(10);
      expect(vscode.languages.registerCompletionItemProvider).toHaveBeenCalledTimes(2);
      expect(vscode.languages.registerDocumentFormattingEditProvider).toHaveBeenCalledTimes(2);
      expect(context.subscriptions).toHaveLength(17);
    });

    it("uses custom tags from settings", () => {
      setConfiguration({
        "easyLanguage.customTags": [{ tag: "urgente", backgroundColor: "#FF00FF" }],
      });

      activate(createContext());

      expect(vscode.window.createTextEditorDecorationType).toHaveBeenCalledTimes(24);
    });

    it("uses the configured debounce delay", () => {
      setConfiguration({ "easyLanguage.decorationUpdateDelay": 100 });

      const { editor, setDecorations } = createMockEditor(["#todo tarea"]);
      vscode.window.activeTextEditor = editor;

      activate(createContext());

      jest.advanceTimersByTime(99);
      expect(setDecorations).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(setDecorations).toHaveBeenCalledTimes(23);
    });

    it("updates decorations for the initial active editor after the debounce delay", () => {
      const { editor, setDecorations } = createMockEditor(["#todo tarea"]);
      vscode.window.activeTextEditor = editor;

      activate(createContext());

      expect(setDecorations).not.toHaveBeenCalled();
      jest.advanceTimersByTime(300);
      expect(setDecorations).toHaveBeenCalledTimes(23);
    });

    it("reacts to active editor changes", () => {
      activate(createContext());

      const { editor, setDecorations } = createMockEditor(["Tema: prueba"]);
      emitActiveEditorChange(editor as never);

      jest.advanceTimersByTime(300);
      expect(setDecorations).toHaveBeenCalledTimes(23);
    });

    it("reacts to document changes in the active editor", () => {
      const { editor, setDecorations } = createMockEditor(["#done lista"]);
      vscode.window.activeTextEditor = editor;

      activate(createContext());
      jest.advanceTimersByTime(300);
      setDecorations.mockClear();

      emitDocumentChange({ document: (editor as never as { document: unknown }).document });

      jest.advanceTimersByTime(300);
      expect(setDecorations).toHaveBeenCalledTimes(23);
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

    it("rebuilds decorations immediately when settings change", () => {
      const { editor, setDecorations } = createMockEditor(["#urgente revisar"]);
      vscode.window.activeTextEditor = editor;

      activate(createContext());
      jest.advanceTimersByTime(300);
      setDecorations.mockClear();

      setConfiguration({
        "easyLanguage.customTags": [{ tag: "urgente", backgroundColor: "#FF00FF" }],
      });
      emitConfigurationChange(["easyLanguage.customTags"]);

      expect(setDecorations).toHaveBeenCalledTimes(24);
    });

    it("ignores configuration changes outside the easyLanguage section", () => {
      const { editor, setDecorations } = createMockEditor(["#todo tarea"]);
      vscode.window.activeTextEditor = editor;

      activate(createContext());
      jest.advanceTimersByTime(300);
      setDecorations.mockClear();

      emitConfigurationChange(["editor.fontSize"]);

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
