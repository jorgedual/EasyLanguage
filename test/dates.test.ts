import {
  addDays,
  advanceDatesInText,
  differenceInDays,
  findDateMatches,
  formatDateValue,
  parseDateValue,
  startOfDay,
} from "../src/dates";

describe("dates", () => {
  describe("parseDateValue", () => {
    it("parses YYYY-MM-DD regardless of the configured format", () => {
      expect(parseDateValue("2026-09-01", "DD/MM/YYYY")).toEqual(new Date(2026, 8, 1));
      expect(parseDateValue("2026-09-01", "MM/DD/YYYY")).toEqual(new Date(2026, 8, 1));
    });

    it("parses YYYY/MM/DD", () => {
      expect(parseDateValue("2026/09/01", "YYYY/MM/DD")).toEqual(new Date(2026, 8, 1));
    });

    it("interprets slash dates as DD/MM/YYYY by default", () => {
      expect(parseDateValue("01/09/2026", "DD/MM/YYYY")).toEqual(new Date(2026, 8, 1));
    });

    it("interprets slash dates as MM/DD/YYYY when configured", () => {
      expect(parseDateValue("01/09/2026", "MM/DD/YYYY")).toEqual(new Date(2026, 0, 9));
    });

    it("returns null for invalid calendar dates", () => {
      expect(parseDateValue("2026-02-30", "YYYY-MM-DD")).toBeNull();
      expect(parseDateValue("32/01/2026", "DD/MM/YYYY")).toBeNull();
    });

    it("returns null for non-date text", () => {
      expect(parseDateValue("sin fecha", "YYYY-MM-DD")).toBeNull();
      expect(parseDateValue("", "YYYY-MM-DD")).toBeNull();
      expect(parseDateValue("2026-9", "YYYY-MM-DD")).toBeNull();
    });
  });

  describe("formatDateValue", () => {
    it("formats the date for every supported format", () => {
      const date = new Date(2026, 8, 1);

      expect(formatDateValue(date, "YYYY-MM-DD")).toBe("2026-09-01");
      expect(formatDateValue(date, "DD/MM/YYYY")).toBe("01/09/2026");
      expect(formatDateValue(date, "MM/DD/YYYY")).toBe("09/01/2026");
      expect(formatDateValue(date, "YYYY/MM/DD")).toBe("2026/09/01");
    });
  });

  describe("addDays / startOfDay / differenceInDays", () => {
    it("adds days across month boundaries", () => {
      expect(addDays(new Date(2026, 7, 30), 3)).toEqual(new Date(2026, 8, 2));
      expect(addDays(new Date(2026, 0, 1), -1)).toEqual(new Date(2025, 11, 31));
    });

    it("normalizes to midnight and computes whole-day differences", () => {
      const withTime = new Date(2026, 8, 1, 15, 45);

      expect(startOfDay(withTime)).toEqual(new Date(2026, 8, 1));
      expect(differenceInDays(new Date(2026, 8, 4), withTime)).toBe(3);
      expect(differenceInDays(withTime, new Date(2026, 8, 4))).toBe(-3);
    });
  });

  describe("findDateMatches", () => {
    it("finds dates in any supported format", () => {
      const matches = findDateMatches(
        "vence 2026-09-01 y luego 05/10/2026",
        "DD/MM/YYYY"
      );

      expect(matches).toHaveLength(2);
      expect(matches[0]).toMatchObject({ index: 6, length: 10 });
      expect(matches[0].date).toEqual(new Date(2026, 8, 1));
      expect(matches[1].date).toEqual(new Date(2026, 9, 5));
    });

    it("skips invalid calendar dates", () => {
      const matches = findDateMatches("fecha 2026-02-30", "YYYY-MM-DD");

      expect(matches).toHaveLength(0);
    });

    it("does not match digits embedded in longer numbers", () => {
      const matches = findDateMatches("id 12026-09-011", "YYYY-MM-DD");

      expect(matches).toHaveLength(0);
    });
  });

  describe("advanceDatesInText", () => {
    it("advances every date preserving surrounding text", () => {
      expect(advanceDatesInText("#todo pagar - 2026-09-01", 7, "YYYY-MM-DD")).toBe(
        "#todo pagar - 2026-09-08"
      );
    });

    it("keeps the format of each original date", () => {
      expect(advanceDatesInText("01/09/2026", 1, "DD/MM/YYYY")).toBe("02/09/2026");
      expect(advanceDatesInText("09/01/2026", 1, "MM/DD/YYYY")).toBe("09/02/2026");
      expect(advanceDatesInText("2026/09/01", 1, "YYYY/MM/DD")).toBe("2026/09/02");
    });

    it("advances across month boundaries", () => {
      expect(advanceDatesInText("2026-08-31", 1, "YYYY-MM-DD")).toBe("2026-09-01");
    });

    it("leaves text without dates unchanged", () => {
      expect(advanceDatesInText("sin fechas aquí", 5, "YYYY-MM-DD")).toBe("sin fechas aquí");
    });

    it("advances multiple dates in one line", () => {
      expect(advanceDatesInText("2026-01-01 → 2026-12-31", 1, "YYYY-MM-DD")).toBe(
        "2026-01-02 → 2027-01-01"
      );
    });
  });
});
