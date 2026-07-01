"use client";
import { CheckCircle2, Heart } from "lucide-react";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function RegistrationConfirmationPage() {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        {/* ── ICON ──────────────────────────────────────────────────── */}
        <div style={{ position: "relative", marginBottom: "28px" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: "#D5F5E3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
            }}
          >
            <CheckCircle2 size={64} color="#27AE60" strokeWidth={1.8} />
          </div>
          {/* Confetti-like dots */}
          {[
            { top: "-8px", left: "10px", color: "#C0392B", size: "10px" },
            { top: "-4px", right: "8px", color: "#27AE60", size: "8px" },
            { bottom: "4px", left: "-4px", color: "#F39C12", size: "7px" },
            { bottom: "-6px", right: "14px", color: "#C0392B", size: "9px" },
          ].map((dot, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                width: dot.size,
                height: dot.size,
                borderRadius: "50%",
                backgroundColor: dot.color,
                top: dot.top,
                right: dot.right,
                bottom: dot.bottom,
                left: dot.left,
                animation: `popIn ${0.3 + i * 0.08}s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
              }}
            />
          ))}
        </div>

        {/* ── COPY ──────────────────────────────────────────────────── */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "800",
            color: "#1A1A1A",
            textAlign: "center",
            letterSpacing: "-0.02em",
            margin: "0 0 10px",
          }}
        >
          You're All Set!
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "#4A4A4A",
            textAlign: "center",
            lineHeight: "1.6",
            margin: "0 0 32px",
            maxWidth: "300px",
          }}
        >
          Your LyfeBlood account has been created. You can now respond to urgent
          blood requests and help save lives across Imo State.
        </p>

        {/* ── IMPACT CARD ────────────────────────────────────────────── */}
        <div
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            padding: "18px 20px",
            marginBottom: "32px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#6B6B6B",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Your Account Status
          </p>
          {[
            {
              label: "Identity Verification",
              value: "Under Review (24–48h)",
              color: "#F39C12",
              bg: "#FEF9C3",
            },
            {
              label: "Profile Visibility",
              value: "Active",
              color: "#1E8449",
              bg: "#D5F5E3",
            },
            {
              label: "Notifications",
              value: "Enabled",
              color: "#1E40AF",
              bg: "#DBEAFE",
            },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "13px", color: "#4A4A4A" }}>
                {label}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color,
                  backgroundColor: bg,
                  paddingInline: "10px",
                  paddingBlock: "3px",
                  borderRadius: "999px",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* ── STAT ──────────────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "#FADBD8",
            borderRadius: "12px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            marginBottom: "28px",
          }}
        >
          <Heart size={22} color="#C0392B" />
          <p
            style={{
              fontSize: "13px",
              color: "#922B21",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            <strong>One donation</strong> can save up to{" "}
            <strong>3 lives</strong>. Your presence on LyfeBlood matters.
          </p>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <div style={{ width: "100%" }}>
          <PrimaryButton
            onClick={() => {
              if (typeof window !== "undefined")
                window.location.href = "/login";
            }}
          >
            Sign In to Your Account
          </PrimaryButton>
          <p
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#6B6B6B",
              marginTop: "14px",
            }}
          >
            Serving Owerri · Orlu · Okigwe and all Imo State LGAs
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      `}</style>
    </>
  );
}
