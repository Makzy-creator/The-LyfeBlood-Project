"use client";
import { normalizeBloodTypes } from "@/utils/bloodTypes";

/**
 * BloodGroupTag
 * min-width 40px · height 32px · radius 8px
 * #FADBD8 background · #922B21 text
 */
export default function BloodGroupTag({ group, size = "md" }) {
  const fontSize = size === "lg" ? "16px" : size === "sm" ? "11px" : "13px";
  const height = size === "lg" ? "38px" : size === "sm" ? "26px" : "32px";
  const minWidth = size === "lg" ? "52px" : size === "sm" ? "34px" : "40px";
  const groups = normalizeBloodTypes(group);
  const labels = groups.length ? groups : [group].filter(Boolean);

  const renderTag = (label) => (
    <span
      key={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth,
        height,
        paddingInline: "8px",
        backgroundColor: "#FADBD8",
        color: "#922B21",
        fontSize,
        fontWeight: "700",
        fontFamily: "inherit",
        borderRadius: "8px",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );

  if (labels.length > 1) {
    return (
      <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "4px" }}>
        {labels.map(renderTag)}
      </span>
    );
  }

  return renderTag(labels[0] ?? "");
}
