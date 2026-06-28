import { describe, it, expect } from "vitest";
import { validateContact } from "./validation";

describe("validateContact", () => {
  const valid = {
    name: "Kovács Anna",
    email: "anna@pelda.hu",
    phone: "+36 30 123 4567",
    message: "Szeretnék egy modern landing oldalt, kérek rá ajánlatot.",
  };

  it("elfogad egy érvényes kitöltést", () => {
    const r = validateContact(valid);
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual({});
  });

  it("a telefon elhagyható (nem kötelező)", () => {
    const r = validateContact({ ...valid, phone: "" });
    expect(r.ok).toBe(true);
  });

  it("hibát ad túl rövid névre", () => {
    const r = validateContact({ ...valid, name: "A" });
    expect(r.ok).toBe(false);
    expect(r.errors.name).toBeDefined();
  });

  it("hibát ad érvénytelen e-mailre", () => {
    const r = validateContact({ ...valid, email: "nem-email" });
    expect(r.ok).toBe(false);
    expect(r.errors.email).toBeDefined();
  });

  it("hibát ad túl rövid üzenetre", () => {
    const r = validateContact({ ...valid, message: "Szia" });
    expect(r.ok).toBe(false);
    expect(r.errors.message).toBeDefined();
  });

  it("hibát ad túl rövid telefonszámra, ha meg van adva", () => {
    const r = validateContact({ ...valid, phone: "123" });
    expect(r.ok).toBe(false);
    expect(r.errors.phone).toBeDefined();
  });

  it("levágja a felesleges szóközöket", () => {
    const r = validateContact({ ...valid, name: "  Teszt Elek  " });
    expect(r.data.name).toBe("Teszt Elek");
  });
});
