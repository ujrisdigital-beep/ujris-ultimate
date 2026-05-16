import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: Date | string) {
  return format(new Date(d), "d MMM yyyy");
}

export function timeAgo(d: Date | string) {
  return formatDistanceToNow(new Date(d), { addSuffix: true });
}

export function daysUntil(d: Date | string): number {
  return differenceInDays(new Date(d), new Date());
}

export function deadlineStatus(d: Date | string): "overdue" | "urgent" | "soon" | "ok" {
  const days = daysUntil(d);
  if (days < 0)   return "overdue";
  if (days <= 3)  return "urgent";
  if (days <= 14) return "soon";
  return "ok";
}

export function fileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3)  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export function sha256(text: string): Promise<string> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(buf =>
    Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
  );
}

export const JURISDICTIONS = [
  { code: "GB", label: "United Kingdom 🇬🇧", courts: ["County Court", "Employment Tribunal", "High Court", "Court of Appeal"] },
  { code: "US", label: "United States 🇺🇸", courts: ["Small Claims", "State Court", "Federal District Court"] },
  { code: "CA", label: "Canada 🇨🇦", courts: ["Small Claims Court", "Provincial Court", "Federal Court"] },
  { code: "AU", label: "Australia 🇦🇺", courts: ["VCAT", "QCAT", "NCAT", "Federal Circuit Court"] },
  { code: "DE", label: "Germany 🇩🇪", courts: ["Amtsgericht", "Landgericht", "Arbeitsgericht"] },
  { code: "FR", label: "France 🇫🇷", courts: ["Tribunal judiciaire", "Conseil de prud'hommes"] },
  { code: "IN", label: "India 🇮🇳", courts: ["District Court", "Consumer Forum", "High Court"] },
  { code: "NG", label: "Nigeria 🇳🇬", courts: ["Magistrate Court", "High Court", "National Industrial Court"] },
] as const;

export type JurisdictionCode = typeof JURISDICTIONS[number]["code"];

export const CASE_CATEGORIES = [
  "Employment", "Housing", "Benefits", "Family", "Immigration",
  "Criminal", "Civil", "Consumer", "Data Rights", "Other",
] as const;

export function riskColor(score: number): string {
  if (score >= 70) return "text-green-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
}

export function riskLabel(score: number): string {
  if (score >= 70) return "Strong";
  if (score >= 40) return "Moderate";
  return "Weak";
}
