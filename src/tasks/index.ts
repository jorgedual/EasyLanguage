import type { TaskLineInfo } from "../types";

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
