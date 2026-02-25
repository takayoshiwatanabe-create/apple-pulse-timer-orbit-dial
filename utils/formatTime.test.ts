import { describe, it, expect } from "@jest/globals";
import {
  formatSeconds,
  formatMinutes,
  getTodayDateString,
  getWeekStartDate,
} from "./formatTime";

describe("formatSeconds", () => {
  it("formats 0 seconds as 00:00", () => {
    expect(formatSeconds(0)).toBe("00:00");
  });

  it("formats seconds under a minute", () => {
    expect(formatSeconds(5)).toBe("00:05");
    expect(formatSeconds(30)).toBe("00:30");
    expect(formatSeconds(59)).toBe("00:59");
  });

  it("formats exact minutes", () => {
    expect(formatSeconds(60)).toBe("01:00");
    expect(formatSeconds(300)).toBe("05:00");
    expect(formatSeconds(600)).toBe("10:00");
  });

  it("formats minutes and seconds", () => {
    expect(formatSeconds(65)).toBe("01:05");
    expect(formatSeconds(125)).toBe("02:05");
    expect(formatSeconds(1500)).toBe("25:00");
  });

  it("formats large values over an hour", () => {
    expect(formatSeconds(3600)).toBe("60:00");
    expect(formatSeconds(3661)).toBe("61:01");
  });
});

describe("formatMinutes", () => {
  it("formats minutes under an hour with m suffix", () => {
    expect(formatMinutes(1)).toBe("1m");
    expect(formatMinutes(25)).toBe("25m");
    expect(formatMinutes(59)).toBe("59m");
  });

  it("formats exact hours", () => {
    expect(formatMinutes(60)).toBe("1h");
    expect(formatMinutes(120)).toBe("2h");
  });

  it("formats hours and minutes", () => {
    expect(formatMinutes(90)).toBe("1h 30m");
    expect(formatMinutes(125)).toBe("2h 5m");
    expect(formatMinutes(61)).toBe("1h 1m");
  });
});

describe("getTodayDateString", () => {
  it("returns a string in YYYY-MM-DD format", () => {
    const result = getTodayDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("matches today's date", () => {
    const result = getTodayDateString();
    const expected = new Date().toISOString().split("T")[0];
    expect(result).toBe(expected);
  });
});

describe("getWeekStartDate", () => {
  it("returns a string in YYYY-MM-DD format", () => {
    const result = getWeekStartDate();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a Monday", () => {
    const result = getWeekStartDate();
    const day = new Date(result + "T12:00:00").getDay();
    expect(day).toBe(1);
  });
});
