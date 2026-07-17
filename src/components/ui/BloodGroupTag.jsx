"use client";

/**
 * BloodGroupTag
 * min-width 40px · height 32px · radius 8px
 * #FADBD8 background · #922B21 text
 */
export default function BloodGroupTag({ group, size = "md" }) {
  const fontSize = size === "lg" ? "16px" : size === "sm" ? "11px" : "13px";
  const height = size === "lg" ? "38px" : size === "sm" ? "26px" : "32px";
  const minWidth = size === "lg" ? "52px" : size === "sm" ? "34px" : "40px";

  return (
    <span
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
      {group}
    </span>
  );
}
