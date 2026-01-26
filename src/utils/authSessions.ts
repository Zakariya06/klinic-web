import { UserRole } from "@/types/userTypes";

// These are the keys like "USER" | "DOCTOR" | ...
export type RoleKey = keyof typeof UserRole;

export type AuthSession = {
  token: string;
  user: any;
  role: RoleKey;
  updatedAt: number;
};

export type SessionsMap = Partial<Record<RoleKey, AuthSession>>;

const KEY = "auth_sessions";
const LAST_ACTIVE_KEY = "last_active_role";

// ✅ normalize any role ("user", "User", "USER") -> "USER"
export function normalizeRole(role: string): RoleKey {
  return role.toUpperCase() as RoleKey;
}

export function getSessions(): SessionsMap {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

// ✅ Always read session using normalized role
export function getSession(role: RoleKey | string): AuthSession | null {
  const sessions = getSessions();
  const key = normalizeRole(role as string);
  return sessions?.[key] || null;
}

// ✅ Always save session using normalized role
export function setSession(role: RoleKey | string, session: AuthSession) {
  const sessions = getSessions();
  const key = normalizeRole(role as string);

  sessions[key] = {
    ...session,
    role: key, // ensure session.role is uppercase too
  };

  localStorage.setItem(KEY, JSON.stringify(sessions));
  localStorage.setItem(LAST_ACTIVE_KEY, key); // ✅ store exact key
}

export function clearSession(role: RoleKey | string) {
  const sessions = getSessions();
  const key = normalizeRole(role as string);

  delete sessions[key];
  localStorage.setItem(KEY, JSON.stringify(sessions));

  const last = getLastActiveRole();
  if (last === key) localStorage.removeItem(LAST_ACTIVE_KEY);
}

export function hasAnySession(): boolean {
  const sessions = getSessions();
  return Object.values(sessions).some((s) => !!s?.token);
}

export function getLastActiveRole(): RoleKey | null {
  const v = localStorage.getItem(LAST_ACTIVE_KEY);
  return v ? (normalizeRole(v) as RoleKey) : null;
}

export function getDefaultRedirectRole(): RoleKey | null {
  const last = getLastActiveRole();
  if (last && getSession(last)?.token) return last;

  const sessions = getSessions();
  const entries = Object.entries(sessions) as [RoleKey, AuthSession][];
  if (entries.length === 0) return null;

  entries.sort((a, b) => (b[1]?.updatedAt || 0) - (a[1]?.updatedAt || 0));
  return entries[0][0] || null;
}
