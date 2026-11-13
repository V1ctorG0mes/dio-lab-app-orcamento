import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { makeSampleInvoice, parseStoredInvoice, STORAGE_KEY, type Invoice } from "@/lib/invoice";

/** Invoice state persisted to localStorage (read after hydration, saved with a short debounce). */
export function useInvoice() {
  const [invoice, setInvoice] = useState<Invoice>(() => makeSampleInvoice());
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const latest = useRef(invoice);
  latest.current = invoice;

  useEffect(() => {
    const stored = parseStoredInvoice(window.localStorage.getItem(STORAGE_KEY));
    if (stored) setInvoice(stored);
    setLoaded(true);
  }, []);

  const persist = useCallback((data: Invoice) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSavedAt(new Date());
      return true;
    } catch {
      toast.error("Não foi possível salvar", {
        description: "O armazenamento do navegador está cheio. Tente uma logo menor.",
      });
      return false;
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = window.setTimeout(() => persist(invoice), 350);
    return () => window.clearTimeout(t);
  }, [invoice, loaded, persist]);

  const saveNow = useCallback(() => persist(latest.current), [persist]);

  return { invoice, setInvoice, savedAt, saveNow, loaded };
}
