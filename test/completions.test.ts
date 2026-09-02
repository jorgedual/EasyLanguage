import {
  buildTagCompletions,
  detectCompletionContext,
  registerCompletionProviders,
  toCompletionItems,
} from "../src/completions";
import { createDefaultConfig } from "../src/config";
import type { CustomTagDefinition, EasyLanguageConfig } from "../src/types";
import * as vscode from "vscode";
import { resetVscodeMock } from "./__mocks__/vscode";

function makeConfig(overrides: Partial<EasyLanguageConfig> = {}): () => EasyLanguageConfig {
  const config: EasyLanguageConfig = { ...createDefaultConfig(), ...overrides };
  return () => config;
}

describe("detectCompletionContext", () => {
  it("detects a tag prefix", () => {
    expect(detectCompletionContext("#")).toBe("tag");
    expect(detectCompletionContext("#to")).toBe("tag");
    expect(detectCompletionContext("texto #do")).toBe("tag");
  });

  it("detects the start of a line", () => {
    expect(detectCompletionContext("")).toBe("lineStart");
    expect(detectCompletionContext("   ")).toBe("lineStart");
    expect(detectCompletionContext("primera línea\n")).toBe("lineStart");
  });

  it("detects contexts without suggestions", () => {
    expect(detectCompletionContext("texto normal")).toBe("none");
    expect(detectCompletionContext("Tema: algo")).toBe("none");
  });
});

describe("buildTagCompletions", () => {
  it("lists every built-in tag with its description", () => {
    const completions = buildTagCompletions([]);

    expect(completions.map((completion) => completion.label)).toEqual([
      "#todo",
      "#doing",
      "#done",
      "#blocked",
      "#waiting",
      "#alta",
      "#media",
      "#baja",
      "#task",
      "#validar",
      "#check",
    ]);
    expect(completions[0]).toMatchObject({
      insertText: "todo ",
      detail: "Tarea pendiente",
      kind: "tag",
    });
    expect(completions[5]).toMatchObject({ detail: "Prioridad alta" });
    expect(completions[7]).toMatchObject({ detail: "Prioridad baja" });
    expect(completions[3]).toMatchObject({ detail: "Tarea bloqueada" });
  });

  it("appends custom tags with their hover message as documentation", () => {
    const customTags: CustomTagDefinition[] = [
      { tag: "urgente", backgroundColor: "#FF00FF", hoverMessage: "Revisar ya" },
    ];

    const completions = buildTagCompletions(customTags);

    expect(completions[completions.length - 1]).toEqual({
      label: "#urgente",
      insertText: "urgente ",
      detail: "Etiqueta personalizada",
      documentation: "Revisar ya",
      kind: "tag",
    });
  });
});

describe("toCompletionItems", () => {
  it("maps data to VS Code completion items", () => {
    const [item] = toCompletionItems([
      { label: "#todo", insertText: "todo ", detail: "Tarea pendiente", kind: "tag" },
    ]);

    expect(item).toBeInstanceOf(vscode.CompletionItem);
    expect(item.label).toBe("#todo");
    expect(item.insertText).toBe("todo ");
    expect(item.detail).toBe("Tarea pendiente");
  });
});

describe("registerCompletionProviders", () => {
  beforeEach(() => {
    resetVscodeMock();
  });

  function getProvider(): {
    provideCompletionItems(document: unknown, position: vscode.Position): { items: unknown[] };
  } {
    return (vscode.languages.registerCompletionItemProvider as jest.Mock).mock.calls[0][1];
  }

  function fakeDocument(lines: string[]): unknown {
    return { lineAt: (line: number) => ({ text: lines[line] ?? "" }) };
  }

  it("registers one provider per supported language with the # trigger", () => {
    const context = {
      subscriptions: [] as vscode.Disposable[],
    } as unknown as vscode.ExtensionContext;

    registerCompletionProviders(context, makeConfig());

    expect(vscode.languages.registerCompletionItemProvider).toHaveBeenCalledTimes(2);
    expect(vscode.languages.registerCompletionItemProvider).toHaveBeenCalledWith(
      "easy",
      expect.anything(),
      "#"
    );
    expect(context.subscriptions).toHaveLength(2);
  });

  it("returns tag completions after a #", () => {
    registerCompletionProviders(
      { subscriptions: [] } as unknown as vscode.ExtensionContext,
      makeConfig()
    );

    const result = getProvider().provideCompletionItems(fakeDocument(["#"]), new vscode.Position(0, 1));

    expect(result.items).toHaveLength(11);
  });

  it("includes custom tags in the suggestions", () => {
    registerCompletionProviders(
      { subscriptions: [] } as unknown as vscode.ExtensionContext,
      makeConfig({ customTags: [{ tag: "urgente", backgroundColor: "#FF00FF" }] })
    );

    const result = getProvider().provideCompletionItems(fakeDocument(["#"]), new vscode.Position(0, 1));

    expect(result.items).toHaveLength(12);
  });

  it("returns line-start suggestions on an empty line", () => {
    registerCompletionProviders(
      { subscriptions: [] } as unknown as vscode.ExtensionContext,
      makeConfig()
    );

    const result = getProvider().provideCompletionItems(fakeDocument([""]), new vscode.Position(0, 0));
    const labels = result.items.map(
      (item) => (item as vscode.CompletionItem).label
    );

    expect(labels).toEqual(["Tema:", "fecha:", ">>"]);
  });

  it("returns no suggestions mid-sentence", () => {
    registerCompletionProviders(
      { subscriptions: [] } as unknown as vscode.ExtensionContext,
      makeConfig()
    );

    const result = getProvider().provideCompletionItems(
      fakeDocument(["texto normal"]),
      new vscode.Position(0, 6)
    );

    expect(result.items).toHaveLength(0);
  });

  it("returns no suggestions when completions are disabled", () => {
    registerCompletionProviders(
      { subscriptions: [] } as unknown as vscode.ExtensionContext,
      makeConfig({ completionsEnabled: false })
    );

    const tagResult = getProvider().provideCompletionItems(fakeDocument(["#"]), new vscode.Position(0, 1));
    const lineResult = getProvider().provideCompletionItems(fakeDocument([""]), new vscode.Position(0, 0));

    expect(tagResult.items).toHaveLength(0);
    expect(lineResult.items).toHaveLength(0);
  });
});
