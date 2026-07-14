import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as restoreSession } from "@/app/api/auth/session/route";
import { REMEMBER_SESSION_COOKIE } from "@/app/api/auth/session-cookie";

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  refreshSession: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("@/app/api/utils/supabase", () => ({
  createSupabaseAuthClient: () => ({
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      refreshSession: mocks.refreshSession,
    },
  }),
  createSupabaseServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: mocks.maybeSingle,
        }),
      }),
    }),
  }),
  normalizeEmail: (email) => email?.trim().toLowerCase() ?? "",
}));

const profile = {
  id: "user-1",
  email: "user@example.com",
  role: "donor",
  full_name: "Test User",
};

function makeRequest(body, options = {}) {
  return new Request(options.url ?? "https://app.test/api/auth/login", {
    method: options.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.cookie ? { cookie: options.cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function mockSignedInSession(overrides = {}) {
  mocks.signInWithPassword.mockResolvedValue({
    data: {
      user: { id: profile.id },
      session: {
        access_token: "access-token",
        refresh_token: "refresh-token",
        expires_at: 1810000000,
        ...overrides,
      },
    },
    error: null,
  });
  mocks.maybeSingle.mockResolvedValue({ data: profile, error: null });
}

describe("Supabase Remember Me session cookies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps unchecked sign-in browser-session only and clears any remembered cookie", async () => {
    mockSignedInSession();

    const response = await login(makeRequest({
      email: " USER@example.com ",
      password: "password",
      rememberMe: false,
    }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({ user: profile, token: "access-token" });
    expect(json.session).toBeUndefined();
    expect(JSON.stringify(json)).not.toContain("refresh-token");
    expect(response.headers.get("set-cookie")).toContain(`${REMEMBER_SESSION_COOKIE}=`);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("sets a persistent httpOnly secure cookie when Remember Me is checked", async () => {
    mockSignedInSession();

    const response = await login(makeRequest({
      email: "user@example.com",
      password: "password",
      rememberMe: true,
    }));

    const cookie = response.headers.get("set-cookie");
    expect(response.status).toBe(200);
    expect(cookie).toContain(`${REMEMBER_SESSION_COOKIE}=refresh-token`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Max-Age=2592000");
  });

  it("restores a remembered session and rotates the refresh-token cookie", async () => {
    mocks.refreshSession.mockResolvedValue({
      data: {
        user: { id: profile.id },
        session: {
          access_token: "new-access-token",
          refresh_token: "new-refresh-token",
          expires_at: 1810000000,
        },
      },
      error: null,
    });
    mocks.maybeSingle.mockResolvedValue({ data: profile, error: null });

    const response = await restoreSession(
      makeRequest(undefined, {
        method: "GET",
        url: "https://app.test/api/auth/session",
        cookie: `${REMEMBER_SESSION_COOKIE}=old-refresh-token`,
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.refreshSession).toHaveBeenCalledWith({
      refresh_token: "old-refresh-token",
    });
    expect(json).toMatchObject({ user: profile, token: "new-access-token" });
    expect(response.headers.get("set-cookie")).toContain(
      `${REMEMBER_SESSION_COOKIE}=new-refresh-token`,
    );
  });

  it("expires an invalid remembered session and clears the cookie", async () => {
    mocks.refreshSession.mockResolvedValue({
      data: { session: null, user: null },
      error: new Error("expired"),
    });

    const response = await restoreSession(
      makeRequest(undefined, {
        method: "GET",
        url: "https://app.test/api/auth/session",
        cookie: `${REMEMBER_SESSION_COOKIE}=expired-refresh-token`,
      }),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toContain(`${REMEMBER_SESSION_COOKIE}=`);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("clears the persistent session cookie on logout", async () => {
    const response = await logout(
      makeRequest(undefined, {
        method: "POST",
        url: "https://app.test/api/auth/logout",
        cookie: `${REMEMBER_SESSION_COOKIE}=refresh-token`,
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain(`${REMEMBER_SESSION_COOKIE}=`);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });
});
