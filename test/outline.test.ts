import {
  computeDocumentSymbols,
  computeFoldingRanges,
  registerOutlineProviders,
} from "../src/outline";
import { createDefaultConfig } from "../src/config";
import type { EasyLanguageConfig } from "../src/types";
import * as vscode from "vscode";
import { createMockEditor } from "./helpers";
import { resetVscodeMock } from "./__mocks__/vscode";

const DOCUMENT = [
  "Tema: Proyecto",
  "#todo algo pendiente",
  "# Intro",
  "texto de la intro",
  "## Punto uno",
  "más texto",
  "### Detalle",
  "detalle",
  "## Punto dos",
];

function makeConfig(overrides: Partial<EasyLanguageConfig> = {}): () => EasyLanguageConfig {
  const config: EasyLanguageConfig = { ...createDefaultConfig(), ...overrides };
  return () => config;
}

describe("computeDocumentSymbols", () => {
  it("builds the heading hierarchy with block ranges", () => {
    const symbols = computeDocumentSymbols(DOCUMENT);

    expect(symbols).toEqual([
      { name: "Proyecto", level: 1, lineNumber: 0, nameLength: 14, endLineNumber: 8 },
      { name: "Intro", level: 2, lineNumber: 2, nameLength: 7, endLineNumber: 8 },
      { name: "Punto uno", level: 3, lineNumber: 4, nameLength: 12, endLineNumber: 7 },
      { name: "Detalle", level: 4, lineNumber: 6, nameLength: 11, endLineNumber: 7 },
      { name: "Punto dos", level: 3, lineNumber: 8, nameLength: 12, endLineNumber: 8 },
    ]);
  });

  it("does not treat tags as headings", () => {
    const symbols = computeDocumentSymbols(["#todo tarea", "#alta urgente"]);

    expect(symbols).toEqual([]);
  });

  it("excludes custom tags passed by the caller", () => {
    const symbols = computeDocumentSymbols(["#urgente revisar"], ["urgente"]);

    expect(symbols).toEqual([]);
  });

  it("treats unknown hashes as titles", () => {
    const symbols = computeDocumentSymbols(["#otro titulo"]);

    expect(symbols.map((symbol) => symbol.name)).toEqual(["otro titulo"]);
  });

  it("falls back to Tema: when the theme line has no content", () => {
    const symbols = computeDocumentSymbols(["Tema:"]);

    expect(symbols[0]).toMatchObject({ name: "Tema:", level: 1 });
  });

  it("trims heading names", () => {
    const symbols = computeDocumentSymbols(["#   titulo con espacios   "]);

    expect(symbols[0].name).toBe("titulo con espacios");
  });

  it("returns no symbols for an empty document", () => {
    expect(computeDocumentSymbols([])).toEqual([]);
  });
});

describe("computeFoldingRanges", () => {
  it("folds every heading block with content, keeping headings visible", () => {
    const ranges = computeFoldingRanges(computeDocumentSymbols(DOCUMENT));

    expect(ranges).toEqual([
      { startLine: 0, endLine: 8 },
      { startLine: 2, endLine: 8 },
      { startLine: 4, endLine: 7 },
      { startLine: 6, endLine: 7 },
    ]);
  });

  it("skips empty blocks (heading followed by a sibling heading)", () => {
    const symbols = computeDocumentSymbols(["# una", "# dos"]);

    expect(computeFoldingRanges(symbols)).toEqual([]);
  });

  it("returns no ranges for documents without headings", () => {
    expect(computeFoldingRanges(computeDocumentSymbols(["texto"]))).toEqual([]);
  });
});

describe("outline providers", () => {
  beforeEach(() => {
    resetVscodeMock();
  });

  function getProviders(): {
    symbols: { provideDocumentSymbols(document: unknown): unknown[] };
    folding: { provideFoldingRanges(document: unknown): unknown[] };
  } {
    const calls = vscode.languages as unknown as Record<string, jest.Mock>;
    return {
      symbols: calls.registerDocumentSymbolProvider.mock.calls[0][1],
      folding: calls.registerFoldingRangeProvider.mock.calls[0][1],
    };
  }

  function register(): void {
    registerOutlineProviders(
      { subscriptions: [] } as unknown as vscode.ExtensionContext,
      makeConfig({ customTags: [{ tag: "urgente", backgroundColor: "#FF00FF" }] })
    );
  }

  it("registers both providers for easy and plaintext", () => {
    const context = {
      subscriptions: [] as vscode.Disposable[],
    } as unknown as vscode.ExtensionContext;

    registerOutlineProviders(context, makeConfig());

    expect(vscode.languages.registerDocumentSymbolProvider).toHaveBeenCalledTimes(2);
    expect(vscode.languages.registerFoldingRangeProvider).toHaveBeenCalledTimes(2);
    expect(vscode.languages.registerDocumentSymbolProvider).toHaveBeenCalledWith(
      "easy",
      expect.anything()
    );
    expect(context.subscriptions).toHaveLength(4);
  });

  it("maps symbols to DocumentSymbol instances with ranges", () => {
    register();
    const { editor } = createMockEditor(DOCUMENT);
    const { symbols } = getProviders();

    const result = symbols.provideDocumentSymbols(
      (editor as unknown as { document: unknown }).document
    ) as Array<vscode.DocumentSymbol>;

    expect(result).toHaveLength(5);
    expect(result[0]).toBeInstanceOf(vscode.DocumentSymbol);
    expect(result[0].name).toBe("Proyecto");
    expect(result[0].kind).toBe(vscode.SymbolKind.Module);
    expect(result[0].range).toMatchObject({ start: { line: 0 }, end: { line: 8 } });
    expect(result[1].kind).toBe(vscode.SymbolKind.Class);
    expect(result[2].kind).toBe(vscode.SymbolKind.Method);
    expect(result[3].kind).toBe(vscode.SymbolKind.Property);
    expect(result[3].selectionRange).toMatchObject({
      start: { line: 6, character: 0 },
      end: { line: 6, character: 11 },
    });
  });

  it("respects custom tags when computing document symbols", () => {
    register();
    const { editor } = createMockEditor(["#urgente revisar"]);
    const { symbols } = getProviders();

    const result = symbols.provideDocumentSymbols(
      (editor as unknown as { document: unknown }).document
    ) as unknown[];

    expect(result).toHaveLength(0);
  });

  it("maps folding ranges to FoldingRange instances", () => {
    register();
    const { editor } = createMockEditor(DOCUMENT);
    const { folding } = getProviders();

    const result = folding.provideFoldingRanges(
      (editor as unknown as { document: unknown }).document
    ) as Array<vscode.FoldingRange>;

    expect(result).toHaveLength(4);
    expect(result[0]).toBeInstanceOf(vscode.FoldingRange);
    expect(result[0]).toMatchObject({ start: 0, end: 8 });
    expect(result[1]).toMatchObject({ start: 2, end: 8 });
  });
});
