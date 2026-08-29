import {
  filterTasks,
  nextTask,
  previousTask,
  registerTaskCommands,
  showTaskStats,
} from "../src/commands/taskCommands";
import { createDefaultConfig } from "../src/config";
import type { CustomTagDefinition, EasyLanguageConfig } from "../src/types";
import * as vscode from "vscode";
import { createMockEditor } from "./helpers";
import { resetVscodeMock } from "./__mocks__/vscode";

const TASK_DOCUMENT = [
  "Tema: documento",
  "#todo primera tarea",
  "texto plano",
  "#doing en curso",
  "#done completada #done",
];

function makeConfig(overrides: Partial<EasyLanguageConfig> = {}): () => EasyLanguageConfig {
  const config: EasyLanguageConfig = { ...createDefaultConfig(), ...overrides };
  return () => config;
}

function makeConfigWithCustomTags(tags: CustomTagDefinition[]): () => EasyLanguageConfig {
  return makeConfig({ customTags: tags });
}

describe("task commands", () => {
  beforeEach(() => {
    resetVscodeMock();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("showTaskStats", () => {
    it("shows a message with the per-tag breakdown", () => {
      const { editor } = createMockEditor(TASK_DOCUMENT, { cursor: { line: 0, character: 0 } });
      vscode.window.activeTextEditor = editor;

      showTaskStats(makeConfig());

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "Easy: 4 tareas — #todo: 1  |  #doing: 1  |  #done: 2"
      );
    });

    it("includes custom tags in the breakdown", () => {
      const { editor } = createMockEditor(["#urgente revisar esto"]);
      vscode.window.activeTextEditor = editor;

      showTaskStats(makeConfigWithCustomTags([{ tag: "urgente", backgroundColor: "#FF00FF" }]));

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "Easy: 1 tareas — #urgente: 1"
      );
    });

    it("notifies when the document has no tasks", () => {
      const { editor } = createMockEditor(["solo texto normal"]);
      vscode.window.activeTextEditor = editor;

      showTaskStats(makeConfig());

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "Easy: No hay tareas en este documento"
      );
    });

    it("shows an error when there is no active editor", () => {
      vscode.window.activeTextEditor = undefined;

      showTaskStats(makeConfig());

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("No hay editor activo");
    });
  });

  describe("nextTask", () => {
    it("moves the selection to the next task line", () => {
      const { editor, getSelection, revealRange } = createMockEditor(TASK_DOCUMENT, {
        cursor: { line: 1, character: 0 },
      });
      vscode.window.activeTextEditor = editor;

      nextTask(makeConfig());

      expect(getSelection()).toEqual({ line: 3, character: 0 });
      expect(revealRange).toHaveBeenCalledTimes(1);
    });

    it("wraps around to the first task when past the last one", () => {
      const { editor, getSelection } = createMockEditor(TASK_DOCUMENT, {
        cursor: { line: 4, character: 0 },
      });
      vscode.window.activeTextEditor = editor;

      nextTask(makeConfig());

      expect(getSelection()).toEqual({ line: 1, character: 0 });
    });

    it("notifies when there are no tasks", () => {
      const { editor } = createMockEditor(["sin tareas"]);
      vscode.window.activeTextEditor = editor;

      nextTask(makeConfig());

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "Easy: No hay tareas en este documento"
      );
    });
  });

  describe("previousTask", () => {
    it("moves the selection to the previous task line", () => {
      const { editor, getSelection } = createMockEditor(TASK_DOCUMENT, {
        cursor: { line: 3, character: 0 },
      });
      vscode.window.activeTextEditor = editor;

      previousTask(makeConfig());

      expect(getSelection()).toEqual({ line: 1, character: 0 });
    });

    it("wraps around to the last task when before the first one", () => {
      const { editor, getSelection } = createMockEditor(TASK_DOCUMENT, {
        cursor: { line: 0, character: 0 },
      });
      vscode.window.activeTextEditor = editor;

      previousTask(makeConfig());

      expect(getSelection()).toEqual({ line: 4, character: 0 });
    });
  });

  describe("filterTasks", () => {
    it("opens a QuickPick with every task line", async () => {
      const { editor } = createMockEditor(TASK_DOCUMENT);
      vscode.window.activeTextEditor = editor;

      filterTasks(makeConfig());

      expect(vscode.window.showQuickPick).toHaveBeenCalledTimes(1);
      const [items, options] = (vscode.window.showQuickPick as jest.Mock).mock.calls[0];

      expect(items).toHaveLength(3);
      expect(items[0]).toMatchObject({
        label: "#todo",
        description: "#todo primera tarea",
        lineNumber: 1,
      });
      expect(options.placeHolder).toContain("Selecciona una tarea");
    });

    it("jumps to the selected task line", async () => {
      const { editor, getSelection } = createMockEditor(TASK_DOCUMENT);
      vscode.window.activeTextEditor = editor;

      (vscode.window.showQuickPick as jest.Mock).mockImplementation(() =>
        Promise.resolve({ label: "#doing", description: "#doing en curso", lineNumber: 3 })
      );

      filterTasks(makeConfig());
      await Promise.resolve();

      expect(getSelection()).toEqual({ line: 3, character: 0 });
    });

    it("does nothing when the QuickPick is dismissed", async () => {
      const { editor, getSelection } = createMockEditor(TASK_DOCUMENT, {
        cursor: { line: 0, character: 0 },
      });
      vscode.window.activeTextEditor = editor;

      (vscode.window.showQuickPick as jest.Mock).mockImplementation(() =>
        Promise.resolve(undefined)
      );

      filterTasks(makeConfig());
      await Promise.resolve();

      expect(getSelection()).toEqual({ line: 0, character: 0 });
    });

    it("notifies when there are no tasks", () => {
      const { editor } = createMockEditor(["sin tareas"]);
      vscode.window.activeTextEditor = editor;

      filterTasks(makeConfig());

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "Easy: No hay tareas en este documento"
      );
      expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
    });
  });

  describe("registerTaskCommands", () => {
    it("registers the four task commands", () => {
      const context = {
        subscriptions: [] as vscode.Disposable[],
      } as unknown as vscode.ExtensionContext;

      registerTaskCommands(context, makeConfig());

      expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(4);
      expect(context.subscriptions).toHaveLength(4);
    });
  });
});
