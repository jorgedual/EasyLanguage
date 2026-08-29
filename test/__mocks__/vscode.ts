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
  edit(callback: (builder: { insert(position: Position, text: string): void }) => void): Thenable<boolean>;
  setDecorations(decorationType: TextEditorDecorationType, decorations: DecorationOptions[]): void;
}

interface DocumentChangeEventLike {
  document: unknown;
}

const activeEditorHandlers: Array<ChangeHandler<EditorLike | undefined>> = [];
const documentChangeHandlers: Array<ChangeHandler<DocumentChangeEventLike>> = [];

let decorationCounter = 0;
const createdDecorationTypes: TextEditorDecorationType[] = [];

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

  onDidChangeActiveTextEditor: jest.fn((handler: ChangeHandler<EditorLike | undefined>): Disposable => {
    activeEditorHandlers.push(handler);
    return new Disposable(() => {
      const index = activeEditorHandlers.indexOf(handler);
      if (index >= 0) {
        activeEditorHandlers.splice(index, 1);
      }
    });
  }),
};

export const workspace = {
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
};

export const commands = {
  registerCommand: jest.fn((_command: string, _callback: () => void): Disposable => {
    return new Disposable();
  }),
};

export function getCreatedDecorationTypes(): TextEditorDecorationType[] {
  return createdDecorationTypes;
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
  window.onDidChangeActiveTextEditor.mockClear();
  workspace.onDidChangeTextDocument.mockClear();
  commands.registerCommand.mockClear();
  createdDecorationTypes.length = 0;
  activeEditorHandlers.length = 0;
  documentChangeHandlers.length = 0;
}
