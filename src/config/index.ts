import * as vscode from "vscode";
import type { CustomTagDefinition, DateFormat, EasyLanguageConfig } from "../types";

const CONFIG_SECTION = "easyLanguage";
const CUSTOM_TAG_NAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const DATE_FORMATS: readonly DateFormat[] = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY/MM/DD"];

export const DEFAULT_DECORATION_UPDATE_DELAY = 300;
export const DEFAULT_DATE_FORMAT: DateFormat = "YYYY-MM-DD";
export const DEFAULT_RECURRING_TASK_DAYS = 1;

/** Returns a config object with documented defaults (used for tests and fallbacks). */
export function createDefaultConfig(): EasyLanguageConfig {
  return {
    decorationUpdateDelay: DEFAULT_DECORATION_UPDATE_DELAY,
    dateFormat: DEFAULT_DATE_FORMAT,
    disabledDecorations: new Set<string>(),
    backgroundColorOverrides: {},
    foregroundColorOverrides: {},
    customTags: [],
    completionsEnabled: true,
    recurringTaskDays: DEFAULT_RECURRING_TASK_DAYS,
  };
}

/** Type guard for `#RGB`, `#RRGGBB`, and `#RRGGBBAA` color strings. */
export function isValidColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR_PATTERN.test(value);
}

function isValidCustomTagName(value: unknown): value is string {
  return typeof value === "string" && CUSTOM_TAG_NAME_PATTERN.test(value);
}

/**
 * Parses and validates raw `easyLanguage.customTags` entries.
 * Invalid tags or colors are skipped with a user-visible warning; a leading
 * `#` on the tag name is tolerated and stripped.
 */
export function parseCustomTags(raw: unknown): CustomTagDefinition[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const parsed: CustomTagDefinition[] = [];

  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) {
      continue;
    }

    const record = entry as Record<string, unknown>;
    const tag = typeof record.tag === "string" ? record.tag.replace(/^#/, "") : record.tag;

    if (!isValidCustomTagName(tag)) {
      logConfigWarning(`etiqueta personalizada inválida (se omite): ${JSON.stringify(record.tag)}`);
      continue;
    }

    if (!isValidColor(record.backgroundColor)) {
      logConfigWarning(
        `color de fondo inválido para #${tag} (se omite): ${JSON.stringify(record.backgroundColor)}`
      );
      continue;
    }

    const foregroundColor = isValidColor(record.foregroundColor)
      ? record.foregroundColor
      : undefined;

    const hoverMessage = typeof record.hoverMessage === "string" ? record.hoverMessage : undefined;

    parsed.push({
      tag,
      backgroundColor: record.backgroundColor,
      ...(foregroundColor !== undefined ? { foregroundColor } : {}),
      ...(hoverMessage !== undefined ? { hoverMessage } : {}),
    });
  }

  return parsed;
}

function logConfigWarning(message: string): void {
  console.warn(`EasyLanguage: Configuración: ${message}`);
  void vscode.window.showWarningMessage(`EasyLanguage: ${message}`);
}

function parseUpdateDelay(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0) {
    return DEFAULT_DECORATION_UPDATE_DELAY;
  }

  return raw;
}

function parseDateFormat(raw: unknown): DateFormat {
  return DATE_FORMATS.includes(raw as DateFormat) ? (raw as DateFormat) : DEFAULT_DATE_FORMAT;
}

function parseRecurringTaskDays(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 1) {
    return DEFAULT_RECURRING_TASK_DAYS;
  }

  return raw;
}

function parseBoolean(raw: unknown, fallback: boolean): boolean {
  return typeof raw === "boolean" ? raw : fallback;
}

function parseStringSet(raw: unknown): Set<string> {
  if (!Array.isArray(raw)) {
    return new Set<string>();
  }

  return new Set(raw.filter((value): value is string => typeof value === "string"));
}

function parseColorOverrides(raw: unknown): Record<string, string> {
  if (typeof raw !== "object" || raw === null) {
    return {};
  }

  const overrides: Record<string, string> = {};

  for (const [name, value] of Object.entries(raw as Record<string, unknown>)) {
    if (isValidColor(value)) {
      overrides[name] = value;
    }
  }

  return overrides;
}

/**
 * Loads and validates all settings from the `easyLanguage` section.
 * Invalid values fall back to their documented defaults.
 */
export function loadConfig(): EasyLanguageConfig {
  const configuration = vscode.workspace.getConfiguration(CONFIG_SECTION);

  return {
    decorationUpdateDelay: parseUpdateDelay(configuration.get("decorationUpdateDelay")),
    dateFormat: parseDateFormat(configuration.get("dateFormat")),
    disabledDecorations: parseStringSet(configuration.get("decorations.disabled")),
    backgroundColorOverrides: parseColorOverrides(
      configuration.get("decorations.backgroundColor")
    ),
    foregroundColorOverrides: parseColorOverrides(
      configuration.get("decorations.foregroundColor")
    ),
    customTags: parseCustomTags(configuration.get("customTags")),
    completionsEnabled: parseBoolean(configuration.get("completions.enabled"), true),
    recurringTaskDays: parseRecurringTaskDays(configuration.get("recurringTaskDays")),
  };
}

/** Subscribes `callback` to configuration changes affecting the `easyLanguage` section only. */
export function watchConfig(callback: () => void): vscode.Disposable {
  return vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(CONFIG_SECTION)) {
      callback();
    }
  });
}
