import { exportToMarkdown } from "../src/commands/exportCommands";
import { writeFile } from "fs/promises";
import { createDefaultConfig } from "../src/config";
import type { EasyLanguageConfig } from "../src/types";
import * as vscode from "vscode";
import { createMockEditor } from "./helpers";
import { resetVscodeMock } from "./__mocks__/vscode";

jest.mock("fs/promises", () => ({ writeFile: jest.fn(() => Promise.resolve()) }));

function makeConfig(overrides: Partial<EasyLanguageConfig> = {}): () => EasyLanguageConfig {
  const config: EasyLanguageConfig = { ...createDefaultConfig(), ...overrides };
  return () => config;
}

describe("exportToMarkdown", () => {
  beforeEach(() => {
    resetVscodeMock();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("writes a .md file next to the .easy source", async () => {
    const { editor } = createMockEditor(["Tema: notas", "#todo tarea"], {
      fsPath: "/notas/diario.easy",
    });
    vscode.window.activeTextEditor = editor;
    (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue(undefined);

    exportToMarkdown(makeConfig());
    await Promise.resolve();
    await Promise.resolve();

    expect(writeFile).toHaveBeenCalledWith(
      "/notas/diario.md",
      "# notas\n**#todo** tarea",
      "utf8"
    );
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      "Easy: Exportado a /notas/diario.md",
      "Abrir"
    );
  });

  it("appends .md when the file does not end in .easy", async () => {
    const { editor } = createMockEditor(["texto"], { fsPath: "/notas/archivo" });
    vscode.window.activeTextEditor = editor;
    (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue(undefined);

    exportToMarkdown(makeConfig());
    await Promise.resolve();

    expect(writeFile).toHaveBeenCalledWith("/notas/archivo.md", "texto", "utf8");
  });

  it("opens the exported file when the user picks «Abrir»", async () => {
    const { editor } = createMockEditor(["texto"], { fsPath: "/notas/diario.easy" });
    vscode.window.activeTextEditor = editor;
    (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue("Abrir");

    exportToMarkdown(makeConfig());
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(vscode.Uri.file).toHaveBeenCalledWith("/notas/diario.md");
    expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith({ fsPath: "/notas/diario.md" });
    expect(vscode.window.showTextDocument).toHaveBeenCalled();
  });

  it("opens an untitled markdown buffer when the document has no path", async () => {
    const { editor } = createMockEditor(["#todo sin guardar"]);
    vscode.window.activeTextEditor = editor;

    exportToMarkdown(makeConfig());
    await Promise.resolve();

    expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith({
      content: "**#todo** sin guardar",
      language: "markdown",
    });
    expect(vscode.window.showTextDocument).toHaveBeenCalled();
  });

  it("rejects unsupported languages", () => {
    const { editor } = createMockEditor(["texto"], { languageId: "javascript" });
    vscode.window.activeTextEditor = editor;

    exportToMarkdown(makeConfig());

    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      "Easy: La exportación solo está disponible en archivos .easy"
    );
  });

  it("shows an error when there is no active editor", () => {
    vscode.window.activeTextEditor = undefined;

    exportToMarkdown(makeConfig());

    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("No hay editor activo");
  });
});
