import { insertCurrentDate, insertSquare, insertText, registerCommands } from "../src/commands";
import * as vscode from "vscode";
import { createMockEditor } from "./helpers";
import { resetVscodeMock } from "./__mocks__/vscode";

describe("commands", () => {
  beforeEach(() => {
    resetVscodeMock();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("insertText", () => {
    it("inserts a check mark at the start of the current line", () => {
      const { editor, insertCalls } = createMockEditor(["una tarea"], { cursor: { line: 0, character: 4 } });
      vscode.window.activeTextEditor = editor;

      insertText();

      expect(insertCalls).toEqual([{ position: { line: 0, character: 0 }, text: "🗸 " }]);
    });

    it("inserts before leading indentation", () => {
      const { editor, insertCalls } = createMockEditor(["   tarea con sangria"], {
        cursor: { line: 0, character: 5 },
      });
      vscode.window.activeTextEditor = editor;

      insertText();

      expect(insertCalls).toEqual([{ position: { line: 0, character: 3 }, text: "🗸 " }]);
    });

    it("inserts at the cursor when the line is blank", () => {
      const { editor, insertCalls } = createMockEditor([""], { cursor: { line: 0, character: 0 } });
      vscode.window.activeTextEditor = editor;

      insertText();

      expect(insertCalls).toEqual([{ position: { line: 0, character: 0 }, text: "🗸 " }]);
    });

    it("shows an error when there is no active editor", () => {
      vscode.window.activeTextEditor = undefined;

      insertText();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("No hay editor activo");
    });
  });

  describe("insertSquare", () => {
    it("inserts a square checkbox at the start of the current line", () => {
      const { editor, insertCalls } = createMockEditor(["una tarea"], { cursor: { line: 0, character: 2 } });
      vscode.window.activeTextEditor = editor;

      insertSquare();

      expect(insertCalls).toEqual([{ position: { line: 0, character: 0 }, text: "□ " }]);
    });

    it("shows an error when there is no active editor", () => {
      vscode.window.activeTextEditor = undefined;

      insertSquare();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("No hay editor activo");
    });
  });

  describe("insertCurrentDate", () => {
    it("inserts the current date at the cursor position", () => {
      const { editor, insertCalls } = createMockEditor(["nota "], { cursor: { line: 0, character: 5 } });
      vscode.window.activeTextEditor = editor;

      insertCurrentDate();

      expect(insertCalls).toHaveLength(1);
      expect(insertCalls[0].position).toEqual({ line: 0, character: 5 });
      expect(insertCalls[0].text).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("shows an error when there is no active editor", () => {
      vscode.window.activeTextEditor = undefined;

      insertCurrentDate();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("No hay editor activo");
    });
  });

  describe("registerCommands", () => {
    it("registers all three commands", () => {
      const context = { subscriptions: [] as vscode.Disposable[] } as unknown as vscode.ExtensionContext;

      registerCommands(context);

      expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(3);
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith("extension.insertText", insertText);
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith("extension.insertSquare", insertSquare);
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "extension.insertCurrentDate",
        insertCurrentDate
      );
      expect(context.subscriptions).toHaveLength(3);
    });
  });
});
