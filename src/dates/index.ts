import type { DateFormat } from "../types";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const YEAR_FIRST_EXACT = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;
const DAY_FIRST_EXACT = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

const YEAR_FIRST_FIND = /(?<!\d)(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?!\d)/g;
const DAY_FIRST_FIND = /(?<!\d)(\d{1,2})\/(\d{1,2})\/(\d{4})(?!\d)/g;

export interface DateMatch {
  readonly index: number;
  readonly length: number;
  readonly date: Date;
  readonly render: (date: Date) => string;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function buildDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

/** Parses an exact date token: `YYYY-MM-DD`/`YYYY/MM/DD`, or `NN/NN/NNNN` interpreted per `dateFormat`. */
export function parseDateValue(raw: string, dateFormat: DateFormat): Date | null {
  const value = raw.trim();

  const yearFirst = value.match(YEAR_FIRST_EXACT);
  if (yearFirst) {
    return buildDate(Number(yearFirst[1]), Number(yearFirst[2]), Number(yearFirst[3]));
  }

  const dayFirst = value.match(DAY_FIRST_EXACT);
  if (dayFirst) {
    const first = Number(dayFirst[1]);
    const second = Number(dayFirst[2]);
    const year = Number(dayFirst[3]);
    return dateFormat === "MM/DD/YYYY"
      ? buildDate(year, first, second)
      : buildDate(year, second, first);
  }

  return null;
}

/** Formats a date using the given `DateFormat` token string. */
export function formatDateValue(date: Date, dateFormat: DateFormat): string {
  const year = date.getFullYear().toString();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return dateFormat
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day);
}

/** Returns a new date shifted by `days` (keeps time-of-day). */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MILLISECONDS_PER_DAY);
}

/** Returns a copy of the date normalized to midnight local time. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole-day difference `a - b`, ignoring time of day. */
export function differenceInDays(a: Date, b: Date): number {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / MILLISECONDS_PER_DAY);
}

/**
 * Finds all date occurrences in `text` (any supported format; `NN/NN/NNNN`
 * interpreted per `dateFormat`). Invalid calendar dates are skipped.
 */
export function findDateMatches(text: string, dateFormat: DateFormat): DateMatch[] {
  const matches: Array<{
    index: number;
    length: number;
    date: Date | null;
    render: (date: Date) => string;
  }> = [];

  for (const pattern of [YEAR_FIRST_FIND, DAY_FIRST_FIND]) {
    pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const [raw, first, second, third] = match;
      const isYearFirst = pattern === YEAR_FIRST_FIND;
      const separator = raw.includes("-") ? "-" : "/";

      const date = isYearFirst
        ? buildDate(Number(first), Number(second), Number(third))
        : dateFormat === "MM/DD/YYYY"
          ? buildDate(Number(third), Number(first), Number(second))
          : buildDate(Number(third), Number(second), Number(first));

      matches.push({
        index: match.index,
        length: raw.length,
        date,
        render: (value: Date): string =>
          isYearFirst
            ? `${value.getFullYear()}${separator}${pad(value.getMonth() + 1)}${separator}${pad(
                value.getDate()
              )}`
            : dateFormat === "MM/DD/YYYY"
              ? `${pad(value.getMonth() + 1)}${separator}${pad(value.getDate())}${separator}${value.getFullYear()}`
              : `${pad(value.getDate())}${separator}${pad(value.getMonth() + 1)}${separator}${value.getFullYear()}`,
      });
    }
  }

  return matches
    .filter((match) => match.date !== null)
    .sort((a, b) => a.index - b.index)
    .map((match) => ({ ...match, date: match.date as Date }));
}

/** Replaces every date in `text` with the same date shifted by `days`, preserving each date's format. */
export function advanceDatesInText(text: string, days: number, dateFormat: DateFormat): string {
  const matches = findDateMatches(text, dateFormat);

  let result = "";
  let lastIndex = 0;

  for (const match of matches) {
    result += text.slice(lastIndex, match.index);
    result += match.render(addDays(match.date, days));
    lastIndex = match.index + match.length;
  }

  result += text.slice(lastIndex);
  return result;
}
