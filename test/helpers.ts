import * as vscode from "vscode";

export interface MockEditorResult {
  editor: vscode.TextEditor;
  edit: jest.Mock;
  setDecorations: jest.Mock;
  revealRange: jest.Mock;
  insertCalls: Array<{ position: { line: number; character: number }; text: string }>;
  replaceCalls: Array<{
    start: { line: number; character: number };
    end: { line: number; character: number };
    text: string;
  }>;
  getSelection(): { line: number; character: number };
}

export function createMockEditor(
  lines: string[],
  options: {
    languageId?: string;
    cursor?: { line: number; character: number };
    fsPath?: string;
  } = {}
): MockEditorResult {
  const languageId = options.languageId ?? "easy";
  const cursor = options.cursor ?? { line: 0, character: 0 };
  const text = lines.join("\n");

  const insertCalls: MockEditorResult["insertCalls"] = [];
  const replaceCalls: MockEditorResult["replaceCalls"] = [];

  const document = {
    languageId,
    ...(options.fsPath !== undefined ? { uri: { fsPath: options.fsPath } } : {}),
    getText: () => text,
    lineCount: lines.length,
    lineAt: (line: number) => ({
      text: lines[line] ?? "",
      lineNumber: line,
    }),
    positionAt: (offset: number) => {
      const before = text.slice(0, offset);
      const parts = before.split("\n");
      return new vscode.Position(parts.length - 1, parts[parts.length - 1].length);
    },
  };

  const edit = jest.fn(
    (
      callback: (builder: {
        insert(position: vscode.Position, text: string): void;
        replace(location: vscode.Range | vscode.Position, text: string): void;
      }) => void
    ): Thenable<boolean> => {
      const builder = {
        insert: (position: vscode.Position, insertedText: string): void => {
          insertCalls.push({
            position: { line: position.line, character: position.character },
            text: insertedText,
          });
        },
        replace: (location: vscode.Range | vscode.Position, replacedText: string): void => {
          const range = location as {
            start: { line: number; character: number };
            end: { line: number; character: number };
          };
          replaceCalls.push({
            start: { line: range.start.line, character: range.start.character },
            end: { line: range.end.line, character: range.end.character },
            text: replacedText,
          });
        },
      };
      callback(builder);
      return Promise.resolve(true);
    }
  );

  const setDecorations = jest.fn();
  const revealRange = jest.fn();

  let selection = { active: new vscode.Position(cursor.line, cursor.character) };

  const getSelection = (): { line: number; character: number } => ({
    line: selection.active.line,
    character: selection.active.character,
  });

  const editor = {
    document,
    get selection() {
      return selection;
    },
    set selection(value: { active: vscode.Position }) {
      selection = value;
    },
    edit,
    setDecorations,
    revealRange,
  } as unknown as vscode.TextEditor;

  return { editor, edit, setDecorations, revealRange, insertCalls, replaceCalls, getSelection };
}
