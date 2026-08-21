import { describe, expect, it } from "vitest";
import {
  isMixedUseZoning,
  isResidentialZoning,
  isSingleFamilyZoning,
} from "@/lib/rules/zoning-class";

describe("zoning-class", () => {
  it("treats RH-1(D) as residential and single-family", () => {
    expect(isResidentialZoning("RH-1(D)")).toBe(true);
    expect(isSingleFamilyZoning("RH-1(D)")).toBe(true);
    expect(isMixedUseZoning("RH-1(D)")).toBe(false);
  });

  it("treats RH-2 as residential but not single-family", () => {
    expect(isResidentialZoning("RH-2")).toBe(true);
    expect(isSingleFamilyZoning("RH-2")).toBe(false);
  });

  it("treats NCT and CMUO as mixed-use residential for ADU", () => {
    expect(isMixedUseZoning("NCT-24TH-MISSION")).toBe(true);
    expect(isResidentialZoning("NCT-24TH-MISSION")).toBe(true);
    expect(isSingleFamilyZoning("NCT-24TH-MISSION")).toBe(false);
    expect(isMixedUseZoning("CMUO")).toBe(true);
    expect(isResidentialZoning("CMUO")).toBe(true);
  });

  it("treats C-3-O(SD) and PDR-2 as non-residential", () => {
    expect(isResidentialZoning("C-3-O(SD)")).toBe(false);
    expect(isResidentialZoning("C-2")).toBe(false);
    expect(isResidentialZoning("PDR-2")).toBe(false);
    expect(isMixedUseZoning("C-3-O(SD)")).toBe(false);
  });
});
