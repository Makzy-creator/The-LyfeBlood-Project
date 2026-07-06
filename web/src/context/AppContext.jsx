"use client";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  apiCreateRequest,
  apiGetNotifications,
  apiGetRequests,
  apiUpdateNotifications,
  apiUpdateRequestStatus,
} from "@/utils/api";

// ─── PERSONA DEFINITIONS ─────────────────────────────────────────────────────
export const PERSONAS = {
  donor: {
    id: "donor-001",
    role: "donor",
    roleLabel: "Blood Donor",             
    name: "Emmanuel Okafor",
    bloodGroup: "O+",
    avatar: "EO",
    location: "Owerri North, Imo State",
    lastDonated: "2025-02-14",
    totalDonations: 7,
    isAvailable: true,
  },
  patient_family: {
    id: "patient-fam-001",
    role: "patient_family",
    roleLabel: "Patient Family",
    name: "Chioma Eze",
    avatar: "CE",
    location: "Owerri West, Imo State",
    patientName: "Mr. Vincent Eze",
    bloodGroupNeeded: "A-",
  },
  hospital_officer: {
    id: "hospital-001",
    role: "hospital_officer",
    roleLabel: "Hospital Officer",
    name: "Dr. Adaeze Nwosu",
    avatar: "AN",
    hospital: "Federal Medical Centre Owerri",
    department: "Blood Bank & Procurement",
    location: "Owerri Municipal, Imo State",
  },
};

// ─── BLOOD GROUPS ─────────────────────────────────────────────────────────────
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// ─── REQUEST STATUS ENUM ──────────────────────────────────────────────────────
export const REQUEST_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  DONOR_MATCHED: "donor_matched",
  CHECKED_IN: "checked_in",
  FULFILLED: "fulfilled",
  CANCELLED: "cancelled",
};

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);
const AUTH_STORAGE_KEY = "lyfeblood.auth.user";
const AUTH_TOKEN_STORAGE_KEY = "lyfeblood.auth.token";

function canUseStorage() {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function getInitialUser() {
  if (!canUseStorage()) return null;
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    return stored && token ? JSON.parse(stored) : null;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
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
  };
}

function normalizeRole(role) {
  if (role === "patient_family") return "requester";
  if (role === "hospital_officer") return "hospital";
  return role;
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
    const { requests } = await apiGetRequests();
    setBloodRequests((requests ?? []).map(normalizeBloodRequest));
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
    refreshBloodRequests().catch((error) => {
      console.error("[AppContext] Failed to load blood requests:", error);
      setBloodRequests([]);
    });
  }, [refreshBloodRequests]);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshNotifications().catch((error) => {
      console.error("[AppContext] Failed to load notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    });
  }, [isAuthenticated, refreshNotifications]);

  const login = useCallback((personaKeyOrUser) => {
    // Accept a real DB user object (from /api/auth/login response)
    if (personaKeyOrUser && typeof personaKeyOrUser === "object") {
      const authUser = personaKeyOrUser.user ?? personaKeyOrUser;
      const token = personaKeyOrUser.token ?? null;
      const user = normalizeDbUser(authUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setBloodRequests([]); 
      setNotifications([]);
      setUnreadCount(0);
      setDonorAvailable(user.isAvailable);
      if (canUseStorage()) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        if (token) window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      }
      refreshBloodRequests().catch((error) => {
        console.error("[AppContext] Failed to refresh blood requests after login:", error);
      });
      refreshNotifications().catch((error) => {
        console.error("[AppContext] Failed to refresh notifications after login:", error);
      });
      return;
    }
    // Legacy: accept a persona key string (keeps existing mock flows working)
    const persona = PERSONAS[personaKeyOrUser];
    if (!persona) return;
    setCurrentUser(persona);
    setIsAuthenticated(true);
    setBloodRequests([]);
    setNotifications([]);
    setUnreadCount(0);
    setDonorAvailable(persona.isAvailable ?? true);
    if (canUseStorage()) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(persona));
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
    refreshBloodRequests().catch((error) => {
      console.error("[AppContext] Failed to refresh blood requests after login:", error);
    });
    refreshNotifications().catch((error) => {
      console.error("[AppContext] Failed to refresh notifications after login:", error);
    });
  }, [refreshBloodRequests, refreshNotifications]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveNav("home");
    setIncomingMatchAlert(null);
    setNotifications([]);
    setUnreadCount(0);
    if (canUseStorage()) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  }, []);

  const updateCurrentUser = useCallback((nextUser) => {
    const normalized = normalizeDbUser(nextUser);
    setCurrentUser(normalized);
    setDonorAvailable(normalized.isAvailable);
    if (canUseStorage()) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
    }
  }, []);

  const toggleDonorAvailable = useCallback(() => {
    setDonorAvailable((v) => !v);
  }, []);

  const triggerMatchAlert = useCallback((matchData) => {
    if (matchData) setIncomingMatchAlert(matchData);
  }, []);

  const dismissMatchAlert = useCallback(() => {
    setIncomingMatchAlert(null);
  }, []);

  const updateRequestStatus = useCallback(async (requestId, newStatus, options = {}) => {
    const statusByUiStatus = {
      [REQUEST_STATUS.PENDING]: "pending",
      [REQUEST_STATUS.VERIFIED]: "verified",
      [REQUEST_STATUS.DONOR_MATCHED]: "donor_matched",
      [REQUEST_STATUS.CHECKED_IN]: "checked_in",
      [REQUEST_STATUS.FULFILLED]: "fulfilled",
      [REQUEST_STATUS.CANCELLED]: "cancelled",
    };
    if (options.persist !== false) {
      await apiUpdateRequestStatus({
        request_id: requestId,
        status: statusByUiStatus[newStatus] ?? newStatus,
      });
      refreshNotifications().catch((error) => {
        console.error("[AppContext] Failed to refresh notifications after status update:", error);
      });
    }
    setBloodRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req,
      ),
    );
  }, [refreshNotifications]);

  const addRequest = useCallback(async (newRequest) => {
    const { request } = await apiCreateRequest({
      hospital_name: newRequest.hospitalName,
      blood_type_needed: newRequest.bloodGroup,
      urgency_tier: newRequest.tier === "sos" ? "SOS" : "Standard",
      units_needed: newRequest.unitsNeeded,
      patient_ref: newRequest.patientCode ?? newRequest.ward ?? null,
      location: newRequest.location ?? null,
      urgency_note: newRequest.urgencyNote ?? null,
      requested_by: newRequest.requestedBy ?? null,
    });
    setBloodRequests((prev) => [normalizeBloodRequest(request), ...prev]);
    refreshNotifications().catch((error) => {
      console.error("[AppContext] Failed to refresh notifications after request create:", error);
    });
  }, [refreshNotifications]);

  const markAllNotificationsRead = useCallback(async () => {
    await apiUpdateNotifications({ read: true });
    setNotifications((prev) => prev.map((notification) => ({
      ...notification,
      isRead: true,
      read_at: notification.read_at ?? new Date().toISOString(),
    })));
    setUnreadCount(0);
  }, []);

  const markNotificationsUnread = useCallback(async (ids) => {
    await apiUpdateNotifications({ ids, read: false });
    setNotifications((prev) => prev.map((notification) => {
      if (ids?.length && !ids.includes(notification.id)) return notification;
      return { ...notification, isRead: false, read_at: null };
    }));
    refreshNotifications().catch((error) => {
      console.error("[AppContext] Failed to refresh notifications after unread update:", error);
    });
  }, [refreshNotifications]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        updateCurrentUser,
        isAuthenticated,
        login,
        logout,
        bloodRequests,
        updateRequestStatus,
        addRequest,
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
