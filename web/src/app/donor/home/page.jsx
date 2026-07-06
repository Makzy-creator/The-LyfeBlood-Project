"use client";
import { useEffect, useState } from "react";
import {
  Droplets,
  MapPin,
  Clock,
  Award,
  ChevronRight,
  X,
} from "lucide-react";
import TopAppBar from "@/components/ui/TopAppBar";
import BottomNavBar from "@/components/ui/BottomNavBar";
import BloodGroupTag from "@/components/ui/BloodGroupTag";
import RequestCard from "@/components/ui/RequestCard";
import { useApp } from "@/context/AppContext";
import { apiGetMatches } from "@/utils/api";
import { useNavigate } from "react-router-dom";

function normalizeAssignedMatch(match) {
  const request = match.request ?? {};
  return {
    matchId: match.id,
    id: request.id ?? match.request_id,
    tier: request.urgency_tier === "SOS" ? "sos" : "standard",
    bloodGroup: request.blood_type_needed ?? null,
    unitsNeeded: request.units_needed ?? 1,
    unitsFulfilled: request.units_fulfilled ?? 0,
    hospitalName: request.hospital_name ?? "Hospital",
    ward: request.patient_ref ?? "Blood request",
    patientCode: request.patient_ref ?? null,
    status: "pending",
    requestDate: match.notified_at ?? request.created_at ?? new Date().toISOString(),
    urgencyNote: request.urgency_note ?? null,
    location: request.location ?? null,
    distanceKm: match.distance_km,
  };
}

export default function DonorHomePage() {
  const {
    currentUser,
    isAuthenticated,
    donorAvailable,
    toggleDonorAvailable,
    incomingMatchAlert,
    dismissMatchAlert,
    markAllNotificationsRead,
  } = useApp();

  // Auth guard
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const [toggling, setToggling] = useState(false);
  const [assignedMatches, setAssignedMatches] = useState([]);
  const [matchesError, setMatchesError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let alive = true;
    apiGetMatches()
      .then(({ matches }) => {
        if (!alive) return;
        setAssignedMatches((matches ?? []).map(normalizeAssignedMatch));
        setMatchesError(null);
      })
      .catch((error) => {
        if (!alive) return;
        console.error("[DonorHome] Failed to load assigned matches:", error);
        setAssignedMatches([]);
        setMatchesError(error.message ?? "Failed to load matches");
      });
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  const handleToggle = async () => {
    setToggling(true);
    await new Promise((r) => setTimeout(r, 250));
    toggleDonorAvailable();
    setToggling(false);
  };

  const handleAcceptMatch = () => {
    if (typeof window !== "undefined") {
      navigate(`/donor/match/${incomingMatchAlert.matchId}`);
    }
  };

  if (!currentUser) return null;

  const today = new Date();
  const hour = today.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const activeRequests = assignedMatches;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingBottom: "80px",
        }}
      >
        <TopAppBar title="LyfeBlood" onBellPress={markAllNotificationsRead} />

        {/* ── INCOMING MATCH ALERT BANNER ─────────────────────────────── */}
        {incomingMatchAlert && (
          <div
            style={{
              backgroundColor: "#FADBD8",
              borderBottom: "1px solid #F1948A",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              animation: "slideDown 0.3s ease",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#C0392B",
                flexShrink: 0,
                animation: "pulseDot 1.2s infinite",
              }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#922B21",
                  margin: "0 0 2px",
                }}
              >
                🚨 Urgent Match Found
              </p>
              <p style={{ fontSize: "12px", color: "#922B21", margin: 0 }}>
                {incomingMatchAlert.bloodGroup} needed at{" "}
                {incomingMatchAlert.hospitalName}
              </p>
            </div>
            <button
              onClick={handleAcceptMatch}
              style={{
                backgroundColor: "#C0392B",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "inherit",
                flexShrink: 0,
              }}
            >
              View →
            </button>
            <button
              onClick={dismissMatchAlert}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "#922B21",
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── GREETING PROFILE CARD ─────────────────────────────────── */}
        <div
          style={{
            margin: "12px 12px 0",
            background: "linear-gradient(135deg, #922B21 0%, #C0392B 100%)",
            borderRadius: "12px",
            padding: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: "absolute",
              top: "-30px",
              right: "-30px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
          />

          {/* Name + blood group row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.7)",
                  margin: "0 0 3px",
                }}
              >
                {greeting},
              </p>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#FFFFFF",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                {currentUser.name?.split(" ")[0]} 👋
              </h2>
            </div>
            <BloodGroupTag group={currentUser.bloodGroup} size="lg" />
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "18px",
            }}
          >
            {[
              {
                icon: Award,
                label: "Donations",
                value: currentUser.totalDonations || 0,
              },
              {
                icon: Clock,
                label: "Last Donated",
                value: currentUser.lastDonated ? "Feb 2025" : "Never",
              },
              { icon: MapPin, label: "Location", value: "Owerri N." },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  padding: "10px 8px",
                  textAlign: "center",
                }}
              >
                <Icon
                  size={14}
                  color="rgba(255,255,255,0.7)"
                  style={{ marginBottom: "4px" }}
                />
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "800",
                    color: "#FFFFFF",
                    margin: "0 0 1px",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.6)",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* ── AVAILABILITY TOGGLE ────────────────────────────────────── */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#FFFFFF",
                  margin: "0 0 2px",
                }}
              >
                Live Availability
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.65)",
                  margin: 0,
                }}
              >
                {donorAvailable
                  ? "You are visible to hospitals & patients"
                  : "You are hidden from all requests"}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              {donorAvailable && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    backgroundColor: "#D5F5E3",
                    color: "#1E8449",
                    fontSize: "10px",
                    fontWeight: "700",
                    paddingInline: "8px",
                    paddingBlock: "3px",
                    borderRadius: "999px",
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      backgroundColor: "#27AE60",
                      animation: "pulseDot 1.5s infinite",
                    }}
                  />
                  Available
                </span>
              )}
              {/* Toggle switch */}
              <button
                onClick={handleToggle}
                disabled={toggling}
                aria-label="Toggle availability"
                style={{
                  width: "52px",
                  height: "28px",
                  borderRadius: "14px",
                  backgroundColor: donorAvailable
                    ? "#27AE60"
                    : "rgba(255,255,255,0.25)",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background-color 250ms",
                  outline: "none",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: donorAvailable ? "26px" : "3px",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    transition: "left 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ── ACTIVE REQUESTS ────────────────────────────────────────── */}
        <section style={{ padding: "20px 12px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#1A1A1A",
                  margin: 0,
                }}
              >
                Assigned Requests
              </h2>
              <p
                style={{
                  fontSize: "11px",
                  color: "#6B6B6B",
                  margin: "2px 0 0",
                }}
              >
                Real matches assigned to you
              </p>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#C0392B",
                backgroundColor: "#FADBD8",
                paddingInline: "8px",
                paddingBlock: "3px",
                borderRadius: "999px",
              }}
            >
              {activeRequests.length} open
            </span>
          </div>

          {activeRequests.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 24px",
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
              }}
            >
              <Droplets
                size={48}
                color="#C8C8C8"
                strokeWidth={1.5}
                style={{ marginBottom: "12px" }}
              />
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#6B6B6B",
                  margin: "0 0 4px",
                  textAlign: "center",
                }}
              >
                {matchesError ? "Unable to load matches" : "No assigned requests right now"}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#C8C8C8",
                  margin: 0,
                  textAlign: "center",
                  lineHeight: "1.5",
                }}
              >
                {matchesError ??
                  "When the backend matching engine assigns you to a request, it will appear here."}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {activeRequests.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigate(`/donor/match/${req.matchId}`);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── QUICK LINKS ──────────────────────────────────────────────── */}
        <section style={{ padding: "16px 12px 0" }}>
          <h2
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#1A1A1A",
              margin: "0 0 10px",
            }}
          >
            Quick Actions
          </h2>
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { label: "Donation History", icon: Clock, href: "#" },
              { label: "Update Profile", icon: Award, href: "/profile" },
            ].map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                style={{ flex: 1, textDecoration: "none" }}
              >
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "10px",
                    padding: "14px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Icon size={16} color="#C0392B" />
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#1A1A1A",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  <ChevronRight size={14} color="#C8C8C8" />
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

      <BottomNavBar
        onNavigate={(key) => {
          if (typeof window === "undefined") return;
          if (key === "home") navigate("/donor/home");
          if (key === "profile") navigate("/profile");
        }}
      />

      <style jsx global>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      `}</style>
    </>
  );
}
