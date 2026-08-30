import type { DateFormat, DeadlineStatus, TaskDeadlineInfo, TaskLineInfo } from "../types";
import { differenceInDays, findDateMatches } from "../dates";

/** Tag names counted by the statistics command (custom tags are appended at runtime). */
export const STAT_TAG_NAMES: readonly string[] = [
  "todo",
  "doing",
  "done",
  "alta",
  "media",
  "task",
  "validar",
  "check",
];

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
