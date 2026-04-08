import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// ==========================================
// Tailwind Utilities
// ==========================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==========================================
// Formatting Utilities
// ==========================================

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-ES").format(num);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

// ==========================================
// Date Utilities
// ==========================================

export function formatDate(date: string | Date, formatStr = "dd/MM/yyyy"): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, formatStr, { locale: es });
}

export function formatDateTime(date: string | Date): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, "dd/MM/yyyy HH:mm", { locale: es });
}

export function formatRelativeTime(date: string | Date): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(parsedDate, { addSuffix: true, locale: es });
}

export function formatMonth(date: string | Date): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, "MMMM yyyy", { locale: es });
}

// ==========================================
// String Utilities
// ==========================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function generateSKU(productName: string, talla?: string, color?: string): string {
  const base = slugify(productName).slice(0, 10).toUpperCase();
  const parts = [base];
  
  if (talla) parts.push(talla.toUpperCase());
  if (color) parts.push(color.slice(0, 3).toUpperCase());
  
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  parts.push(random);
  
  return parts.join("-");
}

// ==========================================
// Validation Utilities
// ==========================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+34)?[6-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

export function isValidPostalCode(code: string): boolean {
  const postalRegex = /^\d{5}$/;
  return postalRegex.test(code);
}

// ==========================================
// Color Utilities
// ==========================================

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return "#000000";
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
}

export function adjustColorBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const adjust = (value: number) => {
    const adjusted = Math.round(value + (255 - value) * (percent / 100));
    return Math.min(255, Math.max(0, adjusted));
  };
  
  const r = adjust(rgb.r).toString(16).padStart(2, "0");
  const g = adjust(rgb.g).toString(16).padStart(2, "0");
  const b = adjust(rgb.b).toString(16).padStart(2, "0");
  
  return `#${r}${g}${b}`;
}

// ==========================================
// Cart Utilities
// ==========================================

export function calculateCartSubtotal(
  items: Array<{ precio_unitario: number; cantidad: number }>
): number {
  return items.reduce((total, item) => total + item.precio_unitario * item.cantidad, 0);
}

export function calculateShippingCost(subtotal: number, itemCount: number): number {
  if (subtotal >= 50) return 0; // Envío gratis a partir de 50€
  if (itemCount <= 2) return 4.95;
  return 6.95;
}

export function calculateCommission(total: number, commissionPercent: number): number {
  return Math.round((total * commissionPercent / 100) * 100) / 100;
}

// ==========================================
// URL Utilities
// ==========================================

export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(path, getBaseUrl());
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
}

// ==========================================
// Storage Utilities
// ==========================================

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

export function removeLocalStorage(key: string): void {
  if (typeof window === "undefined") return;
  
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

// ==========================================
// Error Utilities
// ==========================================

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Ha ocurrido un error inesperado";
}

// ==========================================
// Async Utilities
// ==========================================

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(delay * attempt);
      }
    }
  }
  
  throw lastError;
}

// ==========================================
// Debug Utilities
// ==========================================

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function debugLog(...args: unknown[]): void {
  if (isDevelopment()) {
    console.log("[DEBUG]", ...args);
  }
}
