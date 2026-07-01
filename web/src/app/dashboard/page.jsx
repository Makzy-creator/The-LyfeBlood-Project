"use client";
import { useEffect } from "react";
import TopAppBar from "@/components/ui/TopAppBar";
import BottomNavBar from "@/components/ui/BottomNavBar";
import RequestCard from "@/components/ui/RequestCard";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import BloodGroupTag from "@/components/ui/BloodGroupTag";
import { useApp, REQUEST_STATUS } from "@/context/AppContext";
import {
  Droplets,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Bell,
} from "lucide-react";

const ROLE_HOME_CONFIG = {
  donor: {
    greeting: "Ready to give?",
    body: "Your next donation could save up to 3 lives. Nearby requests are waiting for your blood type.",
    cta: "Respond to a Request",
    ctaIcon: Droplets,
  },
  patient_family: {
    greeting: "We're here to help.",
    body: "Post a blood request or track an existing one. Matched donors will be notified immediately.",
     cta: "Post New Request",
    ctaIcon: AlertTriangle,
  },
  requester: {
    greeting: "We're here to help.",
    body: "Post a blood request or track an existing one. Matched donors will be notified immediately.",
    cta: "Post New Request",
    ctaIcon: AlertTriangle,
  },
  hospital_officer: {
    greeting: "Blood Bank Overview",
    body: "Manage all active procurement requests for your facility. Respond to incoming donor matches.",
    cta: "New Procurement Request",
    ctaIcon: AlertTriangle,
  },
  hospital: {
    greeting: "Blood Bank Overview",
    body: "Manage all active procurement requests for your facility. Respond to incoming donor matches.",
    cta: "New Procurement Request",
    ctaIcon: AlertTriangle,
  },

};

export default function DashboardPage() {
  const {
    currentUser,
    isAuthenticated,
    bloodRequests,
    logout,
    unreadCount,
    markAllNotificationsRead,
  } = useApp();

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  if (!currentUser) {
    return (
      <div
        style={{
          flex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Droplets size={32} color="#C0392B" />
          <p
            style={{
              fontSize: "14px",
              color: "#4A4A4A",
              fontFamily: "inherit",
            }}
          >
            Loading…
          </p>
        </div>
      </div>
    );
  }

  const config = ROLE_HOME_CONFIG[currentUser.role] ?? ROLE_HOME_CONFIG.donor;

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
        {/* Top App Bar */}
        <TopAppBar title="LyfeBlood" onBellPress={markAllNotificationsRead} />

        {/* ── HERO CARD ──────────────────────────────────────────────── */}
        <section
          style={{
            background: "linear-gradient(135deg, #922B21 0%, #C0392B 100%)",
            padding: "20px 16px",
            margin: "12px 12px 0",
            borderRadius: "12px",
          }}
        >
          {/* Persona header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: "800",
                color: "#FFFFFF",
                letterSpacing: "0.02em",
                flexShrink: 0,
              }}
            >
              {currentUser.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.7)",
                  margin: "0 0 1px",
                }}
              >
                {currentUser.roleLabel}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#FFFFFF",
                  margin: 0,
                }}
              >
                {currentUser.name}
              </p>
            </div>
            {currentUser.bloodGroup && (
              <BloodGroupTag group={currentUser.bloodGroup} />
            )}
            {currentUser.isAvailable && (
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
                  paddingBlock: "4px",
                  borderRadius: "999px",
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: "#27AE60",
                  }}
                />
                Available
              </span>
            )}
          </div>

          <h2
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#FFFFFF",
              margin: "0 0 6px",
            }}
          >
            {config.greeting}
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.82)",
              margin: "0 0 16px",
              lineHeight: "1.5",
            }}
          >
            {config.body}
          </p>
          <button
            style={{
              width: "100%",
              height: "44px",
              backgroundColor: "#FFFFFF",
              color: "#C0392B",
              fontSize: "14px",
              fontWeight: "700",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              fontFamily: "inherit",
            }}
          >
            <config.ctaIcon size={16} color="#C0392B" />
            {config.cta}
          </button>
        </section>

        {/* ── NOTIFICATIONS BANNER ───────────────────────────────────── */}
        {unreadCount > 0 && (
          <div
            style={{
              margin: "12px 12px 0",
              backgroundColor: "#FADBD8",
              borderRadius: "10px",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "1px solid #F1948A",
            }}
          >
            <Bell size={16} color="#922B21" />
            <span
              style={{
                flex: 1,
                fontSize: "13px",
                fontWeight: "600",
                color: "#922B21",
              }}
            >
              {unreadCount} unread notification{unreadCount > 1 ? "s" : ""} —
              tap the bell to clear
            </span>
          </div>
        )}

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
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#1A1A1A",
                margin: 0,
              }}
            >
              Active Requests
            </h2>
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
              {
                bloodRequests.filter(
                  (r) => r.status !== REQUEST_STATUS.COMPLETED,
                ).length
              }{" "}
              active
            </span>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {bloodRequests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        </section>

        {/* ── SIGN OUT ───────────────────────────────────────────────── */}
        <div style={{ padding: "24px 12px 0" }}>
          <SecondaryButton onClick={logout} icon={LogOut}>
            Sign Out
          </SecondaryButton>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNavBar />

      <style jsx global>{`
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      `}</style>
    </>
  );
}
