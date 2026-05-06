// HIDN API client — talks to backend Express (default http://localhost:4000)
export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:4000";

const TOKEN_KEY = "hidn-token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export type UserRole = "traveler" | "government" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization: string | null;
  phone: string | null;
  personality: string | null;
  created_at: string;
};

export async function api<T = any>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (opts.auth) {
    const t = tokenStore.get();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export const authApi = {
  register: (payload: {
    email: string; fullName: string; password: string;
    role?: UserRole; organization?: string; phone?: string;
  }) =>
    api<{ token: string; user: AuthUser }>("/api/auth/register", {
      method: "POST", body: JSON.stringify(payload),
    }),
  login: (email: string, password: string) =>
    api<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST", body: JSON.stringify({ email, password }),
    }),
  me: () => api<AuthUser>("/api/auth/me", { auth: true }),
};

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export const bookingsApi = {
  create: (payload: {
    destinationId: string; fullName: string; email: string; phone: string;
    visitDate: string; numPeople: number; numDays: number; notes?: string;
  }) => api<any>("/api/bookings", { method: "POST", auth: true, body: JSON.stringify(payload) }),
  myList: () => api<any[]>("/api/bookings", { auth: true }),
  cancel: (id: string) => api<any>(`/api/bookings/${id}`, { method: "DELETE", auth: true }),
};

export const govApi = {
  destinations: () => api<any[]>("/api/gov/destinations", { auth: true }),
  createDestination: (payload: any) =>
    api<any>("/api/gov/destinations", { method: "POST", auth: true, body: JSON.stringify(payload) }),
  updateDestination: (id: string, payload: any) =>
    api<any>(`/api/gov/destinations/${id}`, { method: "PUT", auth: true, body: JSON.stringify(payload) }),
  deleteDestination: (id: string) =>
    api<any>(`/api/gov/destinations/${id}`, { method: "DELETE", auth: true }),
  bookings: () => api<any[]>("/api/gov/bookings", { auth: true }),
  setBookingStatus: (id: string, status: BookingStatus) =>
    api<any>(`/api/gov/bookings/${id}/status`, {
      method: "PATCH", auth: true, body: JSON.stringify({ status }),
    }),
  stats: () => api<{ total_destinations: number; total_bookings: number; pending_bookings: number; revenue: number }>(
    "/api/gov/stats", { auth: true }),
};
