"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopAppBar from "@/components/ui/TopAppBar";
import BottomNavBar from "@/components/ui/BottomNavBar";
import RequestCard from "@/components/ui/RequestCard";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import BloodGroupTag from "@/components/ui/BloodGroupTag";
import { useApp, REQUEST_STATUS, BLOOD_GROUPS } from "@/context/AppContext";
import {
  Droplets,
  LogOut,
  AlertTriangle,
  Bell,
  Plus,
  X,
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
     cta: "Create a Request",
    ctaIcon: AlertTriangle,
  },
  requester: {
    greeting: "We're here to help.",
    body: "Post a blood request or track an existing one. Matched donors will be notified immediately.",
    cta: "Create a Request",
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

function PatientRequestSheet({ onClose, onSubmit, isSubmitting, submitError }) {
  const [form, setForm] = useState({
    hospitalName: "",
    bloodGroup: "",
    unitsNeeded: 1,
    patientCode: "",
    location: "",
    urgencyNote: "",
  });
  const [errors, setErrors] = useState({});

  const inputStyle = {
    width: "100%",
    minHeight: "46px",
    borderRadius: "8px",
    border: "1.5px solid #C8C8C8",
    paddingInline: "12px",
    fontSize: "14px",
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.hospitalName.trim()) nextErrors.hospitalName = "Hospital is required.";
    if (!form.bloodGroup) nextErrors.bloodGroup = "Blood group is required.";
    if (!Number(form.unitsNeeded) || Number(form.unitsNeeded) < 1) {
      nextErrors.unitsNeeded = "Units must be at least 1.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      hospitalName: form.hospitalName.trim(),
      location: form.location.trim(),
      patientCode: form.patientCode.trim(),
      urgencyNote: form.urgencyNote.trim(),
      unitsNeeded: Number(form.unitsNeeded),
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close request form"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          border: "none",
          cursor: "pointer",
        }}
      />
      <form
        onSubmit={handleSubmit}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px 16px 0 0",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#1A1A1A" }}>
            Create a Request
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#F4F4F4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} color="#1A1A1A" />
          </button>
        </div>

        {submitError && (
          <p
            role="alert"
            style={{
              margin: 0,
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "#FADBD8",
              color: "#922B21",
              fontSize: "13px",
              fontWeight: "700",
            }}
          >
            {submitError}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }}>
            Hospital / Facility <span style={{ color: "#C0392B" }}>*</span>
          </label>
          <input
            style={inputStyle}
            value={form.hospitalName}
            onChange={(event) => updateField("hospitalName", event.target.value)}
            placeholder="e.g. Federal Medical Centre Owerri"
            disabled={isSubmitting}
          />
          {errors.hospitalName && (
            <span style={{ fontSize: "12px", color: "#922B21" }}>{errors.hospitalName}</span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }}>
            Blood Group Needed <span style={{ color: "#C0392B" }}>*</span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {BLOOD_GROUPS.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => updateField("bloodGroup", group)}
                disabled={isSubmitting}
                style={{
                  background: "none",
                  border: `2px solid ${form.bloodGroup === group ? "#C0392B" : "#C8C8C8"}`,
                  borderRadius: "8px",
                  padding: 0,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: form.bloodGroup === group ? "0 0 0 3px #FADBD8" : "none",
                }}
              >
                <BloodGroupTag group={group} size="md" />
              </button>
            ))}
          </div>
          {errors.bloodGroup && (
            <span style={{ fontSize: "12px", color: "#922B21" }}>{errors.bloodGroup}</span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }}>
            Units Needed <span style={{ color: "#C0392B" }}>*</span>
          </label>
          <input
            style={inputStyle}
            type="number"
            min="1"
            max="20"
            value={form.unitsNeeded}
            onChange={(event) => updateField("unitsNeeded", event.target.value)}
            disabled={isSubmitting}
          />
          {errors.unitsNeeded && (
            <span style={{ fontSize: "12px", color: "#922B21" }}>{errors.unitsNeeded}</span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }}>
            Patient / Case Reference
          </label>
          <input
            style={inputStyle}
            value={form.patientCode}
            onChange={(event) => updateField("patientCode", event.target.value)}
            placeholder="Optional"
            disabled={isSubmitting}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }}>
            Location
          </label>
          <input
            style={inputStyle}
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="Optional"
            disabled={isSubmitting}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }}>
            Note
          </label>
          <textarea
            style={{ ...inputStyle, minHeight: "80px", paddingTop: "10px", resize: "none" }}
            value={form.urgencyNote}
            onChange={(event) => updateField("urgencyNote", event.target.value)}
            placeholder="Optional"
            disabled={isSubmitting}
          />
        </div>

        <PrimaryButton type="submit" disabled={isSubmitting} icon={Plus}>
          {isSubmitting ? "Creating..." : "Create Request"}
        </PrimaryButton>
        <SecondaryButton onClick={onClose} disabled={isSubmitting}>
          Cancel
        </SecondaryButton>
      </form>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    currentUser,
    isAuthenticated,
    bloodRequests,
    addRequest,
    logout,
    unreadCount,
    markAllNotificationsRead,
  } = useApp();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  const handleOpenCreateRequest = () => {
    if (!["patient_family", "requester"].includes(currentUser?.role)) return;
    setRequestError("");
    setRequestSuccess("");
    setShowRequestForm(true);
  };

  const handleCreateRequest = async (formData) => {
    setRequestSubmitting(true);
    setRequestError("");
    try {
      await addRequest({
        tier: "standard",
        bloodGroup: formData.bloodGroup,
        unitsNeeded: formData.unitsNeeded,
        hospitalName: formData.hospitalName,
        patientCode: formData.patientCode,
        requestedBy: currentUser.email ? currentUser.id : null,
        urgencyNote: formData.urgencyNote,
        location: formData.location || currentUser.location,
      });
      setRequestSuccess("Request created and added to the live feed.");
      setShowRequestForm(false);
    } catch (error) {
      setRequestError(error?.message ?? "Failed to create request.");
    } finally {
      setRequestSubmitting(false);
    }
  };

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
            onClick={handleOpenCreateRequest}
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

        {requestSuccess && (
          <div
            role="status"
            style={{
              margin: "12px 12px 0",
              backgroundColor: "#D5F5E3",
              borderRadius: "10px",
              padding: "12px 14px",
              color: "#1E8449",
              fontSize: "13px",
              fontWeight: "700",
              border: "1px solid #ABEBC6",
            }}
          >
            {requestSuccess}
          </div>
        )}

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
                  (r) =>
                    ![REQUEST_STATUS.FULFILLED, REQUEST_STATUS.CANCELLED].includes(
                      r.status,
                    ),
                ).length
              }{" "}
              active
            </span>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {bloodRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onClick={() => navigate(`/requests/${req.id}`)}
              />
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
      <BottomNavBar
        onNavigate={(key) => {
          if (key === "profile") navigate("/profile");
        }}
      />

      {showRequestForm && (
        <PatientRequestSheet
          onClose={() => setShowRequestForm(false)}
          onSubmit={handleCreateRequest}
          isSubmitting={requestSubmitting}
          submitError={requestError}
        />
      )}

      <style jsx global>{`
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      `}</style>
    </>
  );
}
