import { formatDocumentText, registerFormattingProvider } from "../src/format";
import * as vscode from "vscode";
import { createMockEditor } from "./helpers";
import { resetVscodeMock } from "./__mocks__/vscode";

describe("formatDocumentText", () => {
  it("trims trailing whitespace from every line", () => {
    expect(formatDocumentText("una línea   \nsegunda línea\t\n")).toBe(
      "una línea\nsegunda línea\n"
    );
  });

  it("collapses runs of blank lines into a single blank line", () => {
    expect(formatDocumentText("a\n\n\n\nb")).toBe("a\n\nb\n");
  });

  it("removes leading blank lines", () => {
    expect(formatDocumentText("\n\n\ncontenido")).toBe("contenido\n");
  });

  it("strips trailing blank lines and ends with exactly one newline", () => {
    expect(formatDocumentText("contenido\n\n\n")).toBe("contenido\n");
    expect(formatDocumentText("sin salto final")).toBe("sin salto final\n");
  });

  it("keeps already-formatted text unchanged", () => {
    const text = "a\n\nb\n";

    expect(formatDocumentText(text)).toBe(text);
  });

  it("returns empty text unchanged", () => {
    expect(formatDocumentText("")).toBe("");
  });
});

describe("formatting provider", () => {
  beforeEach(() => {
    resetVscodeMock();
  });

  it("registers one provider per supported language", () => {
    const context = {
      subscriptions: [] as vscode.Disposable[],
    } as unknown as vscode.ExtensionContext;

    registerFormattingProvider(context);

    expect(vscode.languages.registerDocumentFormattingEditProvider).toHaveBeenCalledTimes(2);
    expect(vscode.languages.registerDocumentFormattingEditProvider).toHaveBeenCalledWith(
      "easy",
      expect.anything()
    );
    expect(vscode.languages.registerDocumentFormattingEditProvider).toHaveBeenCalledWith(
      "plaintext",
      expect.anything()
    );
    expect(context.subscriptions).toHaveLength(2);
  });

  it("returns a full-document TextEdit when the text needs formatting", () => {
    registerFormattingProvider({
      subscriptions: [],
    } as unknown as vscode.ExtensionContext);
    const { editor } = createMockEditor(["con espacios   ", "", "", "", "más"]);
    const provider = (vscode.languages.registerDocumentFormattingEditProvider as jest.Mock).mock
      .calls[0][1] as {
      provideDocumentFormattingEdits(document: unknown): unknown[];
    };

    const edits = provider.provideDocumentFormattingEdits(
      (editor as unknown as { document: unknown }).document
    ) as Array<{ range: { start: unknown; end: unknown }; newText: string }>;

    expect(edits).toHaveLength(1);
    expect(edits[0].newText).toBe("con espacios\n\nmás\n");
    expect(edits[0].range.end).toMatchObject({ line: 4 });
  });

  it("returns no edits when the document is already formatted", () => {
    registerFormattingProvider({
      subscriptions: [],
    } as unknown as vscode.ExtensionContext);
    const { editor } = createMockEditor(["ya formateado\n"]);
    const provider = (vscode.languages.registerDocumentFormattingEditProvider as jest.Mock).mock
      .calls[0][1] as {
      provideDocumentFormattingEdits(document: unknown): unknown[];
    };

    expect(
      provider.provideDocumentFormattingEdits(
        (editor as unknown as { document: unknown }).document
      )
    ).toHaveLength(0);
  });
});
