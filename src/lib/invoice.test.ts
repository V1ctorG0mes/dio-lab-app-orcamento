import { describe, expect, it } from "vitest";
import {
  buildWhatsAppMessage,
  discountAmount,
  duplicateQuote,
  makeEmptyInvoice,
  makeSampleInvoice,
  nextQuoteNumber,
  parseStoredInvoice,
  upsertQuote,
  whatsAppUrl,
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

describe("saved quotes", () => {
  const base = makeEmptyInvoice(new Date(2026, 10, 13));

  it("saving the same quote twice updates it instead of adding a copy", () => {
    const first = upsertQuote([], base);
    const second = upsertQuote(first.list, { ...base, notes: "x" });
    expect(second.created).toBe(false);
    expect(second.list).toHaveLength(1);
    expect(second.list[0].invoice.notes).toBe("x");
  });

  it("next number follows the highest of the year", () => {
    expect(nextQuoteNumber(["#2026-003", "#2026-014", "#2025-090"], new Date(2026, 0, 1))).toBe("#2026-015");
  });

  it("duplicate gets a new id, the next number and pending status", () => {
    const saved = upsertQuote([], { ...base, meta: { ...base.meta, number: "#2026-007", status: "pago" } }).list;
    const dup = duplicateQuote(saved, base.id, new Date(2026, 5, 1))!;
    expect(dup.list).toHaveLength(2);
    expect(dup.copy.id).not.toBe(base.id);
    expect(dup.copy.meta.number).toBe("#2026-008");
    expect(dup.copy.meta.status).toBe("pendente");
  });

  it("old 'concluído' status opens as 'Pago'", () => {
    const inv = parseStoredInvoice(JSON.stringify({ meta: { status: "concluido" } }));
    expect(inv?.meta.status).toBe("pago");
  });
});

describe("WhatsApp", () => {
  it("message greets the client and shows number and total", () => {
    const msg = buildWhatsAppMessage(makeSampleInvoice(new Date(2026, 10, 13)));
    expect(msg).toContain("Olá Café Raízes Torrefação Ltda.");
    expect(msg).toContain("orçamento #2026-014 no valor total de R$ 9.369,00");
  });

  it("Brazilian phone gets country code 55", () => {
    expect(whatsAppUrl("(31) 3456-7788", "oi")).toBe("https://wa.me/553134567788?text=oi");
  });
});
