"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Droplets,
  User,
  Building2,
  ChevronLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useApp } from "@/context/AppContext";
import { apiLogin } from "@/utils/api";

// ── Role definitions — NO mock data, NO fake names ────────────────────────────


// Map a DB role string → the correct dashboard route
const ROLE_ROUTE_MAP = {
  donor: "/donor/home",
  requester: "/dashboard",
  hospital: "/hospital/dashboard",
};

// Input field shared style
const inputStyle = {
  width: "100%",
  height: "48px",
  borderRadius: "10px",
  border: "1.5px solid #C8C8C8",
  paddingInline: "14px",
  fontSize: "15px",
  color: "#1A1A1A",
  backgroundColor: "#FFFFFF",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 150ms, box-shadow 150ms",
};

// App accent color used across the UI
const accentColor = "#C0392B";

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit =
    email.trim().length > 0 &&
    password.length >= 1 &&
    !loading &&
    !done;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      const { user, token } = await apiLogin({ email: email.trim(), password });

      // Persist real user in global context
      login({ user, token });
      setLoading(false);
      setDone(true);

      // Navigate via SPA router — no page reload
      const destination =
        ROLE_ROUTE_MAP[user.role] ?? "/dashboard";

      navigate(destination);
    } catch (err) {
      setError(
        err?.status === 401
          ? "Incorrect email or password. Please try again."
          : (err?.message ?? "Sign-in failed. Please try again."),
      );
      setLoading(false);
    }
  };

  const ctaLabel = done ? "Signed In!" : loading ? "Signing in…" : "Sign In";

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
        {/* ── TOP BAR ─────────────────────────────────────────────── */}
        <header
          style={{
            height: "56px",
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #C8C8C8",
            display: "flex",
            alignItems: "center",
            paddingInline: "16px",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <a
            href="/"
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F4F4F4",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            <ChevronLeft size={20} color="#1A1A1A" />
          </a>
          <span
            style={{ fontSize: "16px", fontWeight: "700", color: "#1A1A1A" }}
          >
            <span style={{ color: "#C0392B" }}>Lyfe</span>Blood
          </span>
        </header>

        {/* ── BODY ────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            padding: "28px 16px 40px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: "24px" }}>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#1A1A1A",
                margin: "0 0 6px",
                letterSpacing: "-0.02em",
              }}
            >
              Welcome Back
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#4A4A4A",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              Enter your credentials to continue.
            </p>
          </div>


          {/* ── CREDENTIALS FORM ─────────────────────────────────── */}
          {/* Wrapped in <form> so Enter key and submit button work natively */}
        
            <form
              onSubmit={handleSubmit}
              noValidate
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "14px",
                border: `1.5px solid ${accentColor}30`,
                padding: "20px 16px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              

              {/* Email */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#4A4A4A",
                    marginBottom: "6px",
                  }}
                >
                  Email Address
                </label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#4A4A4A",
                    marginBottom: "6px",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...inputStyle, paddingRight: "48px" }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#6B6B6B",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                  <button
  type="button"
  onClick={() => navigate("/forgot-password")}
  style={{
    background: "none",
    border: "none",
    color: "#DC2626",
    cursor: "pointer",
    fontSize: "14px",
    alignSelf: "flex-end",
  }}
>
  Forgot password?
</button>
              </div>

              {/* ── ERROR BANNER (inside form so it stays near the fields) ── */}
              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    backgroundColor: "#FADBD8",
                    border: "1px solid #F1948A",
                    borderRadius: "10px",
                    padding: "12px 14px",
                  }}
                >
                  <AlertCircle
                    size={16}
                    color="#922B21"
                    style={{ flexShrink: 0, marginTop: "1px" }}
                  />
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#922B21",
                      fontWeight: "600",
                      margin: 0,
                      lineHeight: "1.5",
                    }}
                  >
                    {error}
                  </p>
                </div>
              )}

              {/* Submit button lives inside the <form> — Enter key triggers it */}
              <PrimaryButton
                type="submit"
                disabled={!canSubmit}
                icon={done ? CheckCircle2 : ArrowRight}
              >
                {ctaLabel}
              </PrimaryButton>
            </form>
          

        

          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: "#4A4A4A",
              marginTop: "20px",
            }}
          >
            Don't have an account?{" "}
            <a
              href="/register"
              style={{
                color: "#C0392B",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Create one
            </a>
          </p>

          <p
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#6B6B6B",
              marginTop: "12px",
              lineHeight: "1.5",
            }}
          >
            By continuing, you acknowledge that LyfeBlood facilitates donor
            matching only. All clinical decisions remain with licensed medical
            staff.
          </p>
        </div>
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
        input:focus {
          outline: none;
          border-color: #C0392B !important;
          box-shadow: 0 0 0 3px #FADBD8;
        }
      `}</style>
    </>
  );
}
