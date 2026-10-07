"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "auto" | "light" | "sepia" | "dark";
export type Prefs = {
  theme: Theme;
  font: "serif" | "sans";
  size: number;
  leading: "compact" | "normal" | "relaxed";
  width: "narrow" | "wide";
};

export type Progress = {
  href: string;
  title: string;
  percent: number;
  sectionId?: string;
  sectionText?: string;
  at: number;
};

export type Bookmark = {
  id: string;
  href: string;
  title: string;
  sectionText: string;
  at: number;
};

export const TEXT_SIZES = [15, 16, 17, 18, 19, 21, 23, 26];
export const DEFAULT_PREFS: Prefs = { theme: "auto", font: "serif", size: 3, leading: "normal", width: "narrow" };

const KEYS = {
  prefs: "cr:prefs",
  progress: "cr:progress",
  bookmarks: "cr:bookmarks",
} as const;

type Key = keyof typeof KEYS;

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: Key, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEYS[key]);
  } catch {
    // Private windows can block storage; fall back to defaults.
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  try {
    if (raw) {
      const parsed = JSON.parse(raw);
      value = (Array.isArray(fallback) ? parsed : { ...(fallback as object), ...parsed }) as T;
    }
  } catch {
    value = fallback;
  }
  cache.set(key, { raw, value });
  return value;
}

function write(key: Key, value: unknown) {
  try {
    window.localStorage.setItem(KEYS[key], JSON.stringify(value));
  } catch {
    // Storage full or blocked: the session still works, it just won't remember.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = () => listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const EMPTY_PROGRESS: Record<string, Progress> = {};
const EMPTY_BOOKMARKS: Bookmark[] = [];

export function usePrefs() {
  const prefs = useSyncExternalStore(subscribe, () => read("prefs", DEFAULT_PREFS), () => DEFAULT_PREFS);
  const update = useCallback((patch: Partial<Prefs>) => {
    const next = { ...read("prefs", DEFAULT_PREFS), ...patch };
    write("prefs", next);
    applyPrefs(next);
  }, []);
  return [prefs, update] as const;
}

export function useProgress() {
  return useSyncExternalStore(subscribe, () => read("progress", EMPTY_PROGRESS), () => EMPTY_PROGRESS);
}

export function saveProgress(entry: Progress) {
  const all = { ...read("progress", EMPTY_PROGRESS), [entry.href]: entry };
  // Keep the most recent 40 so storage stays small.
  const trimmed = Object.fromEntries(
    Object.entries(all)
      .sort(([, a], [, b]) => b.at - a.at)
      .slice(0, 40),
  );
  write("progress", trimmed);
}

export function readProgress(href: string): Progress | undefined {
  return read("progress", EMPTY_PROGRESS)[href];
}

export function useBookmarks() {
  return useSyncExternalStore(subscribe, () => read("bookmarks", EMPTY_BOOKMARKS), () => EMPTY_BOOKMARKS);
}

export function toggleBookmark(bookmark: Omit<Bookmark, "at">) {
  const all = read("bookmarks", EMPTY_BOOKMARKS);
  const exists = all.some((item) => item.id === bookmark.id);
  write("bookmarks", exists ? all.filter((item) => item.id !== bookmark.id) : [{ ...bookmark, at: Date.now() }, ...all]);
  return !exists;
}

export function removeBookmark(id: string) {
  write("bookmarks", read("bookmarks", EMPTY_BOOKMARKS).filter((item) => item.id !== id));
}

const THEME_COLORS: Record<Exclude<Theme, "auto">, string> = {
  light: "#f2f2f7",
  sepia: "#f4ecd8",
  dark: "#000000",
};

export function applyPrefs(prefs: Prefs) {
  const root = document.documentElement;
  if (prefs.theme === "auto") delete root.dataset.theme;
  else root.dataset.theme = prefs.theme;
  root.dataset.font = prefs.font;
  root.dataset.leading = prefs.leading;
  root.dataset.width = prefs.width;
  root.style.setProperty("--reader-size", `${TEXT_SIZES[prefs.size] ?? 18}px`);

  // Keep the browser chrome in step with the chosen theme.
  const dark = prefs.theme === "dark" || (prefs.theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  const color = prefs.theme === "sepia" ? THEME_COLORS.sepia : dark ? THEME_COLORS.dark : THEME_COLORS.light;
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", color));
}

/** Runs before first paint (inlined in the layout) so the saved theme never flashes. */
export const PREFS_BOOT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem("${KEYS.prefs}")||"{}");var r=document.documentElement;var s=${JSON.stringify(TEXT_SIZES)};if(p.theme&&p.theme!=="auto")r.dataset.theme=p.theme;r.dataset.font=p.font||"serif";r.dataset.leading=p.leading||"normal";r.dataset.width=p.width||"narrow";r.style.setProperty("--reader-size",(s[p.size==null?3:p.size]||18)+"px");}catch(e){}})();`;
