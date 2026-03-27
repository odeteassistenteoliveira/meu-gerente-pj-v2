"use client";
import { useEffect } from "react";

export default function TrackVisit() {
  useEffect(() => {
    try {
      let sid = sessionStorage.getItem("_gpj_sid");
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem("_gpj_sid", sid);
      }
      fetch("/api/track-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      }).catch(() => {});
    } catch {
      // sessionStorage not available (SSR safety)
    }
  }, []);
  return null;
}
