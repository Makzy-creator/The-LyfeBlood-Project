"use client";
import { createContext, useContext, useState, useCallback } from "react";

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
    notificationCount: 2,
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
    notificationCount: 3,
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
    notificationCount: 5,
  },
};

// ─── BLOOD GROUPS ─────────────────────────────────────────────────────────────
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// ─── REQUEST STATUS ENUM ──────────────────────────────────────────────────────
export const REQUEST_STATUS = {
  PENDING: "pending",
  DONOR_MATCHED: "donor_matched",
  ARRIVED_AT_LAB: "arrived_at_lab",
  COMPLETED: "completed",
};

// ─── MOCK MATCH (used by incoming alert flow) ─────────────────────────────────
export const MATCH_MOCK = {
  matchId: "match-fmc-001",
  requestId: "req-001",
  bloodGroup: "O-",
  hospitalName: "Federal Medical Centre Owerri",
  ward: "Accident & Emergency",
  location: "Orlu Road, Owerri, Imo State",
  distanceKm: 4.2,
  unitsNeeded: 3,
  urgencyNote:
    "Post-operative haemorrhage. Critical — patient is O-, universal donor needed.",
  patientCode: "FMC-AE-2077",
  tier: "sos",
};

// ─── INITIAL MOCK BLOOD REQUESTS ──────────────────────────────────────────────
const INITIAL_REQUESTS = [
  {
    id: "req-001",
    tier: "sos",
    bloodGroup: "O-",
    unitsNeeded: 3,
    unitsFulfilled: 0,
    hospitalName: "Federal Medical Centre Owerri",
    ward: "Accident & Emergency",
    patientCode: "FMC-AE-2077",
    status: REQUEST_STATUS.PENDING,
    requestedBy: "hospital_officer",
    requestDate: "2025-05-22T18:45:00",
    urgencyNote: "Post-operative haemorrhage. Critical.",
    location: "Orlu Road, Owerri, Imo State",
  },
  {
    id: "req-002",
    tier: "standard",
    bloodGroup: "A-",
    unitsNeeded: 2,
    unitsFulfilled: 1,
    hospitalName: "St. David's Hospital",
    ward: "Maternity & Obstetrics",
    patientCode: "SDH-MAT-0339",
    status: REQUEST_STATUS.DONOR_MATCHED,
    requestedBy: "patient_family",
    requestDate: "2025-05-22T11:10:00",
    urgencyNote: "Post-partum anaemia. Stable but urgent.",
    location: "Wetheral Road, Owerri, Imo State",
  },
  {
    id: "req-003",
    tier: "standard",
    bloodGroup: "B+",
    unitsNeeded: 1,
    unitsFulfilled: 1,
    hospitalName: "Holy Rosary Hospital",
    ward: "Surgical Ward C",
    patientCode: "HRH-SWC-1144",
    status: REQUEST_STATUS.ARRIVED_AT_LAB,
    requestedBy: "hospital_officer",
    requestDate: "2025-05-21T09:30:00",
    urgencyNote: "Pre-operative preparation.",
    location: "Hospital Road, Emekuku, Imo State",
  },
];

// ─── INITIAL NOTIFICATIONS ────────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-001",
    type: "sos_alert",
    message: "SOS: O- blood urgently needed at FMC Owerri A&E.",
    timestamp: "2025-05-22T18:50:00",
    isRead: false,
    requestId: "req-001",
  },
  {
    id: "notif-002",
    type: "match_found",
    message: "A donor has been matched for your A- request at St. David's.",
    timestamp: "2025-05-22T12:00:00",
    isRead: false,
    requestId: "req-002",
  },
  {
    id: "notif-003",
    type: "status_update",
    message: "B+ donor arrived at Holy Rosary Lab. Verification in progress.",
    timestamp: "2025-05-22T09:55:00",
    isRead: true,
    requestId: "req-003",
  },
];

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);
const AUTH_STORAGE_KEY = "lyfeblood.auth.user";

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
    return stored ? JSON.parse(stored) : null;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
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
    notificationCount: 0,
    email: u.email ?? null,
    phone: u.phone ?? null,
  };
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getInitialUser);

const [isAuthenticated, setIsAuthenticated] = useState(() => {
  return !!getInitialUser();
});
  const [bloodRequests, setBloodRequests] = useState(INITIAL_REQUESTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeNav, setActiveNav] = useState("home");
  const [donorAvailable, setDonorAvailable] = useState(true);
  const [incomingMatchAlert, setIncomingMatchAlert] = useState(null);

  const login = useCallback((personaKeyOrUser) => {
    // Accept a real DB user object (from /api/auth/login response)
    if (personaKeyOrUser && typeof personaKeyOrUser === "object") {
      const user = normalizeDbUser(personaKeyOrUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setBloodRequests([]); 
      setNotifications([]); 
      setDonorAvailable(user.isAvailable);
      if (canUseStorage()) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }
      return;
    }
    // Legacy: accept a persona key string (keeps existing mock flows working)
    const persona = PERSONAS[personaKeyOrUser];
    if (!persona) return;
    setCurrentUser(persona);
    setIsAuthenticated(true);
    setBloodRequests([]);
    setNotifications([]);
    setDonorAvailable(persona.isAvailable ?? true);
    if (canUseStorage()) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(persona));
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveNav("home");
    setIncomingMatchAlert(null);
    if (canUseStorage()) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const toggleDonorAvailable = useCallback(() => {
    setDonorAvailable((v) => !v);
  }, []);

  const triggerMatchAlert = useCallback((matchData) => {
    setIncomingMatchAlert(matchData ?? MATCH_MOCK);
  }, []);

  const dismissMatchAlert = useCallback(() => {
    setIncomingMatchAlert(null);
  }, []);

  const updateRequestStatus = useCallback((requestId, newStatus) => {
    setBloodRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req,
      ),
    );
  }, []);

  const addRequest = useCallback((newRequest) => {
    const id = `req-${Date.now()}`;
    setBloodRequests((prev) => [
      { ...newRequest, id, requestDate: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        bloodRequests,
        updateRequestStatus,
        addRequest,
        notifications,
        unreadCount,
        markAllNotificationsRead,
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
