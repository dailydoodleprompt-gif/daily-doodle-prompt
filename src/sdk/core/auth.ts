/**
 * Authentication Integration Utilities with Zustand
 *
 * This file provides utilities for built pages to receive and handle
 * authentication tokens from the parent Build Studio application.
 *
 * Usage in built pages:
 * 1. Include this file in your built application
 * 3. Use await getAuthTokenAsync() to get the current token for API calls
 * 4. Or use the useCreaoAuth() hook in React components
 */

import { create } from "zustand";

interface AuthMessage {
  type: "CREAO_AUTH_TOKEN";
  token: string;
  origin: string;
}

type AuthStatus =
  | "authenticated"
  | "unauthenticated"
  | "invalid_token"
  | "loading";

interface AuthState {
  token: string | null;
  status: AuthStatus;
  parentOrigin: string | null;
}

interface AuthStore extends AuthState {
  // Internal state (kept for compatibility)
  initializationPromise: Promise<void> | null;
  validationPromise: Promise<boolean> | null;

  // Actions
  setToken: (token: string, origin?: string | null) => Promise<void>;
  setStatus: (status: AuthStatus) => void;
  setState: (state: Partial<AuthState>) => void;
  clearAuth: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  initialize: () => Promise<void>;
  validateToken: (token: string) => Promise<boolean>;
}

// -----------------------------
// Config
// -----------------------------

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_PATH ||
  import.meta.env.VITE_MCP_API_BASE_PATH ||
  "/api";

function normalizeBaseUrl(base: string): string {
  // Remove trailing slash so `${base}/me` is clean
  return base.replace(/\/+$/, "");
}

const API_BASE_URL = normalizeBaseUrl(RAW_API_BASE_URL);

// -----------------------------
// Zustand store
// -----------------------------

const useAuthStore = create<AuthStore>((set, get): AuthStore => ({
  // Initial state
  token: null,
  status: "loading",
  parentOrigin: null,
  initializationPromise: null,
  validationPromise: null,

  setStatus: (status: AuthStatus) => {
    set({ status });
  },

  setState: (newState: Partial<AuthState>) => {
    set(newState);
  },

  // Validate token by making a request to the /me endpoint
  validateToken: async (token: string): Promise<boolean> => {
    console.log("Validating token...", { API_BASE_URL });

    if (!API_BASE_URL) {
      console.error("API_BASE_URL is not set");
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Token validation response:", response.status, response.ok);
      return response.ok;
    } catch (error) {
      console.warn("Token validation failed:", error);
      return false;
    }
  },

  // Set the authentication token (async to validate)
  setToken: async (token: string, origin?: string | null): Promise<void> => {
    const { validateToken } = get();

    try {
      const isValid = await validateToken(token);

      if (isValid) {
        const parentOrigin = origin || get().parentOrigin;

        // Update in-memory auth state
        set({
          token,
          status: "authenticated",
          parentOrigin,
        });

        // Persist in all known keys so whichever flow reads will work
        persistTokenEverywhere(token);
      } else {
        // Invalid token: fail closed and clear everything
        set({
          token: null,
          status: "unauthenticated",
          parentOrigin: null,
        });

        try {
          localStorage.removeItem("creao_auth_token");
        } catch {}

        try {
          localStorage.removeItem("dailydoodle_oauth_session");
        } catch {}

        try {
          localStorage.removeItem("dailydoodle_session_persist");
        } catch {}
      }
    } catch (error) {
      console.error("[auth] Error while setting token", error);

      set({
        token: null,
        status: "unauthenticated",
        parentOrigin: null,
      });

      try {
        localStorage.removeItem("creao_auth_token");
      } catch {}
      try {
        localStorage.removeItem("dailydoodle_oauth_session");
      } catch {}
      try {
        localStorage.removeItem("dailydoodle_session_persist");
      } catch {}
    }
  },

  clearAuth: async (): Promise<void> => {
    set({
      token: null,
      status: "unauthenticated",
      parentOrigin: null,
    });

    try {
      localStorage.removeItem("creao_auth_token");
    } catch {}

    try {
      localStorage.removeItem("dailydoodle_oauth_session");
    } catch {}

    try {
      localStorage.removeItem("dailydoodle_session_persist");
    } catch {}
  },

  refreshAuth: async (): Promise<boolean> => {
    const { token, validateToken, clearAuth } = get();

    if (!token) return false;

    const isValid = await validateToken(token);
    if (!isValid) {
      set({ status: "invalid_token" });
      await clearAuth();
      return false;
    }

    set({ status: "authenticated" });
    return true;
  },

  initialize: async (): Promise<void> => {
    console.log("Auth initialization started");
    try {
      await initializeFromStorage(get, set);
      await initializeFromUrl(get);
      setupMessageListener(get);

      // Decide final auth status after initialization
      const currentStatus = get().status;
      const existingToken = get().token;

      if (currentStatus === "loading") {
        if (existingToken) {
          console.log(
            "Auth initialization complete – token found, setting to authenticated",
          );
          set({ status: "authenticated" });
        } else {
          console.log(
            "Auth initialization complete – no token, setting to unauthenticated",
          );
          set({ status: "unauthenticated" });
        }
      } else {
        console.log("Auth initialization complete – status:", currentStatus);
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      set({ status: "unauthenticated" });
    }
  },
}));

// -----------------------------
// Storage init (with Supabase import fallback)
// -----------------------------

/**
 * Initialize authentication from localStorage (VALIDATE before trusting)
 * - Prefers canonical key: dailydoodle_session_persist
 * - Falls back to Supabase key: sb-<projectRef>-auth-token (derived from VITE_SUPABASE_URL)
 * - If Supabase token exists + validates, we persist it into canonical keys
 */
async function initializeFromStorage(
  get: () => AuthStore,
  set: (state: Partial<AuthStore>) => void,
): Promise<void> {
  console.log("🟢 STORAGE INIT START");

  try {
    // 1) Prefer canonical key
    const rawSession = localStorage.getItem("dailydoodle_session_persist");
    console.log("🟢 CANONICAL SESSION:", rawSession);

    if (rawSession) {
      const session = JSON.parse(rawSession);
      const restoredToken =
        session?.token || session?.accessToken || session?.authToken || null;

      if (!restoredToken) {
        console.log("⚠️ CANONICAL SESSION FOUND BUT NO TOKEN — clearing");
        localStorage.removeItem("dailydoodle_session_persist");
        set({ status: "unauthenticated", token: null });
        return;
      }

      const isValid = await get().validateToken(restoredToken);
      if (!isValid) {
        console.log("⚠️ CANONICAL TOKEN INVALID — clearing");
        localStorage.removeItem("dailydoodle_session_persist");
        set({ status: "unauthenticated", token: null });
        return;
      }

      set({
        token: restoredToken,
        status: "authenticated",
        parentOrigin: "persist",
      });

      console.log("✅ AUTH RESTORED (canonical)");
      return;
    }

    // 2) Fallback: try importing from Supabase storage
    const supaToken = readSupabaseAccessTokenFromStorage();
    console.log("🟡 SUPABASE IMPORT TOKEN PRESENT:", !!supaToken);

    if (!supaToken) {
      console.log("⚠️ NO STORED SESSION FOUND (canonical or supabase)");
      set({ status: "unauthenticated", token: null });
      return;
    }

    const isValid = await get().validateToken(supaToken);
    if (!isValid) {
      console.log("⚠️ SUPABASE TOKEN INVALID — NOT IMPORTING");
      set({ status: "unauthenticated", token: null });
      return;
    }

    // Persist into canonical + legacy keys so future loads are consistent
    persistTokenEverywhere(supaToken);

    set({
      token: supaToken,
      status: "authenticated",
      parentOrigin: "supabase-import",
    });

    console.log("✅ AUTH RESTORED (imported from supabase storage)");
  } catch (error) {
    console.error("❌ STORAGE INIT FAILED:", error);
    try {
      localStorage.removeItem("dailydoodle_session_persist");
    } catch {}
    set({ status: "unauthenticated", token: null });
  } finally {
    console.log("🔴 STORAGE INIT END");
  }
}

function getSupabaseProjectRefFromUrl(): string | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) return null;

  try {
    const host = new URL(url).hostname; // <ref>.supabase.co
    const ref = host.split(".")[0];
    return ref || null;
  } catch {
    return null;
  }
}

function readSupabaseAccessTokenFromStorage(): string | null {
  const ref = getSupabaseProjectRefFromUrl();
  if (!ref) return null;

  const key = `sb-${ref}-auth-token`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    return (
      data?.access_token ||
      data?.currentSession?.access_token ||
      data?.session?.access_token ||
      null
    );
  } catch {
    return null;
  }
}

function persistTokenEverywhere(token: string) {
  // Canonical key used by this app
  try {
    localStorage.setItem(
      "dailydoodle_session_persist",
      JSON.stringify({ token }),
    );
  } catch (error) {
    console.error("[auth] Failed to persist dailydoodle_session_persist", error);
  }

  // Legacy key for Creao (backwards compat)
  try {
    localStorage.setItem("creao_auth_token", token);
  } catch (error) {
    console.error("[auth] Failed to persist legacy auth token", error);
  }

  // Secondary key used by some flows/tests
  try {
    localStorage.setItem(
      "dailydoodle_oauth_session",
      JSON.stringify({ token, provider: "oauth", expiresAt: null }),
    );
  } catch (error) {
    console.error("[auth] Failed to persist dailydoodle OAuth session", error);
  }
}

// -----------------------------
// URL init + postMessage listener
// -----------------------------

async function initializeFromUrl(get: () => AuthStore): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  const authToken = urlParams.get("auth_token");

  if (authToken) {
    const { setToken } = get();
    await setToken(authToken);
    cleanupUrl();
  }
}

function setupMessageListener(get: () => AuthStore): void {
  window.addEventListener("message", async (event: MessageEvent) => {
    try {
      const data = event.data as AuthMessage;

      if (data?.type === "CREAO_AUTH_TOKEN" && data.token) {
        const { setToken } = get();
        await setToken(data.token, event.origin);
      }
    } catch (error) {
      console.warn("Error processing auth message:", error);
    }
  });
}

function cleanupUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("auth_token");
  window.history.replaceState({}, document.title, url.toString());
}

// Initialize on module load
const initPromise = (async () => {
  const { initialize } = useAuthStore.getState();
  await initialize();
})();

async function ensureInitialized(): Promise<void> {
  await initPromise;
}

// -----------------------------
// Public API
// -----------------------------

export function useCreaoAuth() {
  const token = useAuthStore((state) => state.token);
  const status = useAuthStore((state) => state.status);
  const parentOrigin = useAuthStore((state) => state.parentOrigin);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const refreshAuth = useAuthStore((state) => state.refreshAuth);

  return {
    token,
    status,
    parentOrigin,
    isAuthenticated: status === "authenticated" && !!token,
    isLoading: status === "loading",
    hasInvalidToken: status === "invalid_token",
    hasNoToken: status === "unauthenticated",
    clearAuth,
    refreshAuth,
  };
}

export async function initializeAuthIntegration(): Promise<void> {
  await ensureInitialized();
  console.log("Auth integration initialized");
}

export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

export async function getAuthTokenAsync(): Promise<string | null> {
  await ensureInitialized();
  return useAuthStore.getState().token;
}

export async function isAuthenticated(): Promise<boolean> {
  await ensureInitialized();

  const { token, status, validateToken, clearAuth } = useAuthStore.getState();

  if (!token) return false;
  if (status === "authenticated") return true;

  const isValid = await validateToken(token);
  if (isValid) {
    useAuthStore.setState({ status: "authenticated" });
    return true;
  }

  await clearAuth();
  return false;
}

export function isAuthenticatedSync(): boolean {
  const { status, token } = useAuthStore.getState();
  return status === "authenticated" && !!token;
}

export function getAuthStatus(): AuthStatus {
  return useAuthStore.getState().status;
}

export async function getAuthStatusAsync(): Promise<AuthStatus> {
  await ensureInitialized();
  return useAuthStore.getState().status;
}

export function hasInvalidToken(): boolean {
  return useAuthStore.getState().status === "invalid_token";
}

export async function hasInvalidTokenAsync(): Promise<boolean> {
  await ensureInitialized();
  return useAuthStore.getState().status === "invalid_token";
}

export function hasNoToken(): boolean {
  return useAuthStore.getState().status === "unauthenticated";
}

export async function hasNoTokenAsync(): Promise<boolean> {
  await ensureInitialized();
  return useAuthStore.getState().status === "unauthenticated";
}

export function isAuthenticating(): boolean {
  return useAuthStore.getState().status === "loading";
}

export function getAuthState(): AuthState {
  const { token, status, parentOrigin } = useAuthStore.getState();
  return { token, status, parentOrigin };
}

export function addAuthStateListener(
  listener: (state: AuthState) => void,
): () => void {
  listener(getAuthState());

  const unsubscribe = useAuthStore.subscribe((state) => {
    const { token, status, parentOrigin } = state;
    listener({ token, status, parentOrigin });
  });

  return unsubscribe;
}

export async function clearAuth(): Promise<void> {
  return useAuthStore.getState().clearAuth();
}

export async function refreshAuth(): Promise<boolean> {
  return useAuthStore.getState().refreshAuth();
}
