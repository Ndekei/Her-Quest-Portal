"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ExternalLink, FileText, RotateCw, TriangleAlert } from "lucide-react";

export function ErrorState({ title, message, url, file = false }: { title: string; message: string; url?: string; file?: boolean }) {
  const router = useRouter();
  return (
    <div className="reader-body">
      <header className="navbar" data-scrolled="false">
        <div className="navbar-start">
          <Link href="/" className="back-button">
            <ChevronLeft size={26} strokeWidth={2.2} aria-hidden />
            Library
          </Link>
        </div>
      </header>
      <main id="main" className="page">
        <div className="state" role={file ? undefined : "alert"}>
          <div className="state-icon" aria-hidden>
            {file ? <FileText size={30} /> : <TriangleAlert size={30} />}
          </div>
          <h1>{title}</h1>
          <p>{message}</p>
          <div className="state-actions">
            {url && (
              <a className={file ? "button" : "button secondary"} href={url} target="_blank" rel="noopener noreferrer">
                {file ? "Open" : "Open Original"} <ExternalLink size={16} aria-hidden />
              </a>
            )}
            {!file && (
              <button type="button" className="button" onClick={() => router.refresh()}>
                <RotateCw size={16} aria-hidden /> Try Again
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
