"use client";

import { useEffect } from "react";
import { pushRecent } from "@/lib/recent";

export default function RecentlyViewedTracker({ slug }: { slug: string }) {
  useEffect(() => {
    pushRecent(slug);
  }, [slug]);

  return null;
}
