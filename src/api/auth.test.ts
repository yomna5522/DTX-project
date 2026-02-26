import { describe, it, expect, beforeEach } from "vitest";
import { authApi } from "./auth";

describe("authApi (session storage)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getSession returns null when no session stored", () => {
    expect(authApi.getSession()).toBeNull();
  });

  it("getUserById returns undefined (no customer list from API)", () => {
    expect(authApi.getUserById("any")).toBeUndefined();
  });

  it("getAllUsers returns empty array (management out of scope)", () => {
    expect(authApi.getAllUsers()).toEqual([]);
  });

  it("logout clears session", () => {
    expect(authApi.getSession()).toBeNull();
    authApi.logout();
    expect(authApi.getSession()).toBeNull();
  });
});
