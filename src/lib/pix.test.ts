import { describe, expect, it } from "vitest";
import { buildPixPayload, crc16, normalizePixKey } from "./pix";

describe("Pix payload", () => {
  it("uses CRC16-CCITT", () => {
    expect(crc16("123456789")).toBe("29B1");
  });

  it("ends with a valid checksum over the whole code", () => {
    const code = buildPixPayload({ key: "contato@marinaduarte.design", name: "Marina", amount: 10 });
    expect(code.slice(-4)).toBe(crc16(code.slice(0, -4)));
  });

  it("includes the quote total as the amount", () => {
    const code = buildPixPayload({ key: "a@b.com", name: "X", amount: 8604 });
    expect(code).toContain("54078604.00");
  });

  it("phone keys get +55, CPF keys become digits only", () => {
    expect(normalizePixKey("(11) 98765-4321")).toBe("+5511987654321");
    expect(normalizePixKey("123.456.789-09")).toBe("12345678909");
  });
});
