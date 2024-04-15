import { describe, expect, test } from "@jest/globals";
import { PathUtils } from "./path.utils";

describe("PathUtils", () => {
  test("Test base path", () => {
    expect(PathUtils.getBasePath()).not.toBeNull();
  });

  test("Test getTempPath", () => {
    expect(PathUtils.getTempPath()).toMatch(/\/temp$/);
  });

  test("Test getDataPath", () => {
    expect(PathUtils.getDataPath()).toMatch(/\/data$/);
  });

  test("Test getSbbImportDataPath", () => {
    expect(PathUtils.getSbbImportDataPath()).toMatch(/\/sbb-import-data$/);
  });
});