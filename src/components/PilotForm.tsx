"use client";

import React, { useState } from "react";
import { useVertical } from "@/components/VerticalContext";

// Public Web3Forms submit key. Safe to ship in client code: it can only send a
// message to the address that owns it, and cannot read anything back.
const ACCESS_KEY = "81697f24-158d-429a-b3ef-d8a2f5cbe78f";

type Status = "idle" | "submitting" | "success" | "error";

export default function PilotForm() {
  const { vertical } = useVertical();
  const isGym = vertical === "gyms";

  const [email, setEmail] = useState("");
  const [venue, setVenue] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `Pilot request${venue ? ` — ${venue}` : ""}`,
          from_name: "Constantine site — pilot request",
          vertical: isGym ? "Gyms" : "Museums & Galleries",
          email,
          [isGym ? "Gym name" : "Venue name"]: venue,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setEmail("");
        setVenue("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-fg-muted">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={isGym ? "you@yourgroup.com" : "you@museum.org"}
          className="w-full rounded-lg border border-line-input bg-surface-inset px-4 py-3 text-sm text-fg-primary placeholder:text-fg-muted focus:border-line-input-focus focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="venue" className="mb-2 block text-sm text-fg-muted">
          {isGym ? "Gym name" : "Venue name"}
        </label>
        <input
          id="venue"
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder={isGym ? "e.g. City Centre Gym" : "e.g. City Art Museum"}
          className="w-full rounded-lg border border-line-input bg-surface-inset px-4 py-3 text-sm text-fg-primary placeholder:text-fg-muted focus:border-line-input-focus focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-lg bg-action px-6 py-3 text-sm font-semibold text-on-action transition-colors hover:bg-action-hover"
      >
        {status === "submitting" ? "Sending…" : "Request pilot"}
      </button>

      {status === "success" && (
        <p className="text-sm text-accent-positive-soft">
          Thanks, your pilot request is in. We&apos;ll be in touch shortly.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-accent-negative-soft">
          Something went wrong. Please email ronanj.halpin@gmail.com directly.
        </p>
      )}
    </form>
  );
}
