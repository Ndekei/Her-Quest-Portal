import { Library } from "@/components/Library";
import { getIndex } from "@/lib/source";

export const revalidate = 0;

export default async function Home() {
  const index = await getIndex();
  return <Library index={index} />;
}
