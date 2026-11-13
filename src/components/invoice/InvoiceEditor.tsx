import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Check,
  CreditCard,
  FileText,
  ImagePlus,
  ListChecks,
  Percent,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  formatBRL,
  formatDocument,
  formatPhone,
  invoiceTotals,
  itemSubtotal,
  newId,
  STATUS_LABEL,
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
} from "@/lib/invoice";
import { CurrencyInput, Field } from "./fields";

type Props = {
  invoice: Invoice;
  onChange: (updater: (prev: Invoice) => Invoice) => void;
};

function SectionTitle({ icon: Icon, title, hint }: { icon: typeof Building2; title: string; hint?: string }) {
  return (
    <span className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </span>
    </span>
  );
}

const sectionClass = "rounded-lg border bg-card px-4 shadow-xs";
const triggerClass = "py-3.5 hover:no-underline";

export function InvoiceEditor({ invoice, onChange }: Props) {
  const totals = invoiceTotals(invoice);

  const setIssuer = (patch: Partial<Invoice["issuer"]>) =>
    onChange((p) => ({ ...p, issuer: { ...p.issuer, ...patch } }));
  const setClient = (patch: Partial<Invoice["client"]>) =>
    onChange((p) => ({ ...p, client: { ...p.client, ...patch } }));
  const setMeta = (patch: Partial<Invoice["meta"]>) =>
    onChange((p) => ({ ...p, meta: { ...p.meta, ...patch } }));
  const setItem = (id: string, patch: Partial<InvoiceItem>) =>
    onChange((p) => ({ ...p, items: p.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }));
  const addItem = () =>
    onChange((p) => ({ ...p, items: [...p.items, { id: newId(), description: "", quantity: 1, unitPrice: 0 }] }));
  const removeItem = (id: string) => {
    onChange((p) => ({ ...p, items: p.items.filter((it) => it.id !== id) }));
    toast("Item removido");
  };

  return (
    <Accordion
      type="multiple"
      defaultValue={["issuer", "client", "meta", "items", "totals", "payment"]}
      className="space-y-3"
    >
      <AccordionItem value="issuer" className={sectionClass}>
        <AccordionTrigger className={triggerClass}>
          <SectionTitle icon={Building2} title="Prestador / Emissor" hint="Seus dados profissionais" />
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-1">
          <LogoUpload logo={invoice.issuer.logo} onChange={(logo) => setIssuer({ logo })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              className="sm:col-span-2"
              label="Nome / Razão Social"
              value={invoice.issuer.name}
              onChange={(name) => setIssuer({ name })}
              placeholder="Seu nome ou empresa"
            />
            <Field
              label="CPF / CNPJ"
              inputMode="numeric"
              value={invoice.issuer.document}
              onChange={(v) => setIssuer({ document: formatDocument(v) })}
              placeholder="00.000.000/0000-00"
            />
            <Field
              label="Telefone"
              inputMode="tel"
              value={invoice.issuer.phone}
              onChange={(v) => setIssuer({ phone: formatPhone(v) })}
              placeholder="(00) 00000-0000"
            />
            <Field
              label="E-mail"
              type="email"
              value={invoice.issuer.email}
              onChange={(email) => setIssuer({ email })}
              placeholder="voce@email.com"
            />
            <Field
              label="Chave Pix"
              value={invoice.issuer.pixKey}
              onChange={(pixKey) => setIssuer({ pixKey })}
              placeholder="CPF, e-mail, telefone ou aleatória"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="client" className={sectionClass}>
        <AccordionTrigger className={triggerClass}>
          <SectionTitle icon={UserRound} title="Cliente" hint="Para quem é o orçamento" />
        </AccordionTrigger>
        <AccordionContent className="pt-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              className="sm:col-span-2"
              label="Nome do cliente / Empresa"
              value={invoice.client.name}
              onChange={(name) => setClient({ name })}
              placeholder="Nome do cliente"
            />
            <Field
              label="CPF / CNPJ"
              inputMode="numeric"
              value={invoice.client.document}
              onChange={(v) => setClient({ document: formatDocument(v) })}
              placeholder="000.000.000-00"
            />
            <Field
              label="Telefone"
              inputMode="tel"
              value={invoice.client.phone}
              onChange={(v) => setClient({ phone: formatPhone(v) })}
              placeholder="(00) 00000-0000"
            />
            <Field
              label="E-mail"
              type="email"
              value={invoice.client.email}
              onChange={(email) => setClient({ email })}
              placeholder="cliente@email.com"
            />
            <Field
              label="Cidade / UF"
              value={invoice.client.city}
              onChange={(city) => setClient({ city })}
              placeholder="São Paulo / SP"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="meta" className={sectionClass}>
        <AccordionTrigger className={triggerClass}>
          <SectionTitle icon={FileText} title="Informações do orçamento" hint="Número, datas e status" />
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-1">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label="Número"
              value={invoice.meta.number}
              onChange={(number) => setMeta({ number })}
              placeholder="#2026-001"
            />
            <Field
              label="Data de emissão"
              type="date"
              value={invoice.meta.issueDate}
              onChange={(issueDate) => setMeta({ issueDate })}
            />
            <Field
              label="Válido até"
              type="date"
              value={invoice.meta.validUntil}
              onChange={(validUntil) => setMeta({ validUntil })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Status</Label>
            <div role="radiogroup" aria-label="Status" className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_LABEL) as InvoiceStatus[]).map((s) => {
                const active = invoice.meta.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMeta({ status: s })}
                    className={cn(
                      "cursor-pointer rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      !active && "opacity-45 grayscale hover:opacity-80 hover:grayscale-0",
                    )}
                  >
                    <Badge variant={s} className="gap-1 rounded-full px-3 py-1">
                      {active && <Check className="h-3 w-3" />}
                      {STATUS_LABEL[s]}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="items" className={sectionClass}>
        <AccordionTrigger className={triggerClass}>
          <SectionTitle
            icon={ListChecks}
            title="Itens e serviços"
            hint={`${invoice.items.length} ${invoice.items.length === 1 ? "item" : "itens"} · ${formatBRL(totals.subtotal)}`}
          />
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pt-1">
          {invoice.items.map((item, index) => (
            <ItemRow
              key={item.id}
              index={index}
              item={item}
              onChange={(patch) => setItem(item.id, patch)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full border-dashed text-muted-foreground hover:text-foreground"
          >
            <Plus /> Adicionar item
          </Button>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="totals" className={sectionClass}>
        <AccordionTrigger className={triggerClass}>
          <SectionTitle icon={Percent} title="Totais e descontos" hint={`Total ${formatBRL(totals.total)}`} />
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular font-medium">{formatBRL(totals.subtotal)}</span>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Desconto</Label>
            <div className="flex gap-2">
              <ToggleGroup
                type="single"
                variant="outline"
                value={invoice.discount.type}
                onValueChange={(v) => {
                  if (!v) return;
                  onChange((p) => ({ ...p, discount: { type: v as "fixed" | "percent", value: 0 } }));
                }}
                className="shrink-0"
              >
                <ToggleGroupItem value="fixed" aria-label="Desconto em reais" className="px-3">
                  R$
                </ToggleGroupItem>
                <ToggleGroupItem value="percent" aria-label="Desconto em porcentagem" className="px-3">
                  %
                </ToggleGroupItem>
              </ToggleGroup>
              {invoice.discount.type === "fixed" ? (
                <CurrencyInput
                  aria-label="Valor do desconto"
                  value={invoice.discount.value}
                  onChange={(value) => onChange((p) => ({ ...p, discount: { ...p.discount, value } }))}
                />
              ) : (
                <Input
                  aria-label="Porcentagem de desconto"
                  type="number"
                  min={0}
                  max={100}
                  step="0.5"
                  value={invoice.discount.value || ""}
                  placeholder="0"
                  onChange={(e) =>
                    onChange((p) => ({
                      ...p,
                      discount: { ...p.discount, value: Math.min(100, Math.max(0, Number(e.target.value) || 0)) },
                    }))
                  }
                  className="tabular bg-card text-right"
                />
              )}
            </div>
            {totals.discount > 0 && (
              <p className="tabular text-right text-xs text-muted-foreground">− {formatBRL(totals.discount)}</p>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg bg-primary px-4 py-3.5 text-primary-foreground">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">Total geral</span>
            <span className="tabular font-display text-3xl leading-none">{formatBRL(totals.total)}</span>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="payment" className={sectionClass}>
        <AccordionTrigger className={triggerClass}>
          <SectionTitle icon={CreditCard} title="Pagamento e observações" hint="Condições, prazos e garantia" />
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="payment" className="text-xs font-medium text-muted-foreground">
              Forma de pagamento
            </Label>
            <Textarea
              id="payment"
              rows={2}
              value={invoice.payment}
              onChange={(e) => onChange((p) => ({ ...p, payment: e.target.value }))}
              placeholder="Ex.: 50% de entrada + 50% na entrega"
              className="bg-card"
            />
            <div className="flex flex-wrap gap-1.5">
              {["À vista via Pix", "50% de entrada + 50% na entrega", "Parcelado em 3x sem juros"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange((p) => ({ ...p, payment: s }))}
                  className="cursor-pointer rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground">
              Observações / termos de garantia
            </Label>
            <Textarea
              id="notes"
              rows={4}
              value={invoice.notes}
              onChange={(e) => onChange((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Prazos, garantia, o que está incluso…"
              className="bg-card"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function ItemRow({
  index,
  item,
  onChange,
  onRemove,
}: {
  index: number;
  item: InvoiceItem;
  onChange: (patch: Partial<InvoiceItem>) => void;
  onRemove: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleDelete = () => {
    if (confirming) {
      window.clearTimeout(timer.current);
      onRemove();
      return;
    }
    setConfirming(true);
    timer.current = window.setTimeout(() => setConfirming(false), 3000);
  };

  return (
    <div
      className={cn(
        "rounded-md border bg-background p-3 transition-colors",
        confirming && "border-destructive/40 bg-destructive/5",
      )}
    >
      <div className="flex items-start gap-2">
        <span className="tabular mt-2 w-5 shrink-0 text-xs font-medium text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <Input
          aria-label={`Descrição do item ${index + 1}`}
          value={item.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Descrição do serviço ou produto"
          className="bg-card"
        />
        <Button
          type="button"
          size={confirming ? "default" : "icon"}
          variant={confirming ? "dangerConfirm" : "dangerSoft"}
          onClick={handleDelete}
          aria-label={confirming ? "Confirmar remoção" : `Remover item ${index + 1}`}
          className="shrink-0"
        >
          {confirming ? (
            <>
              <Trash2 /> Remover?
            </>
          ) : (
            <Trash2 />
          )}
        </Button>
      </div>
      <div className="mt-2 grid grid-cols-[4.5rem_1fr_auto] items-end gap-2 pl-7">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Qtd.</Label>
          <Input
            aria-label={`Quantidade do item ${index + 1}`}
            type="number"
            min={0}
            step="1"
            value={Number.isFinite(item.quantity) ? item.quantity : ""}
            onChange={(e) => onChange({ quantity: Math.max(0, Number(e.target.value) || 0) })}
            className="tabular bg-card text-right"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Valor unitário</Label>
          <CurrencyInput
            aria-label={`Valor unitário do item ${index + 1}`}
            value={item.unitPrice}
            onChange={(unitPrice) => onChange({ unitPrice })}
          />
        </div>
        <div className="space-y-1 text-right">
          <span className="block text-[11px] text-muted-foreground">Subtotal</span>
          <span className="tabular block h-9 min-w-24 py-2 text-sm font-semibold">
            {formatBRL(itemSubtotal(item))}
          </span>
        </div>
      </div>
      {confirming && (
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="mt-2 ml-7 inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" /> Cancelar
        </button>
      )}
    </div>
  );
}

function LogoUpload({ logo, onChange }: { logo: string | null; onChange: (v: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Envie um arquivo de imagem (PNG, JPG ou SVG).");
      return;
    }
    if (file.size > 800 * 1024) {
      toast.error("Logo muito grande", { description: "Use uma imagem de até 800 KB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      toast.success("Logo adicionada");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4 rounded-md border border-dashed bg-background p-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary">
        {logo ? (
          <img src={logo} alt="Logo" className="h-full w-full object-contain" />
        ) : (
          <ImagePlus className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">Logo da empresa</p>
        <p className="text-xs text-muted-foreground">PNG, JPG ou SVG até 800 KB</p>
      </div>
      <div className="flex gap-1">
        {logo && (
          <Button type="button" size="sm" variant="dangerSoft" onClick={() => onChange(null)}>
            Remover
          </Button>
        )}
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          {logo ? "Trocar" : "Enviar"}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
