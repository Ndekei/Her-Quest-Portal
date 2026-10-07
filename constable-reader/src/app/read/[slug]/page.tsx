import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentView } from "@/components/DocumentView";
import { ErrorState } from "@/components/ErrorState";
import { bookBySlug, neighbours, sectionById } from "@/lib/books";
import { getDocument, getIndex, indexUrl } from "@/lib/source";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: bookBySlug(slug)?.name ?? "Notes" };
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = bookBySlug(slug);
  if (!book) notFound();

  const index = await getIndex();
  const url = index.books[slug];
  if (!url) {
    return (
      <ErrorState
        title={`${book.name} isn’t listed`}
        message={
          index.ok
            ? `The notes library doesn’t have a link for ${book.name} right now.`
            : `The notes library couldn’t be reached. ${index.error ?? ""}`
        }
        url={indexUrl()}
      />
    );
  }

  const doc = await getDocument(url, book.name, index);
  const section = sectionById(book.section);
  const { previous, next } = neighbours(slug);
  const available = (other?: typeof previous) => (other && index.books[other.slug] ? { slug: other.slug, name: other.name } : undefined);

  return (
    <DocumentView
      key={slug}
      doc={doc}
      href={`/read/${slug}`}
      subtitle={doc.kind === "html" && doc.title !== book.name ? doc.title : undefined}
      book={{ name: book.name, section: section.name, tint: section.tint, chapters: book.chapters }}
      previous={available(previous)}
      next={available(next)}
    />
  );
}
