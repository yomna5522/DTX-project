import { describe, it, expect, beforeEach, vi } from "vitest";
import { authApi } from "./auth";

const mockLoginResponse = {
  user: {
    id: 1,
    email: "user@example.com",
    phone: "+1234567890",
    fullname: "Test User",
    avatar: null,
    is_verified: true,
    is_admin: false,
    role: "customer",
  },
  access: "mock-access-token",
  refresh: "mock-refresh-token",
};

describe("authApi (contract with backend)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string, init?: RequestInit) => {
        const path = url.replace(/^https?:\/\/[^/]+/, "");
        if (path === "/api/login/" && init?.method === "POST") {
          return Promise.resolve(
            new Response(JSON.stringify(mockLoginResponse), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          );
        }
        if (path === "/api/register/" && init?.method === "POST") {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                id: 1,
                email: "new@example.com",
                phone: "+1111111111",
                fullname: "New User",
                avatar: null,
                is_verified: false,
                is_admin: false,
                role: "customer",
                access: "mock-access",
                refresh: "mock-refresh",
                message: "OTP sent",
              }),
              { status: 201, headers: { "Content-Type": "application/json" } }
            )
          );
        }
        return Promise.resolve(new Response(JSON.stringify({ detail: "Not found" }), { status: 404 }));
      })
    );
  });

  it("login calls POST /api/login/ with email and password", async () => {
    const result = await authApi.login("user@example.com", "password123");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.session.user.email).toBe("user@example.com");
      expect(result.session.token).toBe("mock-access-token");
    }
  });

  it("login with phone calls POST /api/login/ with phone and password", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce((url: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      expect(body.phone).toBeDefined();
      expect(body.password).toBeDefined();
      return Promise.resolve(
        new Response(JSON.stringify(mockLoginResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    });
    const result = await authApi.login("+1234567890", "password123");
    expect(result.success).toBe(true);
  });

  it("register requires phone and calls POST /api/register/", async () => {
    const result = await authApi.register({
      name: "New User",
      email: "new@example.com",
      password: "Secret123!",
      password_confirm: "Secret123!",
      phone: "+1111111111",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.session.user.email).toBe("new@example.com");
    }
  });

  it("register without phone returns error", async () => {
    const result = await authApi.register({
      name: "New User",
      email: "new@example.com",
      password: "Secret123!",
      password_confirm: "Secret123!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Phone");
    }
  });

  it("getSession returns null after logout", async () => {
    await authApi.login("user@example.com", "password123");
    expect(authApi.getSession()).not.toBeNull();
    authApi.logout();
    expect(authApi.getSession()).toBeNull();
  });
});
