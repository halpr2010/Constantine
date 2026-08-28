"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type Vertical = "museums" | "gyms";

type VerticalContextValue = {
  vertical: Vertical;
  setVertical: (v: Vertical) => void;
};

const VerticalCtx = createContext<VerticalContextValue | null>(null);

/**
 * Holds the one source of truth for which vertical the page is showing.
 * The hero's switcher writes to it; the hero demo and every section below read
 * from it. Only the pieces that call useVertical() need to be client
 * components — page.tsx stays a server component.
 */
export function VerticalProvider({ children }: { children: React.ReactNode }) {
  const [vertical, setVertical] = useState<Vertical>("museums");
  const value = useMemo(() => ({ vertical, setVertical }), [vertical]);
  return <VerticalCtx.Provider value={value}>{children}</VerticalCtx.Provider>;
}

export function useVertical() {
  const ctx = useContext(VerticalCtx);
  if (!ctx) {
    throw new Error("useVertical must be used inside a VerticalProvider");
  }
  return ctx;
}
