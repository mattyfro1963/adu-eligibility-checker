import { describe, expect, it } from "vitest";
import {
  comboboxActiveIndexOnOpen,
  comboboxSubmitSelection,
} from "@/lib/search/combobox";

describe("comboboxActiveIndexOnOpen", () => {
  it("highlights the first suggestion when the list opens", () => {
    expect(comboboxActiveIndexOnOpen(3)).toBe(0);
    expect(comboboxActiveIndexOnOpen(0)).toBe(-1);
  });
});

describe("comboboxSubmitSelection", () => {
  const items = ["first", "second", "third"];

  it("selects the highlighted match when the list is open", () => {
    expect(comboboxSubmitSelection(true, 0, items)).toBe("first");
    expect(comboboxSubmitSelection(true, 2, items)).toBe("third");
  });

  it("defaults to the first match if the list is open without an index", () => {
    expect(comboboxSubmitSelection(true, -1, items)).toBe("first");
  });

  it("does not select when the list is closed", () => {
    expect(comboboxSubmitSelection(false, 0, items)).toBeNull();
  });
});
