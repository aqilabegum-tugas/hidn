import { useEffect, useState } from "react";
import { authApi, tokenStore, AuthUser } from "@/lib/api";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

let state: AuthState = { user: null, loading: true };
let listeners: Array<() => void> = [];
const emit = () => listeners.forEach((l) => l());

async function bootstrap() {
  if (!tokenStore.get()) {
    state = { user: null, loading: false };
    emit();
    return;
  }
  try {
    const me = await authApi.me();
    state = { user: me, loading: false };
  } catch {
    tokenStore.clear();
    state = { user: null, loading: false };
  }
  emit();
}
bootstrap();

export const authStore = {
  get: () => state,
  async login(email: string, password: string) {
    const { token, user } = await authApi.login(email, password);
    tokenStore.set(token);
    state = { user, loading: false };
    emit();
  },
  async register(email: string, fullName: string, password: string) {
    const { token, user } = await authApi.register(email, fullName, password);
    tokenStore.set(token);
    state = { user, loading: false };
    emit();
  },
  logout() {
    tokenStore.clear();
    state = { user: null, loading: false };
    emit();
  },
};

export function useAuth() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((x) => x + 1);
    listeners.push(fn);
    return () => { listeners = listeners.filter((l) => l !== fn); };
  }, []);
  return state;
}
