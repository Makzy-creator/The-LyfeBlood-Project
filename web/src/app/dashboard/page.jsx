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
import { apiGetMatches, apiSendMatches } from "@/utils/api";
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
    urgencyNote: "",
    requestType: "Emergency",
    scheduledFor: "",
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
    if (Number(form.unitsNeeded) > 5) {
      nextErrors.unitsNeeded = "Patient requests cannot exceed 5 pints.";
    }
    if (form.requestType === "Scheduled") {
      const scheduledTime = new Date(form.scheduledFor).getTime();
      if (!form.scheduledFor || !Number.isFinite(scheduledTime)) {
        nextErrors.scheduledFor = "Select a scheduled donation date.";
      } else if (scheduledTime <= Date.now()) {
        nextErrors.scheduledFor = "Scheduled date must be in the future.";
      }
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
      patientCode: form.patientCode.trim(),
      urgencyNote: form.urgencyNote.trim(),
      unitsNeeded: Number(form.unitsNeeded),
      requestType: form.requestType,
      scheduledFor:
        form.requestType === "Scheduled"
          ? new Date(form.scheduledFor).toISOString()
          : null,
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

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }}>
            Request Type <span style={{ color: "#C0392B" }}>*</span>
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {["Emergency", "Scheduled"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateField("requestType", type)}
                disabled={isSubmitting}
                style={{
                  minHeight: "42px",
                  borderRadius: "8px",
                  border: `1.5px solid ${form.requestType === type ? "#C0392B" : "#C8C8C8"}`,
                  backgroundColor: form.requestType === type ? "#FADBD8" : "#FFFFFF",
                  color: form.requestType === type ? "#922B21" : "#1A1A1A",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {form.requestType === "Scheduled" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }}>
              Scheduled Date <span style={{ color: "#C0392B" }}>*</span>
            </label>
            <input
              style={inputStyle}
              type="date"
              value={form.scheduledFor}
              min={new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}
              onChange={(event) => updateField("scheduledFor", event.target.value)}
              disabled={isSubmitting}
            />
            {errors.scheduledFor && (
              <span style={{ fontSize: "12px", color: "#922B21" }}>{errors.scheduledFor}</span>
            )}
          </div>
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
            max="5"
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
  const [matchingState, setMatchingState] = useState({
    loading: false,
    request: null,
    matches: [],
    selectedIds: [],
    error: "",
    sent: false,
    sending: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  const handleOpenCreateRequest = () => {
    if (!["patient_family", "requester"].includes(currentUser?.role)) return;
    setRequestError("");
    setRequestSuccess("");
    setMatchingState({
      loading: false,
      request: null,
      matches: [],
      selectedIds: [],
      error: "",
      sent: false,
      sending: false,
    });
    setShowRequestForm(true);
  };

  const handleCreateRequest = async (formData) => {
    setRequestSubmitting(true);
    setRequestError("");
    try {
      const { request } = await addRequest({
        tier: "standard",
        bloodGroup: formData.bloodGroup,
        unitsNeeded: formData.unitsNeeded,
        hospitalName: formData.hospitalName,
        patientCode: formData.patientCode,
        requestedBy: currentUser.email ? currentUser.id : null,
        urgencyNote: formData.urgencyNote,
        requestType: formData.requestType,
        scheduledFor: formData.scheduledFor,
      });
      setShowRequestForm(false);
      setMatchingState({
        loading: true,
        request,
        matches: [],
        selectedIds: [],
        error: "",
        sent: false,
        sending: false,
      });
      window.setTimeout(async () => {
        try {
          const { matches } = await apiGetMatches({ request_id: request.id });
          const candidates = (matches ?? [])
            .filter((match) => match.match_status === "Candidate")
            .slice(0, 4);
          setMatchingState((current) => ({
            ...current,
            loading: false,
            matches: candidates,
            selectedIds: candidates.map((match) => match.id),
            error: candidates.length ? "" : "No eligible donors found yet.",
          }));
        } catch (error) {
          setMatchingState((current) => ({
            ...current,
            loading: false,
            error: error?.message ?? "Unable to load eligible donors.",
          }));
        }
      }, 6500);
    } catch (error) {
      setRequestError(error?.message ?? "Failed to create request.");
    } finally {
      setRequestSubmitting(false);
    }
  };

  const toggleSelectedMatch = (matchId) => {
    setMatchingState((current) => {
      const selected = new Set(current.selectedIds);
      if (selected.has(matchId)) selected.delete(matchId);
      else if (selected.size < 4) selected.add(matchId);
      return { ...current, selectedIds: [...selected], error: "" };
    });
  };

  const handleSendSelectedDonors = async () => {
    if (!matchingState.request?.id || !matchingState.selectedIds.length) {
      setMatchingState((current) => ({
        ...current,
        error: "Select at least one donor.",
      }));
      return;
    }

    setMatchingState((current) => ({ ...current, sending: true, error: "" }));
    try {
      await apiSendMatches({
        request_id: matchingState.request.id,
        match_ids: matchingState.selectedIds,
      });
      setRequestSuccess("Request sent to selected donors.");
      setMatchingState((current) => ({
        ...current,
        sending: false,
        sent: true,
        matches: current.matches.map((match) =>
          current.selectedIds.includes(match.id)
            ? { ...match, match_status: "Alerted" }
            : match,
        ),
      }));
    } catch (error) {
      setMatchingState((current) => ({
        ...current,
        sending: false,
        error: error?.message ?? "Unable to send donor requests.",
      }));
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
        {(matchingState.loading || matchingState.request) && (
          <section
            style={{
              margin: "12px 12px 0",
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              padding: "14px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 3px", fontSize: "15px", fontWeight: "800", color: "#1A1A1A" }}>
                Eligible Donors
              </h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#6B6B6B", lineHeight: "1.5" }}>
                {matchingState.loading
                  ? "Searching compatible verified donors nearby..."
                  : "Select up to 4 donors to notify."}
              </p>
            </div>

            {matchingState.loading && (
              <div
                style={{
                  minHeight: "92px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  backgroundColor: "#F4F4F4",
                  borderRadius: "8px",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: "3px solid #FADBD8",
                    borderTopColor: "#C0392B",
                    animation: "spin 900ms linear infinite",
                  }}
                />
                <span style={{ fontSize: "12px", color: "#922B21", fontWeight: "800" }}>
                  Matching donors
                </span>
              </div>
            )}

            {!matchingState.loading && matchingState.matches.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {matchingState.matches.map((match) => {
                  const checked = matchingState.selectedIds.includes(match.id);
                  return (
                    <label
                      key={match.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto",
                        gap: "10px",
                        alignItems: "center",
                        border: `1.5px solid ${checked ? "#C0392B" : "#E0E0E0"}`,
                        borderRadius: "8px",
                        padding: "10px",
                        cursor: matchingState.sent ? "default" : "pointer",
                        backgroundColor: checked ? "#FADBD8" : "#FFFFFF",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={matchingState.sent}
                        onChange={() => toggleSelectedMatch(match.id)}
                        style={{ width: "18px", height: "18px", accentColor: "#C0392B" }}
                      />
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "800", color: "#1A1A1A" }}>
                          {match.donor?.full_name ?? "Eligible donor"}
                        </p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#6B6B6B" }}>
                          {match.donor?.blood_type ?? "Blood type"} donor
                          {match.distance_km != null ? ` · ${match.distance_km} km away` : ""}
                        </p>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "#922B21" }}>
                        #{match.match_rank ?? "-"}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {matchingState.error && (
              <p
                role="alert"
                style={{
                  margin: 0,
                  borderRadius: "8px",
                  backgroundColor: "#FADBD8",
                  color: "#922B21",
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "10px 12px",
                }}
              >
                {matchingState.error}
              </p>
            )}

            {!matchingState.loading && matchingState.matches.length > 0 && (
              <PrimaryButton
                onClick={handleSendSelectedDonors}
                disabled={
                  matchingState.sent ||
                  matchingState.sending ||
                  matchingState.selectedIds.length === 0
                }
                icon={Plus}
              >
                {matchingState.sent
                  ? "Sent to Donors"
                  : matchingState.sending
                    ? "Sending..."
                    : "Send to Selected Donors"}
              </PrimaryButton>
            )}
          </section>
        )}

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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      `}</style>
    </>
  );
}
