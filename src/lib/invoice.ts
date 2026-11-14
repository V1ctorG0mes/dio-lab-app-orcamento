export type InvoiceStatus = "pendente" | "aprovado" | "recusado" | "pago";
export type AccentKey = "grafite" | "marinho" | "esmeralda" | "vinho" | "roxo";
export type DiscountType = "fixed" | "percent";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  /** Stable id used to save/update this quote in "Meus orçamentos". */
  id: string;
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
  style: { accent: AccentKey };
}

export const STATUS_LABEL: Record<InvoiceStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
  pago: "Pago",
};

/** Accent presets for the document; actual colors live in styles.css under [data-accent]. */
export const ACCENTS: { key: AccentKey; label: string }[] = [
  { key: "grafite", label: "Grafite" },
  { key: "marinho", label: "Azul Marinho" },
  { key: "esmeralda", label: "Verde Esmeralda" },
  { key: "vinho", label: "Vinho" },
  { key: "roxo", label: "Roxo" },
];
export const DEFAULT_ACCENT: AccentKey = "esmeralda";

function normalizeStatus(s: unknown): InvoiceStatus {
  if (s === "concluido") return "pago"; // older saves
  return s === "aprovado" || s === "recusado" || s === "pago" ? s : "pendente";
}

function normalizeAccent(a: unknown): AccentKey {
  return ACCENTS.some((x) => x.key === a) ? (a as AccentKey) : DEFAULT_ACCENT;
}

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
    id: newId(),
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
    style: { accent: DEFAULT_ACCENT },
  };
}

export function makeEmptyInvoice(today = new Date(), number?: string): Invoice {
  return {
    id: newId(),
    issuer: { name: "", document: "", email: "", phone: "", pixKey: "", logo: null },
    client: { name: "", document: "", email: "", phone: "", city: "" },
    meta: {
      number: number ?? `#${today.getFullYear()}-001`,
      issueDate: isoDate(today),
      validUntil: isoDate(addDays(today, 15)),
      status: "pendente",
    },
    items: [{ id: newId(), description: "", quantity: 1, unitPrice: 0 }],
    discount: { type: "fixed", value: 0 },
    payment: "",
    notes: "",
    style: { accent: DEFAULT_ACCENT },
  };
}

/** Merges any saved shape over a fresh empty invoice (fills fields added in newer versions). */
export function normalizeInvoice(data: unknown): Invoice | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Partial<Invoice>;
  const base = makeEmptyInvoice();
  return {
    id: typeof d.id === "string" && d.id ? d.id : base.id,
    issuer: { ...base.issuer, ...d.issuer },
    client: { ...base.client, ...d.client },
    meta: { ...base.meta, ...d.meta, status: normalizeStatus(d.meta?.status) },
    items: Array.isArray(d.items) ? d.items : base.items,
    discount: { ...base.discount, ...d.discount },
    payment: d.payment ?? "",
    notes: d.notes ?? "",
    style: { accent: normalizeAccent(d.style?.accent) },
  };
}

/** Accepts whatever was saved and merges it over a fresh empty invoice. */
export function parseStoredInvoice(raw: string | null): Invoice | null {
  if (!raw) return null;
  try {
    return normalizeInvoice(JSON.parse(raw));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Saved quotes ("Meus orçamentos")

export const QUOTES_STORAGE_KEY = "orcafacil:quotes:v1";

export interface SavedQuote {
  savedAt: string; // ISO timestamp
  invoice: Invoice;
}

export function parseStoredQuotes(raw: string | null): SavedQuote[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.flatMap((q) => {
      const invoice = normalizeInvoice(q?.invoice);
      return invoice ? [{ savedAt: String(q.savedAt ?? ""), invoice }] : [];
    });
  } catch {
    return [];
  }
}

/** Newest first. */
export function sortQuotes(list: SavedQuote[]): SavedQuote[] {
  return [...list].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

/** Saves a new quote or replaces the one with the same id. */
export function upsertQuote(list: SavedQuote[], invoice: Invoice, now = new Date()) {
  const exists = list.some((q) => q.invoice.id === invoice.id);
  const entry: SavedQuote = { savedAt: now.toISOString(), invoice };
  return {
    list: exists ? list.map((q) => (q.invoice.id === invoice.id ? entry : q)) : [entry, ...list],
    created: !exists,
  };
}

export function removeQuote(list: SavedQuote[], id: string): SavedQuote[] {
  return list.filter((q) => q.invoice.id !== id);
}

/** Next "#AAAA-NNN" number for the year, after the highest already used. */
export function nextQuoteNumber(numbers: string[], today = new Date()): string {
  const year = today.getFullYear();
  let max = 0;
  for (const n of numbers) {
    const m = /^#?(\d{4})-(\d+)$/.exec(n.trim());
    if (m && Number(m[1]) === year) max = Math.max(max, Number(m[2]));
  }
  return `#${year}-${String(max + 1).padStart(3, "0")}`;
}

/** Copy of a saved quote with a new id, the next free number and status back to pending. */
export function duplicateQuote(list: SavedQuote[], id: string, now = new Date()) {
  const src = list.find((q) => q.invoice.id === id);
  if (!src) return null;
  const copy: Invoice = {
    ...structuredClone(src.invoice),
    id: newId(),
    meta: {
      ...src.invoice.meta,
      number: nextQuoteNumber(list.map((q) => q.invoice.meta.number), now),
      status: "pendente",
    },
  };
  return { copy, list: [{ savedAt: now.toISOString(), invoice: copy }, ...list] };
}

// ---------------------------------------------------------------------------
// WhatsApp

export function buildWhatsAppMessage(inv: Invoice): string {
  const { total } = invoiceTotals(inv);
  const first = inv.client.name.trim();
  const lines = [
    `Olá${first ? ` ${first}` : ""}, tudo bem?`,
    "",
    `Aqui está o orçamento ${inv.meta.number} no valor total de ${formatBRL(total)}, válido até ${formatDateBR(inv.meta.validUntil)}.`,
  ];
  const items = inv.items.filter((i) => i.description.trim());
  if (items.length) {
    lines.push("", "Itens:");
    for (const i of items) lines.push(`• ${i.description.trim()} — ${formatBRL(itemSubtotal(i))}`);
  }
  if (inv.payment.trim()) lines.push("", `Pagamento: ${inv.payment.trim()}`);
  if (inv.issuer.pixKey.trim()) lines.push(`Chave Pix: ${inv.issuer.pixKey.trim()}`);
  lines.push("", "Qualquer dúvida, fico à disposição.");
  if (inv.issuer.name.trim()) lines.push(inv.issuer.name.trim());
  return lines.join("\n");
}

/** wa.me link; Brazilian numbers without country code get 55. No phone opens the contact picker. */
export function whatsAppUrl(phone: string, text: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
