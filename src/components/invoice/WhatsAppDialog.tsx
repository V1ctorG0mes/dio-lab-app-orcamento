import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { copyText } from "@/lib/clipboard";
import { buildWhatsAppMessage, formatPhone, whatsAppUrl, type Invoice } from "@/lib/invoice";
import { WhatsAppIcon } from "./WhatsAppIcon";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; invoice: Invoice };

export function WhatsAppDialog({ open, onOpenChange, invoice }: Props) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  // Refresh the text every time the dialog opens, so it reflects the latest edits.
  useEffect(() => {
    if (!open) return;
    setPhone(invoice.client.phone);
    setMessage(buildWhatsAppMessage(invoice));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const send = () => {
    window.open(whatsAppUrl(phone, message), "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground">
              <WhatsAppIcon className="h-4 w-4" />
            </span>
            Enviar pelo WhatsApp
          </DialogTitle>
          <DialogDescription>Confira a mensagem antes de abrir o WhatsApp. Você pode editá-la.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wa-phone" className="text-xs font-medium text-muted-foreground">
              Telefone do cliente
            </Label>
            <Input
              id="wa-phone"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              className="bg-card"
            />
            {!phone.replace(/\D/g, "") && (
              <p className="text-xs text-muted-foreground">Sem telefone, você escolhe o contato no WhatsApp.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wa-message" className="text-xs font-medium text-muted-foreground">
              Mensagem
            </Label>
            <Textarea
              id="wa-message"
              rows={11}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none rounded-lg rounded-tl-none border-whatsapp/25 bg-whatsapp/8 text-sm leading-relaxed"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="toolbar"
            onClick={async () =>
              (await copyText(message))
                ? toast.success("Mensagem copiada")
                : toast.error("Não foi possível copiar a mensagem")
            }
          >
            <Copy /> Copiar mensagem
          </Button>
          <Button
            type="button"
            onClick={send}
            disabled={!message.trim()}
            className="bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
          >
            <WhatsAppIcon /> Abrir WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
