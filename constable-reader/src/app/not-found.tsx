import { ErrorState } from "@/components/ErrorState";

export default function NotFound() {
  return <ErrorState title="Page not found" message="That book or page isn’t part of the notes library." />;
}
