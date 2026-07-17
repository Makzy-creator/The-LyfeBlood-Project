"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  apiCreateRequest,
  apiDeleteRequest,
  apiGetNotifications,
  apiGetProfile,
  apiUpdateNotifications,
  apiUpdateRequestStatus,
} from "@/utils/api";
import { supabase } from "@/lib/supabase-client";

// ─── PERSONA DEFINITIONS ─────────────────────────────────────────────────────
// ─── BLOOD GROUPS ─────────────────────────────────────────────────────────────
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// ─── REQUEST STATUS ENUM ──────────────────────────────────────────────────────
export const REQUEST_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  DONOR_MATCHED: "donor_matched",
  CHECKED_IN: "checked_in",
  BLOOD_COLLECTED: "blood_collected",
  FULFILLED: "fulfilled",
  CANCELLED: "cancelled",
};

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);
const AUTH_STORAGE_KEY = "lyfeblood.auth.user";
const AUTH_TOKEN_STORAGE_KEY = "lyfeblood.auth.token";

function canUseStorage() {
  try {
    return typeof window !== "undefined" && !!window.sessionStorage;
  } catch {
    return false;
  }
}

// Auth lives in sessionStorage so an un-remembered sign-in is scoped to the
// browser session; a "Remember Me" session is restored from an httpOnly cookie
// on the server instead. Theme and other durable prefs stay in localStorage.
function getInitialUser() {
  if (!canUseStorage()) return null;
  try {
    const stored = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    const token = window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    return stored && token ? JSON.parse(stored) : null;
  } catch {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return null;
  }
}

function normalizeDbUser(u) {
  const fullName = u.full_name ?? u.name ?? "LyfeBlood User";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    id: u.id,
    role: u.role,
    roleLabel:
      u.role === "donor"
        ? "Blood Donor"
        : u.role === "hospital"
          ? "Hospital Officer"
          : "Patient / Family",
    name: fullName,
    avatar: initials || "LB",
    bloodGroup: u.blood_type ?? u.bloodGroup ?? null,
    location: u.location ?? null,
    isAvailable: u.availability_status === 1 || u.availability_status === true,
    lastDonationAt:
      u.last_donation_at ?? u.lastDonationAt ?? u.lastDonated ?? null,
    lastDonated:
      u.last_donation_at ?? u.lastDonationAt ?? u.lastDonated ?? null,
    rewardPoints: Number(u.reward_points ?? u.rewardPoints ?? 0),
    email: u.email ?? null,
    phone: u.phone ?? null,
  };
}

function normalizeRequestStatus(status) {
  switch (status) {
    case "Pending":
    case REQUEST_STATUS.PENDING:
      return REQUEST_STATUS.PENDING;
    case "Verified":
    case REQUEST_STATUS.VERIFIED:
      return REQUEST_STATUS.VERIFIED;
    case "Donor Matched":
    case REQUEST_STATUS.DONOR_MATCHED:
      return REQUEST_STATUS.DONOR_MATCHED;
    case "Arrived":
    case "Arrived At Lab":
    case REQUEST_STATUS.CHECKED_IN:
      return REQUEST_STATUS.CHECKED_IN;
    case "Blood Collected":
    case REQUEST_STATUS.BLOOD_COLLECTED:
      return REQUEST_STATUS.BLOOD_COLLECTED;
    case "Completed":
    case REQUEST_STATUS.FULFILLED:
      return REQUEST_STATUS.FULFILLED;
    case "Cancelled":
    case REQUEST_STATUS.CANCELLED:
      return REQUEST_STATUS.CANCELLED;
    default:
      return REQUEST_STATUS.PENDING;
  }
}

function normalizeBloodRequest(r) {
  return {
    id: r.id,
    tier: r.urgency_tier === "SOS" ? "sos" : "standard",
    bloodGroup: r.blood_type_needed ?? r.bloodGroup ?? null,
    unitsNeeded: r.units_needed ?? r.unitsNeeded ?? 1,
    unitsFulfilled: r.units_fulfilled ?? r.unitsFulfilled ?? 0,
    hospitalName: r.hospital_name ?? r.hospitalName ?? "Hospital",
    ward: r.ward ?? r.patient_ref ?? r.patientCode ?? "Blood request",
    patientCode: r.patient_ref ?? r.patientCode ?? null,
    status: normalizeRequestStatus(r.status),
    requestedBy: r.requested_by ?? r.requestedBy ?? null,
    requestDate: r.created_at ?? r.requestDate ?? new Date().toISOString(),
    urgencyNote: r.urgency_note ?? r.urgencyNote ?? null,
    location: r.location ?? null,
    requestType: r.request_type ?? r.requestType ?? "Emergency",
    scheduledFor: r.scheduled_for ?? r.scheduledFor ?? null,
    matchingStatus: r.matching_status ?? r.matchingStatus ?? "pending",
  };
}

function normalizeRole(role) {
  if (role === "patient_family") return "requester";
  if (role === "hospital_officer") return "hospital";
  return role;
}

function requestSortPriority(urgencyTier) {
  switch (urgencyTier) {
    case "SOS":
      return 0;
    case "Urgent":
      return 1;
    default:
      return 2;
  }
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getInitialUser);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!getInitialUser();
  });
  const [bloodRequests, setBloodRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeNav, setActiveNav] = useState("home");
  const [donorAvailable, setDonorAvailable] = useState(true);
  const [incomingMatchAlert, setIncomingMatchAlert] = useState(null);

  const refreshBloodRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from("blood_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const requests = (data ?? []).sort((a, b) => {
      const aPriority = requestSortPriority(a?.urgency_tier);
      const bPriority = requestSortPriority(b?.urgency_tier);
      if (aPriority !== bPriority) return aPriority - bPriority;
      return (
        new Date(b?.created_at ?? 0).getTime() -
        new Date(a?.created_at ?? 0).getTime()
      );
    });

    setBloodRequests(requests.map(normalizeBloodRequest));
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!getInitialUser()) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const { notifications: rows, unread_count } = await apiGetNotifications();
    setNotifications(
      (rows ?? []).map((notification) => ({
        ...notification,
        isRead: Boolean(notification.read_at),
        requestId: notification.request_id,
        matchId: notification.match_id,
        timestamp: notification.created_at,
      })),
    );
    setUnreadCount(unread_count ?? 0);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setBloodRequests([]);
      return;
    }
    refreshBloodRequests().catch((error) => {
      console.error("[AppContext] Failed to load blood requests:", error);
      setBloodRequests([]);
    });
  }, [isAuthenticated, refreshBloodRequests]);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshNotifications().catch((error) => {
      console.error("[AppContext] Failed to load notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    });
  }, [isAuthenticated, refreshNotifications]);

  const login = useCallback(
    (authPayload) => {
      if (!authPayload || typeof authPayload !== "object") return;
      const authUser = authPayload.user ?? authPayload;
      const token = authPayload.token ?? null;
      const user = normalizeDbUser(authUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setBloodRequests([]);
      setNotifications([]);
      setUnreadCount(0);
      setDonorAvailable(user.isAvailable);
      if (canUseStorage()) {
        window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        if (token) window.sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      }
      refreshBloodRequests().catch((error) => {
        console.error(
          "[AppContext] Failed to refresh blood requests after login:",
          error,
        );
      });
      refreshNotifications().catch((error) => {
        console.error(
          "[AppContext] Failed to refresh notifications after login:",
          error,
        );
      });
    },
    [refreshBloodRequests, refreshNotifications],
  );

  const logout = useCallback(async () => {
    // Sign out of Supabase first; only clear local auth if it succeeds so a
    // failed sign-out leaves the user signed in (and surfaces the error).
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveNav("home");
    setIncomingMatchAlert(null);
    setNotifications([]);
    setUnreadCount(0);
    if (canUseStorage()) {
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
      window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  }, []);

  const updateCurrentUser = useCallback((nextUser) => {
    const normalized = normalizeDbUser(nextUser);
    setCurrentUser(normalized);
    setDonorAvailable(normalized.isAvailable);
    if (canUseStorage()) {
      window.sessionStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(normalized),
      );
    }
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const { user } = await apiGetProfile();
    updateCurrentUser(user);
    return user;
  }, [updateCurrentUser]);

  useEffect(() => {
    let active = true;

    async function applySession(session) {
      if (!session?.access_token || !canUseStorage()) return;
      window.sessionStorage.setItem(
        AUTH_TOKEN_STORAGE_KEY,
        session.access_token,
      );
      try {
        const { user } = await apiGetProfile();
        if (!active) return;
        updateCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error(
          "[AppContext] Failed to restore Supabase session:",
          error,
        );
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      applySession(data?.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          if (canUseStorage()) {
            window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
            window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
          }
          setCurrentUser(null);
          setIsAuthenticated(false);
          return;
        }

        if (session?.access_token) {
          applySession(session);
        }
      },
    );

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, [updateCurrentUser]);

  const toggleDonorAvailable = useCallback(() => {
    setDonorAvailable((v) => !v);
  }, []);

  const triggerMatchAlert = useCallback((matchData) => {
    if (matchData) setIncomingMatchAlert(matchData);
  }, []);

  const dismissMatchAlert = useCallback(() => {
    setIncomingMatchAlert(null);
  }, []);

  const updateRequestStatus = useCallback(
    async (requestId, newStatus, options = {}) => {
      const statusByUiStatus = {
        [REQUEST_STATUS.PENDING]: "pending",
        [REQUEST_STATUS.VERIFIED]: "verified",
        [REQUEST_STATUS.DONOR_MATCHED]: "donor_matched",
        [REQUEST_STATUS.CHECKED_IN]: "checked_in",
        [REQUEST_STATUS.BLOOD_COLLECTED]: "blood_collected",
        [REQUEST_STATUS.FULFILLED]: "fulfilled",
        [REQUEST_STATUS.CANCELLED]: "cancelled",
      };
      if (options.persist !== false) {
        await apiUpdateRequestStatus({
          request_id: requestId,
          status: statusByUiStatus[newStatus] ?? newStatus,
        });
        refreshNotifications().catch((error) => {
          console.error(
            "[AppContext] Failed to refresh notifications after status update:",
            error,
          );
        });
      }
      setBloodRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req,
        ),
      );
    },
    [refreshNotifications],
  );

  const addRequest = useCallback(
    async (newRequest) => {
      const { request } = await apiCreateRequest({
        hospital_name: newRequest.hospitalName,
        blood_type_needed: newRequest.bloodGroup,
        urgency_tier: newRequest.tier === "sos" ? "SOS" : "Standard",
        units_needed: newRequest.unitsNeeded,
        patient_ref: newRequest.patientCode ?? newRequest.ward ?? null,
        location: newRequest.location ?? null,
        urgency_note: newRequest.urgencyNote ?? null,
        requested_by: newRequest.requestedBy ?? null,
        request_type: newRequest.requestType ?? "Emergency",
        scheduled_for: newRequest.scheduledFor ?? null,
      });
      const normalizedRequest = normalizeBloodRequest(request);
      setBloodRequests((prev) => [normalizedRequest, ...prev]);
      refreshNotifications().catch((error) => {
        console.error(
          "[AppContext] Failed to refresh notifications after request create:",
          error,
        );
      });
      return { request: normalizedRequest };
    },
    [refreshNotifications],
  );

  const deleteRequest = useCallback(
    async (requestId) => {
      await apiDeleteRequest(requestId);
      setBloodRequests((prev) =>
        prev.filter((request) => request.id !== requestId),
      );
      refreshNotifications().catch((error) => {
        console.error(
          "[AppContext] Failed to refresh notifications after request delete:",
          error,
        );
      });
    },
    [refreshNotifications],
  );

  const markAllNotificationsRead = useCallback(async () => {
    await apiUpdateNotifications({ read: true });
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isRead: true,
        read_at: notification.read_at ?? new Date().toISOString(),
      })),
    );
    setUnreadCount(0);
  }, []);

  const markNotificationsUnread = useCallback(
    async (ids) => {
      await apiUpdateNotifications({ ids, read: false });
      setNotifications((prev) =>
        prev.map((notification) => {
          if (ids?.length && !ids.includes(notification.id))
            return notification;
          return { ...notification, isRead: false, read_at: null };
        }),
      );
      refreshNotifications().catch((error) => {
        console.error(
          "[AppContext] Failed to refresh notifications after unread update:",
          error,
        );
      });
    },
    [refreshNotifications],
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        updateCurrentUser,
        refreshCurrentUser,
        isAuthenticated,
        login,
        logout,
        bloodRequests,
        updateRequestStatus,
        addRequest,
        deleteRequest,
        notifications,
        unreadCount,
        markAllNotificationsRead,
        markNotificationsUnread,
        refreshNotifications,
        activeNav,
        setActiveNav,
        donorAvailable,
        toggleDonorAvailable,
        incomingMatchAlert,
        triggerMatchAlert,
        dismissMatchAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}

export default AppContext;
