import * as vscode from "vscode";
import { buildTituloPattern, RESERVED_TAG_NAMES } from "../patterns";

const SUPPORTED_LANGUAGES: readonly string[] = ["easy", "plaintext"];

const SYMBOL_KINDS: Readonly<Record<number, vscode.SymbolKind>> = {
  1: vscode.SymbolKind.Module,
  2: vscode.SymbolKind.Class,
  3: vscode.SymbolKind.Method,
  4: vscode.SymbolKind.Property,
};

/** A heading parsed from the document, with its resolved block range. */
export interface OutlineSymbol {
  /** Heading text (after `Tema:`/hashes, trimmed). */
  readonly name: string;
  /** 1 = `Tema:`, 2 = `#`, 3 = `##`, 4 = `###`. */
  readonly level: number;
  /** 0-based line of the heading. */
  readonly lineNumber: number;
  /** Length of the heading line (used as the symbol selection range). */
  readonly nameLength: number;
  /** Last line (inclusive) of the heading's block. */
  readonly endLineNumber: number;
}

/** Inclusive line range to fold (the heading line stays visible when collapsed). */
export interface OutlineRange {
  readonly startLine: number;
  readonly endLine: number;
}

const TEMA_LINE = /^Tema:\s*(.*)$/;
const LEVEL3_LINE = /^###(.*)$/;
const LEVEL2_LINE = /^##([^#].*)$/;

interface HeadingMatch {
  readonly name: string;
  readonly level: number;
  readonly lineNumber: number;
  readonly nameLength: number;
}

function parseHeading(
  line: string,
  lineNumber: number,
  tituloPattern: RegExp
): HeadingMatch | undefined {
  const tema = line.match(TEMA_LINE);
  if (tema) {
    return {
      name: tema[1].trim() || "Tema:",
      level: 1,
      lineNumber,
      nameLength: line.length,
    };
  }

  // Order matters: ### before ## before # (each regex is already exclusive).
  const level3 = line.match(LEVEL3_LINE);
  if (level3) {
    return { name: level3[1].trim(), level: 4, lineNumber, nameLength: line.length };
  }

  const level2 = line.match(LEVEL2_LINE);
  if (level2) {
    return { name: level2[1].trim(), level: 3, lineNumber, nameLength: line.length };
  }

  const level1 = line.match(tituloPattern);
  if (level1) {
    return { name: level1[1].trim(), level: 2, lineNumber, nameLength: line.length };
  }

  return undefined;
}

/**
 * Parses headings into an outline: `Tema:` = level 1, `#`/`##`/`###` = 2-4.
 * `#tag` lines (built-in tags and `customTagNames`) are headings, not tags —
 * they never become symbols. A heading's block ends right before the next
 * heading of the same or higher level, or at the end of the document.
 */
export function computeDocumentSymbols(
  lines: readonly string[],
  customTagNames: readonly string[] = []
): OutlineSymbol[] {
  // buildTituloPattern returns a global regex; per-line matching needs groups,
  // so rebuild it without the g/m flags.
  const tituloLine = new RegExp(buildTituloPattern([...RESERVED_TAG_NAMES, ...customTagNames]).source);
  const headings: HeadingMatch[] = [];

  lines.forEach((line, index) => {
    const heading = parseHeading(line, index, tituloLine);
    if (heading) {
      headings.push(heading);
    }
  });

  const lastLine = Math.max(lines.length - 1, 0);

  return headings.map((heading, index) => {
    let end = lastLine;

    for (let next = index + 1; next < headings.length; next++) {
      if (headings[next].level <= heading.level) {
        end = headings[next].lineNumber - 1;
        break;
      }
    }

    return { ...heading, endLineNumber: Math.max(end, heading.lineNumber) };
  });
}

/**
 * Folding ranges for the given symbols: one per heading whose block has at
 * least one content line. Collapsing keeps the heading line visible.
 */
export function computeFoldingRanges(symbols: readonly OutlineSymbol[]): OutlineRange[] {
  return symbols
    .filter((symbol) => symbol.endLineNumber > symbol.lineNumber)
    .map((symbol) => ({ startLine: symbol.lineNumber, endLine: symbol.endLineNumber }));
}

/** Registers the outline (symbols) and folding providers for supported languages. */
export function registerOutlineProviders(
  context: vscode.ExtensionContext,
  getConfig: () => { customTags: readonly { tag: string }[] }
): void {
  function parseDocument(document: vscode.TextDocument): OutlineSymbol[] {
    const lines = document.getText().split("\n");
    const customTagNames = getConfig().customTags.map((customTag) => customTag.tag);
    return computeDocumentSymbols(lines, customTagNames);
  }

  const symbolProvider: vscode.DocumentSymbolProvider = {
    provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
      return parseDocument(document).map((symbol) => {
        const range = new vscode.Range(
          new vscode.Position(symbol.lineNumber, 0),
          new vscode.Position(
            symbol.endLineNumber,
            document.lineAt(symbol.endLineNumber).text.length
          )
        );
        const selectionRange = new vscode.Range(
          new vscode.Position(symbol.lineNumber, 0),
          new vscode.Position(symbol.lineNumber, symbol.nameLength)
        );

        return new vscode.DocumentSymbol(
          symbol.name,
          "",
          SYMBOL_KINDS[symbol.level],
          range,
          selectionRange
        );
      });
    },
  };

  const foldingProvider: vscode.FoldingRangeProvider = {
    provideFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
      return computeFoldingRanges(parseDocument(document)).map(
        (range) => new vscode.FoldingRange(range.startLine, range.endLine)
      );
    },
  };

  for (const language of SUPPORTED_LANGUAGES) {
    context.subscriptions.push(
      vscode.languages.registerDocumentSymbolProvider(language, symbolProvider)
    );
    context.subscriptions.push(
      vscode.languages.registerFoldingRangeProvider(language, foldingProvider)
    );
  }
}
