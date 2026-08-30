import {
  PRIORITY_TAG_NAMES,
  STATE_TAG_NAMES,
  STAT_TAG_NAMES,
  classifyDeadline,
  computeStatePriorityMatrix,
  collectTaskDeadlines,
  computeTaskStats,
  countTotalTasks,
  cycleTaskStatus,
  extractDueDate,
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

describe("task deadlines", () => {
  const TODAY = new Date(2026, 8, 1);

  describe("extractDueDate", () => {
    it("returns the first date found in the line", () => {
      expect(extractDueDate("#todo pagar 2026-09-15", "YYYY-MM-DD")).toEqual(new Date(2026, 8, 15));
      expect(extractDueDate("#todo pagar 15/09/2026", "DD/MM/YYYY")).toEqual(new Date(2026, 8, 15));
    });

    it("returns null when the line has no date", () => {
      expect(extractDueDate("#todo sin fecha", "YYYY-MM-DD")).toBeNull();
    });
  });

  describe("classifyDeadline", () => {
    it("classifies overdue, today, upcoming and later", () => {
      expect(classifyDeadline(new Date(2026, 7, 30), TODAY)).toEqual({
        status: "overdue",
        daysUntil: -2,
      });
      expect(classifyDeadline(new Date(2026, 8, 1), TODAY)).toEqual({
        status: "today",
        daysUntil: 0,
      });
      expect(classifyDeadline(new Date(2026, 8, 5), TODAY)).toEqual({
        status: "upcoming",
        daysUntil: 4,
      });
      expect(classifyDeadline(new Date(2026, 11, 1), TODAY)).toEqual({
        status: "later",
        daysUntil: 91,
      });
    });
  });

  describe("collectTaskDeadlines", () => {
    it("collects only task lines that have dates, sorted by date", () => {
      const lines = [
        "#todo primera 2026-09-10",
        "texto sin tareas 2026-01-01",
        "#doing segunda 2026-09-03",
        "#done tercera sin fecha",
      ];

      const deadlines = collectTaskDeadlines(lines, STAT_TAG_NAMES, "YYYY-MM-DD", TODAY);

      expect(deadlines.map((deadline) => deadline.text)).toEqual([
        "#doing segunda 2026-09-03",
        "#todo primera 2026-09-10",
      ]);
      expect(deadlines[0].status).toBe("upcoming");
      expect(deadlines[1].status).toBe("later");
    });

    it("reports overdue tasks with negative days", () => {
      const deadlines = collectTaskDeadlines(
        ["#todo vencida 2026-08-30"],
        STAT_TAG_NAMES,
        "YYYY-MM-DD",
        TODAY
      );

      expect(deadlines[0]).toMatchObject({ status: "overdue", daysUntil: -2 });
    });
  });
});

describe("computeStatePriorityMatrix", () => {
  it("counts only lines that combine a state and a priority", () => {
    const lines = [
      "#todo #alta primera",
      "#todo #baja segunda",
      "#todo #baja tercera",
      "#doing #media cuarta",
    ];

    expect(
      computeStatePriorityMatrix(lines, STATE_TAG_NAMES, PRIORITY_TAG_NAMES)
    ).toEqual({
      todo: { alta: 1, baja: 2 },
      doing: { media: 1 },
    });
  });

  it("skips lines with only a state or only a priority", () => {
    const lines = ["#todo sin prioridad", "#alta sin estado", "texto plano"];

    expect(computeStatePriorityMatrix(lines, STATE_TAG_NAMES, PRIORITY_TAG_NAMES)).toEqual({});
  });

  it("follows the canonical order of the state and priority lists", () => {
    const lines = ["#doing #todo #media #alta mezcla"];

    expect(computeStatePriorityMatrix(lines, STATE_TAG_NAMES, PRIORITY_TAG_NAMES)).toEqual({
      todo: { alta: 1 },
    });
  });

  it("covers every built-in state and priority", () => {
    const lines = [
      "#todo #alta a",
      "#doing #media b",
      "#done #baja c",
      "#blocked #alta d",
      "#waiting #media e",
    ];

    const matrix = computeStatePriorityMatrix(lines, STATE_TAG_NAMES, PRIORITY_TAG_NAMES);

    expect(Object.keys(matrix).sort()).toEqual(["blocked", "doing", "done", "todo", "waiting"]);
  });

  it("returns an empty matrix for documents without combined tasks", () => {
    expect(computeStatePriorityMatrix([], STATE_TAG_NAMES, PRIORITY_TAG_NAMES)).toEqual({});
  });
});

describe("cycleTaskStatus", () => {
  it("inserts #todo after leading whitespace on a plain line", () => {
    expect(cycleTaskStatus("comprar pan")).toEqual([
      { start: 0, end: 0, text: "#todo " },
    ]);
    expect(cycleTaskStatus("   comprar pan")).toEqual([
      { start: 3, end: 3, text: "#todo " },
    ]);
  });

  it("inserts #todo after a leading checkbox or check symbol", () => {
    expect(cycleTaskStatus("□ llamar a Juan")).toEqual([
      { start: 2, end: 2, text: "#todo " },
    ]);
    // 🗸 is an astral character (2 UTF-16 units)
    expect(cycleTaskStatus("🗸 llamar a Juan")).toEqual([
      { start: 3, end: 3, text: "#todo " },
    ]);
  });

  it("advances todo → doing and doing → done", () => {
    expect(cycleTaskStatus("#todo primera")).toEqual([
      { start: 0, end: 5, text: "#doing" },
    ]);
    expect(cycleTaskStatus("#doing segunda")).toEqual([
      { start: 0, end: 6, text: "#done" },
    ]);
  });

  it("removes #done together with one adjacent space", () => {
    expect(cycleTaskStatus("#done terminada")).toEqual([{ start: 0, end: 6, text: "" }]);
    expect(cycleTaskStatus("tarea #done")).toEqual([{ start: 5, end: 11, text: "" }]);
    expect(cycleTaskStatus("#done")).toEqual([{ start: 0, end: 5, text: "" }]);
  });

  it("reactivates blocked and waiting as todo", () => {
    expect(cycleTaskStatus("#blocked revisar")).toEqual([
      { start: 0, end: 8, text: "#todo" },
    ]);
    expect(cycleTaskStatus("#waiting revisar")).toEqual([
      { start: 0, end: 8, text: "#todo" },
    ]);
  });

  it("syncs a leading checkbox to a check when reaching done", () => {
    expect(cycleTaskStatus("□ #doing llamar a Juan")).toEqual([
      { start: 2, end: 8, text: "#done" },
      { start: 0, end: 1, text: "🗸" },
    ]);
  });

  it("does not touch an existing check symbol when reaching done", () => {
    expect(cycleTaskStatus("🗸 #doing llamar a Juan")).toEqual([
      { start: 3, end: 9, text: "#done" },
    ]);
  });

  it("leaves the symbol untouched when leaving done", () => {
    expect(cycleTaskStatus("🗸 #done terminada")).toEqual([{ start: 3, end: 9, text: "" }]);
  });

  it("does not confuse longer words that start with a state tag", () => {
    expect(cycleTaskStatus("#todoX algo")).toEqual([{ start: 0, end: 0, text: "#todo " }]);
  });
});
