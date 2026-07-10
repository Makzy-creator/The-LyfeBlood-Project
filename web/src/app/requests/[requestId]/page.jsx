"use client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Flag,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";
import TopAppBar from "@/components/ui/TopAppBar";
import BottomNavBar from "@/components/ui/BottomNavBar";
import BloodGroupTag from "@/components/ui/BloodGroupTag";
import RequestStatusBadge from "@/components/ui/RequestStatusBadge";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import DonationJourney from "@/components/ui/DonationJourney";
import { REQUEST_STATUS, useApp } from "@/context/AppContext";
import { apiGetMatches } from "@/utils/api";
import { supabase } from "@/lib/supabase-client";

const ROLE_HOME_ROUTE = {
  donor: "/donor/home",
  requester: "/dashboard",
  hospital: "/hospital/dashboard",
  patient_family: "/dashboard",
  hospital_officer: "/hospital/dashboard",
};

function normalizeRequestStatus(status) {
  switch (status) {
    case "Pending":
    case REQUEST_STATUS.PENDING:
      return REQUEST_STATUS.PENDING;
    case "Verified":
    case REQUEST_STATUS.VERIFIED:
      return REQUEST_STATUS.VERIFIED;
    case "Donor Matched":
    case REQUEST_STATUS.DONOR_MATCHED:
      return REQUEST_STATUS.DONOR_MATCHED;
    case "Arrived":
    case "Arrived At Lab":
    case REQUEST_STATUS.CHECKED_IN:
      return REQUEST_STATUS.CHECKED_IN;
    case "Blood Collected":
    case REQUEST_STATUS.BLOOD_COLLECTED:
      return REQUEST_STATUS.BLOOD_COLLECTED;
    case "Completed":
    case REQUEST_STATUS.FULFILLED:
      return REQUEST_STATUS.FULFILLED;
    case "Cancelled":
    case REQUEST_STATUS.CANCELLED:
      return REQUEST_STATUS.CANCELLED;
    default:
      return REQUEST_STATUS.PENDING;
  }
}

function normalizeBloodRequest(r) {
  return {
    id: r.id,
    tier: r.urgency_tier === "SOS" ? "sos" : "standard",
    bloodGroup: r.blood_type_needed ?? r.bloodGroup ?? null,
    unitsNeeded: r.units_needed ?? r.unitsNeeded ?? 1,
    unitsFulfilled: r.units_fulfilled ?? r.unitsFulfilled ?? 0,
    hospitalName: r.hospital_name ?? r.hospitalName ?? "Hospital",
    ward: r.ward ?? r.patient_ref ?? r.patientCode ?? "Blood request",
    patientCode: r.patient_ref ?? r.patientCode ?? null,
    status: normalizeRequestStatus(r.status),
    requestedBy: r.requested_by ?? r.requestedBy ?? null,
    requestDate: r.created_at ?? r.requestDate ?? new Date().toISOString(),
    urgencyNote: r.urgency_note ?? r.urgencyNote ?? null,
    location: r.location ?? null,
    matching_status: r.matching_status ?? r.matchingStatus ?? "pending",
  };
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
      <span style={{ fontSize: "11px", fontWeight: "700", color: "#6B6B6B", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontSize: "14px", fontWeight: "600", color: "#1A1A1A", lineHeight: "1.4" }}>
        {value || "Not provided"}
      </span>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Icon size={18} color="#C0392B" />
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#1A1A1A" }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function RequestDetailsPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const {
    currentUser,
    isAuthenticated,
    markAllNotificationsRead,
    updateRequestStatus,
  } = useApp();
  const [request, setRequest] = useState(null);
  const [requestLoading, setRequestLoading] = useState(true);
  const [requestNotFound, setRequestNotFound] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [consented, setConsented] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [statusSuccess, setStatusSuccess] = useState(null);
  const [requestMatches, setRequestMatches] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !requestId) return undefined;

    let isActive = true;
    setRequestLoading(true);
    setRequestNotFound(false);
    setRequestError(null);

    supabase
      .from("blood_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle()
      .then(async ({ data: loadedRequest, error }) => {
        if (error) throw error;
        if (!isActive) return;
        if (!loadedRequest) {
          setRequest(null);
          setRequestMatches([]);
          setAcceptedMatches([]);
          setRequestNotFound(true);
          return;
        }
        setRequest(normalizeBloodRequest(loadedRequest));
        const { matches } = await apiGetMatches({ request_id: loadedRequest.id });
        if (!isActive) return;
        setRequestMatches(matches ?? []);
        setAcceptedMatches((matches ?? []).filter((match) => match.match_status === "Accepted"));
      })
      .catch((error) => {
        if (!isActive) return;
        setRequest(null);
        setRequestMatches([]);
        setAcceptedMatches([]);
        if (error?.status === 404) {
          setRequestNotFound(true);
          return;
        }
        setRequestError(error?.message ?? "Unable to load request details.");
      })
      .finally(() => {
        if (isActive) setRequestLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, requestId]);

  if (!currentUser) return null;

  const role = currentUser.role;
  const homeRoute = ROLE_HOME_ROUTE[role] ?? "/dashboard";
  const isHospital = role === "hospital" || role === "hospital_officer";
  const isPatient = ["requester", "patient", "patient_family"].includes(role);

  if (requestLoading) {
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: "80px" }}>
          <TopAppBar title="Request Details" onBellPress={markAllNotificationsRead} />
          <div style={{ padding: "24px 12px" }}>
            <Section title="Loading request" icon={ClipboardCheck}>
              <p style={{ margin: 0, fontSize: "14px", color: "#4A4A4A", lineHeight: "1.5" }}>
                Fetching the latest request details from the hospital record.
              </p>
            </Section>
          </div>
        </div>
        <BottomNavBar onNavigate={(key) => {
          if (key === "home") navigate(homeRoute);
          if (key === "profile") navigate("/profile");
        }} />
      </>
    );
  }

  if (requestError) {
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: "80px" }}>
          <TopAppBar title="Request Details" onBellPress={markAllNotificationsRead} />
          <div style={{ padding: "24px 12px" }}>
            <Section title="Unable to load request" icon={AlertTriangle}>
              <p style={{ margin: 0, fontSize: "14px", color: "#4A4A4A", lineHeight: "1.5" }}>
                {requestError}
              </p>
              <SecondaryButton onClick={() => navigate(homeRoute)} icon={ChevronLeft}>
                Back to Dashboard
              </SecondaryButton>
            </Section>
          </div>
        </div>
        <BottomNavBar onNavigate={(key) => {
          if (key === "home") navigate(homeRoute);
          if (key === "profile") navigate("/profile");
        }} />
      </>
    );
  }

  if (requestNotFound || !request) {
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: "80px" }}>
          <TopAppBar title="Request Details" onBellPress={markAllNotificationsRead} />
          <div style={{ padding: "24px 12px" }}>
            <Section title="Request not found" icon={AlertTriangle}>
              <p style={{ margin: 0, fontSize: "14px", color: "#4A4A4A", lineHeight: "1.5" }}>
                This request could not be found or is not available to your account.
              </p>
              <SecondaryButton onClick={() => navigate(homeRoute)} icon={ChevronLeft}>
                Back to Dashboard
              </SecondaryButton>
            </Section>
          </div>
        </div>
        <BottomNavBar onNavigate={(key) => {
          if (key === "home") navigate(homeRoute);
          if (key === "profile") navigate("/profile");
        }} />
      </>
    );
  }

  const handleFlag = () => {
    if (!flagReason) return;
    setFlagged(true);
  };

  const handleStatusUpdate = async (nextStatus) => {
    setStatusUpdating(true);
    setStatusError(null);
    setStatusSuccess(null);
    try {
      await updateRequestStatus(request.id, nextStatus);
      setRequest((prev) => prev ? { ...prev, status: nextStatus } : prev);
      setStatusSuccess(`Status updated to ${nextStatus.replaceAll("_", " ")}.`);
    } catch (error) {
      setStatusError(error?.message ?? "Unable to update request status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const statusActions = isHospital
    ? [
        request.status === REQUEST_STATUS.PENDING && {
          label: "Mark Verified",
          next: REQUEST_STATUS.VERIFIED,
        },
        request.status === REQUEST_STATUS.VERIFIED && {
          label: "Mark Donor Matched",
          next: REQUEST_STATUS.DONOR_MATCHED,
        },
        request.status === REQUEST_STATUS.CHECKED_IN && {
          label: "Mark Blood Collected",
          next: REQUEST_STATUS.BLOOD_COLLECTED,
        },
        request.status === REQUEST_STATUS.BLOOD_COLLECTED && {
          label: "Mark Completed",
          next: REQUEST_STATUS.FULFILLED,
        },
        ![REQUEST_STATUS.FULFILLED, REQUEST_STATUS.CANCELLED].includes(request.status) && {
          label: "Cancel Request",
          next: REQUEST_STATUS.CANCELLED,
          secondary: true,
        },
      ].filter(Boolean)
    : [];

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: "80px" }}>
        <TopAppBar title="Request Details" onBellPress={markAllNotificationsRead} />

        <div style={{ padding: "16px 12px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F4F4F4",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} color="#1A1A1A" />
          </button>

          <Section title="Request Summary" icon={ClipboardCheck}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <BloodGroupTag group={request.bloodGroup} size="lg" />
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: "15px", fontWeight: "800", color: "#1A1A1A" }}>
                    {request.hospitalName}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6B6B6B" }}>
                    {request.ward}
                  </p>
                </div>
              </div>
              <RequestStatusBadge status={request.status} size="sm" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <DetailRow label="Units" value={`${request.unitsFulfilled}/${request.unitsNeeded}`} />
              <DetailRow label="Priority" value={request.tier === "sos" ? "SOS" : "Standard"} />
              <DetailRow label="Case Ref" value={request.patientCode} />
              <DetailRow label="Location" value={request.location} />
            </div>
            {request.urgencyNote && (
              <p style={{ margin: 0, fontSize: "13px", color: "#922B21", lineHeight: "1.5", fontWeight: "600" }}>
                {request.urgencyNote}
              </p>
            )}
          </Section>

          <DonationJourney request={request} matches={requestMatches} />

          <Section title="Verification & Status" icon={ShieldCheck}>
            <DetailRow label="Current status" value={request.status.replaceAll("_", " ")} />
            <p style={{ margin: 0, fontSize: "12px", color: "#4A4A4A", lineHeight: "1.5" }}>
              Donors should only proceed after confirming this request with hospital staff. Hospital staff should update the status only after verification at the facility.
            </p>
            {statusError && (
              <p style={{ margin: 0, fontSize: "12px", color: "#922B21", fontWeight: "700" }}>
                {statusError}
              </p>
            )}
            {statusSuccess && (
              <p style={{ margin: 0, fontSize: "12px", color: "#1E8449", fontWeight: "700" }}>
                {statusSuccess}
              </p>
            )}
            {statusActions.map((action) =>
              action.secondary ? (
                <SecondaryButton
                  key={action.next}
                  onClick={() => handleStatusUpdate(action.next)}
                  disabled={statusUpdating}
                >
                  {statusUpdating ? "Saving..." : action.label}
                </SecondaryButton>
              ) : (
                <PrimaryButton
                  key={action.next}
                  onClick={() => handleStatusUpdate(action.next)}
                  disabled={statusUpdating}
                  icon={CheckCircle2}
                >
                  {statusUpdating ? "Saving..." : action.label}
                </PrimaryButton>
              ),
            )}
          </Section>

          {isPatient && acceptedMatches.length > 0 && (
            <Section title="Donor Coordination" icon={Navigation}>
              <p style={{ margin: 0, fontSize: "12px", color: "#4A4A4A", lineHeight: "1.5" }}>
                Chat and live tracking are available because a matched donor accepted this request.
              </p>
              {acceptedMatches.map((match) => (
                <div
                  key={match.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <SecondaryButton
                    onClick={() => navigate(`/matches/${match.id}/chat`)}
                    icon={MessageCircle}
                  >
                    Chat
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={() => navigate(`/matches/${match.id}/tracking`)}
                    icon={Navigation}
                  >
                    Track Donor
                  </PrimaryButton>
                </div>
              ))}
            </Section>
          )}

          <Section title="Emergency Contact" icon={Phone}>
            <DetailRow label="Facility" value={request.hospitalName} />
            <DetailRow label="Where to go" value={request.location || request.ward} />
            <a
              href="tel:112"
              style={{
                minHeight: "44px",
                borderRadius: "8px",
                backgroundColor: "#FADBD8",
                color: "#922B21",
                fontSize: "14px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                textDecoration: "none",
              }}
            >
              <Phone size={16} />
              Call Emergency Line
            </a>
          </Section>

          <Section title="Privacy & Consent" icon={ShieldCheck}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={consented}
                onChange={(event) => setConsented(event.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#C0392B", flexShrink: 0 }}
              />
              <span style={{ fontSize: "12px", color: "#4A4A4A", lineHeight: "1.5" }}>
                I understand this request may contain sensitive medical context and should only be used for donation coordination with authorized hospital staff.
              </span>
            </label>
            {consented && (
              <p style={{ margin: 0, fontSize: "12px", color: "#1E8449", fontWeight: "700" }}>
                Consent acknowledged for this session.
              </p>
            )}
          </Section>

          <Section title="Report / Flag Request" icon={Flag}>
            <select
              value={flagReason}
              onChange={(event) => {
                setFlagReason(event.target.value);
                setFlagged(false);
              }}
              style={{
                width: "100%",
                height: "46px",
                borderRadius: "8px",
                border: "1.5px solid #C8C8C8",
                paddingInline: "12px",
                fontSize: "14px",
                color: "#1A1A1A",
                backgroundColor: "#FFFFFF",
                fontFamily: "inherit",
              }}
            >
              <option value="">Select a reason</option>
              <option value="incorrect_details">Incorrect request details</option>
              <option value="duplicate">Duplicate request</option>
              <option value="unsafe_contact">Unsafe or suspicious contact</option>
              <option value="privacy">Privacy concern</option>
            </select>
            <SecondaryButton onClick={handleFlag} disabled={!flagReason} icon={Flag}>
              Flag Request
            </SecondaryButton>
            {flagged && (
              <p style={{ margin: 0, fontSize: "12px", color: "#922B21", fontWeight: "700" }}>
                Flag recorded locally for hospital-testing review.
              </p>
            )}
          </Section>
        </div>
      </div>

      <BottomNavBar onNavigate={(key) => {
        if (key === "home") navigate(homeRoute);
        if (key === "profile") navigate("/profile");
      }} />
    </>
  );
}
