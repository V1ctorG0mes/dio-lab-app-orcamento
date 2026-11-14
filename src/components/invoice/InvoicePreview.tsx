import { useEffect, useRef, useState } from "react";
import { Copy, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { copyText } from "@/lib/clipboard";
import { buildPixPayload } from "@/lib/pix";
import {
  formatBRL,
  formatDateBR,
  invoiceTotals,
  itemSubtotal,
  STATUS_LABEL,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/invoice";

const STATUS_DOT: Record<InvoiceStatus, string> = {
  pendente: "bg-status-pending-foreground",
  aprovado: "bg-status-approved-foreground",
  recusado: "bg-status-refused-foreground",
  pago: "bg-status-paid-foreground",
};

function PixBlock({ invoice, total }: { invoice: Invoice; total: number }) {
  const key = invoice.issuer.pixKey.trim();
  const payload = buildPixPayload({
    key,
    name: invoice.issuer.name,
    amount: total,
    txid: invoice.meta.number,
  });
  const copy = async () => {
    if (await copyText(key)) toast.success("Chave Pix copiada", { description: key });
    else toast.error("Não foi possível copiar a chave Pix");
  };
  return (
    <div className="mt-3 flex items-center gap-3.5 rounded-md border border-sheet-ink/15 bg-sheet-ink-soft p-2.5">
      <div className="shrink-0 rounded bg-sheet p-1.5 text-sheet-ink shadow-[0_0_0_1px] shadow-sheet-ink/10">
        <QRCodeSVG
          value={payload}
          size={96}
          level="M"
          marginSize={0}
          bgColor="transparent"
          fgColor="currentColor"
          title="QR Code Pix"
          className="block h-[24mm] w-[24mm]"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[8.5px] font-semibold uppercase tracking-[0.16em] text-sheet-ink">
          <QrCode className="h-3 w-3" /> Pague com Pix
        </p>
        <p className="mt-0.5 text-[9px] leading-snug text-sheet-muted">
          Escaneie o código no app do seu banco.
        </p>
        <p className="mt-2 text-[7.5px] font-semibold uppercase tracking-wider text-sheet-muted">Chave Pix</p>
        <p className="font-mono text-[9.5px] leading-snug break-all text-sheet-foreground">{key}</p>
        {total > 0 && (
          <p className="tabular mt-1 text-[9.5px] text-sheet-muted">
            Valor: <span className="font-semibold text-sheet-foreground">{formatBRL(total)}</span>
          </p>
        )}
        <button
          type="button"
          onClick={copy}
          className="no-print mt-1.5 inline-flex cursor-pointer items-center gap-1 rounded border border-sheet-ink/20 bg-sheet px-1.5 py-0.5 text-[8.5px] font-medium text-sheet-ink transition-colors hover:bg-sheet-ink hover:text-sheet-ink-foreground"
        >
          <Copy className="h-2.5 w-2.5" /> Copiar chave Pix
        </button>
      </div>
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "OF";
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function Line({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p className="leading-relaxed">{children}</p>;
}

export function InvoiceSheet({ invoice }: { invoice: Invoice }) {
  const { issuer, client, meta, items, discount, payment, notes, style } = invoice;
  const totals = invoiceTotals(invoice);
  const visibleItems = items.filter((i) => i.description.trim() || i.unitPrice > 0);

  return (
    <article data-accent={style.accent} className="a4-sheet flex flex-col px-[16mm] pt-[15mm] pb-[13mm] text-[10.5px]">
      {/* Header */}
      <header className="flex items-start justify-between gap-8">
        <div className="flex items-start gap-4">
          {issuer.logo ? (
            <img
              src={issuer.logo}
              alt="Logo"
              className="h-14 w-14 shrink-0 rounded-md object-contain"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-sheet-ink font-display text-2xl text-sheet-ink-foreground">
              {initials(issuer.name)}
            </div>
          )}
          <div className="space-y-0.5 text-sheet-muted">
            <h2 className="text-[14px] font-semibold text-sheet-foreground">
              {issuer.name || "Seu nome ou empresa"}
            </h2>
            <Line>{issuer.document && `CPF/CNPJ ${issuer.document}`}</Line>
            <Line>{[issuer.email, issuer.phone].filter(Boolean).join("  ·  ")}</Line>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-[34px] leading-none tracking-tight text-sheet-ink">
            Orçamento
          </p>
          <p className="mt-2 font-mono text-[11px] text-sheet-muted">{meta.number || "—"}</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-sheet-ink/20 bg-sheet-ink-soft px-3 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-sheet-ink">
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[meta.status]}`} />
            {STATUS_LABEL[meta.status]}
          </span>
        </div>
      </header>

      <div className="mt-7 flex items-center">
        <div className="h-[2px] w-[28mm] bg-sheet-ink" />
        <div className="h-px flex-1 bg-sheet-rule" />
      </div>

      {/* Parties & dates */}
      <section className="mt-6 grid grid-cols-[1.6fr_1fr_1fr] gap-6">
        <div>
          <p className="mb-1.5 text-[8.5px] font-semibold uppercase tracking-[0.16em] text-sheet-muted">
            Cliente
          </p>
          <p className="text-[12px] font-semibold text-sheet-foreground">
            {client.name || "Nome do cliente"}
          </p>
          <div className="mt-0.5 text-sheet-muted">
            <Line>{client.document && `CPF/CNPJ ${client.document}`}</Line>
            <Line>{client.email}</Line>
            <Line>{[client.phone, client.city].filter(Boolean).join("  ·  ")}</Line>
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[8.5px] font-semibold uppercase tracking-[0.16em] text-sheet-muted">
            Emissão
          </p>
          <p className="tabular text-[12px] font-medium">{formatDateBR(meta.issueDate)}</p>
        </div>
        <div>
          <p className="mb-1.5 text-[8.5px] font-semibold uppercase tracking-[0.16em] text-sheet-muted">
            Válido até
          </p>
          <p className="tabular text-[12px] font-medium">{formatDateBR(meta.validUntil)}</p>
        </div>
      </section>

      {/* Items */}
      <section className="mt-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-t-2 border-b border-t-sheet-ink border-b-sheet-ink/15 bg-sheet-ink-soft text-[8.5px] uppercase tracking-[0.14em] text-sheet-ink">
              <th className="w-8 py-2.5 pl-1 text-left font-semibold">#</th>
              <th className="py-2.5 text-left font-semibold">Descrição</th>
              <th className="w-14 py-2.5 text-right font-semibold">Qtd.</th>
              <th className="w-24 py-2.5 text-right font-semibold">Valor unit.</th>
              <th className="w-26 py-2.5 pr-1 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sheet-muted">
                  Adicione itens ao orçamento
                </td>
              </tr>
            )}
            {visibleItems.map((item, i) => (
              <tr
                key={item.id}
                className="print-avoid-break border-b border-sheet-rule/70 even:bg-sheet-stripe"
              >
                <td className="tabular py-2.5 pl-1 align-top text-sheet-muted">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="py-2.5 pr-4 align-top font-medium">{item.description || "—"}</td>
                <td className="tabular py-2.5 text-right align-top">
                  {item.quantity.toLocaleString("pt-BR")}
                </td>
                <td className="tabular py-2.5 text-right align-top text-sheet-muted">
                  {formatBRL(item.unitPrice)}
                </td>
                <td className="tabular py-2.5 pr-1 text-right align-top font-medium">
                  {formatBRL(itemSubtotal(item))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="print-avoid-break mt-5 flex justify-end">
          <div className="w-[78mm] space-y-1.5">
            <div className="flex justify-between text-sheet-muted">
              <span>Subtotal</span>
              <span className="tabular text-sheet-foreground">{formatBRL(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-sheet-muted">
                <span>
                  Desconto
                  {discount.type === "percent" && ` (${discount.value.toLocaleString("pt-BR")}%)`}
                </span>
                <span className="tabular text-sheet-foreground">− {formatBRL(totals.discount)}</span>
              </div>
            )}
            <div className="mt-3 flex items-end justify-between rounded-md bg-sheet-ink px-4 py-3 text-sheet-ink-foreground">
              <span className="text-[8.5px] font-semibold uppercase tracking-[0.18em] opacity-80">
                Total geral
              </span>
              <span className="tabular font-display text-[26px] leading-none">
                {formatBRL(totals.total)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Payment & notes */}
      {(payment || notes || issuer.pixKey) && (
        <section className="print-avoid-break mt-8 grid grid-cols-2 gap-8 border-t border-sheet-rule pt-5">
          <div>
            <p className="mb-1.5 text-[8.5px] font-semibold uppercase tracking-[0.16em] text-sheet-muted">
              Condições de pagamento
            </p>
            <p className="whitespace-pre-line leading-relaxed">{payment || "—"}</p>
            {issuer.pixKey.trim() && <PixBlock invoice={invoice} total={totals.total} />}
          </div>
          <div>
            <p className="mb-1.5 text-[8.5px] font-semibold uppercase tracking-[0.16em] text-sheet-muted">
              Observações e garantia
            </p>
            <p className="whitespace-pre-line leading-relaxed text-sheet-muted">{notes || "—"}</p>
          </div>
        </section>
      )}

      {/* Signature */}
      <footer className="print-avoid-break mt-auto pt-14">
        <div className="grid grid-cols-[1.5fr_1fr] gap-12">
          <div>
            <div className="h-px bg-sheet-foreground/60" />
            <p className="mt-2 font-medium">{issuer.name || "Assinatura do prestador"}</p>
            <p className="text-sheet-muted">
              Prestador de serviços{issuer.document && ` · ${issuer.document}`}
            </p>
          </div>
          <div>
            <div className="flex items-end gap-2">
              <span className="text-sheet-muted">Data:</span>
              <span className="tabular flex-1 border-b border-sheet-foreground/60 pb-0.5 text-center">
                {formatDateBR(meta.issueDate)}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-[8px] tracking-wider text-sheet-muted/80">
          {meta.number} · Documento gerado com OrçaFácil
        </p>
      </footer>
    </article>
  );
}

/** Scales the real-size A4 sheet down to fit its column on screen; print resets the scale. */
export function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ scale: 1, w: 0, h: 0 });

  useEffect(() => {
    const box = boxRef.current;
    const sheet = sheetRef.current;
    if (!box || !sheet) return;
    const update = () => {
      const w = sheet.offsetWidth;
      const h = sheet.offsetHeight;
      const scale = Math.min(1, box.clientWidth / w);
      setDims({ scale, w, h });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(box);
    ro.observe(sheet);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={boxRef} className="print-root w-full">
      <div
        className="print-scaler animate-sheet-in mx-auto"
        style={dims.w ? { width: dims.w * dims.scale, height: dims.h * dims.scale } : undefined}
      >
        <div
          ref={sheetRef}
          className="print-scaler w-max origin-top-left"
          style={{ transform: `scale(${dims.scale})` }}
        >
          <InvoiceSheet invoice={invoice} />
        </div>
      </div>
    </div>
  );
}
