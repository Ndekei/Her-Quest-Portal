"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Translucent bar that stays clear over the large title, gains its material
 * once content scrolls beneath it, and shows the inline title only after the
 * large title has scrolled away (the iOS large-title pattern).
 */
export function NavBar({
  title,
  start,
  end,
  watch,
  children,
}: {
  title: string;
  start?: ReactNode;
  end?: ReactNode;
  /** Element id of the large title; the inline title appears once it leaves the screen. */
  watch: string;
  children?: ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const target = document.getElementById(watch);
    const observer = target
      ? new IntersectionObserver(([entry]) => setShowTitle(!entry.isIntersecting), { rootMargin: "-52px 0px 0px 0px" })
      : undefined;
    if (target) observer?.observe(target);

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, [watch]);

  return (
    <header className="navbar" data-scrolled={scrolled} data-title={showTitle}>
      <div className="navbar-start">{start}</div>
      <div className="navbar-title" aria-hidden={!showTitle}>
        {title}
      </div>
      <div className="navbar-end">{end}</div>
      {children}
    </header>
  );
}
