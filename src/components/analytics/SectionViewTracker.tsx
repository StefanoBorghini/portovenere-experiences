"use client";

import { useEffect, useRef } from "react";
import { trackSectionViewed } from "@/lib/analytics/gtag";

interface SectionViewTrackerProps {
  name: string;
  slug?: string;
  children: React.ReactNode;
}

// =========================================================
// Wrapper "invisibile" — display:contents fa si' che il div
// non influenzi affatto il layout (nessun box aggiuntivo,
// nessuna interferenza con margin/flex/grid del figlio), ma
// ci da comunque un nodo DOM a cui agganciare l'observer.
//
// Spara trackSectionViewed(name, slug) UNA SOLA VOLTA, la
// prima volta che la sezione supera il 40% di visibilita'
// nel viewport, poi si disconnette (non ci interessa sapere
// se la si rivede scrollando su e giu').
// =========================================================

export default function SectionViewTracker({
  name,
  slug,
  children,
}: SectionViewTrackerProps) {

  const ref = useRef<HTMLDivElement | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {

        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          trackSectionViewed(name, slug);
          observer.disconnect();
        }

      },
      { threshold: 0.4 }
    );

    observer.observe(node);

    return () => observer.disconnect();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} style={{ display: "contents" }}>
      {children}
    </div>
  );
}