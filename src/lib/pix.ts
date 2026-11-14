/**
 * Static Pix "copia e cola" (BR Code / EMV) payload, following the Banco Central spec.
 * Pure helpers — the QR code on the sheet just encodes the string returned here.
 */

function field(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

/** CRC16-CCITT (poly 0x1021, init 0xFFFF), as required by the BR Code. */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Uppercase ASCII without accents, as banks expect for name/city. */
function plain(text: string, max: number): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 .\-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .slice(0, max);
}

/** Puts a typed Pix key in the format the BR Code needs (phones get +55, CPF/CNPJ digits only). */
export function normalizePixKey(key: string): string {
  const k = key.trim();
  if (!k) return "";
  if (k.includes("@")) return k.toLowerCase();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k)) return k.toLowerCase();
  const digits = k.replace(/\D/g, "");
  if (k.startsWith("+")) return `+${digits}`;
  const looksLikePhone = /[()\s]/.test(k);
  if (looksLikePhone && (digits.length === 10 || digits.length === 11)) return `+55${digits}`;
  if (digits.length === 11 || digits.length === 14) return digits; // CPF / CNPJ
  return k;
}

export function buildPixPayload(opts: {
  key: string;
  name: string;
  city?: string;
  amount?: number;
  txid?: string;
}): string {
  const key = normalizePixKey(opts.key);
  const account = field("00", "br.gov.bcb.pix") + field("01", key);
  const amount = opts.amount && opts.amount > 0 ? opts.amount.toFixed(2) : "";
  const txid = (opts.txid ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const body =
    field("00", "01") +
    field("26", account) +
    field("52", "0000") +
    field("53", "986") +
    (amount ? field("54", amount) : "") +
    field("58", "BR") +
    field("59", plain(opts.name, 25) || "RECEBEDOR") +
    field("60", plain(opts.city ?? "", 15) || "BRASIL") +
    field("62", field("05", txid)) +
    "6304";
  return body + crc16(body);
}
