# Study Notes — a reader for Constable’s Notes

A standalone, Apple-style reading app around the plain HTML pages at
<https://soniclight.com/constable-notes-html/>. It does not copy the notes. On each
visit it reads your index page, finds each book’s link, and shows that page in a
clean reader. When you update the source site, the reader picks up the changes.

## What you get

**Library**
- All 66 books grouped the way a study Bible groups them (The Law, History, Poetry & Wisdom, …), with Old/New Testament filtering.
- Instant search by name or abbreviation (“1 Cor”, “Phil”, “Rev”). Press `/` or `⌘K` to jump to it and `Enter` to open the top result.
- **Continue Reading**: picks up the last book at the exact section where you stopped.
- **Saved**: bookmarked sections, one tap away.
- Any non-book pages on your index (introductions, appendices) appear under **More from the Notes**.

**Reader**
- Typography modelled on Apple Books: New York / San Francisco, 8 text sizes, three line spacings, and comfortable or wide page width.
- Auto, Light, Sepia and Dark themes. Your choice is remembered and applied before the page paints, so there is no flash.
- **Contents**: an outline built from the headings, with a filter and the current section highlighted (`t`).
- **Find in notes**: highlights every match, with “3 of 27” and next/previous (`/` or `⌘F`, then `Enter` / `⇧Enter`).
- **Footnotes open in a popover** instead of jumping to the bottom of the page.
- **Bookmark** the section you’re in (`b`).
- Reading-progress bar, estimated reading time, and previous/next book at the end.
- Your reading position is saved automatically.
- Links to other books stay inside the app. Outside links open in a new tab.
- Word-export clean-up: inline styles, fonts, empty spacer paragraphs and scripts are stripped, wide tables scroll sideways, and windows-1252 text (curly quotes, dashes) decodes correctly.

**Built to Apple’s Human Interface Guidelines**
- Large titles that collapse into a translucent nav bar.
- 44 pt hit targets and system colours.
- Bottom sheets on phones and side panels or popovers on larger screens.
- Respects reduced motion.
- Full keyboard support with focus trapping in sheets.
- Safe-area insets, installable to the home screen (web manifest), and a clean print style.

Bookmarks, progress and preferences live in the browser’s local storage. They are per device and need no account.

## Run it

```bash
cd constable-reader
npm install
npm run dev        # http://localhost:3000
```

Production: `npm run build && npm start`, or deploy the `constable-reader` folder to Vercel
as its own project (set **Root Directory** to `constable-reader`).

### Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `NOTES_INDEX_URL` | `https://soniclight.com/constable-notes-html/` | The page that links to every book. Only pages on this site are ever fetched. |

Fetched pages are cached for a day on the server.

## How books are matched

The index page is parsed for links. Each book is matched by link text first (“Genesis”,
“1 Samuel”, “I Samuel”, “Song of Solomon”, …) and then by file name (`genesis.htm`,
`1sam.html`). Web pages are preferred over PDFs when both are listed. A book shows
“Not listed” if no link matches it. If your index uses unusual names, add them to
`aliases` in `src/lib/books.ts`.

## Layout

```
src/lib/books.ts        66 books, sections, aliases
src/lib/source.ts       fetch, decode, match links, sanitise HTML, build outline
src/lib/storage.ts      preferences, progress, bookmarks (localStorage)
src/components/         Library, Reader (+ find bar, contents), Sheet, NavBar, Appearance
src/app/                routes: /, /read/[slug], /doc?u=…
```
