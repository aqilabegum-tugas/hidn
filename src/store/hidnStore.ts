import { useEffect, useState } from "react";
import { Personality, Destination } from "@/data/hidn";

const KEY = "hidn-state-v1";

export type ItineraryItem = {
  id: string;
  destinationId: string;
  destinationName: string;
  day: number;
  time: string;
  activity: string;
  notes?: string;
};

export type HidnState = {
  personality?: Personality;
  savedDestinations: string[];
  itineraries: { id: string; title: string; createdAt: string; items: ItineraryItem[] }[];
};

const initial: HidnState = { savedDestinations: [], itineraries: [] };

function read(): HidnState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch { return initial; }
}

let listeners: Array<() => void> = [];
let state: HidnState = typeof window !== "undefined" ? read() : initial;

function emit() { listeners.forEach((l) => l()); }
function persist() { localStorage.setItem(KEY, JSON.stringify(state)); emit(); }

export const hidnStore = {
  get: () => state,
  setPersonality(p: Personality) { state = { ...state, personality: p }; persist(); },
  toggleSave(d: Destination) {
    const set = new Set(state.savedDestinations);
    set.has(d.id) ? set.delete(d.id) : set.add(d.id);
    state = { ...state, savedDestinations: [...set] }; persist();
  },
  createItinerary(title: string) {
    const it = { id: crypto.randomUUID(), title, createdAt: new Date().toISOString(), items: [] };
    state = { ...state, itineraries: [it, ...state.itineraries] }; persist();
    return it.id;
  },
  addItem(itineraryId: string, item: Omit<ItineraryItem, "id">) {
    state = {
      ...state,
      itineraries: state.itineraries.map((it) =>
        it.id === itineraryId ? { ...it, items: [...it.items, { ...item, id: crypto.randomUUID() }] } : it
      ),
    }; persist();
  },
  removeItem(itineraryId: string, itemId: string) {
    state = {
      ...state,
      itineraries: state.itineraries.map((it) =>
        it.id === itineraryId ? { ...it, items: it.items.filter((x) => x.id !== itemId) } : it
      ),
    }; persist();
  },
  removeItinerary(id: string) {
    state = { ...state, itineraries: state.itineraries.filter((i) => i.id !== id) }; persist();
  },
  reset() { state = initial; persist(); },
};

export function useHidn() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((x) => x + 1);
    listeners.push(fn);
    return () => { listeners = listeners.filter((l) => l !== fn); };
  }, []);
  return state;
}
