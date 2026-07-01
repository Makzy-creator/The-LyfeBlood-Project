"use client";
import { REQUEST_STATUS } from "@/context/AppContext";

/**
 * RequestStatusBadge
 * Full pill indicator with 4 status states.
 * Pending        → #FEF9C3 bg / #92400E text
 * Donor Matched  → #DBEAFE bg / #1E40AF text
 * Arrived at Lab → #EDE9FE bg / #5B21B6 text
 * Completed      → #D5F5E3 bg / #1E8449 text
 */

const STATUS_CONFIG = {
  [REQUEST_STATUS.PENDING]: {
    label: "Pending",
    bg: "#FEF9C3",
    color: "#92400E",
    dot: "#D97706",
  },
  [REQUEST_STATUS.DONOR_MATCHED]: {
    label: "Donor Matched",
    bg: "#DBEAFE",
    color: "#1E40AF",
    dot: "#3B82F6",
  },
  [REQUEST_STATUS.ARRIVED_AT_LAB]: {
    label: "Arrived at Lab",
    bg: "#EDE9FE",
    color: "#5B21B6",
    dot: "#7C3AED",
  },
  [REQUEST_STATUS.COMPLETED]: {
    label: "Completed",
    bg: "#D5F5E3",
    color: "#1E8449",
    dot: "#27AE60",
  },
};

export default function RequestStatusBadge({ status, size = "md" }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[REQUEST_STATUS.PENDING];
  const fontSize = size === "sm" ? "11px" : "12px";
  const dotSize = size === "sm" ? "5px" : "6px";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        paddingInline: size === "sm" ? "8px" : "10px",
        paddingBlock: size === "sm" ? "3px" : "4px",
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontSize,
        fontWeight: "600",
        fontFamily: "inherit",
        borderRadius: "999px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          backgroundColor: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
