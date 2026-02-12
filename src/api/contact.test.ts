import { describe, it, expect, beforeEach } from "vitest";
import { contactApi } from "./contact";

describe("contactApi", () => {
  beforeEach(() => {
    localStorage.removeItem("dtx_contact_submissions");
  });

  it("submits contact form and returns success with id", () => {
    const result = contactApi.submit({
      name: "Test User",
      email: "test@example.com",
      phone: "+20123456789",
      message: "Hello, I need a quote.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.id).toMatch(/^contact-/);
    }
  });
});
