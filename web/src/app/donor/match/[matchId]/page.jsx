"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  MapPin,
  Navigation,
  Clock,
  ChevronLeft,
  X,
  CheckCircle2,
  Building2,
} from "lucide-react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import BloodGroupTag from "@/components/ui/BloodGroupTag";
import { useApp, MATCH_MOCK } from "@/context/AppContext";

// ─── MAP WIDGET PLACEHOLDER ───────────────────────────────────────────────────
function MapWidget({ distanceKm, hospitalName }) {
  const [bearing, setBearing] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setBearing((b) => (b + 0.4) % 360), 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "220px",
        borderRadius: "12px",
        overflow: "hidden",
        background:
          "linear-gradient(160deg, #1a3a2a 0%, #1e4530 50%, #162d20 100%)",
      }}
    >
      {/* Grid lines mimicking a map */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={`h${i}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${(i + 1) * 13}%`,
            height: "1px",
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={`v${i}`}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${(i + 1) * 13}%`,
            width: "1px",
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
      ))}

      {/* 20km boundary circle */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          border: "1.5px dashed rgba(192, 57, 43, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            fontSize: "9px",
            color: "rgba(192,57,43,0.7)",
            fontWeight: "600",
          }}
        >
          20km
        </span>
        {/* Donor position */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "#27AE60",
              border: "2.5px solid #FFFFFF",
              boxShadow: "0 0 0 6px rgba(39,174,96,0.2)",
              animation: "gpsPulse 2s infinite",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: "-20px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "9px",
              color: "#27AE60",
              fontWeight: "700",
              whiteSpace: "nowrap",
            }}
          >
            YOU
          </span>
        </div>
      </div>

      {/* Hospital pin */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          right: "22%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "#C0392B",
            border: "2.5px solid #FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            animation: "pinBounce 2s ease-in-out infinite",
          }}
        >
          <Building2 size={13} color="#FFFFFF" />
        </div>
        <div
          style={{
            backgroundColor: "rgba(192,57,43,0.9)",
            borderRadius: "4px",
            paddingInline: "5px",
            paddingBlock: "2px",
          }}
        >
          <span
            style={{
              fontSize: "8px",
              color: "#FFFFFF",
              fontWeight: "700",
              whiteSpace: "nowrap",
            }}
          >
            FMC Owerri
          </span>
        </div>
      </div>

      {/* Route line */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <line
          x1="50%"
          y1="50%"
          x2="78%"
          y2="30%"
          stroke="#C0392B"
          strokeWidth="2"
          strokeDasharray="6 4"
          strokeOpacity="0.7"
        />
      </svg>

      {/* Distance badge */}
      <div
        style={{
          position: "absolute",
          bottom: "12px",
          left: "12px",
          backgroundColor: "rgba(0,0,0,0.7)",
          borderRadius: "8px",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          backdropFilter: "blur(4px)",
        }}
      >
        <Navigation size={13} color="#27AE60" />
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#FFFFFF" }}>
          {distanceKm ?? 4.2} km away
        </span>
      </div>

      {/* Compass */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Navigation
          size={15}
          color="#FFFFFF"
          style={{
            transform: `rotate(${bearing}deg)`,
            transition: "transform 50ms linear",
          }}
        />
      </div>

      {/* Label overlay */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          backgroundColor: "rgba(0,0,0,0.5)",
          borderRadius: "6px",
          paddingInline: "8px",
          paddingBlock: "4px",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#C0392B",
            animation: "gpsPulse 1.5s infinite",
          }}
        />
        <span style={{ fontSize: "10px", color: "#FFFFFF", fontWeight: "600" }}>
          Live · Owerri
        </span>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function MatchPage({ params }) {
  const { matchId } = params;
  const { isAuthenticated, dismissMatchAlert } = useApp();
  const [declining, setDeclining] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  // Use MATCH_MOCK — in a real app this would be fetched by matchId
  const match = MATCH_MOCK;

  const handleAccept = () => {
    if (typeof window !== "undefined") {
      window.location.href = `/donor/match/${matchId}/checkin`;
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    await new Promise((r) => setTimeout(r, 600));
    setDeclined(true);
    dismissMatchAlert();
    await new Promise((r) => setTimeout(r, 800));
    if (typeof window !== "undefined") window.location.href = "/donor/home";
  };

  if (declined) {
    return (
      <div
        style={{
          flex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
          padding: "24px",
        }}
      >
        <X size={48} color="#C8C8C8" strokeWidth={1.5} />
        <p
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#6B6B6B",
            textAlign: "center",
          }}
        >
          Request declined. Redirecting you home…
        </p>
      </div>
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
        {/* ── SOS HEADER ────────────────────────────────────────────── */}
        <header
          style={{
            backgroundColor: "#922B21",
            padding: "0 16px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => {
              if (typeof window !== "undefined")
                window.location.href = "/donor/home";
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "rgba(255,255,255,0.8)",
              padding: 0,
            }}
          >
            <ChevronLeft size={18} />
            <span style={{ fontSize: "13px", fontWeight: "500" }}>
              Dashboard
            </span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                animation: "gpsPulse 1.2s infinite",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#FFFFFF",
                letterSpacing: "0.06em",
              }}
            >
              SOS ALERT
            </span>
          </div>
          <AlertTriangle size={20} color="#FFFFFF" />
        </header>

        {/* ── URGENT NOTIFICATION BANNER ────────────────────────────── */}
        <div
          style={{
            backgroundColor: "#FADBD8",
            padding: "14px 16px",
            borderBottom: "1px solid #F1948A",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertTriangle size={18} color="#922B21" />
          <div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#922B21",
                margin: "0 0 1px",
              }}
            >
              You have been matched for an urgent O- request
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#922B21",
                margin: 0,
                opacity: 0.8,
              }}
            >
              Please review and respond within 10 minutes to keep your response
              rate high.
            </p>
          </div>
        </div>

        {/* ── BODY ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
          {/* Blood group — centered, large */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 0 16px",
              gap: "8px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#C0392B",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Blood Group Required
            </p>
            <BloodGroupTag group={match.bloodGroup} size="lg" />
            <span
              style={{
                fontSize: "11px",
                color: "#6B6B6B",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "2px",
                  backgroundColor: "#922B21",
                  display: "inline-block",
                }}
              />
              SOS · {match.unitsNeeded} units needed
            </span>
          </div>

          {/* Map widget */}
          <MapWidget
            distanceKm={match.distanceKm}
            hospitalName={match.hospitalName}
          />

          {/* Hospital details card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "18px",
              marginTop: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#6B6B6B",
                margin: "0 0 10px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Request Details
            </p>

            {[
              {
                icon: Building2,
                label: "Hospital",
                value: match.hospitalName,
              },
              { icon: MapPin, label: "Ward", value: match.ward },
              { icon: MapPin, label: "Address", value: match.location },
              {
                icon: Navigation,
                label: "Distance",
                value: `${match.distanceKm} km from your location`,
              },
              {
                icon: Clock,
                label: "Patient Code",
                value: match.patientCode,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                  alignItems: "flex-start",
                }}
              >
                <Icon
                  size={14}
                  color="#C0392B"
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />
                <div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#6B6B6B",
                      margin: "0 0 1px",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#1A1A1A",
                      margin: 0,
                    }}
                  >
                    {value}
                  </p>
                </div>
              </div>
            ))}

            {/* Urgency note */}
            <div
              style={{
                backgroundColor: "#FADBD8",
                borderRadius: "8px",
                padding: "10px 12px",
                marginTop: "4px",
                borderLeft: "3px solid #922B21",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#922B21",
                  margin: "0 0 2px",
                }}
              >
                Clinical Note
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
                {match.urgencyNote}
              </p>
            </div>
          </div>

          {/* What happens next */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "16px",
              marginTop: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#6B6B6B",
                margin: "0 0 12px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              If you accept
            </p>
            {[
              {
                step: "1",
                text: "A secure 6-digit OTP check-in code will be issued.",
              },
              {
                step: "2",
                text: "Travel to the hospital and present the code to the Lab Manager.",
              },
              {
                step: "3",
                text: "Clinical staff will handle all screening and procedures.",
              },
            ].map(({ step, text }) => (
              <div
                key={step}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    backgroundColor: "#D5F5E3",
                    color: "#1E8449",
                    fontSize: "11px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {step}
                </span>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#4A4A4A",
                    margin: 0,
                    lineHeight: "1.5",
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "20px",
              paddingBottom: "32px",
            }}
          >
            <PrimaryButton onClick={handleAccept} icon={CheckCircle2}>
              Accept This Request
            </PrimaryButton>
            <SecondaryButton
              onClick={handleDecline}
              disabled={declining}
              icon={X}
            >
              {declining ? "Declining…" : "Decline"}
            </SecondaryButton>
            <p
              style={{
                textAlign: "center",
                fontSize: "11px",
                color: "#6B6B6B",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              Declining will pass this match to another available donor. Your
              availability status will remain on.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gpsPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
        @keyframes pinBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      `}</style>
    </>
  );
}
