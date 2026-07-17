import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "@/context/AppContext";
import ProfilePage from "./page";

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  unsubscribe: vi.fn(),
  from: vi.fn(),
  getNotifications: vi.fn(),
  getProfile: vi.fn(),
  logout: vi.fn(),
  restoreSession: vi.fn(),
  updateNotifications: vi.fn(),
}));

vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    auth: {
      signOut: mocks.signOut,
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
    },
    from: mocks.from,
    rpc: vi.fn(),
  },
}));

vi.mock("@/utils/api", () => ({
  apiCreateRequest: vi.fn(),
  apiDeleteRequest: vi.fn(),
  apiGetNotifications: mocks.getNotifications,
  apiGetProfile: mocks.getProfile,
  apiLogout: mocks.logout,
  apiRestoreSession: mocks.restoreSession,
  apiUpdateNotifications: mocks.updateNotifications,
  apiUpdateRequestStatus: vi.fn(),
}));

const AUTH_USER_KEY = "lyfeblood.auth.user";
const AUTH_TOKEN_KEY = "lyfeblood.auth.token";

function makeUser(role) {
  return {
    id: `${role}-user`,
    role,
    name: "Test User",
    avatar: "TU",
    bloodGroup: role === "donor" ? "O+" : null,
    location: "Lagos",
    phone: "+2348000000000",
    isAvailable: role === "donor",
    email: `${role}@example.com`,
  };
}

function seedAuth(role) {
  window.sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(makeUser(role)));
  window.sessionStorage.setItem(AUTH_TOKEN_KEY, "session-token");
  window.localStorage.setItem("lyfeblood.theme", "dark");
}

function mockBloodRequestQuery() {
  const limit = vi.fn().mockResolvedValue({ data: [], error: null });
  const order = vi.fn(() => ({ limit }));
  const select = vi.fn(() => ({ order }));
  mocks.from.mockImplementation((table) => {
    if (table === "blood_requests") return { select };
    return { select: vi.fn() };
  });
}

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={["/profile"]}>
      <AppProvider>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<div data-testid="login-page">Sign in</div>} />
        </Routes>
      </AppProvider>
    </MemoryRouter>,
  );
}

describe("Profile logout", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.clearAllMocks();
    mockBloodRequestQuery();
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mocks.unsubscribe } },
    });
    mocks.getNotifications.mockResolvedValue({ notifications: [], unread_count: 0 });
    mocks.getProfile.mockResolvedValue({ user: makeUser("donor") });
    mocks.logout.mockResolvedValue({});
    mocks.restoreSession.mockRejectedValue(new Error("No remembered session"));
    mocks.updateNotifications.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
  });

  it.each([
    ["blood donor", "donor"],
    ["hospital", "hospital"],
    ["patient/family", "patient_family"],
    ["admin", "admin"],
  ])("logs out a %s profile and blocks protected profile access after refresh", async (_label, role) => {
    seedAuth(role);
    let resolveSignOut;
    mocks.signOut.mockReturnValue(
      new Promise((resolve) => {
        resolveSignOut = () => resolve({ error: null });
      }),
    );

    const { unmount } = renderProfile();
    const logoutButton = await screen.findByRole("button", { name: /logout/i });

    fireEvent.click(logoutButton);
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mocks.signOut).toHaveBeenCalledTimes(1);
    });
    expect(logoutButton).toBeDisabled();

    resolveSignOut();

    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });
    expect(window.sessionStorage.getItem(AUTH_USER_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(window.localStorage.getItem("lyfeblood.theme")).toBe("dark");

    unmount();
    renderProfile();

    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });
  });

  it("shows an error and keeps auth storage when Supabase sign-out fails", async () => {
    seedAuth("donor");
    mocks.signOut.mockResolvedValue({ error: new Error("Unable to sign out") });

    renderProfile();
    fireEvent.click(await screen.findByRole("button", { name: /logout/i }));

    expect(await screen.findByText("Unable to sign out")).toBeInTheDocument();
    expect(window.sessionStorage.getItem(AUTH_USER_KEY)).not.toBeNull();
    expect(window.sessionStorage.getItem(AUTH_TOKEN_KEY)).toBe("session-token");
  });
});
