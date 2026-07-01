"use client";
import { Bell } from "lucide-react";
import { useApp } from "@/context/AppContext";

/**
 * TopAppBar
 * sticky top-0 z-50 · 56px height · white · 1px border-bottom #C8C8C8
 * Respects the lb-frame 480px column — no viewport-width bleed.
 */
export default function TopAppBar({ title = "LyfeBlood", onBellPress }) {
  const { unreadCount } = useApp();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        height: "56px",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #C8C8C8",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* Left: Title */}
      <span
        style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "#1A1A1A",
          fontFamily: "inherit",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {title === "LyfeBlood" ? (
          <>
            <span style={{ color: "#C0392B" }}>Lyfe</span>
            <span style={{ color: "#1A1A1A" }}>Blood</span>
          </>
        ) : (
          title
        )}
      </span>

      {/* Right: Bell + unread dot */}
      <button
        onClick={onBellPress}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : "Notifications"
        }
        style={{
          position: "relative",
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: unreadCount > 0 ? "#FADBD8" : "transparent",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          outline: "none",
          transition: "background-color 150ms",
          flexShrink: 0,
        }}
      >
        <Bell
          size={22}
          color={unreadCount > 0 ? "#C0392B" : "#1A1A1A"}
          strokeWidth={1.8}
        />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "8px",
              height: "8px",
              backgroundColor: "#C0392B",
              borderRadius: "50%",
              border: "1.5px solid #FFFFFF",
              display: "block",
            }}
          />
        )}
      </button>
    </header>
  );
}
