import {
  createDefaultConfig,
  isValidColor,
  loadConfig,
  parseCustomTags,
  watchConfig,
} from "../src/config";
import * as vscode from "vscode";
import {
  clearConfiguration,
  emitConfigurationChange,
  resetVscodeMock,
  setConfiguration,
} from "./__mocks__/vscode";

describe("config", () => {
  beforeEach(() => {
    resetVscodeMock();
    clearConfiguration();
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createDefaultConfig", () => {
    it("returns the documented defaults", () => {
      const config = createDefaultConfig();

      expect(config.decorationUpdateDelay).toBe(300);
      expect(config.dateFormat).toBe("YYYY-MM-DD");
      expect(config.disabledDecorations.size).toBe(0);
      expect(config.customTags).toEqual([]);
    });
  });

  describe("isValidColor", () => {
    it("accepts hex colors", () => {
      expect(isValidColor("#FFF")).toBe(true);
      expect(isValidColor("#FF0000")).toBe(true);
      expect(isValidColor("#FF0000AA")).toBe(true);
    });

    it("rejects non-hex values", () => {
      expect(isValidColor("red")).toBe(false);
      expect(isValidColor("rgb(1, 2, 3)")).toBe(false);
      expect(isValidColor(42)).toBe(false);
      expect(isValidColor(undefined)).toBe(false);
    });
  });

  describe("parseCustomTags", () => {
    it("returns an empty list for non-array values", () => {
      expect(parseCustomTags(undefined)).toEqual([]);
      expect(parseCustomTags("nope")).toEqual([]);
      expect(parseCustomTags({})).toEqual([]);
    });

    it("parses valid custom tags", () => {
      const tags = parseCustomTags([
        { tag: "urgente", backgroundColor: "#FF00FF" },
        { tag: "#revisar", backgroundColor: "#123456", foregroundColor: "#FFFFFF" },
      ]);

      expect(tags).toEqual([
        { tag: "urgente", backgroundColor: "#FF00FF" },
        {
          tag: "revisar",
          backgroundColor: "#123456",
          foregroundColor: "#FFFFFF",
        },
      ]);
    });

    it("keeps hoverMessage when provided", () => {
      const tags = parseCustomTags([
        { tag: "urgente", backgroundColor: "#FF00FF", hoverMessage: "Urgente" },
      ]);

      expect(tags[0].hoverMessage).toBe("Urgente");
    });

    it("skips entries with invalid names", () => {
      const tags = parseCustomTags([
        { tag: "con espacios", backgroundColor: "#FF00FF" },
        { tag: 42, backgroundColor: "#FF00FF" },
        "not-an-object",
      ]);

      expect(tags).toEqual([]);
      expect(vscode.window.showWarningMessage).toHaveBeenCalledTimes(2);
    });

    it("skips entries with invalid background colors", () => {
      const tags = parseCustomTags([{ tag: "urgente", backgroundColor: "rojo" }]);

      expect(tags).toEqual([]);
      expect(vscode.window.showWarningMessage).toHaveBeenCalledTimes(1);
    });

    it("drops invalid foreground colors but keeps the tag", () => {
      const tags = parseCustomTags([
        { tag: "urgente", backgroundColor: "#FF00FF", foregroundColor: "azul" },
      ]);

      expect(tags).toEqual([{ tag: "urgente", backgroundColor: "#FF00FF" }]);
    });
  });

  describe("loadConfig", () => {
    it("returns defaults when no settings exist", () => {
      expect(loadConfig()).toEqual(createDefaultConfig());
    });

    it("reads all settings from the configuration store", () => {
      setConfiguration({
        "easyLanguage.decorationUpdateDelay": 50,
        "easyLanguage.dateFormat": "DD/MM/YYYY",
        "easyLanguage.decorations.disabled": ["todo", "doing"],
        "easyLanguage.decorations.backgroundColor": { todo: "#FF0000" },
        "easyLanguage.decorations.foregroundColor": { done: "#FFFFFF" },
        "easyLanguage.customTags": [{ tag: "urgente", backgroundColor: "#FF00FF" }],
        "easyLanguage.completions.enabled": false,
        "easyLanguage.recurringTaskDays": 7,
      });

      const config = loadConfig();

      expect(config.decorationUpdateDelay).toBe(50);
      expect(config.dateFormat).toBe("DD/MM/YYYY");
      expect(config.disabledDecorations.has("todo")).toBe(true);
      expect(config.disabledDecorations.has("doing")).toBe(true);
      expect(config.backgroundColorOverrides).toEqual({ todo: "#FF0000" });
      expect(config.foregroundColorOverrides).toEqual({ done: "#FFFFFF" });
      expect(config.customTags).toEqual([{ tag: "urgente", backgroundColor: "#FF00FF" }]);
      expect(config.completionsEnabled).toBe(false);
      expect(config.recurringTaskDays).toBe(7);
    });

    it("falls back to defaults for invalid values", () => {
      setConfiguration({
        "easyLanguage.decorationUpdateDelay": -10,
        "easyLanguage.dateFormat": "no-un-formato",
        "easyLanguage.decorations.disabled": ["todo", 42],
        "easyLanguage.decorations.backgroundColor": { todo: "no-color", done: "#00FF00" },
      });

      const config = loadConfig();

      expect(config.decorationUpdateDelay).toBe(300);
      expect(config.dateFormat).toBe("YYYY-MM-DD");
      expect(config.disabledDecorations.has("todo")).toBe(true);
      expect(config.disabledDecorations.has("42")).toBe(false);
      expect(config.backgroundColorOverrides).toEqual({ done: "#00FF00" });
    });

    it("falls back to defaults for invalid completions and recurrence settings", () => {
      setConfiguration({
        "easyLanguage.completions.enabled": "sí",
        "easyLanguage.recurringTaskDays": 0,
      });

      const config = loadConfig();

      expect(config.completionsEnabled).toBe(true);
      expect(config.recurringTaskDays).toBe(1);
    });
  });

  describe("watchConfig", () => {
    it("invokes the callback when an easyLanguage setting changes", () => {
      const callback = jest.fn();
      watchConfig(callback);

      emitConfigurationChange(["easyLanguage.dateFormat"]);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("ignores changes to unrelated settings", () => {
      const callback = jest.fn();
      watchConfig(callback);

      emitConfigurationChange(["editor.fontSize"]);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
