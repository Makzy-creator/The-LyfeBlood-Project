"use client";
import { Home, Droplets, ClipboardList, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

/**
 * BottomNavBar
 * position:fixed, left:50%, translateX(-50%) → always centers over lb-frame column.
 * 64px nav area + safe bottom padding for notch devices.
 * Active: #C0392B · Inactive: #6B6B6B
 */

const NAV_ITEMS = [
  { key: "home", label: "Home", Icon: Home },
  { key: "donate", label: "Donate", Icon: Droplets },
  { key: "requests", label: "Requests", Icon: ClipboardList },
  { key: "profile", label: "Profile", Icon: User },
];

export default function BottomNavBar({ onNavigate }) {
  const { activeNav, setActiveNav } = useApp();
  const navigate = useNavigate();

  const handlePress = (key) => {
    setActiveNav(key);
    if (key === "donate") {
      navigate("/donations/history");
      return;
    }
    if (key === "requests") {
      navigate("/requests/history");
      return;
    }
    onNavigate?.(key);
  };

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "var(--lb-frame-max-width, 480px)",
        /* 64px nav + env() bottom inset for safe area (iOS notch) */
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #C8C8C8",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.07)",
        display: "flex",
        alignItems: "stretch",
        zIndex: 100,
        boxSizing: "border-box",
      }}
    >
      {NAV_ITEMS.map(({ key, label, Icon }) => {
        const isActive = activeNav === key;
        return (
          <button
            key={key}
            onClick={() => handlePress(key)}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            style={{
              flex: 1,
              height: "64px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
              paddingBlock: "10px",
              position: "relative",
              transition: "background-color 150ms",
            }}
          >
            {/* Active top indicator line */}
            {isActive && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "28px",
                  height: "2px",
                  backgroundColor: "#C0392B",
                  borderRadius: "0 0 2px 2px",
                }}
              />
            )}
            <Icon
              size={22}
              strokeWidth={isActive ? 2.2 : 1.7}
              color={isActive ? "#C0392B" : "#6B6B6B"}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: isActive ? "700" : "400",
                color: isActive ? "#C0392B" : "#6B6B6B",
                fontFamily: "inherit",
                letterSpacing: "0.01em",
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
