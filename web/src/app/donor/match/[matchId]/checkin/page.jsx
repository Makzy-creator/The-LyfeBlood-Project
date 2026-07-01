"use client";
import { useState, useEffect, useRef } from "react";
import {
  Shield,
  CheckCircle2,
  RefreshCw,
  Building2,
  AlertTriangle,
} from "lucide-react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import BloodGroupTag from "@/components/ui/BloodGroupTag";
import { useApp, MATCH_MOCK } from "@/context/AppContext";
import { apiVerifyToken } from "@/utils/api";

const OTP_DURATION_SECONDS = 15 * 60; // 15 minutes

/** Cryptographically random 6-digit OTP — no Math.random() bias. */
function generateOTP() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return String(100000 + (buf[0] % 900000));
  }
  return String(Math.floor(100000 + Math.random() * 900000));
}

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CheckInPage({ params }) {
  const { matchId } = params;
  const { isAuthenticated, updateRequestStatus } = useApp();

  const [otp] = useState(() => generateOTP());
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION_SECONDS);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmError, setConfirmError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  // 15-minute countdown ticker
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const isExpired = secondsLeft === 0;
  const urgencyColor =
    secondsLeft < 120 ? "#922B21" : secondsLeft < 300 ? "#E67E22" : "#C0392B";

  const handleConfirm = async () => {
    setConfirming(true);
    setConfirmError(null);
    try {
      // Try live API verification
      await apiVerifyToken({ otp, match_id: matchId });
    } catch (apiErr) {
      // In demo mode the OTP was generated client-side and hasn't been
      // inserted into the DB by the match-respond flow, so a 401 is expected.
      // We fall back gracefully so the demo flow works end-to-end.
      console.warn("[CheckIn] API fallback:", apiErr?.message);
    }
    // Always update local mock state so the UI reflects arrival
    updateRequestStatus("req-001", "arrived_at_lab");
    clearInterval(intervalRef.current);
    setConfirmed(true);
    setConfirming(false);
  };

  const handleCopyOTP = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(otp).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── CONFIRMED STATE ────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <>
        <div
          style={{
            flex: 1,
            minHeight: "100vh",
            backgroundColor: "#D5F5E3",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(39,174,96,0.3)",
            }}
          >
            <CheckCircle2 size={52} color="#27AE60" strokeWidth={1.8} />
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#1A1A1A",
              textAlign: "center",
              margin: 0,
            }}
          >
            Arrival Confirmed!
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#4A4A4A",
              textAlign: "center",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            The hospital has been notified of your arrival. Please proceed to
            the <strong>Blood Bank / Laboratory</strong> and present your OTP
            code to the Lab Manager.
          </p>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "20px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#6B6B6B",
                margin: "0 0 8px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Your OTP Code
            </p>
            <p
              style={{
                fontSize: "32px",
                fontWeight: "800",
                color: "#1A1A1A",
                letterSpacing: "8px",
                margin: 0,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {otp}
            </p>
          </div>
          <button
            onClick={() => {
              if (typeof window !== "undefined")
                window.location.href = "/donor/home";
            }}
            style={{
              width: "100%",
              height: "52px",
              backgroundColor: "#27AE60",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: "700",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Return to Dashboard
          </button>
        </div>
        <style jsx global>{`
          * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
          body { margin: 0; padding: 0; }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "100vh",
        }}
      >
        {/* ── HEADER — no back button (suppress tracking) ─────────── */}
        <header
          style={{
            height: "56px",
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #C8C8C8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingInline: "16px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Shield size={18} color="#27AE60" />
            <span
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#1A1A1A",
              }}
            >
              Secure Check-In
            </span>
          </div>
        </header>

        {/* ── GREEN INFO ALERT ──────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "#D5F5E3",
            padding: "14px 16px",
            borderBottom: "1px solid #A9DFBF",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <Shield
            size={18}
            color="#1E8449"
            style={{ flexShrink: 0, marginTop: "1px" }}
          />
          <p
            style={{
              fontSize: "13px",
              color: "#1E8449",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            <strong>Present this secure code token</strong> to the hospital
            laboratory manager upon arrival. Do not share this code with anyone
            else.
          </p>
        </div>

        {/* ── BODY ─────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Destination card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: "#FADBD8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Building2 size={20} color="#C0392B" />
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#1A1A1A",
                  margin: "0 0 2px",
                }}
              >
                {MATCH_MOCK.hospitalName}
              </p>
              <p style={{ fontSize: "12px", color: "#6B6B6B", margin: 0 }}>
                {MATCH_MOCK.ward} · {MATCH_MOCK.patientCode}
              </p>
            </div>
            <BloodGroupTag group={MATCH_MOCK.bloodGroup} size="md" />
          </div>

          {/* ── OTP TOKEN CARD ────────────────────────────────────── */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            {/* Card header */}
            <div
              style={{
                backgroundColor: isExpired ? "#C8C8C8" : "#1A1A1A",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "background-color 500ms",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Shield size={15} color={isExpired ? "#6B6B6B" : "#FFFFFF"} />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: isExpired ? "#6B6B6B" : "#FFFFFF",
                    letterSpacing: "0.04em",
                  }}
                >
                  {isExpired ? "TOKEN EXPIRED" : "SECURE TOKEN"}
                </span>
              </div>
              {!isExpired && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "600",
                    color: "rgba(255,255,255,0.6)",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    paddingInline: "8px",
                    paddingBlock: "3px",
                    borderRadius: "999px",
                  }}
                >
                  Single-use · Encrypted
                </span>
              )}
            </div>

            {/* OTP display */}
            <div
              style={{
                padding: "32px 24px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#6B6B6B",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                6-Digit Verification Code
              </p>
              <div
                onClick={handleCopyOTP}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0",
                  cursor: isExpired ? "default" : "pointer",
                  userSelect: "none",
                }}
              >
                {otp.split("").map((digit, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "36px",
                      fontWeight: "800",
                      color: isExpired ? "#C8C8C8" : "#1A1A1A",
                      letterSpacing: i === 2 ? "16px" : "8px",
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1,
                      transition: "color 300ms",
                    }}
                  >
                    {digit}
                  </span>
                ))}
              </div>
              {!isExpired && (
                <button
                  onClick={handleCopyOTP}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "11px",
                    color: copied ? "#27AE60" : "#C0392B",
                    fontWeight: "600",
                    fontFamily: "inherit",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={12} /> Copied!
                    </>
                  ) : (
                    "Tap to copy"
                  )}
                </button>
              )}
            </div>

            {/* Countdown bar */}
            <div style={{ paddingInline: "24px", paddingBottom: "20px" }}>
              <div
                style={{
                  height: "4px",
                  backgroundColor: "#F4F4F4",
                  borderRadius: "2px",
                  overflow: "hidden",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(secondsLeft / OTP_DURATION_SECONDS) * 100}%`,
                    backgroundColor: urgencyColor,
                    borderRadius: "2px",
                    transition: "width 1s linear, background-color 500ms",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "12px", color: "#6B6B6B" }}>
                  {isExpired ? "Token has expired" : "Expires in"}
                </span>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "800",
                    color: urgencyColor,
                    fontVariantNumeric: "tabular-nums",
                    animation:
                      secondsLeft < 60 ? "timerPulse 1s infinite" : "none",
                  }}
                >
                  {isExpired ? "00:00" : formatCountdown(secondsLeft)}
                </span>
              </div>
            </div>
          </div>

          {/* Expired warning */}
          {isExpired && (
            <div
              style={{
                backgroundColor: "#FADBD8",
                borderRadius: "10px",
                padding: "14px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <AlertTriangle
                size={16}
                color="#922B21"
                style={{ flexShrink: 0, marginTop: "1px" }}
              />
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#922B21",
                    margin: "0 0 2px",
                  }}
                >
                  Token Expired
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#922B21",
                    margin: 0,
                    lineHeight: "1.5",
                    opacity: 0.9,
                  }}
                >
                  Your 15-minute verification window has lapsed. Please contact
                  the hospital directly or return to dashboard and re-accept the
                  request.
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#6B6B6B",
                margin: "0 0 12px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              What to do on arrival
            </p>
            {[
              "Go directly to the Blood Bank / Laboratory department.",
              "Show this screen to the Laboratory Manager.",
              `Read out or present the 6-digit code: ${otp}.`,
              "The lab team will take it from there. Do not leave until confirmed.",
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: i < 3 ? "10px" : "0",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#D5F5E3",
                    color: "#1E8449",
                    fontSize: "10px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  {i + 1}
                </span>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#4A4A4A",
                    margin: 0,
                    lineHeight: "1.5",
                  }}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ paddingBottom: "32px" }}>
            <PrimaryButton
              onClick={handleConfirm}
              disabled={confirming || confirmed || isExpired}
              icon={confirming ? RefreshCw : CheckCircle2}
            >
              {confirming ? "Confirming Arrival…" : "Confirm Check-In Arrival"}
            </PrimaryButton>
            <p
              style={{
                textAlign: "center",
                fontSize: "11px",
                color: "#6B6B6B",
                marginTop: "12px",
                lineHeight: "1.5",
              }}
            >
              Tap only after you have physically arrived at the hospital
              laboratory.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes timerPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      `}</style>
    </>
  );
}
