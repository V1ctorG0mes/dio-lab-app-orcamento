import { describe, expect, it } from "vitest";
import {
  discountAmount,
  formatBRL,
  invoiceTotals,
  itemSubtotal,
  parseCurrencyDigits,
} from "./invoice";

describe("invoice math", () => {
  it("item subtotal is quantity times unit price", () => {
    expect(itemSubtotal({ quantity: 3, unitPrice: 980 })).toBe(2940);
  });

  it("percentage discount applies over the subtotal", () => {
    expect(discountAmount(1000, { type: "percent", value: 10 })).toBe(100);
  });

  it("fixed discount never exceeds the subtotal", () => {
    expect(discountAmount(500, { type: "fixed", value: 800 })).toBe(500);
  });

  it("percentage discount is capped at 100%", () => {
    expect(discountAmount(500, { type: "percent", value: 150 })).toBe(500);
  });

  it("total is subtotal minus discount", () => {
    const totals = invoiceTotals({
      items: [
        { id: "a", description: "", quantity: 2, unitPrice: 1500 },
        { id: "b", description: "", quantity: 1, unitPrice: 250.5 },
      ],
      discount: { type: "fixed", value: 50.5 },
    });
    expect(totals).toEqual({ subtotal: 3250.5, discount: 50.5, total: 3200 });
  });
});

describe("BRL formatting", () => {
  it("formats as R$ 0.000,00", () => {
    expect(formatBRL(1234.5)).toBe("R$ 1.234,50");
  });

  it("typed digits become cents", () => {
    expect(parseCurrencyDigits("R$ 1.234,56")).toBe(1234.56);
  });
});
