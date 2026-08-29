import {
  STAT_TAG_NAMES,
  computeTaskStats,
  countTotalTasks,
  findNextTaskLine,
  findPrevTaskLine,
  findTaskLines,
} from "../src/tasks";

const SAMPLE_LINES = [
  "Tema: documento de prueba",
  "#todo primera tarea",
  "texto plano",
  "#doing tarea en curso #alta",
  "#done completada",
  "### subsección",
  "#todo segunda tarea",
];

describe("tasks", () => {
  describe("computeTaskStats", () => {
    it("counts occurrences per tag", () => {
      const text = "#todo a\n#todo b\n#doing c\n#done d";

      const stats = computeTaskStats(text, STAT_TAG_NAMES);

      expect(stats.todo).toBe(2);
      expect(stats.doing).toBe(1);
      expect(stats.done).toBe(1);
      expect(stats.alta).toBe(0);
    });

    it("returns zero for every tag on empty text", () => {
      const stats = computeTaskStats("", STAT_TAG_NAMES);

      expect(Object.values(stats).every((count) => count === 0)).toBe(true);
    });

    it("includes custom tags", () => {
      const stats = computeTaskStats("#urgente x #urgente y", [...STAT_TAG_NAMES, "urgente"]);

      expect(stats.urgente).toBe(2);
    });
  });

  describe("countTotalTasks", () => {
    it("sums all tag counts", () => {
      expect(countTotalTasks({ todo: 3, doing: 2, done: 5 })).toBe(10);
    });

    it("returns zero for empty stats", () => {
      expect(countTotalTasks({})).toBe(0);
    });
  });

  describe("findTaskLines", () => {
    it("returns only lines containing task tags", () => {
      const taskLines = findTaskLines(SAMPLE_LINES, STAT_TAG_NAMES);

      expect(taskLines.map((taskLine) => taskLine.lineNumber)).toEqual([1, 3, 4, 6]);
    });

    it("collects all tags present on a line", () => {
      const taskLines = findTaskLines(SAMPLE_LINES, STAT_TAG_NAMES);
      const doingLine = taskLines.find((taskLine) => taskLine.lineNumber === 3);

      expect(doingLine?.tags).toEqual(["doing", "alta"]);
      expect(doingLine?.text).toBe("#doing tarea en curso #alta");
    });

    it("returns an empty list when no lines match", () => {
      expect(findTaskLines(["solo texto", "Tema: sin tareas"], STAT_TAG_NAMES)).toEqual([]);
    });
  });

  describe("findNextTaskLine", () => {
    it("returns the closest task line after the current line", () => {
      const taskLines = findTaskLines(SAMPLE_LINES, STAT_TAG_NAMES);

      expect(findNextTaskLine(0, taskLines)?.lineNumber).toBe(1);
      expect(findNextTaskLine(1, taskLines)?.lineNumber).toBe(3);
      expect(findNextTaskLine(4, taskLines)?.lineNumber).toBe(6);
    });

    it("returns undefined past the last task line", () => {
      const taskLines = findTaskLines(SAMPLE_LINES, STAT_TAG_NAMES);

      expect(findNextTaskLine(6, taskLines)).toBeUndefined();
    });
  });

  describe("findPrevTaskLine", () => {
    it("returns the closest task line before the current line", () => {
      const taskLines = findTaskLines(SAMPLE_LINES, STAT_TAG_NAMES);

      expect(findPrevTaskLine(6, taskLines)?.lineNumber).toBe(4);
      expect(findPrevTaskLine(4, taskLines)?.lineNumber).toBe(3);
    });

    it("returns undefined before the first task line", () => {
      const taskLines = findTaskLines(SAMPLE_LINES, STAT_TAG_NAMES);

      expect(findPrevTaskLine(1, taskLines)).toBeUndefined();
      expect(findPrevTaskLine(0, taskLines)).toBeUndefined();
    });
  });
});
