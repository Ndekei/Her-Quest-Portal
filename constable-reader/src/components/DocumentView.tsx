import { Reader, type ReaderProps } from "./Reader";
import { ErrorState } from "./ErrorState";
import type { NotesDocument } from "@/lib/source";

/** Picks the right screen for whatever the notes site sent back. */
export function DocumentView({ doc, ...rest }: { doc: NotesDocument } & Omit<ReaderProps, "url" | "title" | "html" | "toc" | "words">) {
  if (doc.kind === "error") {
    return <ErrorState title="Couldn’t open these notes" message={doc.message} url={doc.url} />;
  }
  if (doc.kind === "file") {
    return (
      <ErrorState
        file
        title={doc.title}
        message="These notes are published as a document file rather than a web page, so they open in your browser’s viewer."
        url={doc.url}
      />
    );
  }
  return <Reader {...rest} url={doc.url} title={doc.title} html={doc.html} toc={doc.toc} words={doc.words} />;
}
