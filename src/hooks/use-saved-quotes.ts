import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  duplicateQuote,
  parseStoredQuotes,
  QUOTES_STORAGE_KEY,
  removeQuote,
  sortQuotes,
  upsertQuote,
  type Invoice,
  type SavedQuote,
} from "@/lib/invoice";

/** "Meus orçamentos": the list of saved quotes, kept in localStorage. */
export function useSavedQuotes() {
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [loaded, setLoaded] = useState(false);
  const latest = useRef(quotes);
  latest.current = quotes;

  useEffect(() => {
    setQuotes(sortQuotes(parseStoredQuotes(window.localStorage.getItem(QUOTES_STORAGE_KEY))));
    setLoaded(true);
  }, []);

  const write = useCallback((next: SavedQuote[]) => {
    try {
      window.localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(next));
      setQuotes(sortQuotes(next));
      return true;
    } catch {
      toast.error("Não foi possível salvar", {
        description: "O armazenamento do navegador está cheio. Exclua orçamentos antigos ou use uma logo menor.",
      });
      return false;
    }
  }, []);

  const save = useCallback(
    (invoice: Invoice) => {
      const { list, created } = upsertQuote(latest.current, structuredClone(invoice));
      return write(list) ? { created } : null;
    },
    [write],
  );

  const remove = useCallback((id: string) => write(removeQuote(latest.current, id)), [write]);

  const duplicate = useCallback(
    (id: string) => {
      const res = duplicateQuote(latest.current, id);
      if (!res) return null;
      return write(res.list) ? res.copy : null;
    },
    [write],
  );

  return { quotes, loaded, save, remove, duplicate };
}
