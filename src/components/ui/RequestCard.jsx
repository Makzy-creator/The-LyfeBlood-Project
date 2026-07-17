"use client";
import BloodGroupTag from "./BloodGroupTag";
import RequestStatusBadge from "./RequestStatusBadge";
import { MapPin, Clock, Droplets } from "lucide-react";

/**
 * RequestCard
 * White surface · 12px radius · level-1 shadow
 * 4px left-border accent → Standard: #C0392B · SOS: #922B21
 */
export default function RequestCard({ request, onClick }) {
  const isSOS = request.tier === "sos";
  const accentColor = isSOS ? "#922B21" : "#C0392B";

  const formattedDate = (() => {
    const d = new Date(request.requestDate);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  })();

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        overflow: "hidden",
        textAlign: "left",
        cursor: "pointer",
        outline: "none",
        padding: 0,
        border: "none",
        borderLeft: `4px solid ${accentColor}`,
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          padding: "14px 14px 14px 12px",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        {/* Left: Blood Group + SOS Label */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          <BloodGroupTag group={request.bloodGroup} size="lg" />
          {isSOS && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: "800",
                color: "#922B21",
                backgroundColor: "#FADBD8",
                paddingInline: "5px",
                paddingBlock: "2px",
                borderRadius: "4px",
                letterSpacing: "0.08em",
              }}
            >
              SOS
            </span>
          )}
        </div>

        {/* Center: Hospital + Ward details */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#1A1A1A",
              margin: 0,
              lineHeight: "1.35",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              whiteSpace: "normal",
            }}
          >
            {request.hospitalName}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#4A4A4A",
              margin: 0,
              lineHeight: "1.3",
            }}
          >
            {request.ward}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "6px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <Droplets size={11} color="#C0392B" />
              <span style={{ fontSize: "11px", color: "#4A4A4A" }}>
                {request.unitsFulfilled}/{request.unitsNeeded} units
              </span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <Clock size={11} color="#6B6B6B" />
              <span style={{ fontSize: "11px", color: "#6B6B6B" }}>
                {formattedDate}
              </span>
            </span>
          </div>
          {request.urgencyNote && (
            <p
              style={{
                fontSize: "11px",
                color: isSOS ? "#922B21" : "#6B6B6B",
                margin: "4px 0 0",
                fontStyle: "italic",
                lineHeight: "1.4",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {request.urgencyNote}
            </p>
          )}
        </div>

        {/* Right: Status Badge */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          <RequestStatusBadge status={request.status} size="sm" />
        </div>
      </div>
    </button>
  );
}
