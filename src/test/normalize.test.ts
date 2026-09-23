import { describe, it, expect } from "vitest";
import { normalizeSchool, parseFeeRange, toApiBoard, toApiHandle, toApiLevel } from "@/lib/normalize";
import { gradeFor, feeRange } from "@/lib/grading";
import { schools } from "@/data/schools";

/**
 * The normalizer is the seam between the platform API's Phase 1 vocabulary and the UI.
 * These lock the translation both ways.
 */
describe("normalizeSchool", () => {
  const apiRecord = {
    schID: 7,
    name: "Tanzania Institute of Education",
    location: "Dar es Salaam",
    region: "Dar es Salaam",
    level: "O-LEVEL",
    category: "SECONDARY",
    isBoard: 1,
    handle: "MIXED",
    feeRange: "500000-800000",
    phone: "+255123456789",
    email: "school@example.com",
    capacity: 500,
    programOffered: "Science, Arts, Business",
  };

  it("maps the API vocabulary onto the UI shape", () => {
    const school = normalizeSchool(apiRecord);

    expect(school.id).toBe("7");
    expect(school.levels).toEqual(["O-Level"]);
    expect(school.gender).toBe("Mixed");
    expect(school.boardingDay).toBe("Boarding");
    expect(school.tuitionMin).toBe(500_000);
    expect(school.tuitionMax).toBe(800_000);
    expect(school.programs).toEqual(["Science", "Arts", "Business"]);
  });

  it("fills the fields the API does not send, so cards still render", () => {
    const school = normalizeSchool(apiRecord);

    expect(school.rating).toBe(0);
    expect(school.performance.divisionI).toBe(0);
    expect(school.facilities).toEqual([]);
    expect(school.image).toBeTruthy();
  });

  it("reads both level codes and an explicit levels array", () => {
    expect(normalizeSchool({ ...apiRecord, level: "BOTH" }).levels).toEqual(["O-Level", "A-Level"]);
    expect(normalizeSchool({ ...apiRecord, level: "A-LEVEL" }).levels).toEqual(["A-Level"]);
    expect(normalizeSchool({ ...apiRecord, levels: ["A-Level"] }).levels).toEqual(["A-Level"]);
  });

  it("reads boarding from isBoard, including the 'both' code", () => {
    expect(normalizeSchool({ ...apiRecord, isBoard: 0 }).boardingDay).toBe("Day");
    expect(normalizeSchool({ ...apiRecord, isBoard: 2 }).boardingDay).toBe("Both");
  });

  it("keeps ids stable so a photo does not change between renders", () => {
    expect(normalizeSchool(apiRecord).image).toBe(normalizeSchool(apiRecord).image);
  });
});

describe("parseFeeRange", () => {
  it("splits a range", () => {
    expect(parseFeeRange("500000-800000")).toEqual([500_000, 800_000]);
  });

  it("treats a single figure as both ends", () => {
    expect(parseFeeRange("750000")).toEqual([750_000, 750_000]);
  });

  it("survives missing or malformed values", () => {
    expect(parseFeeRange(undefined)).toEqual([0, 0]);
    expect(parseFeeRange("TZS 1,200,000 kwa mwaka")).toEqual([1_200_000, 1_200_000]);
  });
});

describe("query vocabulary", () => {
  it("translates UI filter values to API codes", () => {
    expect(toApiLevel("A-Level")).toBe("A-LEVEL");
    expect(toApiHandle("Girls")).toBe("GIRLS");
    expect(toApiBoard("Boarding")).toBe(1);
    expect(toApiBoard("Day")).toBe(0);
    expect(toApiLevel(undefined)).toBeUndefined();
  });
});

describe("grading", () => {
  it("gives the same letter for the same numbers", () => {
    const [school] = schools;
    expect(gradeFor(school)).toBe(gradeFor({ ...school, id: "other" }));
  });

  it("ranks a stronger school at least as high", () => {
    const order = ["B-", "B", "B+", "A-", "A", "A+"];
    const base = schools[0];
    const stronger = { ...base, performance: { ...base.performance, divisionI: 95 }, rating: 5 };
    const weaker = { ...base, performance: { ...base.performance, divisionI: 20 }, rating: 2 };

    expect(order.indexOf(gradeFor(stronger))).toBeGreaterThan(order.indexOf(gradeFor(weaker)));
  });

  it("formats fees in millions", () => {
    expect(feeRange(1_500_000, 2_200_000)).toBe("TZS 1.5M – 2.2M");
    expect(feeRange(2_000_000, 2_000_000)).toBe("TZS 2M");
  });
});
