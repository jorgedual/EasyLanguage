import {
  filterTasks,
  nextTask,
  previousTask,
  registerTaskCommands,
  showDeadlines,
  repeatTask,
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
    it("registers all six task commands", () => {
      const context = {
        subscriptions: [] as vscode.Disposable[],
      } as unknown as vscode.ExtensionContext;

      registerTaskCommands(context, makeConfig());

      expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(6);
      expect(context.subscriptions).toHaveLength(6);
    });
  });
});

describe("phase 5 task commands", () => {
  beforeEach(() => {
    resetVscodeMock();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("showDeadlines", () => {
    const DATED_DOCUMENT = [
      "#todo vencida 2026-08-30",
      "#doing hoy 2026-09-01",
      "#done futura 2026-10-01",
    ];

    it("opens a QuickPick sorted by date with deadline descriptions", async () => {
      jest.useFakeTimers({ now: new Date(2026, 8, 1) });
      const { editor } = createMockEditor(DATED_DOCUMENT);
      vscode.window.activeTextEditor = editor;

      showDeadlines(makeConfig());

      expect(vscode.window.showQuickPick).toHaveBeenCalledTimes(1);
      const [items, options] = (vscode.window.showQuickPick as jest.Mock).mock.calls[0];

      expect(items).toHaveLength(3);
      expect(items[0].description).toContain("Vencida hace 2 día(s)");
      expect(items[1].description).toContain("Vence hoy");
      expect(items[2].description).toContain("En 30 días");
      expect(options.placeHolder).toContain("1 vencida(s), 1 hoy");
      jest.useRealTimers();
    });

    it("jumps to the selected deadline line", async () => {
      jest.useFakeTimers({ now: new Date(2026, 8, 1) });
      const { editor, getSelection } = createMockEditor(DATED_DOCUMENT, {
        cursor: { line: 0, character: 0 },
      });
      vscode.window.activeTextEditor = editor;
      (vscode.window.showQuickPick as jest.Mock).mockImplementation(() =>
        Promise.resolve({ lineNumber: 2 })
      );

      showDeadlines(makeConfig());
      await Promise.resolve();

      expect(getSelection()).toEqual({ line: 2, character: 0 });
      jest.useRealTimers();
    });

    it("notifies when no task has a date", () => {
      const { editor } = createMockEditor(["#todo sin fecha"]);
      vscode.window.activeTextEditor = editor;

      showDeadlines(makeConfig());

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "Easy: Ninguna tarea tiene fecha límite (añade una fecha como 2026-09-01)"
      );
      expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
    });

    it("shows an error when there is no active editor", () => {
      vscode.window.activeTextEditor = undefined;

      showDeadlines(makeConfig());

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("No hay editor activo");
    });
  });

  describe("repeatTask", () => {
    it("duplicates the current line below with the date advanced", () => {
      const { editor, insertCalls } = createMockEditor(
        ["#todo semanal 2026-09-01"],
        { cursor: { line: 0, character: 5 } }
      );
      vscode.window.activeTextEditor = editor;

      repeatTask(makeConfig({ recurringTaskDays: 7 }));

      expect(insertCalls).toEqual([
        { position: { line: 0, character: 24 }, text: "\n#todo semanal 2026-09-08" },
      ]);
    });

    it("uses one day by default and keeps lines without dates intact", () => {
      const { editor, insertCalls } = createMockEditor(["#todo diaria"], {
        cursor: { line: 0, character: 0 },
      });
      vscode.window.activeTextEditor = editor;

      repeatTask(makeConfig());

      expect(insertCalls).toEqual([{ position: { line: 0, character: 12 }, text: "\n#todo diaria" }]);
    });

    it("shows an error when there is no active editor", () => {
      vscode.window.activeTextEditor = undefined;

      repeatTask(makeConfig());

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("No hay editor activo");
    });
  });
});

describe("stats with state x priority breakdown", () => {
  beforeEach(() => {
    resetVscodeMock();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("appends the cross breakdown when lines combine state and priority", () => {
    const { editor } = createMockEditor([
      "#todo #alta primera",
      "#todo #baja segunda",
      "#todo #baja tercera",
      "#doing #media cuarta",
      "#todo sin prioridad",
    ]);
    vscode.window.activeTextEditor = editor;

    showTaskStats(makeConfig());

    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      "Easy: 9 tareas — #todo: 4  |  #doing: 1  |  #alta: 1  |  #media: 1  |  #baja: 2" +
        " — Cruce: todo+alta: 1  |  todo+baja: 2  |  doing+media: 1"
    );
  });

  it("includes new state and priority tags in the breakdown", () => {
    const { editor } = createMockEditor(["#blocked #baja esperando", "#waiting revisión"]);
    vscode.window.activeTextEditor = editor;

    showTaskStats(makeConfig());

    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      "Easy: 3 tareas — #blocked: 1  |  #waiting: 1  |  #baja: 1 — Cruce: blocked+baja: 1"
    );
  });
});
