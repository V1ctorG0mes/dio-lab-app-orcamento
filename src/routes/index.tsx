import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CloudCheck,
  Eye,
  FilePlus2,
  FolderOpen,
  PencilLine,
  Printer,
  ReceiptText,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { QuotesDrawer } from "@/components/invoice/QuotesDrawer";
import { WhatsAppDialog } from "@/components/invoice/WhatsAppDialog";
import { WhatsAppIcon } from "@/components/invoice/WhatsAppIcon";
import { useInvoice } from "@/hooks/use-invoice";
import { useSavedQuotes } from "@/hooks/use-saved-quotes";
import { makeEmptyInvoice, makeSampleInvoice, nextQuoteNumber, type SavedQuote } from "@/lib/invoice";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OrçaFácil — Gerador de orçamentos e faturas para freelancers" },
      {
        name: "description",
        content:
          "Crie orçamentos e faturas profissionais em minutos, veja a folha A4 em tempo real e exporte em PDF. Grátis e direto no navegador.",
      },
      { property: "og:title", content: "OrçaFácil — Orçamentos e faturas para freelancers" },
      {
        property: "og:description",
        content: "Orçamentos profissionais com prévia A4 ao vivo, valores em R$ e exportação em PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { invoice, setInvoice, savedAt, saveNow } = useInvoice();
  const { quotes, loaded: quotesLoaded, save, remove, duplicate } = useSavedQuotes();
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);

  const savedEntry = quotes.find((q) => q.invoice.id === invoice.id);
  const dirty = useMemo(
    () => !savedEntry || JSON.stringify(savedEntry.invoice) !== JSON.stringify(invoice),
    [savedEntry, invoice],
  );

  const handleSave = () => {
    saveNow();
    const res = save(invoice);
    if (!res) return;
    toast.success(res.created ? "Orçamento salvo" : "Orçamento atualizado", {
      description: `${invoice.meta.number} está em “Meus orçamentos”.`,
    });
  };

  const openQuote = (q: SavedQuote) => {
    setInvoice(structuredClone(q.invoice));
    setDrawerOpen(false);
    setView("edit");
    toast.success(`Orçamento ${q.invoice.meta.number} aberto`);
  };

  const duplicateSaved = (id: string) => {
    const copy = duplicate(id);
    if (copy) toast.success("Cópia criada", { description: `${copy.meta.number} foi adicionado à lista.` });
  };

  const deleteSaved = (id: string) => {
    if (remove(id)) toast("Orçamento excluído da lista");
  };

  const fillExample = () => {
    setInvoice(makeSampleInvoice());
    toast.success("Exemplo preenchido", { description: "Edite os campos à vontade." });
  };

  const clearAll = () => {
    const used = [...quotes.map((q) => q.invoice.meta.number), invoice.meta.number];
    setInvoice(makeEmptyInvoice(new Date(), nextQuoteNumber(used)));
    toast.success("Novo orçamento iniciado", { description: "Os dados anteriores foram apagados." });
  };

  const handlePrint = () => {
    saveNow();
    const prev = document.title;
    const who = invoice.client.name.trim();
    document.title = `Orcamento ${invoice.meta.number.replace("#", "")}${who ? ` - ${who}` : ""}`;
    window.print();
    document.title = prev;
  };

  return (
    <div className="print-root flex h-dvh flex-col bg-background">
      {/* Topbar */}
      <header className="no-print z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur lg:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-cta">
            <ReceiptText className="h-[18px] w-[18px]" />
          </span>
          <div className="leading-tight">
            <h1 className="sr-only font-display text-2xl leading-none tracking-tight sm:not-sr-only">OrçaFácil</h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">Orçamentos para freelancers</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => saveNow() && toast.success("Alterações salvas neste navegador")}
          className="ml-2 hidden cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground xl:inline-flex"
          title="O rascunho é salvo automaticamente neste navegador"
        >
          <CloudCheck className="h-3.5 w-3.5" />
          {savedAt
            ? `Rascunho salvo às ${savedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
            : "Salvamento automático"}
        </button>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="toolbar"
            size="sm"
            onClick={fillExample}
            title="Preencher exemplo"
            aria-label="Preencher exemplo"
            className="px-2.5 2xl:px-3"
          >
            <Sparkles /> <span className="hidden 2xl:inline">Preencher exemplo</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="toolbar"
                size="sm"
                title="Limpar / Novo"
                aria-label="Limpar / Novo"
                className="px-2.5 2xl:px-3"
              >
                <FilePlus2 /> <span className="hidden 2xl:inline">Limpar / Novo</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Começar um novo orçamento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todos os campos serão apagados. Orçamentos salvos em “Meus orçamentos” continuam na lista.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearAll}>Limpar tudo</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />

          <Button
            variant="toolbar"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            title="Meus orçamentos"
            aria-label={`Meus orçamentos (${quotes.length} salvos)`}
            className="relative px-2.5 lg:px-3"
          >
            <FolderOpen /> <span className="hidden lg:inline">Meus orçamentos</span>
            {quotesLoaded && quotes.length > 0 && (
              <span className="tabular absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground lg:static lg:h-[18px] lg:min-w-[18px]">
                {quotes.length}
              </span>
            )}
          </Button>
          <Button
            variant="toolbar"
            size="sm"
            onClick={handleSave}
            title={dirty ? "Salvar orçamento (há alterações não salvas)" : "Orçamento salvo"}
            aria-label="Salvar orçamento"
            className="relative px-2.5 lg:px-3"
          >
            <Save /> <span className="hidden lg:inline xl:hidden">Salvar</span>
            <span className="hidden xl:inline">Salvar orçamento</span>
            {quotesLoaded && dirty && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brass" aria-hidden />
            )}
          </Button>
          <Button
            variant="toolbar"
            size="sm"
            onClick={() => setWaOpen(true)}
            title="Enviar WhatsApp"
            aria-label="Enviar WhatsApp"
            className="px-2.5 lg:px-3"
          >
            <WhatsAppIcon className="text-whatsapp" />
            <span className="hidden lg:inline xl:hidden">WhatsApp</span>
            <span className="hidden xl:inline">Enviar WhatsApp</span>
          </Button>

          <Button variant="cta" onClick={handlePrint} className="ml-1 px-3 lg:px-4">
            <Printer /> <span className="hidden lg:inline">Exportar / Imprimir PDF</span>
            <span className="lg:hidden">PDF</span>
          </Button>
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="no-print flex shrink-0 gap-1 border-b bg-card p-1.5 lg:hidden" role="tablist">
        {(
          [
            ["edit", "Editar", PencilLine],
            ["preview", "Visualizar", Eye],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            role="tab"
            aria-selected={view === key}
            onClick={() => setView(key)}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors",
              view === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <main className="print-root grid min-h-0 flex-1 lg:grid-cols-[minmax(400px,500px)_1fr]">
        <section
          className={cn(
            "no-print min-h-0 overflow-y-auto border-r bg-background p-4 lg:block lg:p-5",
            view === "edit" ? "block" : "hidden",
          )}
        >
          <InvoiceEditor invoice={invoice} onChange={setInvoice} />
          <p className="mt-6 pb-2 text-center text-xs text-muted-foreground">
            Tudo fica salvo apenas neste navegador.
          </p>
        </section>

        <section
          className={cn(
            "print-root workspace-grid min-h-0 overflow-y-auto px-3 py-6 lg:block lg:px-10 lg:py-10",
            view === "preview" ? "block" : "hidden",
          )}
          aria-label="Pré-visualização do orçamento"
        >
          <InvoicePreview invoice={invoice} />
        </section>
      </main>

      <QuotesDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        quotes={quotes}
        currentId={invoice.id}
        currentDirty={dirty}
        onOpenQuote={openQuote}
        onDuplicate={duplicateSaved}
        onDelete={deleteSaved}
      />
      <WhatsAppDialog open={waOpen} onOpenChange={setWaOpen} invoice={invoice} />
    </div>
  );
}
