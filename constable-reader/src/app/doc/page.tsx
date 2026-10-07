import { DocumentView } from "@/components/DocumentView";
import { getDocument, getIndex } from "@/lib/source";

export const revalidate = 0;
export const metadata = { title: "Notes" };

export default async function DocPage({ searchParams }: { searchParams: Promise<{ u?: string | string[] }> }) {
  const { u } = await searchParams;
  const url = Array.isArray(u) ? u[0] : u;
  const index = await getIndex();
  const label = index.extras.find((extra) => extra.url === url)?.label ?? "Notes";
  const doc = url
    ? await getDocument(url, label, index)
    : ({ kind: "error", title: label, message: "No page was chosen." } as const);
  return <DocumentView key={url} doc={doc} href={`/doc?u=${encodeURIComponent(url ?? "")}`} />;
}
