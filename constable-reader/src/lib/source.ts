import sanitizeHtml from "sanitize-html";
import { BOOKS, type Book } from "./books";

const DEFAULT_INDEX_URL = "https://soniclight.com/constable-notes-html/";
const ONE_DAY = 86400;

export const indexUrl = () => process.env.NOTES_INDEX_URL || DEFAULT_INDEX_URL;

export type Extra = { label: string; url: string };

export type NotesIndex = {
  ok: boolean;
  /** Book slug → absolute URL of that book's notes. */
  books: Record<string, string>;
  /** Links on the index page that are not a book (introductions, appendices, …). */
  extras: Extra[];
  error?: string;
};

export type TocEntry = { id: string; level: number; text: string };

export type NotesDocument =
  | { kind: "html"; url: string; title: string; html: string; toc: TocEntry[]; words: number }
  | { kind: "file"; url: string; title: string }
  | { kind: "error"; url?: string; title: string; message: string };

const normalise = (value: string) =>
  decodeEntities(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

const stripTags = (value: string) => decodeEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

const withoutHash = (url: string) => url.split("#")[0];

function sameSite(url: URL) {
  const home = new URL(indexUrl());
  const bare = (host: string) => host.replace(/^www\./, "");
  return bare(url.hostname) === bare(home.hostname);
}

/** Only pages on the notes site may be loaded, so the server never fetches arbitrary URLs. */
export function isAllowedUrl(raw: string) {
  try {
    const url = new URL(raw);
    return (url.protocol === "https:" || url.protocol === "http:") && sameSite(url);
  } catch {
    return false;
  }
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: { "user-agent": "ConstableReader/1.0 (+study notes reader)" },
    next: { revalidate: ONE_DAY },
  });
  if (!response.ok) throw new Error(`The notes site answered ${response.status} ${response.statusText}`);

  const type = response.headers.get("content-type") ?? "";
  const bytes = await response.arrayBuffer();
  if (type && !/html|text\/plain/i.test(type)) return { type, text: "" };

  // Word-exported pages are often windows-1252, so honour the declared charset.
  const headerCharset = /charset=([\w-]+)/i.exec(type)?.[1];
  const sniff = new TextDecoder("latin1").decode(bytes.slice(0, 4096));
  const metaCharset = /<meta[^>]+charset=["']?([\w-]+)/i.exec(sniff)?.[1];
  return { type: type || "text/html", text: decode(bytes, headerCharset || metaCharset || "utf-8") };
}

// Bytes 0x80–0x9F in windows-1252 (curly quotes, dashes, …). Some Node builds decode the
// label as plain ISO-8859-1, which turns these into invisible control characters.
const CP1252 =
  "\u20ac\u0081\u201a\u0192\u201e\u2026\u2020\u2021\u02c6\u2030\u0160\u2039\u0152\u008d\u017d\u008f" +
  "\u0090\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u02dc\u2122\u0161\u203a\u0153\u009d\u017e\u0178";

function decode(bytes: ArrayBuffer, charset: string) {
  // Per the WHATWG encoding spec these labels all mean windows-1252.
  if (/^(windows-1252|cp1252|iso-8859-1|latin1|us-ascii|ascii)$/i.test(charset)) {
    const view = new Uint8Array(bytes);
    let out = "";
    for (let i = 0; i < view.length; i += 8192) {
      const chunk = view.subarray(i, i + 8192);
      out += String.fromCharCode(...Array.from(chunk, (byte) => (byte >= 0x80 && byte <= 0x9f ? CP1252.charCodeAt(byte - 0x80) : byte)));
    }
    return out;
  }
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

type Anchor = { url: string; text: string };

function anchorsIn(html: string, base: string): Anchor[] {
  const anchors: Anchor[] = [];
  const pattern = /<a\b[^>]*?href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(pattern)) {
    const href = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (!href || href.startsWith("#") || /^(mailto|javascript|tel):/i.test(href)) continue;
    try {
      const url = new URL(decodeEntities(href), base);
      if (!sameSite(url)) continue;
      anchors.push({ url: url.toString(), text: stripTags(match[4]) });
    } catch {
      // Ignore malformed links.
    }
  }
  return anchors;
}

const fileName = (url: string) =>
  normalise(decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).pop() ?? "").replace(/\.[a-z0-9]+$/i, ""));

const fullNames = (book: Book) => [normalise(book.name), normalise(book.slug)];
const allNames = (book: Book) => [...fullNames(book), ...book.aliases];

/** Lower is better: exact text, exact file name, then a text or file name that starts with the full book name. */
function matchScore(book: Book, anchor: Anchor) {
  const text = normalise(anchor.text);
  const file = fileName(anchor.url);
  if (allNames(book).includes(text)) return 0;
  if (allNames(book).includes(file)) return 1;
  // A prefix match must not be the start of a longer book name ("John" inside "Johnnotes" is fine, "1john" is not).
  const startsWithName = (value: string) =>
    fullNames(book).some((name) => value.startsWith(name) && !BOOKS.some((other) => other !== book && fullNames(other).some((n) => n.length > name.length && value.startsWith(n))));
  if (startsWithName(text)) return 2;
  if (startsWithName(file)) return 3;
  return Infinity;
}

const isHtmlPage = (url: string) => !/\.(pdf|docx?|zip|mp3|mp4|jpe?g|png|gif)$/i.test(new URL(url).pathname);

export async function getIndex(): Promise<NotesIndex> {
  const home = indexUrl();
  try {
    const { text } = await fetchText(home);
    const anchors = anchorsIn(text, home).filter((anchor) => withoutHash(anchor.url) !== withoutHash(home));
    const books: Record<string, string> = {};
    const used = new Set<string>();

    for (const book of BOOKS) {
      let best: { anchor: Anchor; score: number } | undefined;
      for (const anchor of anchors) {
        // Prefer readable web pages over downloads when both are listed.
        const score = matchScore(book, anchor) + (isHtmlPage(anchor.url) ? 0 : 0.5);
        if (score < (best?.score ?? Infinity)) best = { anchor, score };
      }
      if (best) {
        books[book.slug] = best.anchor.url;
        used.add(best.anchor.url);
      }
    }

    const seen = new Set<string>();
    const extras = anchors.filter((anchor) => {
      if (used.has(anchor.url) || !anchor.text || seen.has(anchor.url)) return false;
      seen.add(anchor.url);
      return true;
    }).map(({ text, url }) => ({ label: text, url }));

    return { ok: true, books, extras };
  } catch (error) {
    return { ok: false, books: {}, extras: [], error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getDocument(url: string, fallbackTitle: string, index?: NotesIndex): Promise<NotesDocument> {
  if (!isAllowedUrl(url)) {
    return { kind: "error", title: fallbackTitle, message: "That link points outside the notes site." };
  }
  if (!isHtmlPage(url)) return { kind: "file", url, title: fallbackTitle };
  try {
    const { type, text } = await fetchText(url);
    if (!text) return { kind: "file", url, title: fallbackTitle };

    const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(text)?.[1] ?? text;
    const pageTitle = stripTags(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(text)?.[1] ?? "");
    const { html, toc } = clean(body, url, index);
    if (!html.trim()) {
      return { kind: "error", url, title: fallbackTitle, message: `The page came back empty (${type}).` };
    }
    const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return { kind: "html", url, title: pageTitle || fallbackTitle, html, toc, words };
  } catch (error) {
    return {
      kind: "error",
      url,
      title: fallbackTitle,
      message: error instanceof Error ? error.message : "The notes could not be loaded.",
    };
  }
}

function clean(body: string, pageUrl: string, index?: NotesIndex) {
  const bookByUrl = new Map(Object.entries(index?.books ?? {}).map(([slug, url]) => [withoutHash(url), slug]));
  const toc: TocEntry[] = [];
  const usedIds = new Set<string>();
  let counter = 0;

  const uniqueId = (wanted?: string) => {
    let id = wanted && /^[\w:.-]+$/.test(wanted) ? wanted : `section-${++counter}`;
    while (usedIds.has(id)) id = `section-${++counter}`;
    usedIds.add(id);
    return id;
  };

  const heading: sanitizeHtml.Transformer = (tagName, attribs) => ({
    tagName,
    attribs: { id: uniqueId(attribs.id) },
  });

  const html = sanitizeHtml(body, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags.filter((tag) => tag !== "span"), "img"],
    allowedAttributes: {
      "*": ["id"],
      a: ["href", "id", "target", "rel", "data-kind"],
      img: ["src", "alt", "width", "height", "loading"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      ol: ["start", "type"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      h1: heading,
      h2: heading,
      h3: heading,
      h4: heading,
      h5: heading,
      h6: heading,
      // sanitize-html runs this after the tag-specific transforms too, so skip tags already given an id above.
      "*": (tagName, attribs) => ({
        tagName,
        attribs: attribs.id && !/^(a|img|h[1-6])$/.test(tagName) ? { ...attribs, id: uniqueId(attribs.id) } : attribs,
      }),
      img: (tagName, attribs) => {
        try {
          return { tagName, attribs: { ...attribs, src: new URL(attribs.src ?? "", pageUrl).toString(), loading: "lazy" } };
        } catch {
          return { tagName, attribs };
        }
      },
      a: (tagName, attribs) => {
        // Word uses <a name="…"> as anchor targets.
        const id = attribs.id || attribs.name;
        const next: Record<string, string> = id ? { id: uniqueId(id) } : {};
        const href = attribs.href?.trim();
        if (!href) return { tagName, attribs: next };
        if (href.startsWith("#")) return { tagName, attribs: { ...next, href } };
        try {
          const target = new URL(href, pageUrl);
          const hash = target.hash;
          if (withoutHash(target.toString()) === withoutHash(pageUrl)) return { tagName, attribs: { ...next, href: hash || "#" } };
          const slug = bookByUrl.get(withoutHash(target.toString()));
          if (slug) return { tagName, attribs: { ...next, href: `/read/${slug}${hash}`, "data-kind": "book" } };
          if (sameSite(target) && isHtmlPage(target.toString())) {
            return { tagName, attribs: { ...next, href: `/doc?u=${encodeURIComponent(target.toString())}`, "data-kind": "page" } };
          }
          return { tagName, attribs: { ...next, href: target.toString(), target: "_blank", rel: "noopener noreferrer" } };
        } catch {
          return { tagName, attribs: next };
        }
      },
    },
    // Word leaves a trail of empty paragraphs used as spacing.
    exclusiveFilter: (frame) =>
      frame.tag === "p" && !frame.text.replace(/ /g, " ").trim() && !frame.mediaChildren.length,
  });

  // Headings get ids above, so the outline can be read back from the cleaned markup.
  for (const match of html.matchAll(/<h([1-4]) id="([^"]+)">([\s\S]*?)<\/h\1>/g)) {
    const text = stripTags(match[3]);
    if (text) toc.push({ level: Number(match[1]), id: match[2], text });
  }

  return { html, toc };
}
