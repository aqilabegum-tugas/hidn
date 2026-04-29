// HIDN API client — talks to backend Express (default http://localhost:4000)
export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:4000";

const TOKEN_KEY = "hidn-token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
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
  register: (email: string, fullName: string, password: string) =>
    api<{ token: string; user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, fullName, password }),
    }),
  login: (email: string, password: string) =>
    api<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => api<AuthUser>("/api/auth/me", { auth: true }),
};
