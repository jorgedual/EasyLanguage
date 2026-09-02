import type { DateFormat, DeadlineStatus, TaskDeadlineInfo, TaskLineInfo } from "../types";
import { differenceInDays, findDateMatches } from "../dates";

/** Tag names counted by the statistics command (custom tags are appended at runtime). */
export const STAT_TAG_NAMES: readonly string[] = [
  "todo",
  "doing",
  "done",
  "blocked",
  "waiting",
  "alta",
  "media",
  "baja",
  "task",
  "validar",
  "check",
];

/** Built-in state tags (what a task is: its workflow position). */
export const STATE_TAG_NAMES: readonly string[] = ["todo", "doing", "done", "blocked", "waiting"];

/** States traversed by the cycle command, in order. */
export const CYCLE_STATE_ORDER: readonly string[] = ["todo", "doing", "done"];

/** A character-range replacement within a single line (offsets are 0-based). */
export interface LineTextEdit {
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

const STATE_TAG_PATTERN = /#(todo|doing|done|blocked|waiting)\b/;

function leadingSymbolEnd(line: string): number {
  const trimmed = line.trimStart();
  const leadingWhitespace = line.length - trimmed.length;
  // 🗸 is astral (2 UTF-16 units), □ is not — measure with the symbol itself
  const symbol = trimmed.startsWith("🗸") ? "🗸" : trimmed.startsWith("□") ? "□" : undefined;

  if (symbol) {
    let end = leadingWhitespace + symbol.length;
    if (line[end] === " ") {
      end += 1;
    }
    return end;
  }

  return leadingWhitespace;
}

/**
 * Computes the edits that advance the line's task state one step:
 * `(sin estado) → #todo → #doing → #done → (quita el tag)`. `#blocked` and
 * `#waiting` are reactivated to `#todo`. When reaching `#done`, a leading `□`
 * is synced to `🗸`; when leaving `#done`, the symbol is left untouched.
 * Returns character-range replacements for the original line.
 */
export function cycleTaskStatus(line: string): LineTextEdit[] {
  const match = line.match(STATE_TAG_PATTERN);

  if (!match || match.index === undefined) {
    const insertAt = leadingSymbolEnd(line);
    return [{ start: insertAt, end: insertAt, text: "#todo " }];
  }

  const current = match[1];
  const tagStart = match.index;
  const tagEnd = match.index + match[0].length;

  if (current === "done") {
    let start = tagStart;
    let end = tagEnd;
    if (line[end] === " ") {
      end += 1;
    } else if (start > 0 && line[start - 1] === " ") {
      start -= 1;
    }
    return [{ start, end, text: "" }];
  }

  const next =
    current === "todo" ? "doing" : current === "doing" ? "done" : "todo";

  const edits: LineTextEdit[] = [{ start: tagStart, end: tagEnd, text: `#${next}` }];

  if (next === "done") {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("□")) {
      const symbolStart = line.length - trimmed.length;
      edits.push({ start: symbolStart, end: symbolStart + 1, text: "🗸" });
    }
  }

  return edits;
}

/** Built-in priority tags (how urgent a task is). */
export const PRIORITY_TAG_NAMES: readonly string[] = ["alta", "media", "baja"];

/** Counts occurrences of each `#tag` in `text`, returning a tag → count record. */
export function computeTaskStats(
  text: string,
  tagNames: readonly string[]
): Record<string, number> {
  const stats: Record<string, number> = {};

  for (const tagName of tagNames) {
    const matches = text.match(new RegExp(`#${tagName}`, "g"));
    stats[tagName] = matches ? matches.length : 0;
  }

  return stats;
}

/** Sums every per-tag count into a single total. */
export function countTotalTasks(stats: Record<string, number>): number {
  return Object.values(stats).reduce((total, count) => total + count, 0);
}

/** Returns every line (with 0-based number, text, and matched tags) containing at least one task tag. */
export function findTaskLines(
  lines: readonly string[],
  tagNames: readonly string[]
): TaskLineInfo[] {
  const taskLines: TaskLineInfo[] = [];

  lines.forEach((line, index) => {
    const tags = tagNames.filter((tagName) => new RegExp(`#${tagName}`).test(line));

    if (tags.length > 0) {
      taskLines.push({ lineNumber: index, text: line, tags });
    }
  });

  return taskLines;
}

/** Finds the first task line located after `currentLine`, or undefined. */
export function findNextTaskLine(
  currentLine: number,
  taskLines: readonly TaskLineInfo[]
): TaskLineInfo | undefined {
  return taskLines.find((taskLine) => taskLine.lineNumber > currentLine);
}

/** Finds the closest task line located before `currentLine`, or undefined. */
export function findPrevTaskLine(
  currentLine: number,
  taskLines: readonly TaskLineInfo[]
): TaskLineInfo | undefined {
  const candidates = taskLines.filter((taskLine) => taskLine.lineNumber < currentLine);
  return candidates.length > 0 ? candidates[candidates.length - 1] : undefined;
}

/**
 * Cross-tabulates state × priority tag usage, line by line. Only lines that
 * carry BOTH a state tag and a priority tag are counted (each contributing to
 * its first listed state and first listed priority). Rows are states, columns
 * are priorities; only non-zero combinations are included.
 */
export function computeStatePriorityMatrix(
  lines: readonly string[],
  states: readonly string[],
  priorities: readonly string[]
): Record<string, Record<string, number>> {
  const matrix: Record<string, Record<string, number>> = {};

  for (const line of lines) {
    const state = states.find((tagName) => new RegExp(`#${tagName}`).test(line));
    const priority = priorities.find((tagName) => new RegExp(`#${tagName}`).test(line));

    if (!state || !priority) {
      continue;
    }

    const row = matrix[state] ?? (matrix[state] = {});
    row[priority] = (row[priority] ?? 0) + 1;
  }

  return matrix;
}

/** Returns the first valid date found in the line (any supported format), or null. */
export function extractDueDate(line: string, dateFormat: DateFormat): Date | null {
  const matches = findDateMatches(line, dateFormat);
  return matches.length > 0 ? matches[0].date : null;
}

/** Classifies a due date against `today`: overdue, today, upcoming (≤7 days), or later. */
export function classifyDeadline(
  dueDate: Date,
  today: Date
): { status: DeadlineStatus; daysUntil: number } {
  const daysUntil = differenceInDays(dueDate, today);
  const status: DeadlineStatus =
    daysUntil < 0 ? "overdue" : daysUntil === 0 ? "today" : daysUntil <= 7 ? "upcoming" : "later";
  return { status, daysUntil };
}

/**
 * Collects task lines that contain a date, classified by deadline status and
 * sorted by due date ascending. `today` defaults to now (injectable for tests).
 */
export function collectTaskDeadlines(
  lines: readonly string[],
  tagNames: readonly string[],
  dateFormat: DateFormat,
  today: Date = new Date()
): TaskDeadlineInfo[] {
  const deadlines: TaskDeadlineInfo[] = [];

  for (const taskLine of findTaskLines(lines, tagNames)) {
    const dueDate = extractDueDate(taskLine.text, dateFormat);

    if (!dueDate) {
      continue;
    }

    const { status, daysUntil } = classifyDeadline(dueDate, today);
    deadlines.push({ ...taskLine, dueDate, status, daysUntil });
  }

  return deadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}
