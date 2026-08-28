"use client";

import { useVertical } from "@/components/VerticalContext";

export default function PilotForm() {
  const { vertical } = useVertical();
  const isGym = vertical === "gyms";

  return (
    <form className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-zinc-500">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder={isGym ? "you@yourgroup.com" : "you@museum.org"}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="venue" className="mb-2 block text-sm text-zinc-500">
          {isGym ? "Gym name" : "Venue name"}
        </label>
        <input
          id="venue"
          type="text"
          placeholder={isGym ? "e.g. City Centre Gym" : "e.g. City Art Museum"}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
      >
        Request pilot
      </button>
    </form>
  );
}
