import { describe, it, expect, beforeEach } from "vitest";
import { authApi } from "./auth";

describe("authApi", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("logs in existing customer with temporary username and password", () => {
    const result = authApi.login("existing_customer", "temp123");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.session.user.customerType).toBe("EXISTING");
      expect(result.session.user.email).toBe("existing@dtx.example");
    }
  });

  it("logs in existing customer with email and temp password", () => {
    const result = authApi.login("existing@dtx.example", "temp123");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.session.user.customerType).toBe("EXISTING");
    }
  });

  it("rejects wrong password for existing customer", () => {
    const result = authApi.login("existing_customer", "wrong");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Invalid");
    }
  });

  it("registers new customer and returns session", () => {
    const result = authApi.register({
      name: "New User",
      email: "new@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.session.user.customerType).toBe("NEW");
      expect(result.session.user.email).toBe("new@example.com");
      expect(result.session.user.name).toBe("New User");
    }
  });

  it("rejects duplicate email on register", () => {
    authApi.register({ name: "First", email: "same@example.com", password: "pass" });
    const result = authApi.register({ name: "Second", email: "same@example.com", password: "pass" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("already exists");
    }
  });

  it("persists session in localStorage after login", () => {
    authApi.login("existing_customer", "temp123");
    const session = authApi.getSession();
    expect(session).not.toBeNull();
    expect(session?.user.username).toBe("existing_customer");
  });

  it("clears session after logout", () => {
    authApi.login("existing_customer", "temp123");
    authApi.logout();
    expect(authApi.getSession()).toBeNull();
  });
});
