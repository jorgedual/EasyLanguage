import { debounce, getCurrentDate, disposeAll, isSupportedLanguage, logError, logInfo, safeExecute, validateEditor } from "../src/utils";
import * as vscode from "vscode";
import { createMockEditor } from "./helpers";

describe("utils", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe("debounce", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it("delays execution until the delay has elapsed", () => {
      const callback = jest.fn();
      const debounced = debounce(callback, 300);

      debounced();
      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("collapses multiple calls into a single execution", () => {
      const callback = jest.fn();
      const debounced = debounce(callback, 300);

      debounced();
      debounced();
      debounced();

      jest.advanceTimersByTime(300);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("restarts the timer on each call", () => {
      const callback = jest.fn();
      const debounced = debounce(callback, 300);

      debounced();
      jest.advanceTimersByTime(200);
      debounced();
      jest.advanceTimersByTime(200);
      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("forwards arguments to the callback", () => {
      const callback = jest.fn();
      const debounced = debounce(callback, 100);

      debounced();
      jest.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledWith();
    });
  });

  describe("getCurrentDate", () => {
    it("returns a date in YYYY-MM-DD format", () => {
      expect(getCurrentDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("pads month and day with zeros", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 0, 5));

      expect(getCurrentDate()).toBe("2026-01-05");
    });
  });

  describe("validateEditor", () => {
    it("rejects undefined editors", () => {
      expect(validateEditor(undefined)).toBe(false);
    });

    it("rejects editors without a document", () => {
      expect(validateEditor({ document: undefined } as never)).toBe(false);
    });

    it("accepts editors with a document", () => {
      const { editor } = createMockEditor(["hola"]);
      expect(validateEditor(editor)).toBe(true);
    });
  });

  describe("isSupportedLanguage", () => {
    it("accepts easy and plaintext", () => {
      expect(isSupportedLanguage("easy")).toBe(true);
      expect(isSupportedLanguage("plaintext")).toBe(true);
    });

    it("rejects other languages", () => {
      expect(isSupportedLanguage("javascript")).toBe(false);
      expect(isSupportedLanguage("typescript")).toBe(false);
    });

    it("rejects undefined language ids", () => {
      expect(isSupportedLanguage(undefined)).toBe(false);
    });
  });

  describe("safeExecute", () => {
    it("returns the callback result on success", () => {
      expect(safeExecute(() => 42, "test")).toBe(42);
    });

    it("returns null and shows an error message on failure", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

      const result = safeExecute(() => {
        throw new Error("boom");
      }, "test");

      expect(result).toBeNull();
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("EasyLanguage: boom");
      expect(consoleSpy).toHaveBeenCalledWith(
        "EasyLanguage: Error during test",
        expect.objectContaining({ message: "boom" })
      );
    });

    it("handles non-Error throwables", () => {
      jest.spyOn(console, "error").mockImplementation(() => undefined);

      const result = safeExecute(() => {
        throw "plain failure";
      }, "test");

      expect(result).toBeNull();
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "EasyLanguage: plain failure"
      );
    });
  });

  describe("logInfo", () => {
    it("logs the message with the extension prefix", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

      logInfo("hello");

      expect(consoleSpy).toHaveBeenCalledWith("EasyLanguage: hello");
    });

    it("appends serialized data when provided", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

      logInfo("hello", { count: 3 });

      expect(consoleSpy).toHaveBeenCalledWith('EasyLanguage: hello {"count":3}');
    });
  });

  describe("logError", () => {
    it("logs the message with the extension prefix", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

      logError("something failed");

      expect(consoleSpy).toHaveBeenCalledWith("EasyLanguage: something failed");
    });

    it("appends the error message and stack when provided", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
      const error = new Error("boom");

      logError("something failed", error);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("EasyLanguage: something failed boom")
      );
    });
  });

  describe("disposeAll", () => {
    it("disposes every disposable", () => {
      const first = { dispose: jest.fn() };
      const second = { dispose: jest.fn() };

      disposeAll([first as vscode.Disposable, second as vscode.Disposable]);

      expect(first.dispose).toHaveBeenCalledTimes(1);
      expect(second.dispose).toHaveBeenCalledTimes(1);
    });

    it("continues disposing when one disposable throws", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
      const failing = {
        dispose: jest.fn(() => {
          throw new Error("dispose failed");
        }),
      };
      const working = { dispose: jest.fn() };

      disposeAll([failing as vscode.Disposable, working as vscode.Disposable]);

      expect(working.dispose).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        "EasyLanguage: Error disposing resource",
        expect.objectContaining({ message: "dispose failed" })
      );
    });
  });
});
