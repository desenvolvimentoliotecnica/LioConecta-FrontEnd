import { beforeEach, vi } from "vitest";

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});
