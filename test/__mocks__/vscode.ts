type ChangeHandler<T> = (value: T) => void;

export class Disposable {
  private disposed = false;

  constructor(private readonly onDispose?: () => void) {}

  dispose(): void {
    if (!this.disposed) {
      this.disposed = true;
      this.onDispose?.();
    }
  }

  get isDisposed(): boolean {
    return this.disposed;
  }
}

export class Position {
  constructor(readonly line: number, readonly character: number) {}
}

export class Range {
  constructor(readonly start: Position, readonly end: Position) {}
}

export class Selection {
  constructor(readonly anchor: Position, readonly active: Position) {}
}

export class CompletionItem {
  detail?: string;
  documentation?: string;
  insertText?: string;

  constructor(readonly label: string, readonly kind?: unknown) {}
}

export const CompletionItemKind = {
  Keyword: 13,
  Snippet: 15,
  Text: 0,
};

export class TextEdit {
  constructor(readonly range: Range, readonly newText: string) {}

  static replace(range: Range, newText: string): TextEdit {
    return new TextEdit(range, newText);
  }
}

export const Uri = {
  file: jest.fn((path: string): { fsPath: string } => ({ fsPath: path })),
};

export class DocumentSymbol {
  readonly children: DocumentSymbol[] = [];

  constructor(
    readonly name: string,
    readonly detail: string,
    readonly kind: unknown,
    readonly range: Range,
    readonly selectionRange: Range
  ) {}
}

export const SymbolKind = {
  Module: 2,
  Class: 4,
  Method: 6,
  Property: 7,
};

export class FoldingRange {
  constructor(readonly start: number, readonly end: number, readonly kind?: unknown) {}
}

export interface DecorationOptions {
  range: Range;
  hoverMessage?: string;
}

export interface TextEditorDecorationType {
  key: string;
  dispose(): void;
}

interface EditorLike {
  document: {
    languageId: string;
    getText(): string;
    lineAt(line: number): { text: string; lineNumber: number };
    positionAt(offset: number): Position;
  };
  selection: { active: Position };
  edit(
    callback: (builder: { insert(position: Position, text: string): void }) => void
  ): Thenable<boolean>;
  setDecorations(decorationType: TextEditorDecorationType, decorations: DecorationOptions[]): void;
  revealRange(range: Range, revealType?: unknown): void;
}

interface DocumentChangeEventLike {
  document: unknown;
}

interface ConfigurationChangeEventLike {
  affectsConfiguration(section: string): boolean;
}

const activeEditorHandlers: Array<ChangeHandler<EditorLike | undefined>> = [];
const documentChangeHandlers: Array<ChangeHandler<DocumentChangeEventLike>> = [];
const configurationChangeHandlers: Array<ChangeHandler<ConfigurationChangeEventLike>> = [];

let decorationCounter = 0;
const createdDecorationTypes: TextEditorDecorationType[] = [];

let configurationStore: Record<string, unknown> = {};

export const window = {
  activeTextEditor: undefined as EditorLike | undefined,

  createTextEditorDecorationType: jest.fn((): TextEditorDecorationType => {
    const type: TextEditorDecorationType = {
      key: `decoration-${++decorationCounter}`,
      dispose: jest.fn(),
    };
    createdDecorationTypes.push(type);
    return type;
  }),

  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  showInformationMessage: jest.fn(),
  showQuickPick: jest.fn((): Thenable<unknown> => Promise.resolve(undefined)),
  showTextDocument: jest.fn((): Thenable<unknown> => Promise.resolve({})),

  onDidChangeActiveTextEditor: jest.fn(
    (handler: ChangeHandler<EditorLike | undefined>): Disposable => {
      activeEditorHandlers.push(handler);
      return new Disposable(() => {
        const index = activeEditorHandlers.indexOf(handler);
        if (index >= 0) {
          activeEditorHandlers.splice(index, 1);
        }
      });
    }
  ),
};

export const workspace = {
  getConfiguration: jest.fn((section: string) => ({
    get: jest.fn((key: string) => configurationStore[`${section}.${key}`]),
  })),

  openTextDocument: jest.fn((): Thenable<unknown> => Promise.resolve({})),

  onDidChangeTextDocument: jest.fn(
    (handler: ChangeHandler<DocumentChangeEventLike>): Disposable => {
      documentChangeHandlers.push(handler);
      return new Disposable(() => {
        const index = documentChangeHandlers.indexOf(handler);
        if (index >= 0) {
          documentChangeHandlers.splice(index, 1);
        }
      });
    }
  ),

  onDidChangeConfiguration: jest.fn(
    (handler: ChangeHandler<ConfigurationChangeEventLike>): Disposable => {
      configurationChangeHandlers.push(handler);
      return new Disposable(() => {
        const index = configurationChangeHandlers.indexOf(handler);
        if (index >= 0) {
          configurationChangeHandlers.splice(index, 1);
        }
      });
    }
  ),
};

export const commands = {
  registerCommand: jest.fn((_command: string, _callback: () => void): Disposable => {
    return new Disposable();
  }),
};

export const languages = {
  registerCompletionItemProvider: jest.fn(
    (_selector: string, _provider: unknown, ..._triggers: string[]): Disposable => {
      return new Disposable();
    }
  ),

  registerDocumentFormattingEditProvider: jest.fn(
    (_selector: string, _provider: unknown): Disposable => {
      return new Disposable();
    }
  ),

  registerDocumentSymbolProvider: jest.fn(
    (_selector: string, _provider: unknown): Disposable => {
      return new Disposable();
    }
  ),

  registerFoldingRangeProvider: jest.fn(
    (_selector: string, _provider: unknown): Disposable => {
      return new Disposable();
    }
  ),
};

export const TextEditorRevealType = {
  InCenter: 2,
};

export function getCreatedDecorationTypes(): TextEditorDecorationType[] {
  return createdDecorationTypes;
}

export function setConfiguration(values: Record<string, unknown>): void {
  configurationStore = { ...configurationStore, ...values };
}

export function clearConfiguration(): void {
  configurationStore = {};
}

export function emitConfigurationChange(changedKeys: string[]): void {
  const event: ConfigurationChangeEventLike = {
    affectsConfiguration: (section: string) =>
      changedKeys.some((key) => key === section || key.startsWith(`${section}.`)),
  };

  for (const handler of configurationChangeHandlers) {
    handler(event);
  }
}

export function emitActiveEditorChange(editor: EditorLike | undefined): void {
  for (const handler of activeEditorHandlers) {
    handler(editor);
  }
}

export function emitDocumentChange(event: DocumentChangeEventLike): void {
  for (const handler of documentChangeHandlers) {
    handler(event);
  }
}

export function resetVscodeMock(): void {
  window.activeTextEditor = undefined;
  window.createTextEditorDecorationType.mockClear();
  window.showErrorMessage.mockClear();
  window.showWarningMessage.mockClear();
  window.showInformationMessage.mockClear();
  window.showQuickPick.mockClear().mockImplementation(() => Promise.resolve(undefined));
  window.onDidChangeActiveTextEditor.mockClear();
  workspace.getConfiguration.mockClear();
  workspace.onDidChangeTextDocument.mockClear();
  workspace.onDidChangeConfiguration.mockClear();
  workspace.openTextDocument.mockClear().mockImplementation(() => Promise.resolve({}));
  commands.registerCommand.mockClear();
  languages.registerCompletionItemProvider.mockClear();
  languages.registerDocumentFormattingEditProvider.mockClear();
  languages.registerDocumentSymbolProvider.mockClear();
  languages.registerFoldingRangeProvider.mockClear();
  window.showTextDocument.mockClear().mockImplementation(() => Promise.resolve({}));
  Uri.file.mockClear().mockImplementation((path: string) => ({ fsPath: path }));
  createdDecorationTypes.length = 0;
  activeEditorHandlers.length = 0;
  documentChangeHandlers.length = 0;
  configurationChangeHandlers.length = 0;
  configurationStore = {};
}
