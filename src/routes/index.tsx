import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, FilePlus2, PencilLine, Printer, ReceiptText, Sparkles, CloudCheck } from "lucide-react";
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
import { useInvoice } from "@/hooks/use-invoice";
import { makeEmptyInvoice, makeSampleInvoice } from "@/lib/invoice";
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
  const [view, setView] = useState<"edit" | "preview">("edit");

  const fillExample = () => {
    setInvoice(makeSampleInvoice());
    toast.success("Exemplo preenchido", { description: "Edite os campos à vontade." });
  };

  const clearAll = () => {
    setInvoice(makeEmptyInvoice());
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
            <h1 className="font-display text-2xl leading-none tracking-tight">OrçaFácil</h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">Orçamentos para freelancers</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => saveNow() && toast.success("Alterações salvas neste navegador")}
          className="ml-2 hidden cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:inline-flex"
          title="Salvar agora"
        >
          <CloudCheck className="h-3.5 w-3.5" />
          {savedAt
            ? `Salvo às ${savedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
            : "Salvamento automático"}
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="toolbar" size="sm" onClick={fillExample}>
            <Sparkles /> <span className="hidden sm:inline">Preencher exemplo</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="toolbar" size="sm">
                <FilePlus2 /> <span className="hidden sm:inline">Limpar / Novo</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Começar um novo orçamento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todos os campos serão apagados. Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearAll}>Limpar tudo</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="cta" onClick={handlePrint} className="ml-1">
            <Printer /> <span className="hidden sm:inline">Exportar / Imprimir PDF</span>
            <span className="sm:hidden">PDF</span>
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
    </div>
  );
}
