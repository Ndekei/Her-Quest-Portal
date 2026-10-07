"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ALargeSmall, BookmarkCheck, ChevronRight, FileText, Search, TriangleAlert, X } from "lucide-react";
import { NavBar } from "./NavBar";
import { AppearanceSheet } from "./Appearance";
import { BOOKS, SECTIONS, bookBySlug, sectionById, type Testament } from "@/lib/books";
import { removeBookmark, useBookmarks, useProgress } from "@/lib/storage";
import type { NotesIndex } from "@/lib/source";

type Filter = "all" | Testament;

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

function initials(name: string) {
  const words = name.split(" ");
  return /^\d/.test(words[0]) ? `${words[0]}${words[1][0]}` : name.slice(0, 2);
}

export function Library({ index }: { index: NotesIndex }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [appearance, setAppearance] = useState(false);
  const deferred = useDeferredValue(query);
  const search = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const progress = useProgress();
  const bookmarks = useBookmarks();

  // ⌘K or "/" jumps to search, as in Spotlight-style apps.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLInputElement;
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        search.current?.focus();
        search.current?.select();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const needle = normalise(deferred);
  const books = useMemo(
    () =>
      BOOKS.filter((book) => {
        if (filter !== "all" && sectionById(book.section).testament !== filter) return false;
        if (!needle) return true;
        return [book.name, book.slug, ...book.aliases].some((name) => normalise(name).includes(needle));
      }),
    [filter, needle],
  );
  const extras = index.extras.filter((extra) => !needle || normalise(extra.label).includes(needle));

  const latest = Object.values(progress).sort((a, b) => b.at - a.at)[0];
  const latestBook = latest?.href.startsWith("/read/") ? bookBySlug(latest.href.slice(6)) : undefined;

  const available = (slug: string) => !index.ok || Boolean(index.books[slug]);

  return (
    <>
      <NavBar
        title="Study Notes"
        watch="library-title"
        end={
          <button type="button" className="icon-button" aria-label="Appearance" onClick={() => setAppearance(true)}>
            <ALargeSmall size={22} />
          </button>
        }
      />

      <main id="main" className="page">
        <h1 id="library-title" className="large-title">
          Study Notes
        </h1>
        <p className="subtitle">Dr. Thomas L. Constable’s expository notes on every book of the Bible.</p>

        {!index.ok && (
          <div className="banner" role="status">
            <TriangleAlert size={20} aria-hidden />
            <div>
              <strong>Couldn’t reach the notes library</strong>
              Books will still try to open, but some may be unavailable. {index.error}
            </div>
          </div>
        )}

        {latest && !needle && (
          <section className="section" aria-labelledby="continue-heading">
            <div className="section-header">
              <h2 id="continue-heading">Continue Reading</h2>
            </div>
            <Link
              href={latest.sectionId ? `${latest.href}#${latest.sectionId}` : latest.href}
              className="continue"
              style={{ ["--section-tint" as string]: latestBook ? sectionById(latestBook.section).tint : "var(--tint)" }}
            >
              <span className="continue-cover" aria-hidden>
                {latestBook ? initials(latestBook.name) : <FileText size={22} />}
              </span>
              <span style={{ minWidth: 0 }}>
                <span className="continue-eyebrow">{latestBook ? sectionById(latestBook.section).name : "Notes"}</span>
                <div className="continue-title">{latest.title}</div>
                {latest.sectionText && <div className="continue-section">{latest.sectionText}</div>}
                <div className="continue-meter">
                  <span className="meter" aria-hidden>
                    <span style={{ width: `${Math.round(latest.percent * 100)}%` }} />
                  </span>
                  {Math.round(latest.percent * 100)}% read
                </div>
              </span>
              <ChevronRight size={20} className="row-icon" aria-hidden />
            </Link>
          </section>
        )}

        {bookmarks.length > 0 && !needle && (
          <section className="section" aria-labelledby="saved-heading">
            <div className="section-header">
              <h2 id="saved-heading">Saved</h2>
              <p>{bookmarks.length}</p>
            </div>
            <ul className="list">
              {bookmarks.slice(0, 6).map((bookmark) => (
                <li key={bookmark.id}>
                  <div className="row">
                    <BookmarkCheck size={20} style={{ color: "var(--tint)", flex: "none" }} aria-hidden />
                    <Link href={bookmark.href} className="row-main" style={{ color: "inherit", textDecoration: "none" }}>
                      <div className="row-title">{bookmark.sectionText}</div>
                      <div className="row-sub">{bookmark.title}</div>
                    </Link>
                    <button
                      type="button"
                      className="row-action"
                      aria-label={`Remove “${bookmark.sectionText}” from saved`}
                      onClick={() => removeBookmark(bookmark.id)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="toolbar-row" style={{ marginTop: 20 }}>
          <label className="search">
            <span className="visually-hidden">Search books</span>
            <Search size={18} aria-hidden />
            <input
              ref={search}
              type="search"
              placeholder="Search books"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setQuery("");
                if (event.key === "Enter" && books[0] && available(books[0].slug)) {
                  router.push(`/read/${books[0].slug}`);
                }
              }}
              autoComplete="off"
              spellCheck={false}
            />
            {query ? (
              <button type="button" className="clear" aria-label="Clear search" onClick={() => setQuery("")}>
                <X size={16} />
              </button>
            ) : (
              <kbd aria-hidden>/</kbd>
            )}
          </label>
          <div className="segmented" role="group" aria-label="Testament">
            {(
              [
                ["all", "All"],
                ["ot", "Old Testament"],
                ["nt", "New Testament"],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {SECTIONS.map((section) => {
          const inSection = books.filter((book) => book.section === section.id);
          if (!inSection.length) return null;
          return (
            <section key={section.id} className="section" aria-labelledby={`section-${section.id}`}>
              <div className="section-header">
                <h2 id={`section-${section.id}`}>{section.name}</h2>
                <p>{inSection.length === 1 ? "1 book" : `${inSection.length} books`}</p>
              </div>
              <div className="book-grid" style={{ ["--section-tint" as string]: section.tint }}>
                {inSection.map((book) => {
                  const read = progress[`/read/${book.slug}`];
                  const ok = available(book.slug);
                  return (
                    <Link
                      key={book.slug}
                      href={ok ? `/read/${book.slug}` : "#"}
                      className="book"
                      aria-disabled={!ok}
                      onClick={(event) => !ok && event.preventDefault()}
                    >
                      <span className="book-name">{book.name}</span>
                      <span className="book-meta">
                        <span>{ok ? (book.chapters === 1 ? "1 chapter" : `${book.chapters} chapters`) : "Not listed"}</span>
                        <span className="book-dot" aria-hidden />
                      </span>
                      {read && read.percent > 0.01 && (
                        <span className="book-progress" aria-label={`${Math.round(read.percent * 100)}% read`}>
                          <span style={{ width: `${Math.round(read.percent * 100)}%` }} />
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {extras.length > 0 && (
          <section className="section" aria-labelledby="more-heading">
            <div className="section-header">
              <h2 id="more-heading">More from the Notes</h2>
            </div>
            <ul className="list">
              {extras.map((extra) => (
                <li key={extra.url}>
                  <Link href={`/doc?u=${encodeURIComponent(extra.url)}`} className="row">
                    <FileText size={20} style={{ color: "var(--tint)", flex: "none" }} aria-hidden />
                    <span className="row-main">
                      <span className="row-title" style={{ display: "block" }}>
                        {extra.label}
                      </span>
                    </span>
                    <ChevronRight size={18} className="row-icon" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!books.length && !extras.length && (
          <div className="empty" role="status">
            <strong>No results for “{deferred}”</strong>
            Try a book name such as “Romans” or an abbreviation like “1 Cor”.
          </div>
        )}

        <p className="footer-note">Notes © Thomas L. Constable. Presented for personal study.</p>
      </main>

      {appearance && <AppearanceSheet reader={false} onClose={() => setAppearance(false)} />}
    </>
  );
}
