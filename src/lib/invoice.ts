export type InvoiceStatus = "pendente" | "aprovado" | "concluido";
export type DiscountType = "fixed" | "percent";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  issuer: {
    name: string;
    document: string;
    email: string;
    phone: string;
    pixKey: string;
    logo: string | null;
  };
  client: {
    name: string;
    document: string;
    email: string;
    phone: string;
    city: string;
  };
  meta: {
    number: string;
    issueDate: string;
    validUntil: string;
    status: InvoiceStatus;
  };
  items: InvoiceItem[];
  discount: { type: DiscountType; value: number };
  payment: string;
  notes: string;
}

export const STATUS_LABEL: Record<InvoiceStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  concluido: "Concluído",
};

export const STORAGE_KEY = "orcafacil:invoice:v1";

const round2 = (n: number) => Math.round(n * 100) / 100;

export function itemSubtotal(item: Pick<InvoiceItem, "quantity" | "unitPrice">): number {
  const q = Number.isFinite(item.quantity) ? Math.max(0, item.quantity) : 0;
  const p = Number.isFinite(item.unitPrice) ? Math.max(0, item.unitPrice) : 0;
  return round2(q * p);
}

export function invoiceSubtotal(items: InvoiceItem[]): number {
  return round2(items.reduce((sum, it) => sum + itemSubtotal(it), 0));
}

/** Discount in R$, never negative and never larger than the subtotal. */
export function discountAmount(subtotal: number, discount: Invoice["discount"]): number {
  const v = Number.isFinite(discount.value) ? Math.max(0, discount.value) : 0;
  const raw = discount.type === "percent" ? (subtotal * Math.min(v, 100)) / 100 : v;
  return round2(Math.min(raw, subtotal));
}

export function invoiceTotals(inv: Pick<Invoice, "items" | "discount">) {
  const subtotal = invoiceSubtotal(inv.items);
  const discount = discountAmount(subtotal, inv.discount);
  return { subtotal, discount, total: round2(subtotal - discount) };
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export function formatBRL(value: number): string {
  // Intl uses a non-breaking space after "R$"; normalise to a regular one.
  return brl.format(Number.isFinite(value) ? value : 0).replace(/\u00a0/g, " ");
}

/** Turns typed digits into a currency value: "123456" -> 1234.56 */
export function parseCurrencyDigits(input: string): number {
  const digits = input.replace(/\D/g, "").slice(0, 13);
  return digits ? Number(digits) / 100 : 0;
}

export function formatDateBR(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—";
}

export function formatDocument(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + days);
  return c;
}

export function makeSampleInvoice(today = new Date()): Invoice {
  return {
    issuer: {
      name: "Marina Duarte Design Studio",
      document: "32.418.775/0001-09",
      email: "contato@marinaduarte.design",
      phone: "(11) 98765-4321",
      pixKey: "contato@marinaduarte.design",
      logo: null,
    },
    client: {
      name: "Café Raízes Torrefação Ltda.",
      document: "18.942.310/0001-56",
      email: "financeiro@caferaizes.com.br",
      phone: "(31) 3456-7788",
      city: "Belo Horizonte / MG",
    },
    meta: {
      number: `#${today.getFullYear()}-014`,
      issueDate: isoDate(today),
      validUntil: isoDate(addDays(today, 15)),
      status: "pendente",
    },
    items: [
      { id: "s1", description: "Identidade visual completa (logotipo, paleta e tipografia)", quantity: 1, unitPrice: 4800 },
      { id: "s2", description: "Manual de marca — 24 páginas", quantity: 1, unitPrice: 1650 },
      { id: "s3", description: "Design de embalagem para café especial (250g)", quantity: 3, unitPrice: 980 },
      { id: "s4", description: "Pacote de posts para redes sociais", quantity: 12, unitPrice: 85 },
    ],
    discount: { type: "percent", value: 10 },
    payment: "50% de entrada via Pix na aprovação + 50% na entrega dos arquivos finais.",
    notes:
      "Prazo de entrega: 30 dias úteis após a aprovação. Inclui até 3 rodadas de ajustes por peça. Arquivos finais entregues em AI, PDF e PNG. Este orçamento é válido até a data indicada.",
  };
}

export function makeEmptyInvoice(today = new Date()): Invoice {
  return {
    issuer: { name: "", document: "", email: "", phone: "", pixKey: "", logo: null },
    client: { name: "", document: "", email: "", phone: "", city: "" },
    meta: {
      number: `#${today.getFullYear()}-001`,
      issueDate: isoDate(today),
      validUntil: isoDate(addDays(today, 15)),
      status: "pendente",
    },
    items: [{ id: newId(), description: "", quantity: 1, unitPrice: 0 }],
    discount: { type: "fixed", value: 0 },
    payment: "",
    notes: "",
  };
}

/** Accepts whatever was saved and merges it over a fresh empty invoice. */
export function parseStoredInvoice(raw: string | null): Invoice | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<Invoice>;
    if (!data || typeof data !== "object") return null;
    const base = makeEmptyInvoice();
    return {
      issuer: { ...base.issuer, ...data.issuer },
      client: { ...base.client, ...data.client },
      meta: { ...base.meta, ...data.meta },
      items: Array.isArray(data.items) ? data.items : base.items,
      discount: { ...base.discount, ...data.discount },
      payment: data.payment ?? "",
      notes: data.notes ?? "",
    };
  } catch {
    return null;
  }
}
