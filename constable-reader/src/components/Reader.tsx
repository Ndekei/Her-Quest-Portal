"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ALargeSmall,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ExternalLink,
  List,
  Search,
  X,
} from "lucide-react";
import { NavBar } from "./NavBar";
import { Sheet } from "./Sheet";
import { AppearanceSheet } from "./Appearance";
import { readProgress, saveProgress, toggleBookmark, useBookmarks } from "@/lib/storage";
import type { TocEntry } from "@/lib/source";

type BookInfo = { name: string; section: string; tint: string; chapters: number };
type Neighbour = { slug: string; name: string };

export type ReaderProps = {
  href: string;
  url: string;
  title: string;
  subtitle?: string;
  html: string;
  toc: TocEntry[];
  words: number;
  book?: BookInfo;
  previous?: Neighbour;
  next?: Neighbour;
};

type Footnote = { label: string; html: string; top: number; left: number };

const NAV_OFFSET = 72;
const FOOTNOTE_TEXT = /^[[(]?\d{1,4}[\])]?$|^\*{1,3}$/;

function readingTime(words: number) {
  const minutes = Math.max(1, Math.round(words / 238));
  if (minutes < 60) return `${minutes} min read`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min read` : `${hours} hr read`;
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target as HTMLElement | null)?.isContentEditable;

export function Reader(props: ReaderProps) {
  const { href, url, title, subtitle, html, toc, words, book, previous, next } = props;
  const router = useRouter();
  const label = book?.name ?? title;
  const article = useRef<HTMLDivElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);
  const headingTops = useRef<{ id: string; top: number }[]>([]);
  const currentRef = useRef<string | undefined>(undefined);

  const [current, setCurrent] = useState<string>();
  const [panel, setPanel] = useState<"toc" | "appearance" | null>(null);
  const [findOpen, setFindOpen] = useState(false);
  const [footnote, setFootnote] = useState<Footnote | null>(null);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const bookmarks = useBookmarks();

  const currentEntry = toc.find((entry) => entry.id === current);
  const bookmarkId = `${href}#${current ?? "top"}`;
  const isSaved = bookmarks.some((item) => item.id === bookmarkId);

  /* ── Mount the notes once, outside React's diffing, then enhance them. ── */
  useEffect(() => {
    const root = article.current;
    if (!root) return;
    root.innerHTML = html;

    root.querySelectorAll("table").forEach((table) => {
      const wrap = document.createElement("div");
      wrap.className = "table-scroll";
      table.replaceWith(wrap);
      wrap.appendChild(table);
    });

    root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
      const id = decodeURIComponent(link.getAttribute("href")!.slice(1));
      const target = id && document.getElementById(id);
      if (!target || !root.contains(target)) return;
      const text = link.textContent?.trim() ?? "";
      const after = link.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING;
      if (after && (FOOTNOTE_TEXT.test(text) || link.closest("sup"))) {
        link.dataset.footnote = "true";
        link.setAttribute("aria-label", `Footnote ${text.replace(/\D/g, "") || text}`);
        link.setAttribute("aria-haspopup", "dialog");
      }
    });

    const measure = () => {
      headingTops.current = toc
        .map((entry) => {
          const el = document.getElementById(entry.id);
          return el ? { id: entry.id, top: el.getBoundingClientRect().top + window.scrollY } : undefined;
        })
        .filter((value): value is { id: string; top: number } => Boolean(value));
    };
    measure();

    // Return to the reader's place: an explicit #anchor wins, then the saved position.
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const anchor = hash && document.getElementById(hash);
    if (anchor) {
      anchor.scrollIntoView();
    } else {
      const saved = readProgress(href);
      if (saved && saved.percent > 0.002) {
        const box = root.getBoundingClientRect();
        window.scrollTo({ top: box.top + window.scrollY + saved.percent * box.height - NAV_OFFSET });
      }
    }

    // Lazy images and font swaps move headings; re-measure when the article resizes.
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    return () => resize.disconnect();
  }, [html, href, toc]);

  /* ── Scroll: progress bar, current section, saved position. ── */
  useEffect(() => {
    let frame = 0;
    let saveTimer: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      frame = 0;
      const root = article.current;
      if (!root) return;
      const box = root.getBoundingClientRect();
      const percent = Math.min(1, Math.max(0, (NAV_OFFSET - box.top) / Math.max(1, box.height - window.innerHeight + NAV_OFFSET)));
      progressBar.current?.style.setProperty("--progress", String(percent));

      const line = window.scrollY + NAV_OFFSET + 8;
      const tops = headingTops.current;
      let lo = 0;
      let hi = tops.length - 1;
      let found: string | undefined;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (tops[mid].top <= line) {
          found = tops[mid].id;
          lo = mid + 1;
        } else hi = mid - 1;
      }
      if (found !== currentRef.current) {
        currentRef.current = found;
        setCurrent(found);
      }

      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const position = Math.min(1, Math.max(0, (window.scrollY + NAV_OFFSET - (box.top + window.scrollY)) / box.height));
        const entry = toc.find((item) => item.id === currentRef.current);
        saveProgress({ href, title: label, percent: position, sectionId: entry?.id, sectionText: entry?.text, at: Date.now() });
      }, 500);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
      setFootnote(null);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(saveTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [href, label, toc]);

  /* ── Links inside the notes: footnotes pop over, app links stay in the app. ── */
  const onArticleClick = useCallback(
    (event: React.MouseEvent) => {
      const link = (event.target as HTMLElement).closest("a");
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      const raw = link.getAttribute("href") ?? "";

      if (link.dataset.footnote) {
        event.preventDefault();
        const target = document.getElementById(decodeURIComponent(raw.slice(1)));
        if (!target) return;
        const block = (target.closest("p, li, div:not(.prose)") ?? target.parentElement) as HTMLElement;
        const clone = block.cloneNode(true) as HTMLElement;
        clone.querySelectorAll(`[id="${CSS.escape(target.id)}"]`).forEach((el) => el.remove());
        clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
        const rect = link.getBoundingClientRect();
        const width = Math.min(420, window.innerWidth - 24);
        const below = rect.bottom + 8;
        const room = window.innerHeight - below;
        setFootnote({
          label: link.textContent?.trim().replace(/[[\]()]/g, "") || "Note",
          html: clone.innerHTML,
          left: Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 12),
          top: room > 220 ? below : Math.max(12, rect.top - 8 - Math.min(360, window.innerHeight / 2)),
        });
        return;
      }

      if (raw.startsWith("/")) {
        event.preventDefault();
        router.push(raw);
      }
    },
    [router],
  );

  const jumpTo = useCallback((id: string) => {
    setPanel(null);
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ block: "start" });
    history.replaceState(null, "", `#${id}`);
  }, []);

  const onBookmark = () => {
    const added = toggleBookmark({
      id: bookmarkId,
      href: current ? `${href}#${current}` : href,
      title: book?.name ?? title,
      sectionText: currentEntry?.text ?? "Beginning",
    });
    setToast({ text: added ? "Saved to your library" : "Removed from saved", key: Date.now() });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setFindOpen(true);
        return;
      }
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey || panel) return;
      if (event.key === "/") {
        event.preventDefault();
        setFindOpen(true);
      } else if (event.key === "t") {
        event.preventDefault(); // or the "t" lands in the sheet's filter field
        setPanel("toc");
      } else if (event.key === "b") {
        event.preventDefault();
        document.getElementById("bookmark-button")?.click();
      } else if (event.key === "Escape") {
        setFootnote(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel]);

  const meta = [
    book ? (book.chapters === 1 ? "1 chapter" : `${book.chapters} chapters`) : undefined,
    toc.length ? `${toc.length} sections` : undefined,
    readingTime(words),
  ].filter(Boolean);

  return (
    <div className="reader-body">
      <NavBar
        title={book?.name ?? title}
        watch="reader-title"
        start={
          <Link href="/" className="back-button">
            <ChevronLeft size={26} strokeWidth={2.2} aria-hidden />
            Library
          </Link>
        }
        end={
          <>
            <button type="button" className="icon-button" aria-label="Contents" onClick={() => setPanel("toc")} disabled={!toc.length}>
              <List size={22} />
            </button>
            <button type="button" className="icon-button" aria-label="Find in notes" aria-pressed={findOpen} onClick={() => setFindOpen((open) => !open)}>
              <Search size={21} />
            </button>
            <button
              id="bookmark-button"
              type="button"
              className="icon-button"
              aria-label={isSaved ? "Remove bookmark for this section" : "Bookmark this section"}
              aria-pressed={isSaved}
              onClick={onBookmark}
            >
              {isSaved ? <BookmarkCheck size={21} /> : <Bookmark size={21} />}
            </button>
            <button type="button" className="icon-button" aria-label="Appearance" onClick={() => setPanel("appearance")}>
              <ALargeSmall size={23} />
            </button>
          </>
        }
      >
        <div ref={progressBar} className="progress" aria-hidden />
      </NavBar>

      {findOpen && <FindBar root={article} onClose={() => setFindOpen(false)} />}

      <main id="main" className="reader">
        <header className="reader-hero">
          {book && (
            <span className="reader-eyebrow">
              <span className="book-dot" style={{ ["--section-tint" as string]: book.tint }} aria-hidden />
              {book.section}
            </span>
          )}
          <h1 id="reader-title" className="reader-title">
            {book?.name ?? title}
          </h1>
          {subtitle && <div className="reader-meta">{subtitle}</div>}
          <div className="reader-meta">{meta.join(" · ")}</div>
        </header>

        <div ref={article} className="prose" onClick={onArticleClick} />

        {(previous || next) && (
          <nav className="reader-end" aria-label="More books">
            {previous && (
              <Link href={`/read/${previous.slug}`}>
                <span>Previous</span>
                <strong>{previous.name}</strong>
              </Link>
            )}
            {next && (
              <Link href={`/read/${next.slug}`}>
                <span>Next</span>
                <strong>{next.name}</strong>
              </Link>
            )}
          </nav>
        )}
        <p className="source-link">
          <a href={url} target="_blank" rel="noopener noreferrer">
            View original page <ExternalLink size={12} aria-hidden style={{ verticalAlign: "-1px" }} />
          </a>
        </p>
      </main>

      {panel === "toc" && <Contents toc={toc} current={current} onPick={jumpTo} onClose={() => setPanel(null)} />}
      {panel === "appearance" && <AppearanceSheet onClose={() => setPanel(null)} />}

      {footnote && (
        <>
          <div className="scrim" style={{ background: "transparent" }} onClick={() => setFootnote(null)} aria-hidden />
          <div className="footnote" role="dialog" aria-label={`Footnote ${footnote.label}`} style={{ top: footnote.top, left: footnote.left }}>
            <div className="footnote-head">
              <span>Note {footnote.label}</span>
              <button type="button" aria-label="Close note" onClick={() => setFootnote(null)} autoFocus>
                <X size={16} />
              </button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: footnote.html }} />
          </div>
        </>
      )}

      {toast && (
        <div key={toast.key} className="toast" role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}

function Contents({
  toc,
  current,
  onPick,
  onClose,
}: {
  toc: TocEntry[];
  current?: string;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const [filter, setFilter] = useState("");
  const shown = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return needle ? toc.filter((entry) => entry.text.toLowerCase().includes(needle)) : toc;
  }, [filter, toc]);

  return (
    <Sheet title="Contents" kind="panel" onClose={onClose}>
      <div className="sheet-body">
        {toc.length > 12 && (
          <label className="search">
            <span className="visually-hidden">Filter sections</span>
            <Search size={18} aria-hidden />
            <input
              type="search"
              placeholder="Filter sections"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && shown[0] && onPick(shown[0].id)}
            />
          </label>
        )}
        <ul className="toc">
          {shown.map((entry) => (
            <li key={entry.id} data-level={entry.level}>
              <a
                href={`#${entry.id}`}
                aria-current={entry.id === current}
                onClick={(event) => {
                  event.preventDefault();
                  onPick(entry.id);
                }}
              >
                {entry.text}
              </a>
            </li>
          ))}
        </ul>
        {!shown.length && <p className="empty">No sections match “{filter}”.</p>}
      </div>
    </Sheet>
  );
}

const HIGHLIGHT_CSS =
  "::highlight(find){background:var(--mark);color:inherit}::highlight(find-current){background:var(--mark-current);color:inherit}";

type HighlightRegistry = Map<string, unknown>;
declare const Highlight: { new (...ranges: Range[]): unknown } | undefined;

function FindBar({ root, onClose }: { root: React.RefObject<HTMLDivElement | null>; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Range[]>([]);
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const registry = (typeof CSS !== "undefined" ? (CSS as unknown as { highlights?: HighlightRegistry }).highlights : undefined);

  useEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, []);

  // Search text nodes after a short pause in typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase();
      const found: Range[] = [];
      if (needle.length >= 2 && root.current) {
        const walker = document.createTreeWalker(root.current, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node && found.length < 2000; node = walker.nextNode()) {
          const text = node.nodeValue?.toLowerCase() ?? "";
          for (let at = text.indexOf(needle); at !== -1 && found.length < 2000; at = text.indexOf(needle, at + needle.length)) {
            const range = document.createRange();
            range.setStart(node, at);
            range.setEnd(node, at + needle.length);
            found.push(range);
          }
        }
      }
      // Start from the first match below the current reading position.
      const line = 80;
      const first = found.findIndex((range) => range.getBoundingClientRect().top > line);
      setMatches(found);
      setIndex(first === -1 ? 0 : first);
    }, 160);
    return () => clearTimeout(timer);
  }, [query, root]);

  useEffect(() => {
    if (!registry || typeof Highlight === "undefined") return;
    if (matches.length) registry.set("find", new Highlight(...matches));
    else registry.delete("find");
    const active = matches[index];
    if (active) registry.set("find-current", new Highlight(active));
    else registry.delete("find-current");
    return () => {
      registry.delete("find");
      registry.delete("find-current");
    };
  }, [matches, index, registry]);

  useEffect(() => {
    const active = matches[index];
    if (!active) return;
    const rect = active.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.scrollY - window.innerHeight / 3 });
    if (!registry || typeof Highlight === "undefined") {
      // Browsers without the Highlight API: show the match as a selection instead.
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(active);
    }
  }, [matches, index, registry]);

  const step = (delta: number) => matches.length && setIndex((value) => (value + delta + matches.length) % matches.length);

  return (
    <div className="findbar" role="search">
      <style>{HIGHLIGHT_CSS}</style>
      <label className="search">
        <span className="visually-hidden">Find in notes</span>
        <Search size={17} aria-hidden />
        <input
          ref={input}
          type="search"
          placeholder="Find in notes"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              step(event.shiftKey ? -1 : 1);
            } else if (event.key === "Escape") {
              event.preventDefault();
              onClose();
            }
          }}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <span className="find-count" aria-live="polite">
        {query.trim().length >= 2 ? (matches.length ? `${index + 1} of ${matches.length}${matches.length === 2000 ? "+" : ""}` : "No matches") : ""}
      </span>
      <button type="button" className="icon-button" aria-label="Previous match" disabled={!matches.length} onClick={() => step(-1)}>
        <ChevronUp size={20} />
      </button>
      <button type="button" className="icon-button" aria-label="Next match" disabled={!matches.length} onClick={() => step(1)}>
        <ChevronDown size={20} />
      </button>
      <button type="button" className="text-button" onClick={onClose}>
        Done
      </button>
    </div>
  );
}
