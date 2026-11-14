import { useState } from "react";
import { Copy, FolderOpen, PencilLine, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatBRL, formatDateBR, invoiceTotals, STATUS_LABEL, type SavedQuote } from "@/lib/invoice";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotes: SavedQuote[];
  currentId: string;
  /** Current editor has changes that are not in the saved list. */
  currentDirty: boolean;
  onOpenQuote: (q: SavedQuote) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

function savedLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `Salvo em ${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function QuotesDrawer({
  open,
  onOpenChange,
  quotes,
  currentId,
  currentDirty,
  onOpenQuote,
  onDuplicate,
  onDelete,
}: Props) {
  const [toOpen, setToOpen] = useState<SavedQuote | null>(null);
  const [toDelete, setToDelete] = useState<SavedQuote | null>(null);

  const requestOpen = (q: SavedQuote) => {
    if (q.invoice.id === currentId && !currentDirty) {
      onOpenChange(false);
      return;
    }
    if (currentDirty) setToOpen(q);
    else onOpenQuote(q);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b px-5 py-4 text-left">
            <SheetTitle className="flex items-center gap-2 font-display text-2xl font-normal tracking-tight">
              <FolderOpen className="h-5 w-5 text-muted-foreground" /> Meus orçamentos
            </SheetTitle>
            <SheetDescription>
              {quotes.length === 0
                ? "Nenhum orçamento salvo ainda."
                : `${quotes.length} ${quotes.length === 1 ? "orçamento salvo" : "orçamentos salvos"} neste navegador.`}
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-4">
            {quotes.length === 0 ? (
              <div className="mt-10 flex flex-col items-center px-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <FolderOpen className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-medium">Sua lista está vazia</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use “Salvar orçamento” no topo para guardar o orçamento atual e voltar a ele depois.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {quotes.map((q) => {
                  const inv = q.invoice;
                  const isCurrent = inv.id === currentId;
                  return (
                    <li
                      key={inv.id}
                      className={cn(
                        "rounded-lg border bg-card p-3.5 shadow-xs transition-colors",
                        isCurrent && "border-primary/40 ring-1 ring-primary/25",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                            <span
                              data-accent={inv.style.accent}
                              className="h-2 w-2 shrink-0 rounded-full bg-sheet-ink"
                              aria-hidden
                            />
                            {inv.meta.number || "Sem número"}
                            {isCurrent && (
                              <span className="font-sans font-medium text-primary">· aberto agora</span>
                            )}
                          </p>
                          <p className="mt-1 truncate text-sm font-semibold">
                            {inv.client.name.trim() || "Cliente sem nome"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Emitido em {formatDateBR(inv.meta.issueDate)}
                          </p>
                        </div>
                        <Badge variant={inv.meta.status} className="shrink-0 rounded-full px-2.5">
                          {STATUS_LABEL[inv.meta.status]}
                        </Badge>
                      </div>

                      <div className="mt-2 flex items-end justify-between gap-3">
                        <span className="tabular font-display text-2xl leading-none">
                          {formatBRL(invoiceTotals(inv).total)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{savedLabel(q.savedAt)}</span>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 border-t pt-3">
                        <Button size="sm" variant="outline" onClick={() => requestOpen(q)}>
                          <PencilLine /> Abrir / Editar
                        </Button>
                        <Button size="sm" variant="toolbar" onClick={() => onDuplicate(inv.id)}>
                          <Copy /> Duplicar
                        </Button>
                        <Button
                          size="sm"
                          variant="dangerSoft"
                          className="ml-auto"
                          onClick={() => setToDelete(q)}
                          aria-label={`Excluir orçamento ${inv.meta.number}`}
                        >
                          <Trash2 /> Excluir
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!toOpen} onOpenChange={(o) => !o && setToOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abrir {toOpen?.invoice.meta.number}?</AlertDialogTitle>
            <AlertDialogDescription>
              O orçamento atual tem alterações que não foram salvas em “Meus orçamentos”. Elas serão
              perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toOpen) onOpenQuote(toOpen);
                setToOpen(null);
              }}
            >
              Abrir mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {toDelete?.invoice.meta.number}?</AlertDialogTitle>
            <AlertDialogDescription>
              O orçamento de {toDelete?.invoice.client.name.trim() || "cliente sem nome"} será removido da
              lista. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) onDelete(toDelete.invoice.id);
                setToDelete(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
