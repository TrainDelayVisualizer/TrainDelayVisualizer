import { describe, expect, test } from "@jest/globals";
import { PathUtils } from "./path.utils";

describe("PathUtils", () => {
  test("Test base path", () => {
    expect(PathUtils.getBasePath()).not.toBeNull();
  });
});
