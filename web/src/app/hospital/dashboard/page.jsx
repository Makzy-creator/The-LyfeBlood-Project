"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  AlertTriangle,
  Plus,
  X,
  ClipboardList,
  Zap,
  Clock,
  Droplets,
  CheckCircle2,
  Building2,
  Radio,
  ChevronDown,
} from "lucide-react";
import TopAppBar from "@/components/ui/TopAppBar";
import BottomNavBar from "@/components/ui/BottomNavBar";
import BloodGroupTag from "@/components/ui/BloodGroupTag";
import RequestCard from "@/components/ui/RequestCard";
import RequestStatusBadge from "@/components/ui/RequestStatusBadge";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { useApp, REQUEST_STATUS, BLOOD_GROUPS } from "@/context/AppContext";

// ─── NEW REQUEST MODAL SHEET ──────────────────────────────────────────────────
function NewRequestSheet({ onClose, onSubmit, isSOS }) {
  const [form, setForm] = useState({
    bloodGroup: "",
    ward: "",
    unitsNeeded: 1,
    urgencyNote: "",
    patientCode: "",
  });

  const canSubmit = form.bloodGroup && form.ward && form.unitsNeeded >= 1;

  const inputStyle = {
    width: "100%",
    height: "46px",
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px 16px 0 0",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "sheetUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 4px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "#C8C8C8",
            }}
          />
        </div>

        {/* Sheet header */}
        <div
          style={{
            padding: "8px 16px 16px",
            borderBottom: "1px solid #F4F4F4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isSOS && <AlertTriangle size={18} color="#922B21" />}
            <h2
              style={{
                fontSize: "17px",
                fontWeight: "800",
                color: "#1A1A1A",
                margin: 0,
              }}
            >
              {isSOS ? "SOS Broadcast Request" : "New Blood Request"}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#6B6B6B",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {isSOS && (
            <div
              style={{
                backgroundColor: "#FADBD8",
                borderRadius: "10px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <Radio
                size={15}
                color="#922B21"
                style={{ flexShrink: 0, marginTop: "1px" }}
              />
              <p
                style={{
                  fontSize: "12px",
                  color: "#922B21",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                <strong>SOS mode:</strong> This request will be broadcast
                immediately to ALL available matching donors in Imo State with
                the highest priority alert.
              </p>
            </div>
          )}

          {/* Blood Group */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#1A1A1A" }}
            >
              Blood Group Required <span style={{ color: "#C0392B" }}>*</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {BLOOD_GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, bloodGroup: g }))}
                  style={{
                    background: "none",
                    border: `2px solid ${form.bloodGroup === g ? "#C0392B" : "#C8C8C8"}`,
                    borderRadius: "8px",
                    padding: 0,
                    cursor: "pointer",
                    outline: "none",
                    transform:
                      form.bloodGroup === g ? "scale(1.06)" : "scale(1)",
                    boxShadow:
                      form.bloodGroup === g ? "0 0 0 3px #FADBD8" : "none",
                    transition: "all 150ms",
                  }}
                >
                  <BloodGroupTag group={g} size="md" />
                </button>
              ))}
            </div>
          </div>

          {/* Ward */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#1A1A1A" }}
            >
              Requesting Ward <span style={{ color: "#C0392B" }}>*</span>
            </label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={form.ward}
              onChange={(e) => setForm((f) => ({ ...f, ward: e.target.value }))}
            >
              <option value="">Select ward</option>
              <option>Accident & Emergency</option>
              <option>Maternity & Obstetrics</option>
              <option>Surgical Ward A</option>
              <option>Surgical Ward B</option>
              <option>Surgical Ward C</option>
              <option>Intensive Care Unit (ICU)</option>
              <option>Paediatric Ward</option>
              <option>General Medical Ward</option>
            </select>
          </div>

          {/* Units */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#1A1A1A" }}
            >
              Units Required <span style={{ color: "#C0392B" }}>*</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, unitsNeeded: n }))}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor:
                      form.unitsNeeded === n ? "#C0392B" : "#F4F4F4",
                    color: form.unitsNeeded === n ? "#FFFFFF" : "#1A1A1A",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "15px",
                    fontFamily: "inherit",
                    transition: "all 150ms",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Code */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#1A1A1A" }}
            >
              Patient / Case Reference Code
            </label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. FMC-AE-2077"
              value={form.patientCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, patientCode: e.target.value }))
              }
            />
          </div>

          {/* Clinical note */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#1A1A1A" }}
            >
              Clinical Note (optional)
            </label>
            <textarea
              style={{
                ...inputStyle,
                height: "80px",
                paddingTop: "10px",
                paddingBottom: "10px",
                resize: "none",
              }}
              placeholder="Brief clinical context for the donor (no diagnostic criteria)"
              value={form.urgencyNote}
              onChange={(e) =>
                setForm((f) => ({ ...f, urgencyNote: e.target.value }))
              }
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              paddingBottom: "16px",
            }}
          >
            <PrimaryButton
              onClick={() => {
                if (canSubmit) onSubmit({ ...form, isSOS });
              }}
              disabled={!canSubmit}
              icon={isSOS ? AlertTriangle : Plus}
            >
              {isSOS ? "Trigger SOS Broadcast" : "Post Blood Request"}
            </PrimaryButton>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN HOSPITAL DASHBOARD ──────────────────────────────────────────────────
export default function HospitalDashboardPage() {
  const {
    currentUser,
    isAuthenticated,
    bloodRequests,
    addRequest,
    updateRequestStatus,
    markAllNotificationsRead,
  } = useApp();

  const [showSheet, setShowSheet] = useState(false);
  const [sheetIsSOS, setSheetIsSOS] = useState(false);
  const [demoCycleActive, setDemoCycleActive] = useState(false);
  const [demoCycleCountdown, setDemoCycleCountdown] = useState(null);
  const [sosPressed, setSosPressed] = useState(false);
  const demoIntervalRef = useRef(null);
  const demoCountRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  // ── 15-second demo simulation cycle ────────────────────────────────────────
  const startDemoCycle = useCallback(() => {
    if (demoCycleActive) return;
    setDemoCycleActive(true);
    setDemoCycleCountdown(15);

    demoCountRef.current = setInterval(() => {
      setDemoCycleCountdown((c) => {
        if (c <= 1) {
          clearInterval(demoCountRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    demoIntervalRef.current = setTimeout(() => {
      // Auto-transition first pending request → donor_matched
      const pendingReq = bloodRequests.find(
        (r) => r.status === REQUEST_STATUS.PENDING,
      );
      if (pendingReq)
        updateRequestStatus(pendingReq.id, REQUEST_STATUS.DONOR_MATCHED);
      clearInterval(demoCountRef.current);
      setDemoCycleActive(false);
      setDemoCycleCountdown(null);
    }, 15000);
  }, [demoCycleActive, bloodRequests, updateRequestStatus]);

  useEffect(() => {
    return () => {
      clearTimeout(demoIntervalRef.current);
      clearInterval(demoCountRef.current);
    };
  }, []);

  const handleNewRequest = (formData) => {
    addRequest({
      tier: formData.isSOS ? "sos" : "standard",
      bloodGroup: formData.bloodGroup,
      unitsNeeded: formData.unitsNeeded,
      unitsFulfilled: 0,
      hospitalName: currentUser?.hospital || "Federal Medical Centre Owerri",
      ward: formData.ward,
      patientCode:
        formData.patientCode || `FMC-${Date.now().toString().slice(-4)}`,
      status: REQUEST_STATUS.PENDING,
      requestedBy: "hospital_officer",
      urgencyNote: formData.urgencyNote,
      location: currentUser?.location || "Owerri Municipal, Imo State",
    });
    setShowSheet(false);
  };

  if (!currentUser) return null;

  const activeRequests = bloodRequests.filter(
    (r) => r.status !== REQUEST_STATUS.COMPLETED,
  );
  const pendingCount = bloodRequests.filter(
    (r) => r.status === REQUEST_STATUS.PENDING,
  ).length;
  const matchedCount = bloodRequests.filter(
    (r) => r.status === REQUEST_STATUS.DONOR_MATCHED,
  ).length;

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
        <TopAppBar
          title="Blood Bank Command"
          onBellPress={markAllNotificationsRead}
        />

        {/* ── DEMO CYCLE BANNER ──────────────────────────────────────── */}
        {demoCycleActive && (
          <div
            style={{
              backgroundColor: "#DBEAFE",
              padding: "12px 16px",
              borderBottom: "1px solid #BFDBFE",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#1E40AF",
                animation: "pulseDot 1s infinite",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                flex: 1,
                fontSize: "13px",
                fontWeight: "600",
                color: "#1E40AF",
              }}
            >
              Demo cycle running — auto-matching pending request in{" "}
              {demoCycleCountdown}s…
            </span>
          </div>
        )}

        {/* ── OFFICER PROFILE CARD ───────────────────────────────────── */}
        <div
          style={{
            margin: "12px 12px 0",
            background: "linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)",
            borderRadius: "12px",
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: "800",
                color: "#FFFFFF",
              }}
            >
              {currentUser.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.5)",
                  margin: "0 0 2px",
                }}
              >
                {currentUser.roleLabel}
              </p>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#FFFFFF",
                  margin: 0,
                }}
              >
                {currentUser.name}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.5)",
                  margin: "1px 0 0",
                }}
              >
                {currentUser.hospital} · {currentUser.department}
              </p>
            </div>
            <Building2 size={22} color="rgba(255,255,255,0.3)" />
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              {
                label: "Pending",
                value: pendingCount,
                color: "#F39C12",
                bg: "rgba(243,156,18,0.2)",
              },
              {
                label: "Matched",
                value: matchedCount,
                color: "#3B82F6",
                bg: "rgba(59,130,246,0.2)",
              },
              {
                label: "Total Active",
                value: activeRequests.length,
                color: "#27AE60",
                bg: "rgba(39,174,96,0.2)",
              },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  backgroundColor: bg,
                  borderRadius: "8px",
                  padding: "10px 8px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color,
                    margin: "0 0 2px",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.5)",
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
        </div>

        {/* ── ACTION BUTTONS ─────────────────────────────────────────── */}
        <div
          style={{
            margin: "12px 12px 0",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* SOS BROADCAST BUTTON */}
          <button
            onPointerDown={() => setSosPressed(true)}
            onPointerUp={() => setSosPressed(false)}
            onPointerLeave={() => setSosPressed(false)}
            onClick={() => {
              setSheetIsSOS(true);
              setShowSheet(true);
            }}
            style={{
              width: "100%",
              height: "58px",
              backgroundColor: sosPressed ? "#7B241C" : "#922B21",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              fontFamily: "inherit",
              transform: sosPressed ? "scale(0.98)" : "scale(1)",
              transition: "background-color 100ms, transform 100ms",
              boxShadow: "0 4px 16px rgba(146,43,33,0.4)",
            }}
          >
            <Radio size={20} color="#FFFFFF" />
            <span
              style={{
                fontSize: "16px",
                fontWeight: "800",
                color: "#FFFFFF",
                letterSpacing: "0.04em",
              }}
            >
              TRIGGER SOS BROADCAST
            </span>
          </button>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => {
                setSheetIsSOS(false);
                setShowSheet(true);
              }}
              style={{
                flex: 1,
                height: "46px",
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #C0392B",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Plus size={16} color="#C0392B" />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#C0392B",
                }}
              >
                New Request
              </span>
            </button>

            <button
              onClick={startDemoCycle}
              disabled={demoCycleActive}
              style={{
                flex: 1,
                height: "46px",
                backgroundColor: demoCycleActive ? "#F4F4F4" : "#FFFFFF",
                border: `1.5px solid ${demoCycleActive ? "#C8C8C8" : "#1A1A1A"}`,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                cursor: demoCycleActive ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <Zap size={15} color={demoCycleActive ? "#C8C8C8" : "#1A1A1A"} />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: demoCycleActive ? "#C8C8C8" : "#1A1A1A",
                }}
              >
                {demoCycleActive ? `${demoCycleCountdown}s…` : "Demo Cycle"}
              </span>
            </button>
          </div>
        </div>

        {/* ── STATUS PIPELINE ────────────────────────────────────────── */}
        <section style={{ padding: "20px 12px 0" }}>
          <h2
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "#1A1A1A",
              margin: "0 0 12px",
            }}
          >
            Status Pipeline
          </h2>
          <div
            style={{
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
          >
            {[
              { status: REQUEST_STATUS.PENDING, label: "Pending" },
              { status: REQUEST_STATUS.DONOR_MATCHED, label: "Matched" },
              { status: REQUEST_STATUS.ARRIVED_AT_LAB, label: "At Lab" },
              { status: REQUEST_STATUS.COMPLETED, label: "Complete" },
            ].map(({ status, label }) => {
              const count = bloodRequests.filter(
                (r) => r.status === status,
              ).length;
              return (
                <div
                  key={status}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    flexShrink: 0,
                    minWidth: "64px",
                  }}
                >
                  <RequestStatusBadge status={status} size="sm" />
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "800",
                      color: "#1A1A1A",
                    }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

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
                fontSize: "15px",
                fontWeight: "700",
                color: "#1A1A1A",
                margin: 0,
              }}
            >
              All Active Requests
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
              <ClipboardList
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
                No active requests
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
                Tap "New Request" or "TRIGGER SOS BROADCAST" above to create
                your first blood procurement request.
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
                <div key={req.id}>
                  <RequestCard request={req} />
                  {/* Quick status advance controls */}
                  {req.status !== REQUEST_STATUS.COMPLETED && (
                    <div
                      style={{
                        backgroundColor: "#FAFAFA",
                        borderRadius: "0 0 10px 10px",
                        borderTop: "1px solid #F4F4F4",
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "-2px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#6B6B6B",
                          flexShrink: 0,
                        }}
                      >
                        Advance:
                      </span>
                      {[
                        {
                          label: "→ Matched",
                          next: REQUEST_STATUS.DONOR_MATCHED,
                          from: REQUEST_STATUS.PENDING,
                        },
                        {
                          label: "→ At Lab",
                          next: REQUEST_STATUS.ARRIVED_AT_LAB,
                          from: REQUEST_STATUS.DONOR_MATCHED,
                        },
                        {
                          label: "→ Complete",
                          next: REQUEST_STATUS.COMPLETED,
                          from: REQUEST_STATUS.ARRIVED_AT_LAB,
                        },
                      ]
                        .filter((a) => a.from === req.status)
                        .map(({ label, next }) => (
                          <button
                            key={next}
                            onClick={() => updateRequestStatus(req.id, next)}
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "#C0392B",
                              backgroundColor: "#FADBD8",
                              border: "none",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            {label}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── COMPLETED REQUESTS ─────────────────────────────────────── */}
        {bloodRequests.filter((r) => r.status === REQUEST_STATUS.COMPLETED)
          .length > 0 && (
          <section style={{ padding: "20px 12px" }}>
            <h2
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#6B6B6B",
                margin: "0 0 10px",
              }}
            >
              Completed
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                opacity: 0.65,
              }}
            >
              {bloodRequests
                .filter((r) => r.status === REQUEST_STATUS.COMPLETED)
                .map((req) => (
                  <RequestCard key={req.id} request={req} />
                ))}
            </div>
          </section>
        )}
      </div>

      {/* Bottom Nav */}
      <BottomNavBar
        onNavigate={(key) => {
          if (typeof window === "undefined") return;
          if (key === "home") window.location.href = "/hospital/dashboard";
        }}
      />

      {/* New Request Sheet */}
      {showSheet && (
        <NewRequestSheet
          onClose={() => setShowSheet(false)}
          onSubmit={handleNewRequest}
          isSOS={sheetIsSOS}
        />
      )}

      <style jsx global>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
        input:focus, select:focus, textarea:focus {
          border-color: #C0392B !important;
          box-shadow: 0 0 0 3px #FADBD8;
          outline: none;
        }
      `}</style>
    </>
  );
}
