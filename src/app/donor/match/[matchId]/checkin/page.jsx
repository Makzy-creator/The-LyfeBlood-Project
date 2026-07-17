"use client";
import { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle2,
  Building2,
  AlertTriangle,
} from "lucide-react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import BloodGroupTag from "@/components/ui/BloodGroupTag";
import { useApp } from "@/context/AppContext";
import { apiGetMatch } from "@/utils/api";

const OTP_DURATION_SECONDS = 15 * 60; // 15 minutes

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CheckInPage({ params }) {
  const { matchId } = params;
  const { isAuthenticated } = useApp();

  const [otp, setOtp] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(OTP_DURATION_SECONDS);
  const [match, setMatch] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION_SECONDS);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !matchId) return;
    if (typeof window !== "undefined") {
      const storedOtp =
        window.sessionStorage.getItem(`lyfeblood.match.${matchId}.otp`) ?? "";
      const storedExpiresAt = window.sessionStorage.getItem(
        `lyfeblood.match.${matchId}.expires_at`,
      );
      const storedTtl = Number.parseInt(
        window.sessionStorage.getItem(`lyfeblood.match.${matchId}.ttl_seconds`) ?? "",
        10,
      );
      setOtp(storedOtp);
      setExpiresAt(storedExpiresAt);
      if (Number.isFinite(storedTtl) && storedTtl > 0) {
        setDurationSeconds(storedTtl);
      }
      if (!storedOtp || !storedExpiresAt) {
        setLoadError("OTP details are unavailable. Please accept the match again.");
      }
    }
    let alive = true;
    apiGetMatch(matchId)
      .then(({ match }) => {
        if (!alive || !match) return;
        const request = match.request ?? {};
        setMatch({
          requestId: match.request_id,
          hospitalName: request.hospital_name ?? "Hospital",
          ward: request.patient_ref ?? "Blood request",
          patientCode: request.patient_ref ?? null,
          bloodGroup: request.blood_type_needed ?? null,
        });
      })
      .catch((error) => {
        console.error("[CheckIn] Failed to load match:", error);
        setLoadError(error?.message ?? "Failed to load check-in details");
      });
    return () => {
      alive = false;
    };
  }, [isAuthenticated, matchId]);

  useEffect(() => {
    if (!expiresAt) return;

    const updateSecondsLeft = () => {
      setSecondsLeft(
        Math.max(0, Math.ceil((Date.parse(expiresAt) - Date.now()) / 1000)),
      );
    };

    updateSecondsLeft();
    const interval = setInterval(() => {
      updateSecondsLeft();
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const isExpired = secondsLeft === 0;
  const urgencyColor =
    secondsLeft < 120 ? "#922B21" : secondsLeft < 300 ? "#E67E22" : "#C0392B";

  const handleCopyOTP = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(otp).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                {match?.hospitalName ?? "Loading hospital..."}
              </p>
              <p style={{ fontSize: "12px", color: "#6B6B6B", margin: 0 }}>
                {match?.ward ?? "Blood request"} · {match?.patientCode ?? matchId}
              </p>
            </div>
            <BloodGroupTag group={match?.bloodGroup} size="md" />
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
                {(otp || "------").split("").map((digit, i) => (
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
                    width: `${(secondsLeft / durationSeconds) * 100}%`,
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
            {loadError && (
              <p
                style={{
                  backgroundColor: "#FADBD8",
                  borderRadius: "8px",
                  color: "#922B21",
                  fontSize: "12px",
                  fontWeight: "600",
                  margin: "0 0 10px",
                  padding: "10px 12px",
                  textAlign: "center",
                }}
              >
                {loadError}
              </p>
            )}
            <PrimaryButton
              onClick={() => {}}
              disabled
              icon={CheckCircle2}
            >
              Awaiting Hospital Verification
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
