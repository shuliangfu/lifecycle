/**
 * @module @dreamer/lifecycle/i18n
 *
 * i18n for @dreamer/lifecycle: stage descriptions and error messages.
 * Uses $tr + module instance, no install(); locale auto-detected from env.
 */

import {
  createI18n,
  type I18n,
  type TranslationData,
  type TranslationParams,
} from "@dreamer/i18n";
import { getEnv } from "@dreamer/runtime-adapter";
import enUS from "./locales/en-US.json" with { type: "json" };
import zhCN from "./locales/zh-CN.json" with { type: "json" };

export type Locale = "en-US" | "zh-CN";

export const DEFAULT_LOCALE: Locale = "en-US";

const LIFECYCLE_LOCALES: Locale[] = ["en-US", "zh-CN"];

const LOCALE_DATA: Record<string, TranslationData> = {
  "en-US": enUS as TranslationData,
  "zh-CN": zhCN as TranslationData,
};

let lifecycleI18n: I18n | null = null;

/**
 * Detect locale from env (LANGUAGE > LC_ALL > LANG).
 */
export function detectLocale(): Locale {
  const langEnv = getEnv("LANGUAGE") || getEnv("LC_ALL") || getEnv("LANG");
  if (!langEnv) return DEFAULT_LOCALE;
  const first = langEnv.split(/[:\s]/)[0]?.trim();
  if (!first) return DEFAULT_LOCALE;
  const match = first.match(/^([a-z]{2})[-_]([A-Z]{2})/i);
  if (match) {
    const normalized = `${match[1].toLowerCase()}-${
      match[2].toUpperCase()
    }` as Locale;
    if (LIFECYCLE_LOCALES.includes(normalized)) return normalized;
  }
  const primary = first.substring(0, 2).toLowerCase();
  if (primary === "zh") return "zh-CN";
  if (primary === "en") return "en-US";
  return DEFAULT_LOCALE;
}

/**
 * Create lifecycle i18n instance. Call once at entry if needed; not required for $tr (falls back to key).
 */
export function initLifecycleI18n(): void {
  if (lifecycleI18n) return;
  const i18n = createI18n({
    defaultLocale: DEFAULT_LOCALE,
    fallbackBehavior: "default",
    locales: [...LIFECYCLE_LOCALES],
    translations: LOCALE_DATA as Record<string, TranslationData>,
  });
  i18n.setLocale(detectLocale());
  lifecycleI18n = i18n;
}

/**
 * Set locale for lifecycle messages. Initializes i18n if not yet called.
 */
export function setLifecycleLocale(locale: Locale): void {
  if (!lifecycleI18n) initLifecycleI18n();
  lifecycleI18n!.setLocale(locale);
}

/**
 * Translate by key. When init not called, returns key.
 */
export function $tr(
  key: string,
  params?: Record<string, string | number>,
  lang?: Locale,
): string {
  if (!lifecycleI18n) return key;
  if (lang !== undefined) {
    const prev = lifecycleI18n.getLocale();
    lifecycleI18n.setLocale(lang);
    try {
      return lifecycleI18n.t(key, params as TranslationParams);
    } finally {
      lifecycleI18n.setLocale(prev);
    }
  }
  return lifecycleI18n.t(key, params as TranslationParams);
}

/**
 * Get localized stage description. Uses stage.* keys.
 * @param stage - Lifecycle stage key (e.g. "ready", "uninitialized")
 */
export function getStageDescription(stage: string, lang?: Locale): string {
  return $tr(`stage.${stage}`, undefined, lang);
}
