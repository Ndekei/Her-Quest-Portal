export type Testament = "ot" | "nt";

export type Section = {
  id: string;
  name: string;
  testament: Testament;
  /** CSS custom property holding the section's tint. */
  tint: string;
};

export type Book = {
  slug: string;
  name: string;
  chapters: number;
  section: string;
  /** Other names or abbreviations the source page might use for this book. */
  aliases: string[];
};

export const SECTIONS: Section[] = [
  { id: "law", name: "The Law", testament: "ot", tint: "var(--red)" },
  { id: "history", name: "History", testament: "ot", tint: "var(--orange)" },
  { id: "wisdom", name: "Poetry & Wisdom", testament: "ot", tint: "var(--yellow)" },
  { id: "major", name: "Major Prophets", testament: "ot", tint: "var(--green)" },
  { id: "minor", name: "Minor Prophets", testament: "ot", tint: "var(--teal)" },
  { id: "gospels", name: "Gospels & Acts", testament: "nt", tint: "var(--blue)" },
  { id: "paul", name: "Paul’s Letters", testament: "nt", tint: "var(--indigo)" },
  { id: "general", name: "General Letters", testament: "nt", tint: "var(--purple)" },
  { id: "prophecy", name: "Prophecy", testament: "nt", tint: "var(--pink)" },
];

const b = (
  slug: string,
  name: string,
  chapters: number,
  section: string,
  aliases: string[] = [],
): Book => ({ slug, name, chapters, section, aliases });

export const BOOKS: Book[] = [
  b("genesis", "Genesis", 50, "law", ["gen"]),
  b("exodus", "Exodus", 40, "law", ["exod", "exo"]),
  b("leviticus", "Leviticus", 27, "law", ["lev"]),
  b("numbers", "Numbers", 36, "law", ["num"]),
  b("deuteronomy", "Deuteronomy", 34, "law", ["deut", "deu"]),
  b("joshua", "Joshua", 24, "history", ["josh"]),
  b("judges", "Judges", 21, "history", ["judg"]),
  b("ruth", "Ruth", 4, "history"),
  b("1-samuel", "1 Samuel", 31, "history", ["1sam", "isamuel", "firstsamuel"]),
  b("2-samuel", "2 Samuel", 24, "history", ["2sam", "iisamuel", "secondsamuel"]),
  b("1-kings", "1 Kings", 22, "history", ["1kgs", "ikings", "firstkings"]),
  b("2-kings", "2 Kings", 25, "history", ["2kgs", "iikings", "secondkings"]),
  b("1-chronicles", "1 Chronicles", 29, "history", ["1chron", "1chr", "ichronicles", "firstchronicles"]),
  b("2-chronicles", "2 Chronicles", 36, "history", ["2chron", "2chr", "iichronicles", "secondchronicles"]),
  b("ezra", "Ezra", 10, "history"),
  b("nehemiah", "Nehemiah", 13, "history", ["neh"]),
  b("esther", "Esther", 10, "history", ["esth"]),
  b("job", "Job", 42, "wisdom"),
  b("psalms", "Psalms", 150, "wisdom", ["psalm", "psa", "ps"]),
  b("proverbs", "Proverbs", 31, "wisdom", ["prov"]),
  b("ecclesiastes", "Ecclesiastes", 12, "wisdom", ["eccl", "eccles", "qoheleth"]),
  b("song-of-solomon", "Song of Songs", 8, "wisdom", ["songofsolomon", "song", "canticles"]),
  b("isaiah", "Isaiah", 66, "major", ["isa"]),
  b("jeremiah", "Jeremiah", 52, "major", ["jer"]),
  b("lamentations", "Lamentations", 5, "major", ["lam"]),
  b("ezekiel", "Ezekiel", 48, "major", ["ezek"]),
  b("daniel", "Daniel", 12, "major", ["dan"]),
  b("hosea", "Hosea", 14, "minor", ["hos"]),
  b("joel", "Joel", 3, "minor"),
  b("amos", "Amos", 9, "minor"),
  b("obadiah", "Obadiah", 1, "minor", ["obad"]),
  b("jonah", "Jonah", 4, "minor"),
  b("micah", "Micah", 7, "minor", ["mic"]),
  b("nahum", "Nahum", 3, "minor", ["nah"]),
  b("habakkuk", "Habakkuk", 3, "minor", ["hab"]),
  b("zephaniah", "Zephaniah", 3, "minor", ["zeph"]),
  b("haggai", "Haggai", 2, "minor", ["hag"]),
  b("zechariah", "Zechariah", 14, "minor", ["zech"]),
  b("malachi", "Malachi", 4, "minor", ["mal"]),
  b("matthew", "Matthew", 28, "gospels", ["matt"]),
  b("mark", "Mark", 16, "gospels"),
  b("luke", "Luke", 24, "gospels"),
  b("john", "John", 21, "gospels"),
  b("acts", "Acts", 28, "gospels"),
  b("romans", "Romans", 16, "paul", ["rom"]),
  b("1-corinthians", "1 Corinthians", 16, "paul", ["1cor", "icorinthians", "firstcorinthians"]),
  b("2-corinthians", "2 Corinthians", 13, "paul", ["2cor", "iicorinthians", "secondcorinthians"]),
  b("galatians", "Galatians", 6, "paul", ["gal"]),
  b("ephesians", "Ephesians", 6, "paul", ["eph"]),
  b("philippians", "Philippians", 4, "paul", ["phil", "php"]),
  b("colossians", "Colossians", 4, "paul", ["col"]),
  b("1-thessalonians", "1 Thessalonians", 5, "paul", ["1thess", "ithessalonians", "firstthessalonians"]),
  b("2-thessalonians", "2 Thessalonians", 3, "paul", ["2thess", "iithessalonians", "secondthessalonians"]),
  b("1-timothy", "1 Timothy", 6, "paul", ["1tim", "itimothy", "firsttimothy"]),
  b("2-timothy", "2 Timothy", 4, "paul", ["2tim", "iitimothy", "secondtimothy"]),
  b("titus", "Titus", 3, "paul"),
  b("philemon", "Philemon", 1, "paul", ["phlm", "phm"]),
  b("hebrews", "Hebrews", 13, "general", ["heb"]),
  b("james", "James", 5, "general", ["jas"]),
  b("1-peter", "1 Peter", 5, "general", ["1pet", "ipeter", "firstpeter"]),
  b("2-peter", "2 Peter", 3, "general", ["2pet", "iipeter", "secondpeter"]),
  b("1-john", "1 John", 5, "general", ["1jn", "ijohn", "firstjohn"]),
  b("2-john", "2 John", 1, "general", ["2jn", "iijohn", "secondjohn"]),
  b("3-john", "3 John", 1, "general", ["3jn", "iiijohn", "thirdjohn"]),
  b("jude", "Jude", 1, "general"),
  b("revelation", "Revelation", 22, "prophecy", ["rev", "revelations", "apocalypse"]),
];

export const bookBySlug = (slug: string) => BOOKS.find((book) => book.slug === slug);

export const sectionById = (id: string) => SECTIONS.find((section) => section.id === id)!;

export function neighbours(slug: string) {
  const index = BOOKS.findIndex((book) => book.slug === slug);
  return {
    previous: index > 0 ? BOOKS[index - 1] : undefined,
    next: index >= 0 && index < BOOKS.length - 1 ? BOOKS[index + 1] : undefined,
  };
}
